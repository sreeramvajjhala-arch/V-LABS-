# Implementation & Breakdown Tasks: V Labs Web & Business Automation

## Overview
Detailed vertical slice breakdown for V Labs (Vizag's 24-Hour Digital Studio). Each task is scoped (S/M size), features testable acceptance criteria, explicit verification commands, dependency graph order, and checkpoint validation gates.

---

## Dependency Graph & Architecture

```
[SPEC.md] (Master Requirements)
    │
    ├── Phase 1: Core Design System & Layout (index.html)
    │       │
    │       ├── Phase 2: Client State & Dynamic Switcher (app.js)
    │       │       │
    │       │       └── Phase 3: Secure API Gateway & Sheet Logger (backend.gs)
    │       │
    │       └── Phase 4: Mobile Performance & Glass Fallbacks
    │
    └── Checkpoint Validation & Local Verification
```

---

## Task Breakdown

### Phase 1: Core Design System & UI Foundation

#### Task 1: Setup HTML5 Canvas & Design System Tokens
- **Description**: Configure Tailwind CSS CDN, Google Fonts (`Cinzel` & `Plus Jakarta Sans`), Font Awesome, and base deep crimson/gold theme styling.
- **Acceptance Criteria**:
  - [x] Cinzel serif headings & Plus Jakarta Sans body fonts loaded via Google Fonts.
  - [x] Tailwind CSS configured with custom `crimson`, `cream`, and `gold` color palette.
  - [x] Base background `#1A0202` and text `#FFF8EE` applied cleanly.
- **Verification**:
  - [x] View page in browser at `http://localhost:8080` and confirm typography and background colors.
- **Dependencies**: None
- **Files**: `index.html`
- **Scope**: Small (1 file)

#### Task 2: Build Sticky Header & Hero Section
- **Description**: Construct sticky glass navigation bar with V LABS brand logo `— ^V^ —`, subtext `WEB & BUSINESS AUTOMATION`, and `Get 24h Prototype` CTA, alongside hero badge, headline, and simulated WhatsApp terminal.
- **Acceptance Criteria**:
  - [x] Sticky navbar remains blurred on scroll.
  - [x] Hero badge `⚡ VIZAG'S 24-HOUR DIGITAL STUDIO` and main headline rendered cleanly.
  - [x] Simulated WhatsApp terminal box built with terminal bar and live badge.
- **Verification**:
  - [x] Verify layout responsiveness and header position sticky behavior on scroll.
- **Dependencies**: Task 1
- **Files**: `index.html`
- **Scope**: Medium (1 file)

#### Task 3: Build Comparison Grid & Industry Use-Cases Layout
- **Description**: Construct Problem vs. Solution comparison cards ("The Old Way" vs "The V Labs Way") and Industry Use-Cases interactive tab layout.
- **Acceptance Criteria**:
  - [x] "The Old Way" card styled with faded red tint and ❌ icons.
  - [x] "The V Labs Way" card styled with gold border and ✅ icons.
  - [x] Tab buttons for Healthcare, High-Ticket Gyms, Retail, and Caterers rendered.
- **Verification**:
  - [x] Check visual contrast and layout grid alignment across desktop and mobile.
- **Dependencies**: Task 2
- **Files**: `index.html`
- **Scope**: Medium (1 file)

---

### Checkpoint 1: UI Foundation
- [x] All 6 sections (Header, Hero, Comparison, Use-Cases, Pricing, Modal) present in `index.html`.
- [x] Zero broken links or missing font resources.

---

### Phase 2: Client Logic & Interactive Features

#### Task 4: Hero Terminal Typewriter Engine
- **Description**: Implement typewriter simulation in `app.js` typing out AI responses in real-time.
- **Acceptance Criteria**:
  - [x] `initHeroTerminalTypewriter()` types text character-by-character with realistic latency.
  - [x] Caret blinking animation active during typing.
- **Verification**:
  - [x] Observe hero terminal typing output on page load.
- **Dependencies**: Task 2
- **Files**: `app.js`
- **Scope**: Small (1 file)

#### Task 5: Industry Use-Cases Tab Switcher Engine
- **Description**: Implement dynamic tab switching logic for Healthcare, Gyms, Retail, and Caterers in `app.js`.
- **Acceptance Criteria**:
  - [x] Clicking tab updates active button styles.
  - [x] Rendered content displays 3-step automation flow and expected ROI impact.
- **Verification**:
  - [x] Click each tab button and verify correct content transition.
- **Dependencies**: Task 3
- **Files**: `app.js`
- **Scope**: Small (1 file)

#### Task 6: Floating AI Chat Modal Controls & WhatsApp Escape Hatch
- **Description**: Implement modal toggle state, slide-up animation, input submission, and manual "Chat on WhatsApp" escape hatch.
- **Acceptance Criteria**:
  - [x] Floating button click opens/closes chat modal with slide-up animation.
  - [x] "Chat on WhatsApp" button opens `wa.me` in a new tab.
  - [x] Quick prompt chips fill input and trigger submission.
- **Verification**:
  - [x] Click floating trigger, test escape hatch button, send quick prompts.
- **Dependencies**: Task 4, Task 5
- **Files**: `index.html`, `app.js`
- **Scope**: Medium (2 files)

---

### Checkpoint 2: Client Logic & Interactivity
- [x] Terminal typewriter animates smoothly on initial load.
- [x] Tab switcher renders all 4 industry workflows seamlessly.
- [x] Floating AI Modal slides up and escape hatch button opens WhatsApp.

---

### Phase 3: Secure Backend Proxy & Sheet CRM

#### Task 7: Google Apps Script CORS Preflight & Gemini API Proxy (`backend.gs`)
- **Description**: Implement `doOptions(e)` and `doPost(e)` in `backend.gs` using `UrlFetchApp.fetch()` to securely call Gemini 1.5 Flash API without client-side key exposure.
- **Acceptance Criteria**:
  - [x] `doOptions(e)` handles OPTIONS preflight requests returning CORS headers (`Access-Control-Allow-Origin: *`).
  - [x] `GEMINI_API_KEY` stored securely in backend script.
  - [x] `doPost(e)` calls Gemini 1.5 Flash API with system prompt instructions (<25 words).
- **Verification**:
  - [x] Check `backend.gs` script syntax and CORS payload structure.
- **Dependencies**: Task 6
- **Files**: `backend.gs`
- **Scope**: Medium (1 file)

#### Task 8: Google Sheets Lead Logging Engine
- **Description**: Implement regex phone number detection in `backend.gs` and `logLeadToSheet()` to record lead entries in Google Sheets.
- **Acceptance Criteria**:
  - [x] Phone number regex captures 10-digit / international numbers.
  - [x] Auto-creates headers (`Date & Time`, `WhatsApp / Phone`, `Lead Message / Inquiry`, `Status`) if sheet is empty.
  - [x] Appends lead row and returns status in JSON response.
- **Verification**:
  - [x] Test regex matching against phone number samples.
- **Dependencies**: Task 7
- **Files**: `backend.gs`
- **Scope**: Small (1 file)

---

### Checkpoint 3: End-to-End Verification & Production Readiness
- [x] `app.js` contains ZERO client-side Gemini API keys.
- [x] `backend.gs` successfully proxies requests and logs leads to Google Sheets.
- [x] Mobile CSS performance constraint verified (animations use `transform` and `opacity` only).
- [x] All acceptance criteria met across all tasks.
