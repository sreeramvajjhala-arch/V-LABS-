# Technical Requirements Analysis: R2 & R4 (Canvas Particle Physics & Interactive Demo UI)

## Executive Summary
This document delivers a comprehensive technical specification, physics model, mathematical formulation, event architecture, and UI state blueprint for **Requirement R2 (Interactive Mouse & Touch Physics)** and **Requirement R4 (Live Interactive Demo Page & UI Controls)** of the `canvas_particle_bg` project.

---

## 1. Scope & Boundaries Analysis

| Requirement | Description | Key Components |
|---|---|---|
| **R2** | Interactive Mouse & Touch Physics | Cursor/Touch state tracking, Proximity Repulsion, Dynamic Web Line Thresholds, Click Shockwave Impulse |
| **R4** | Live Interactive Demo Page & UI Controls | Luxury Dark Mode Aesthetic (`#4A0000` to `#1A0202`), Density & Speed Sliders, Mouse Toggle, 4 Color Palettes, Play/Pause Controls, Glassmorphism UI |

---

## 2. Requirement R2: Interactive Mouse & Touch Physics Analysis

### 2.1 Pointer State & Event Normalization Schema
To ensure seamless mouse and touch support across desktops, tablets, and smartphones, pointer coordinates are normalized relative to canvas bounding geometry.

```javascript
const pointerState = {
  x: null,              // Canvas-relative X coordinate (px)
  y: null,              // Canvas-relative Y coordinate (px)
  isActive: false,      // True when cursor/finger is within canvas bounds
  isPressed: false,     // True during mousedown / touchstart
  radius: 150,          // Proximity interaction radius (px)
  lastMoveTimestamp: 0  // Event throttle tracking
};
```

#### Event Handling & Touch Support
- **Events**: `mousemove`, `mouseleave`, `mouseenter`, `touchstart`, `touchmove`, `touchend`, `touchcancel`, `click`.
- **Coordinate Transformation**:
  $$\text{canvasX} = (\text{event.clientX} - \text{rect.left}) \times \left(\frac{\text{canvas.width}}{\text{rect.width}}\right)$$
  $$\text{canvasY} = (\text{event.clientY} - \text{rect.top}) \times \left(\frac{\text{canvas.height}}{\text{rect.height}}\right)$$
- **Performance Guideline**: Pointer event handlers ONLY update `pointerState.x` and `pointerState.y`. Force calculations and particle velocity updates are computed strictly within the `requestAnimationFrame` render loop to prevent main thread layout thrashing.

---

### 2.2 Sub-requirement R2.1: Proximity Repulsion & Displacement

#### Mathematical Formulation
When the pointer is active and within interaction radius $R_{repel}$ (default 150px) of a particle at $(p_x, p_y)$:

1. **Distance Calculation**:
   $$\Delta x = p_x - \text{pointer.x}, \quad \Delta y = p_y - \text{pointer.y}$$
   $$d = \sqrt{\Delta x^2 + \Delta y^2}$$

2. **Bounding Box Pre-Filter (Optimization)**:
   $$\text{If } |\Delta x| > R_{repel} \text{ or } |\Delta y| > R_{repel}, \text{ skip square root calculation.}$$

3. **Repulsion Force Vector**:
   $$\text{If } 0 < d < R_{repel}:$$
   $$\hat{u}_x = \frac{\Delta x}{d}, \quad \hat{u}_y = \frac{\Delta y}{d}$$
   $$F_{repel} = \left(1 - \frac{d}{R_{repel}}\right)^2 \times F_{max} \times \text{speedMultiplier}$$
   $$v_x \leftarrow v_x + \hat{u}_x \cdot F_{repel}$$
   $$v_y \leftarrow v_y + \hat{u}_y \cdot F_{repel}$$

4. **Velocity Damping & Dextrous Drift Return**:
   To ensure smooth organic movement after repulsion:
   $$v_x \leftarrow v_x \times 0.95 + v_{base\_x} \times 0.05$$
   $$v_y \leftarrow v_y \times 0.95 + v_{base\_y} \times 0.05$$

---

### 2.3 Sub-requirement R2.2: Dynamic Connecting Web Lines

Connecting lines form a responsive geometric network between close particles and between particles and the cursor.

#### Distance Thresholds
- **Particle-to-Particle Web ($R_{P2P}$)**: 120px threshold.
- **Particle-to-Mouse Web ($R_{P2M}$)**: 150px threshold (when mouse physics is enabled).

#### Opacity & Styling Function
Line stroke opacity $\alpha$ decays linearly with distance to create a smooth fading mesh:
$$\alpha = \alpha_{base} \times \left(1 - \frac{d}{R_{threshold}}\right)$$
$$\text{ctx.strokeStyle} = \text{`rgba(\$\{color.r\}, \$\{color.g\}, \$\{color.b\}, \$\{\alpha.toFixed(3)\})`}$$
$$\text{ctx.lineWidth} = 0.8 \text{ px}$$

#### Complexity Optimization Strategy
For $N$ particles, naive distance matrix is $O(N^2)$.
To maintain steady 60 FPS performance:
- Spatial bounding box pre-filtering ($|\Delta x| < R \land |\Delta y| < R$) eliminates >75% of expensive `Math.sqrt()` calls.
- Double-pass elimination ($j > i$) prevents duplicate line rendering.

---

### 2.4 Sub-requirement R2.3: Click Impulse Wave (Shockwave Ripple)

#### Impulse Wave Lifecycle Schema
```javascript
class ImpulseWave {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = 220;    // Maximum expansion radius (px)
    this.speed = 7;          // Radial propagation speed (px/frame)
    this.thickness = 25;     // Wavefront active zone thickness (px)
    this.force = 12;         // Maximum acceleration force
    this.active = true;
  }
  
  update() {
    this.radius += this.speed;
    if (this.radius > this.maxRadius) this.active = false;
  }
}
```

