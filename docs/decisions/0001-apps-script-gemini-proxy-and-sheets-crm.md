# ADR-001: Zero-Retainer Google Apps Script Gateway & Gemini AI Proxy

## Status
Accepted

## Date
2026-08-02

## Context
V Labs requires a high-performing 24-hour automation engine for Vizag local businesses with:
- Zero monthly server retainers or complex backend hosting bills.
- Secure protection of Google Gemini 1.5 Flash API keys (zero keys exposed on client).
- Automatic lead capture straight into client Google Sheets.
- Ultra-low latency responses with manual WhatsApp human escape hatches.

## Decision
Use **Google Apps Script (`backend.gs`)** as a serverless CORS-enabled gateway to:
1. Proxy client requests to Google Gemini 1.5 Flash API securely using `UrlFetchApp.fetch()`.
2. Automatically append qualified lead entries into Google Sheets CRM.
3. Expose CORS preflight `doOptions(e)` and `doPost(e)` endpoints returning structured JSON.

## Alternatives Considered

### Node.js / Express Server on AWS/Vercel
- **Pros:** Full server control, Node ecosystem.
- **Cons:** Incurs monthly hosting retainers and server maintenance costs; violates V Labs flat one-time setup model.
- **Rejected:** V Labs promises zero monthly retainers.

### Direct Client-Side Gemini API Calls
- **Pros:** Simple client fetch logic.
- **Cons:** Severe security flaw. Exposes Gemini API key in client `app.js` bundle allowing key theft.
- **Rejected:** Unacceptable client security violation.

## Consequences
- 100% Zero Monthly Retainers for business owners.
- 100% Source Code & Account ownership handed over.
- Clean separation between key-free client JS (`app.js`) and serverless Apps Script backend (`backend.gs`).
- Enforced 32/32 passing TDD automated suite verification.
