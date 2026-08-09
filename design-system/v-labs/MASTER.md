# Design System Master File — V Labs

> **LOGIC:** When building a specific page, first check `design-system/v-labs/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** V Labs — Vizag's 24-Hour Digital Studio & Business Automation  
**Aesthetic Style:** Luxury Dark Glassmorphism (Deep Crimson & Dark Maroon)  
**Target Platform:** Mobile-First Responsive Web (HTML5, Tailwind CSS, Vanilla JS)  

---

## 1. Color Palette & Design Tokens

### Core Brand & Semantic Colors

| Role | Hex / HSL | CSS Token | Usage / Accessibility |
|------|-----------|-----------|------------------------|
| **Background Start** | `#4A0000` | `--color-bg-start` | Deep Crimson gradient top |
| **Background End** | `#1A0202` | `--color-bg-end` | Dark Maroon / near-black gradient bottom |
| **Surface Card** | `rgba(45, 5, 5, 0.65)` | `--color-surface-card` | Glassmorphic card surface with `blur(12px)` |
| **Surface Nav** | `rgba(26, 2, 2, 0.85)` | `--color-surface-nav` | Sticky navbar surface with `blur(16px)` |
| **Surface Modal** | `rgba(30, 3, 3, 0.94)` | `--color-surface-modal` | Modal dialog background with `blur(20px)` |
| **Primary Text** | `#FFFFFF` | `--color-text-primary` | Pure White (Headlines, primary UI text, 15:1 contrast) |
| **Secondary Text** | `#E5E5E5` | `--color-text-secondary` | Muted Soft White (Subheadings, body paragraphs, 11:1 contrast) |
| **Muted Text / Border** | `#D1D1D1` | `--color-text-muted` | Soft Light Gray (Subtle icons, secondary borders, 9:1 contrast) |
| **Accent Crimson Glow** | `#E11D48` | `--color-accent-crimson` | Crimson Rose highlight / active pill glow |
| **Accent Gold Luxury** | `#F59E0B` | `--color-accent-gold` | Gold proof badges, 24h speed badges, CTA highlights |
| **WhatsApp Escape Hatch** | `#22C55E` | `--color-accent-whatsapp` | Manual WhatsApp direct contact CTA |
| **Subtle Glass Border** | `rgba(229, 229, 229, 0.2)` | `--color-border-subtle` | Glass card standard border |
| **Hover Glass Border** | `rgba(255, 255, 255, 0.45)` | `--color-border-hover` | Glass card active hover border |
| **Focus Ring** | `rgba(225, 29, 72, 0.7)` | `--color-focus-ring` | Keyboard navigation accessibility outline ring |

### Fallback Rules (No Backdrop-Filter Support)
For browsers or low-power mobile engines that do not support `backdrop-filter`:
```css
@supports not (backdrop-filter: blur(12px)) {
  .glass-card, .glass-modal {
    background: rgba(45, 5, 5, 0.95) !important;
  }
  .glass-nav {
    background: rgba(26, 2, 2, 0.95) !important;
  }
}
```

---

## 2. Typography & Font Pairings (Option 4: Swiss Geometric Minimalist)

### Google Fonts System

1. **Heading Display Font:** `Outfit` (`500`, `600`, `700`, `800`, `900`)
   - *Style:* Ultra-clean, geometric display sans-serif.
   - *Usage:* Main section titles (`h1`, `h2`), modal headlines, feature card headers.
   - *Tracking:* `letter-spacing: -0.02em` (`tracking-tight`) to `0.02em`.

2. **Body & UI Font:** `Plus Jakarta Sans` (`300`, `400`, `500`, `600`, `700`, `800`)
   - *Style:* Modern, highly legible geometric sans-serif.
   - *Usage:* Body copy, nav links, buttons, form inputs, card text.

3. **Terminal Monospace Font:** `JetBrains Mono` (`400`, `500`)
   - *Style:* Precise developer monospace font.
   - *Usage:* Terminal typewriter simulation, live demo terminal logs, code snippets.

### Google Fonts Embed URL
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

### Fluid Typography Token Scale