#### Shockwave Render & Particle Dynamics
1. **Visual Ring Rendering**:
   - Renders expanding circle stroke on canvas:
     $$\alpha_{wave} = 1 - \frac{\text{radius}}{\text{maxRadius}}$$
   - Canvas stroke with accent palette color and gradient fade.
2. **Particle Push Wave Physics**:
   - For each particle, calculate distance $d$ to impulse center $(x, y)$.
   - If $|d - \text{radius}| < \text{thickness}$, particle is on the wavefront:
     $$\hat{u}_x = \frac{p_x - x}{d}, \quad \hat{u}_y = \frac{p_y - y}{d}$$
     $$F_{wave} = \text{force} \times \left(1 - \frac{\text{radius}}{\text{maxRadius}}\right)$$
     $$v_x \leftarrow v_x + \hat{u}_x \cdot F_{wave}$$
     $$v_y \leftarrow v_y + \hat{u}_y \cdot F_{wave}$$

---

## 3. Requirement R4: Live Interactive Demo Page & UI Controls Analysis

### 3.1 Luxury Dark Mode Aesthetic & Design System Integration
Per project guidelines in `AGENTS.md`:
- **Background Gradient**:
  - CSS Linear/Radial Gradient: `#4A0000` (Deep Crimson) $\rightarrow$ `#1A0202` (Dark Maroon).
  - Canvas background fill option for offscreen/standalone export.
- **Typography**:
  - Headlines: Google Font `Cinzel` (Serif, elegant luxury).
  - Body / Controls: Google Font `Plus Jakarta Sans`.
- **Glassmorphism Overlay Card**:
  - `.glass-card` styling with `backdrop-filter: blur(12px)`, `rgba(30, 2, 2, 0.7)` background, `rgba(255, 255, 255, 0.15)` borders.
  - Fallback rule: `@supports not (backdrop-filter: blur(12px))` provides solid `rgba(45, 5, 5, 0.95)`.

---

### 3.2 UI Control Panel Specification

| Control ID | Element Type | Range / Options | Default | Handler Effect |
|---|---|---|---|---|
| `density-slider` | `<input type="range">` | `20` to `200` | `80` | Adjusts active particle pool size dynamically using Lodash array transforms |
| `speed-slider` | `<input type="range">` | `0.2` to `3.0` | `1.0` | Scales base particle drift velocity multiplier |
| `mouse-toggle` | `<input type="checkbox">` | `ON` / `OFF` | `ON` | Toggles proximity repulsion & mouse web line rendering |
| `palette-select` | `<select>` / Swatches | 4 Color Themes | `Maroon & Gold` | Updates particle dot, line, & stroke color arrays |
| `play-pause-btn` | `<button>` | `Play` / `Pause` | `Running` | Toggles `requestAnimationFrame` render loop |
| `reset-btn` | `<button>` | Trigger | - | Resets all sliders, toggles, and state to default |
| `whatsapp-link` | `<a>` | Escape Hatch | `wa.me/996655273` | Human escape hatch per AGENTS.md rule |

---

### 3.3 Color Palette Theme Matrix

```javascript
const PALETTES = {
  maroon_gold: {
    name: "Luxury Maroon & Gold",
    bgGradient: ["#4A0000", "#1A0202"],
    particles: ["#FFD700", "#FFF8DC", "#FFFFFF", "#E6C280", "#E11D48"],
    webLine: "255, 215, 0", // RGB string for alpha formatting
    accent: "#FFD700"
  },
  cyber_crimson: {
    name: "Cyber Crimson",
    bgGradient: ["#3B0008", "#0F0003"],
    particles: ["#FF2A6D", "#05D9E8", "#D1D1D1", "#FFFFFF"],
    webLine: "255, 42, 109",
    accent: "#FF2A6D"
  },
  emerald_night: {
    name: "Emerald Night",
    bgGradient: ["#042923", "#01120F"],
    particles: ["#10B981", "#6EE7B7", "#F3F4F6", "#F59E0B"],
    webLine: "16, 185, 129",
    accent: "#10B981"
  },
  sapphire_dark: {
    name: "Sapphire Dark",
    bgGradient: ["#0B192C", "#030712"],
    particles: ["#38BDF8", "#818CF8", "#E2E8F0", "#FFFFFF"],
    webLine: "56, 189, 248",
    accent: "#38BDF8"
  }
};
```

---

## 4. Testability & Automated Verification Strategy

To ensure zero regressions and high code quality, `canvas_particle_bg/tests/suite.js` will execute automated unit and integration tests under Node.js:

1. **Physics Math Verification**:
   - Test vector repulsion calculation output matches expected direction & magnitude decay.
   - Test distance threshold bounding box filter produces identical results to full Euclidean distance check.
   - Test shockwave impulse wavefront force application.
2. **State & UI Control Verification**:
   - Test particle array resize logic on density change.
   - Test palette switcher state update and invalid palette fallback.
   - Test pause/play loop toggle state machine.
   - Test AGENTS.md compliance: check presence of WhatsApp escape hatch link `https://wa.me/996655273`.

---

## 5. Architectural Recommendations for Implementation Workstream
- Maintain clean modular separation in `app.js`: Config object, State object, Engine class/module, Event listeners, UI bind handlers.
- Use Lodash functions (`_.throttle`, `_.clamp`, `_.random`, `_.take`, `_.forEach`) for performance and code clarity as required by R3.
- Enforce strict 60 FPS budget with performance timestamp profiling.
