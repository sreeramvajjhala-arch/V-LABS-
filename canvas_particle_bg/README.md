# Ambient Minimalist Canvas Particle Background

[![V Labs Studio](https://img.shields.io/badge/V%20Labs-24--Hour%20Studio-4A0000?style=for-the-badge)](https://wa.me/996655273)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber500.svg?style=for-the-badge)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-28%2F28%20Passed-emerald600.svg?style=for-the-badge)](tests/suite.js)

An ambient, lightweight **HTML5 2D Canvas Animated Particle Background System** and live interactive demo page. Features drifting geometric shapes (floating bubbles with sin-wave pulse dynamics and spinning lines with center rotation kinematics), interactive cursor/touch proximity physics, dynamic connecting web lines, and click impulse shockwave propagation.

Built strictly according to **Ponytail Minimalist Architecture** — zero heavy frameworks, zero bloat, zero memory leaks, and high 60 FPS performance.

---

## 🌟 Overview & Features

- **Dual-Geometry Particle System**: Alternates between floating bubbles (dots with subtle pulse breathing) and spinning line segments with trigonometric endpoint kinematics.
- **Interactive Mouse & Touch Physics**: Real-time cursor proximity repulsion force, dynamic connecting web lines with distance-squared opacity decay, and click/touch impulse shockwaves.
- **Lodash Utility Integration**: Uses Lodash 4.17.21 (`_.random`, `_.clamp`, `_.sample`, `_.range`, `_.debounce`, `_.throttle`, `_.forEach`) with automatic fallback resolution for Node environments.
- **Luxury Dark Mode Aesthetic**: Styled to match V Labs signature theme (`#4A0000` deep crimson to `#1A0202` dark maroon radial gradient) with glassmorphic controls and solid `@supports` fallbacks.
- **Real-Time Live UI Controls**: Customizable particle density (20–200), drift speed (0.2x–3.0x), physics toggle, play/pause state toggle, and 4 luxury color palette swatches.

> [!NOTE]
> All client operations strictly observe zero Gemini API key exposure in `app.js`.

---

## 🚀 Quick Start & Local Serving

### Serve Live Demo Locally

Serve the component demo using Python's built-in HTTP server:

```bash
# Serve from project root or canvas_particle_bg directory
python -m http.server 8080
```

Then open your browser at:
`http://localhost:8080/canvas_particle_bg/` (or `http://localhost:8080` if served inside directory).

---

## 🧪 Automated Test Suites

The project includes an automated TDD Node.js test runner covering 28 test cases across 7 verification tiers:

### Run Component Test Suite

```bash
node tests/suite.js
```

### Run Root V Labs Project Test Suite

```bash
node ../tests/suite.js
```

### Verification Tiers Covered

| Tier | Focus Area | Tests | Status |
|---|---|---|---|
| **Tier 1** | Engine Core & Config Initialization | 6 | PASS |
| **Tier 2** | Mathematics & Physics Kinematics | 6 | PASS |
| **Tier 3** | Lifecycle, Events & Memory Management | 2 | PASS |
| **Tier 4** | Lodash Utility Functions Integration | 2 | PASS |
| **Tier 5** | AGENTS.md Compliance & Security | 1 | PASS |
| **Tier 6** | Resilience & Edge-Case Input Sanitization | 5 | PASS |
| **Tier 7** | DOM & UI Contract Verification | 6 | PASS |

---

## 📖 API Reference (`ParticleEngine`)

### Constructor

```js
const engine = new ParticleEngine(canvasElement, configOptions);
```

#### `configOptions` Object

| Parameter | Type | Default | Description |
|---|---|---|---|
| `density` | `number` | `80` | Initial particle count (clamped between `10` and `300`). |
| `speedMultiplier` | `number` | `1.0` | Global drift speed factor (clamped between `0.1` and `5.0`). |
| `palette` | `string` | `'maroon_gold'` | Active palette key (`maroon_gold`, `cyber_crimson`, `emerald_night`, `sapphire_dark`). |
| `mousePhysicsEnabled` | `boolean` | `true` | Enables cursor & touch proximity repulsion and web connecting lines. |
| `shapeRatio` | `number` | `0.5` | Ratio of bubbles to spinning lines (`0.5` = 50% bubbles, 50% lines). |

---

### Instance Methods

#### `engine.init()`
Initializes canvas dimensions, high-DPI resolution scaling, event listeners, and instantiates the particle pool.

#### `engine.start()`
Starts the continuous 60 FPS `requestAnimationFrame` loop.

#### `engine.stop()`
Pauses the animation loop and cancels active frame requests.

#### `engine.destroy()`
Stops animation, unbinds all DOM event listeners (resize, mouse, touch), clears particle and shockwave arrays, and nullifies canvas/context references for zero memory leaks.

#### `engine.setDensity(count)`
Dynamically resizes particle array between `10` and `300`. Preserves existing particles when expanding or shrinking. Safe against `NaN` inputs.

#### `engine.setSpeed(multiplier)`
Updates drift velocity scaling factor between `0.1x` and `5.0x`. Safe against `NaN` inputs.

#### `engine.setPalette(paletteKey)`
Swaps active color theme and updates color values of all existing particles cleanly.

#### `engine.togglePhysics(enabled)`
Toggles mouse and touch physics interaction on or off.

#### `engine.triggerImpulse(x, y)`
Spawns an expanding radial shockwave force at coordinates `(x, y)`. Shockwaves accelerate nearby particles outward with velocity damping. Capped at 10 simultaneous active shockwaves.

#### `engine.update()`
Executes particle position drift, sin-wave pulse calculation, line rotation kinematics, boundary wrap-around, proximity repulsion force application, impulse shockwave push, and velocity damping.

#### `engine.render()`
Clears the canvas, draws particle-to-particle connecting web lines, draws particle-to-mouse connecting web lines, renders active shockwave rings, and renders bubble and line particles.

---

### Color Palettes (`ParticleEngine.PALETTES`)

```js
ParticleEngine.PALETTES = {
  maroon_gold: {
    name: "Luxury Maroon & Gold",
    bgGradient: ["#4A0000", "#1A0202"],
    particles: ["#FFD700", "#FFF8DC", "#FFFFFF", "#E6C280", "#E11D48"],
    webLine: "245, 158, 11",
    accent: "#FFD700"
  },
  cyber_crimson: {
    name: "Cyber Crimson",
    bgGradient: ["#3B0008", "#0F0003"],
    particles: ["#FF2A6D", "#05D9E8", "#D1D1D1", "#FFFFFF"],
    webLine: "225, 29, 72",
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
    webLine: "59, 130, 246",
    accent: "#38BDF8"
  }
};
```

---

## ⚡ Technical & Physics Breakdown

### R1. Minimalist Animated Canvas Background Component
- **Bubbles**: Rendered as smooth circles (`ctx.arc`). Radius oscillates smoothly via trigonometric sin-wave breathing:
  $$r(t) = r_{\text{base}} + A \cdot \sin(\omega t + \phi)$$
- **Spinning Lines**: Rendered as line segments rotating around their geometric center. Trigonometric endpoint calculation:
  $$x_1 = x - \frac{L}{2}\cos\theta, \quad y_1 = y - \frac{L}{2}\sin\theta$$
  $$x_2 = x + \frac{L}{2}\cos\theta, \quad y_2 = y + \frac{L}{2}\sin\theta$$

### R2. Interactive Mouse & Touch Physics
- **Proximity Repulsion**: When mouse cursor is within 150px of a particle, an inverse-squared force vector repels the particle away from cursor position.
- **Connecting Web Lines**: Pre-filtered line connections drawn between particles within 120px threshold and between cursor and particles within 150px threshold. Opacity decays linearly with distance.
- **Click Impulse Wave**: Radial shockwaves propagate outward at velocity of 7px/frame. Particles passing through the shockwave boundary receive a velocity impulse:
  $$\vec{v} \leftarrow \vec{v} + \hat{u} \cdot F_{\text{wave}}$$
- **Velocity Damping**: Smooth exponential damping (`v = v * 0.95 + baseV * 0.05`) restores particles back to base drift speeds after physics disturbances.

### R3. Lodash Utilities Integration
- Particle update loops, random bounds generation, clamping, and event handling leverage Lodash (`_.random`, `_.clamp`, `_.sample`, `_.range`, `_.debounce`, `_.throttle`, `_.forEach`).
- Window resize events are debounced by 300ms (`_.debounce`).
- Mouse movement events are throttled to 16ms (~60 FPS, `_.throttle`).

### R4. Live Interactive Demo Page & UI Controls
- **Glassmorphic Design System**: `.glass-card` uses `backdrop-filter: blur(12px)` with fallback rule for older browsers (`rgba(45, 5, 5, 0.95)`).
- **Controls**: Interactive sliders for particle density (20–200) and drift speed (0.2x–3.0x), physics toggle, play/pause button, and 4 swatch palette selectors.

---

## 📊 Performance Metrics & Engineering Highlights

- **$d^2$ Distance Pre-filtering**: Calculates bounding box difference `Math.abs(dx) > threshold` before computing `dx * dx + dy * dy` to avoid expensive `Math.sqrt()` calculations for distant particles.
- **60 FPS Animation Engine**: Optimized `requestAnimationFrame` loop handles up to 300 active particles at 60 FPS without dropping frames or triggering GC layout trashing.
- **High-DPI / Retina Canvas Scaling**: Canvas internal resolution scales dynamically with `window.devicePixelRatio` for razor-sharp rendering on Retina, 4K, and mobile screens.
- **Zero Memory Leaks**: Comprehensive `destroy()` teardown removes all window and canvas listeners, cancels pending debounced handlers, empties arrays, and releases canvas context references.

---

## 💬 Human Escape Hatch & Support

For business automation, custom digital studio solutions, or direct developer support, reach out to V Labs on WhatsApp:

👉 **[Chat on WhatsApp with V Labs](https://wa.me/996655273)** (`https://wa.me/996655273`)

---

© 2026 V Labs — Vizag's 24-Hour Digital Studio & Business Automation.
