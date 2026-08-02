# Technical Specification: V Labs High-Converting Web & Automation Studio

## Objective
Build a high-performance, visually stunning ("Voila" factor) single-page landing page and automated lead reception engine for **V Labs** (Vizag's 24-Hour Digital Studio). 

The platform serves fast-growing enterprises across Healthcare, High-Ticket Gyms, Retail, and Catering by demonstrating real-time WhatsApp AI receptionists (powered by Gemini 1.5 Flash), zero-retainer pricing transparency, and instant Google Sheets CRM integration.

---

## Assumptions & Principles
1. **Zero Client Key Exposure**: Client JavaScript (`app.js`) MUST NEVER contain Gemini API keys. All AI calls pass through Google Apps Script (`backend.gs`).
2. **Mobile GPU Animation Budget**: Animations MUST strictly mutate `transform` and `opacity` to avoid repaints and GPU shadow overhead on budget mobile hardware.
3. **Graceful Degradation**: Fallback solid styling (`rgba(45, 5, 5, 0.95)`) MUST be provided via `@supports not (backdrop-filter: blur(12px))`.
4. **Human Escape Hatch**: A manual "Chat on WhatsApp" escape hatch button MUST be accessible inside the AI chat widget UI pointing to `https://wa.me/996655273`.

---

## Tech Stack & Version Detection
- **Frontend Architecture**: Pure HTML5, Vanilla JS (`app.js`), Font Awesome 6.5.1
- **Styling System**: Tailwind CSS CDN
- **Typography**: Google Fonts (`Cinzel` for serif headlines, `Plus Jakarta Sans` for body)
- **Backend / CRM Gateway**: Google Apps Script (`backend.gs`) deployed as Web App
- **AI Engine**: Google Gemini 1.5 Flash REST API (`v1beta/models/gemini-1.5-flash:generateContent`)

---

## API & Interface Contract Specification

### 1. Client Gateway Contract (`app.js` → `backend.gs`)
- **Transport & Method**: HTTP POST (`fetch` with `redirect: 'follow'`)
- **Request Headers**: `Content-Type: text/plain;charset=utf-8`
- **Request Payload Schema**:
  ```json
  {
    "action": "chat",
    "message": "Are you open on Sundays?",
    "history": [
      { "role": "user", "content": "Are you open on Sundays?" }
    ]
  }
  ```
- **Response Payload Schema (Success - HTTP 200)**:
  ```json
  {
    "result": "success",
    "reply": "Yes! We are open from 9 AM to 8 PM. What is your business name and WhatsApp number?",
    "leadLogged": false,
    "timestamp": "2026-08-01T12:00:00.000Z"
  }
  ```

### 2. CORS Preflight Contract (`doOptions(e)`)
- **Method**: HTTP OPTIONS
- **Response Headers**:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: POST, GET, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type`
- **Body**: Empty text output (`MimeType.TEXT`)

### 3. Server-Side Gemini API Proxy Contract (`backend.gs` → Google AI)
- **Endpoint**: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}`
- **Request Payload Schema**:
  ```json
  {
    "contents": [
      { "role": "user", "parts": [{ "text": "User message string" }] }
    ],
    "systemInstruction": {
      "parts": [{ "text": "You are V Labs AI... polite, brief (<25 words)..." }]
    },
    "generationConfig": {
      "maxOutputTokens": 60,
      "temperature": 0.7
    }
  }
  ```

---

## Source-Driven Development & Official Citation Index

### 1. Google Gemini 1.5 Flash REST API
- **Official Source**: [Google AI REST API Reference](https://ai.google.dev/api/rest/v1beta/models/generateContent)
- **Documented Pattern**: Request endpoint `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}` with `{ contents: [...], systemInstruction: { parts: [...] } }`.

### 2. Google Apps Script Web App Endpoint & CORS Handling
- **Official Source**: [Google Apps Script Web App Guide](https://developers.google.com/apps-script/guides/web)
- **Documented Pattern**: Endpoint entry points `doPost(e)` and `doOptions(e)` returning `ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)`.

### 3. Fetch API & HTTP Redirect Handling
- **Official Source**: [MDN Web Docs — Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- **Documented Pattern**: Client fetch calls specify `{ redirect: 'follow' }` for automatic handling across Google Apps Script redirects.

### 4. CSS Hardware Acceleration & Animation Performance
- **Official Source**: [MDN Web Docs — High Performance Animations](https://developer.mozilla.org/en-US/docs/Web/Performance/Animation_performance_and_frame_rate)
- **Documented Pattern**: Animating `transform` and `opacity` runs on the compositor thread without layout repaints.

---

## Commands
```bash
# Serve local application:
python -m http.server 8080

# Automated Test Suite:
node tests/suite.js
```

---

## Project Structure
```
c:\Users\dell\OneDrive\Documents\V_labs\
├── index.html                     # Single-page landing page & Tailwind/Font setup
├── app.js                         # Client state, terminal typewriter, tab switcher, secure fetch proxy
├── backend.gs                     # Apps Script CORS preflight, Gemini 1.5 proxy, and Google Sheet CRM logger
├── assets/
│   └── vlabs-logo.jpg             # Official V Labs emblem image
├── tests/
│   └── suite.js                   # Automated TDD node test suite (20 tests)
├── SPEC.md                        # Master Technical Specification & API Contract
├── TASKS.md                       # Task Breakdown & Dependencies
├── INCREMENTAL_IMPLEMENTATION.md  # Vertical Slice Delivery Log
└── AGENTS.md                      # Persistent Project Rules & Context Configuration
```

---

## Boundaries & Constraints
- **Always do**: Keep client JavaScript key-free; animate only `transform` and `opacity`; provide solid fallback for non-backdrop-filter browsers; enforce contract-first validation.
- **Ask first**: Changing brand color tokens or replacing Gemini 1.5 Flash with alternative models.
- **Never do**: Expose Gemini API keys in client-side code (`app.js`); remove the WhatsApp manual escape hatch `https://wa.me/996655273`; break CORS headers.

---

## Success Criteria
- [x] Landing page loads under 1 second with responsive layout across mobile and desktop.
- [x] Hero WhatsApp terminal performs typewriter simulation of AI replies.
- [x] Industry Use-Cases tabs dynamically switch flows for Healthcare, Gyms, Retail, and Caterers.
- [x] Floating AI Chat widget opens with slide-up glass animation, clean robot icon, and direct WhatsApp escape hatch link `https://wa.me/996655273`.
- [x] `backend.gs` proxies requests to Gemini API securely without exposing keys to client browsers.
- [x] Incoming lead details automatically append to Google Sheets CRM upon phone number detection.
- [x] Every architectural decision backed by primary, authoritative documentation citations.
- [x] Typed contract definitions established for all network boundaries.
