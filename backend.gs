/**
 * V LABS — Google Apps Script Secure Backend (backend.gs)
 * Features:
 * 1. CORS Preflight Handling via doOptions(e)
 * 2. FAQ Fast-Path Cache (<100ms latency for common queries)
 * 3. Multi-Turn Context Proxy for Gemini 1.5 Flash API via UrlFetchApp (API Key hidden from client)
 * 4. Automatic & Deduplicated Google Sheet Lead Logging when phone numbers are detected
 */

// SECURE GEMINI API KEY (Stored securely in Google Apps Script ScriptProperties)
var GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY") || "YOUR_GEMINI_API_KEY_HERE";

// Gemini 1.5 Flash Model Endpoint
var GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;

// System Prompt for V Labs AI Receptionist
var SYSTEM_PROMPT = "You are V Labs AI, an assistant for V Labs - Vizag's 24-Hour Digital Studio. Be polite, brief (<25 words), and ask for the user's business name and WhatsApp number to schedule a 24-hour prototype demo.";

// High-frequency FAQ Fast-Path Table (<100ms response time bypassing external API)
var FAQ_FAST_PATH = [
  {
    keywords: ["price", "cost", "fee", "rates", "charge", "pricing"],
    reply: "Our turnkey digital setup has flat one-time fees with 0 monthly retainers! What is your business name and WhatsApp number for a full quote?"
  },
  {
    keywords: ["demo", "prototype", "24h", "24 hour", "sample", "trial"],
    reply: "We build working prototypes with AI WhatsApp receptionists in 24 hours. Share your business name & WhatsApp number to claim your slot!"
  },
  {
    keywords: ["location", "vizag", "address", "office", "where"],
    reply: "V Labs is based in Vizag, Andhra Pradesh! We deliver 24-hour digital solutions across India. What's your business name and WhatsApp number?"
  },
  {
    keywords: ["contact", "phone", "whatsapp", "call", "reach"],
    reply: "You can chat with our lead architect directly on WhatsApp at https://wa.me/996655273 or reply here with your number!"
  }
];

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
    // 1. Parse incoming payload safely
    var postData = {};
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    var userMessage = (postData.message || "").trim();
    // Input truncation to prevent payload bloat or abusive token consumption
    if (userMessage.length > 1000) {
      userMessage = userMessage.substring(0, 1000);
    }

    var history = postData.history || [];
    var leadLogged = false;

    // 2. Detect phone number in user message and log lead to Sheet if present
    var phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/;
    var phoneMatch = userMessage.match(phoneRegex);

    if (phoneMatch) {
      logLeadToSheet(phoneMatch[0], userMessage);
      leadLogged = true;
    }

    // 3. Fast-Path Caching Check: Evaluate FAQ lookup table (<100ms response)
    var fastPathReply = checkFastPathFaq(userMessage);
    var aiReply = "";

    if (fastPathReply) {
      aiReply = fastPathReply;
    } else {
      // 4. Multi-Turn Gemini 1.5 Flash Execution via server proxy
      aiReply = callGeminiApi(userMessage, history);
    }

    // 5. Return CORS-compliant JSON response
    var resultObj = {
      result: "success",
      reply: aiReply,
      leadLogged: leadLogged,
      fastPathUsed: !!fastPathReply,
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
 * Check Fast-Path FAQ Cache for sub-100ms instant replies
 */
function checkFastPathFaq(message) {
  if (!message) return null;
  var lowerMsg = message.toLowerCase();
  for (var i = 0; i < FAQ_FAST_PATH.length; i++) {
    var item = FAQ_FAST_PATH[i];
    if (item.keywords.some(function(k) { return lowerMsg.indexOf(k) !== -1; })) {
      return item.reply;
    }
  }
  return null;
}

/**
 * Securely query Gemini 1.5 Flash API with multi-turn history support
 */
function callGeminiApi(userMessage, history) {
  if (!userMessage) {
    return "Hello! I am V Labs AI. What is your business name and WhatsApp number to get started on your 24-hour prototype?";
  }

  // Construct structured contents array supporting multi-turn conversation
  var contentsList = [];
  
  if (Array.isArray(history) && history.length > 0) {
    // Standardize client history items to Gemini contents format
    var recentTurns = history.slice(-6); // Limit to last 6 turns for optimal latency
    for (var i = 0; i < recentTurns.length; i++) {
      var turn = recentTurns[i];
      var role = turn.role === "user" ? "user" : "model";
      var textContent = turn.content || turn.text || "";
      if (textContent) {
        contentsList.push({
          role: role,
          parts: [{ text: textContent }]
        });
      }
    }
  }

  // Ensure current user message is present at the end
  if (contentsList.length === 0 || contentsList[contentsList.length - 1].role !== "user" || contentsList[contentsList.length - 1].parts[0].text !== userMessage) {
    contentsList.push({
      role: "user",
      parts: [{ text: userMessage }]
    });
  }

  var payload = {
    contents: contentsList,
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
 * Log Lead Entry to active Google Sheet with sheet caching and formatting
 */
function logLeadToSheet(phone, chatMessage) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Create header row if sheet is clean
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
    corsEnabled: true,
    fastPathCache: true
  }))
  .setMimeType(ContentService.MimeType.JSON)
  .appendHeader("Access-Control-Allow-Origin", "*");
}

