/**
 * V LABS — Google Apps Script Secure Backend (backend.gs)
 * Features:
 * 1. CORS Preflight Handling via doOptions(e)
 * 2. Secure Proxy execution for Gemini 1.5 Flash API via UrlFetchApp (API Key hidden from client)
 * 3. Automatic Google Sheet Lead Logging when phone numbers are detected
 * 
 * Deployment Instructions:
 * 1. Open Google Sheets (create a new sheet named "V Labs Lead CRM").
 * 2. Click Extensions > Apps Script.
 * 3. Paste this code into Code.gs (or backend.gs).
 * 4. Click Deploy > New deployment.
 * 5. Select type: "Web app".
 * 6. Set "Execute as": "Me".
 * 7. Set "Who has access": "Anyone".
 * 8. Click Deploy, copy the Web App URL, and paste it into app.js as APPS_SCRIPT_WEBHOOK_URL.
 */

// SECURE GEMINI API KEY (Stored securely in Google Apps Script ScriptProperties)
var GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY") || "YOUR_GEMINI_API_KEY_HERE";

// Gemini 1.5 Flash Model Endpoint
var GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;

// System Prompt for V Labs AI Receptionist
var SYSTEM_PROMPT = "You are V Labs AI, an assistant for V Labs - Vizag's 24-Hour Digital Studio. Be polite, brief (<25 words), and ask for the user's business name and WhatsApp number to schedule a 24-hour prototype demo.";

/**
 * Handle CORS Preflight OPTIONS requests to prevent preflight blocking
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .appendHeader("Access-Control-Allow-Origin", "*")
    .appendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .appendHeader("Access-Control-Allow-Headers", "Content-Type");
}

/**
 * Handle incoming POST requests from app.js
 */
function doPost(e) {
  try {
    // 1. Parse incoming payload
    var postData = {};
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    var userMessage = postData.message || "";
    var leadLogged = false;

    // 2. Detect phone number in user message and log lead to Sheet if present
    var phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/;
    var phoneMatch = userMessage.match(phoneRegex);

    if (phoneMatch) {
      logLeadToSheet(phoneMatch[0], userMessage);
      leadLogged = true;
    }

    // 3. Securely call Gemini 1.5 Flash API from Apps Script backend
    var aiReply = callGeminiApi(userMessage);

    // 4. Return CORS-compliant JSON response
    var resultObj = {
      result: "success",
      reply: aiReply,
      leadLogged: leadLogged,
      timestamp: new Date().toISOString()
    };

    return ContentService.createTextOutput(JSON.stringify(resultObj))
      .setMimeType(ContentService.MimeType.JSON)
      .appendHeader("Access-Control-Allow-Origin", "*")
      .appendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
      .appendHeader("Access-Control-Allow-Headers", "Content-Type");

  } catch (error) {
    var errorObj = {
      result: "error",
      reply: "Thank you for contacting V Labs! Please share your WhatsApp number so our Vizag team can schedule your 24-hour prototype.",
      error: error.toString()
    };

    return ContentService.createTextOutput(JSON.stringify(errorObj))
      .setMimeType(ContentService.MimeType.JSON)
      .appendHeader("Access-Control-Allow-Origin", "*")
      .appendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
      .appendHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

/**
 * Securely query Gemini 1.5 Flash API using UrlFetchApp
 */
function callGeminiApi(userMessage) {
  if (!userMessage) {
    return "Hello! I am V Labs AI. What is your business name and WhatsApp number to get started on your 24-hour prototype?";
  }

  var payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: userMessage }]
      }
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    generationConfig: {
      maxOutputTokens: 60,
      temperature: 0.7
    }
  };

  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(GEMINI_API_URL, options);
  var responseCode = response.getResponseCode();

  if (responseCode === 200) {
    var json = JSON.parse(response.getContentText());
    if (json.candidates && json.candidates.length > 0 && json.candidates[0].content) {
      return json.candidates[0].content.parts[0].text;
    }
  }

  // Fallback if API key requires setup or returns non-200
  return "Thanks for reaching out to V Labs! We build custom websites & AI WhatsApp bots in 24 hours. What is your business name & WhatsApp number?";
}

/**
 * Log Lead Entry to active Google Sheet
 */
function logLeadToSheet(phone, chatMessage) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Create header row if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Date & Time",
        "WhatsApp / Phone",
        "Lead Message / Inquiry",
        "Status"
      ]);
      var headerRange = sheet.getRange(1, 1, 1, 4);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#4A0000");
      headerRange.setFontColor("#FFF8EE");
    }

    var timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    sheet.appendRow([
      timestamp,
      phone,
      chatMessage,
      "New 24h Prototype Lead"
    ]);

  } catch (err) {
    Logger.log("Error logging lead: " + err.toString());
  }
}

/**
 * Health check endpoint for testing Web App deployment
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "V Labs Secure Gemini Proxy & Sheet CRM",
    corsEnabled: true
  }))
  .setMimeType(ContentService.MimeType.JSON)
  .appendHeader("Access-Control-Allow-Origin", "*");
}