| Token | Size | Line Height | Recommended Usage |
|-------|------|-------------|-------------------|
| `text-xs` | `0.75rem` (12px) | `1.5` | Footers, status tags, metadata |
| `text-sm` | `0.875rem` (14px) | `1.5` | Subtext, nav links, form labels |
| `text-base` | `1rem` (16px) | `1.6` | Body paragraphs, form inputs (prevents iOS auto-zoom) |
| `text-lg` | `1.125rem` (18px) | `1.5` | Lead copy, card titles, button labels |
| `text-xl` | `1.25rem` (20px) | `1.4` | Subheadings, section titles |
| `text-2xl` | `clamp(1.25rem, 2vw + 1rem, 1.5rem)` | `1.3` | Card headers, feature highlights |
| `text-3xl` | `clamp(1.5rem, 3vw + 1rem, 2rem)` | `1.2` | Hero subhead, modal titles |
| `text-4xl` | `clamp(2rem, 4vw + 1rem, 2.5rem)` | `1.1` | Main section headings (`h2`) |
| `text-5xl` | `clamp(2.5rem, 5vw + 1rem, 3.5rem)` | `1.05` | Main hero headline (`h1`) |

---

## 3. Component Tokens & Specifications

### Glassmorphic Card Token (`.glass-card`)
- **Background:** `rgba(45, 5, 5, 0.65)`
- **Backdrop Blur:** `blur(12px)`
- **Border:** `1px solid rgba(229, 229, 229, 0.2)`
- **Border Radius:** `16px` (`rounded-2xl`)
- **GPU Animation Budget:** ONLY `transform` (`translateY(-4px)`) and `opacity`. NEVER animate `box-shadow` or layout bounds.
- **Hover Border:** `rgba(255, 255, 255, 0.45)`

### Sticky Glass Navbar (`.glass-nav`)
- **Background:** `rgba(26, 2, 2, 0.85)`
- **Backdrop Blur:** `blur(16px)`
- **Border Bottom:** `1px solid rgba(229, 229, 229, 0.15)`
- **Height:** `64px` (`4rem`)

### Modal Container Token (`.glass-modal`)
- **Background:** `rgba(30, 3, 3, 0.94)`
- **Backdrop Blur:** `blur(20px)`
- **Border:** `1px solid rgba(255, 255, 255, 0.25)`
- **Border Radius:** `24px` (`rounded-3xl`)

### Primary Action Button (`.btn-primary`)
- **Style:** Pure white text on crimson/maroon translucent fill with bright border contrast.
- **Hover State:** `transform: translateY(-2px);` opacity transition `0.3s`.
- **Active State:** `transform: scale(0.96);`
- **Cursor:** `cursor: pointer;`

### Human Escape Hatch ("Chat on WhatsApp")
- **Target URL:** `https://wa.me/996655273`
- **Accent Color:** WhatsApp Emerald (`#22C55E`)
- **Icon:** Font Awesome `<i class="fa-brands fa-whatsapp"></i>`
- **Behavior:** Opens WhatsApp directly in new tab with pre-filled message support.

### Form Inputs & Mobile Accessibility
- **Font Size:** Minimum `16px` (`text-base`) to enforce ZERO auto-zooming on iOS Safari.
- **Background:** Solid dark crimson input surface `rgba(20, 2, 2, 0.75)`
- **Border:** `1px solid rgba(229, 229, 229, 0.25)`
- **Focus Ring:** `2px solid rgba(225, 29, 72, 0.8)` with `outline: 2px solid transparent;`

---

## 4. Accessibility & Animation Rules

1. **WCAG AAA Text Contrast:** All primary text (#FFFFFF) against deep crimson (#4A0000) achieves >15:1 contrast ratio.
2. **Keyboard Focus Rings:** Explicit `:focus-visible` styling on all interactive links, buttons, and inputs.
3. **Prefers Reduced Motion:**
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, ::before, ::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
4. **Mobile Touch Budget:** All touch targets maintain a minimum hit area of `44x44px`.

---

## 5. Pre-Delivery Verification Checklist

- [x] No emojis used as functional icons (Font Awesome 6.5 SVG/icon classes used)
- [x] `cursor-pointer` enforced on all interactive buttons and tabs
- [x] GPU-only animations (`transform` & `opacity`)
- [x] Google Fonts includes `Cinzel`, `Plus Jakarta Sans`, and `JetBrains Mono`
- [x] Glassmorphism `@supports not (backdrop-filter: blur(12px))` fallback rule present
- [x] WhatsApp link pointing to `https://wa.me/996655273` present as escape hatch
- [x] Zero Gemini API keys in client JavaScript `app.js`
- [x] Automated test suite `node tests/suite.js` passing 100%
