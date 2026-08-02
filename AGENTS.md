# Project: V Labs — Vizag's 24-Hour Digital Studio & Business Automation

## Tech Stack
- **Frontend Architecture**: Pure HTML5, Vanilla JavaScript (`app.js`), Tailwind CSS CDN, Font Awesome 6.5
- **Typography**: Google Fonts (`Cinzel` for serif headlines, `Plus Jakarta Sans` for body)
- **Backend / CRM Gateway**: Google Apps Script (`backend.gs`)
- **AI Engine**: Google Gemini 1.5 Flash API (proxied via Apps Script `UrlFetchApp.fetch()`)

## Commands
- **Dev / Serve**: `python -m http.server 8080`
- **Automated Test Suite**: `node tests/suite.js`

## Code Conventions
- **Client Security**: ZERO Gemini API keys in `app.js`. All AI requests pass via `fetch()` with `redirect: 'follow'` to Google Apps Script.
- **Mobile Animation Budget**: ONLY animate GPU-accelerated `transform` and `opacity` properties. Never animate `box-shadow` or layout bounds.
- **Color System**:
  - Background Gradient: Deep Crimson (`#4A0000`) to Dark Maroon (`#1A0202`)
  - Primary Text & Headlines: Pure White (`#FFFFFF`)
  - Secondary Text & Borders: Muted Soft White / Light Gray (`#E5E5E5` / `#D1D1D1`)
- **Glassmorphism & Fallback**: Standard `.glass-card`, `.glass-nav`, `.glass-modal` with `@supports not (backdrop-filter: blur(12px))` fallback rule providing solid `rgba(45, 5, 5, 0.95)` backgrounds.
- **Human Escape Hatch**: Always provide a manual "Chat on WhatsApp" escape hatch pointing to `https://wa.me/996655273`.

## File Structure & Map
```
c:\Users\dell\OneDrive\Documents\V_labs\
├── index.html                     # Single-page landing page & Tailwind/Font setup
├── app.js                         # Client state, terminal typewriter, tab switcher, secure fetch proxy
├── backend.gs                     # Apps Script CORS preflight, Gemini 1.5 proxy, and Google Sheet CRM logger
├── assets/
│   └── vlabs-logo.jpg             # Official V Labs emblem image
├── tests/
│   └── suite.js                   # Automated TDD node test suite (20 tests)
├── SPEC.md                        # Master Technical Specification
├── TASKS.md                       # Task Breakdown & Dependencies
├── INCREMENTAL_IMPLEMENTATION.md  # Vertical Slice Delivery Log
└── AGENTS.md                      # Persistent Project Rules & Context Configuration
```

## Boundaries
- **Always**: Keep `app.js` key-free; run `node tests/suite.js` after logic changes; preserve GPU animation constraints.
- **Never**: Expose Gemini API keys on client; break CORS headers in `backend.gs`; alter WhatsApp link `https://wa.me/996655273`.
