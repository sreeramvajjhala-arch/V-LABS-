# V Labs — Official Brand Guidelines & Design Tokens

Master brand identity specification for **V Labs** (Vizag's 24-Hour Digital Studio & Business Automation).

---

## 🎨 Color Palette & Tokens

### Primary Brand System
- **Deep Crimson (`#4A0000`)**: Primary brand identity tone, used for headers, glass card accents, and sheet CRM themes.
- **Dark Maroon (`#1A0202`)**: Base canvas & body background tone for low-eyestrain dark mode elegance.
- **Pure White (`#FFFFFF`)**: Primary headline typography, primary icons, and active CTA button backgrounds.
- **Muted Soft White (`#E5E5E5` / `#D1D1D1`)**: Secondary body text, item descriptions, and subtle container borders.

### Functional Accents
- **Electric Emerald (`#10B981`)**: Live status indicators, WhatsApp CTA highlights, and ROI performance tags.
- **Amber Gold (`#F59E0B`)**: Fast-path cache indicators, demo triggers, and premium tier badges.

---

## ✒️ Typography Hierarchy

- **Headlines & Display Titles**: `Cinzel` (Google Fonts, Serif) — Font Weights: `700`, `800`, `900`.
- **Body & Interface Text**: `Plus Jakarta Sans` (Google Fonts, Sans-Serif) — Font Weights: `400`, `500`, `600`, `700`.
- **Code & Status Indicators**: System Monospace (`ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`).

---

## 🏛️ Glassmorphism & UI Constraints

1. **Backdrop Blur Standard**: `.glass-card`, `.glass-nav`, `.glass-modal` with `backdrop-filter: blur(12px)`.
2. **Solid Fallback Rule**: Enforce `@supports not (backdrop-filter: blur(12px))` fallback rule providing solid `rgba(45, 5, 5, 0.95)` backgrounds for older/mobile browsers.
3. **Mobile GPU Budget**: Animations MUST strictly mutate GPU-accelerated `transform` and `opacity` properties to prevent repaints on budget mobile hardware.
4. **Human Escape Hatch**: A manual "Chat on WhatsApp" escape hatch button MUST be present inside the AI chat widget UI pointing to `https://wa.me/996655273`.
