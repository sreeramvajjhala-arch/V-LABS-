# Technical Specification: Ambient Minimalist Canvas Animated Particle Background & Live Demo

**Version**: 1.0.0  
**Target Directory**: `c:\Users\dell\OneDrive\Documents\V_labs\canvas_particle_bg`  
**Integrity Mode**: Development / High-Performance TDD  
**Specification Miner**: `teamwork_preview_spec_miner_survey_3`  
**Date**: 2026-08-08  

---

## 1. Overview & Architecture

This specification defines the technical requirements, interface contracts, performance benchmarks, testing protocols, and minimalist architecture constraints for an ambient **Minimalist Canvas Animated Particle Background Component** and companion **Live Interactive Demo Page**.

The system creates an organic yet technical visual environment featuring drifting geometric shapes that alternate between **floating bubbles** (circles with subtle breathing/pulse dynamics) and **spinning lines** (rotating line segments), combined with real-time **mouse & touch proximity physics**, dynamic **connecting web lines**, and **click impulse shockwaves**.

The component is engineered adhering strictly to **Ponytail Minimalist Architecture** (zero heavy external frameworks, native HTML5 Canvas 2D Context, Lodash utility assistance, and zero memory leaks) while honoring the **V Labs Luxury Dark Mode Aesthetic** (`#4A0000` deep crimson to `#1A0202` dark maroon gradient with gold/crimson/rose accents).

---

## 2. Features Discovered & Interface Enumeration

### Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| F1 | Particle Engine | Drifting Floating Bubbles | Renders circular particles with subtle radial pulse/breathing dynamics and drifting motion vectors. | Canvas 2D Context, particle state `(x, y, radius, pulseSpeed, pulsePhase, color, alpha)` | Rendered glowing filled/stroked circle on canvas | Clamps radius to `[1.0, 15.0]px`; fallback to solid color if gradient fails. | `ORIGINAL_REQUEST.md` R1 |
| F2 | Particle Engine | Drifting Spinning Lines | Renders line segment particles that rotate around their center at defined angular velocities while drifting across canvas. | Canvas 2D Context, particle state `(x, y, length, angle, angularVelocity, speedX, speedY, color)` | Rendered rotated line segment on canvas | Wraps angle in `[0, 2π]`; fallback line length minimum 4px. | `ORIGINAL_REQUEST.md` R1 |
| F3 | Mouse Physics | Proximity Repulsion Force Field | Pushes particles away from mouse/touch cursor when cursor is within proximity threshold. | Mouse `(x, y)`, particle `(x, y)`, `mouseRadius` threshold (100–150px) | Mutated particle velocity `(vx, vy)` vector with inverse-distance force | Ignores calculation if distance is zero (`dx=0, dy=0`) to avoid division by zero. | `ORIGINAL_REQUEST.md` R2 |
| F4 | Mouse Physics | Dynamic Proximity Web Lines | Draws subtle connecting lines between nearby particles and between mouse cursor and nearby particles. | Particle array, mouse `(x, y)`, `connectDistance` threshold (100–130px) | Canvas stroke paths with distance-faded opacity (`alpha = 1 - d/maxD`) | Skips stroke if `alpha <= 0` or total connections exceed max performance threshold. | `ORIGINAL_REQUEST.md` R2 |
| F5 | Mouse Physics | Click Impulse Shockwave | Triggers an expanding radial ring from click/touch point that accelerates nearby particles outward. | Click `(x, y)`, timestamp, expansion radius (0–200px), impulse force multiplier | Mutated particle velocities and animated expanding ring render | Auto-disposes shockwave object after max lifespan (500ms). | `ORIGINAL_REQUEST.md` R2 |
| F6 | Utility Integration | Lodash Math & State Helpers | Uses Lodash (`_.random`, `_.clamp`, `_.sample`, `_.range`, `_.forEach`) for particle state creation, math bounds, and vector math. | Raw numerical inputs, arrays, collections | Sanitized random parameters, clamped values, transformed collections | Gracefully handles empty arrays; returns min/max boundaries if input invalid. | `ORIGINAL_REQUEST.md` R3 |
| F7 | Event Handling | Debounced Canvas Window Resize | Listens to window `resize` events with `_.debounce` to scale canvas dimensions to match container width/height. | Window `innerWidth`/`innerHeight` or container bounding box | Updated canvas width/height, updated DPI scale, re-bounded particles | Prevents rapid buffer reallocation thrashing during continuous window drag. | `ORIGINAL_REQUEST.md` R3 & Performance Target |
| F8 | Event Handling | Throttled / Passive Pointer Tracking | Tracks `mousemove`, `touchstart`, `touchmove`, `mouseleave`, `touchend` using `_.throttle` and passive event listeners. | DOM Pointer events | Updated `mouse.x`, `mouse.y`, `mouse.active` state | Resets `mouse.active = false` on `mouseleave`/`touchend` to halt cursor forces cleanly. | `ORIGINAL_REQUEST.md` R2, R3 |
| F9 | Live Demo UI | Interactive Control Panel | Floating glassmorphism card containing real-time tuning controls (density, speed, physics toggle, theme switcher, pause/play). | User UI inputs (sliders, checkboxes, select, buttons) | Dynamically updated particle config state object | Clamps inputs to safe ranges (e.g. max 300 particles) to prevent frame drops. | `ORIGINAL_REQUEST.md` R4 |
| F10 | Live Demo UI | Palette & Theme Switcher | Switches color palette for background gradient and particle stroke/fill accents (Luxury Crimson, Cyber Neon, Pure White, Emerald). | Selected theme ID | Canvas background CSS / gradient update & particle color re-assignment | Defaults to V Labs Luxury Dark Mode (`#4A0000` to `#1A0202`) if theme ID unknown. | `ORIGINAL_REQUEST.md` R4 & `AGENTS.md` |
| F11 | Live Demo UI | Pause / Play Engine State Control | Allows user to pause animation loop or resume it without losing particle state. | Button click event | Frozen animation state / `cancelAnimationFrame` or resumed `requestAnimationFrame` | Clears stored frame ID on pause to eliminate unnecessary CPU/GPU usage. | `ORIGINAL_REQUEST.md` R4 |
| F12 | Lifecycle & Memory | Zero-Leak Cleanup & Disposal | Provides clean `destroy()` or `stop()` interface that unbinds all window/DOM event listeners and cancels animation frames. | Destruction call | Removed event listeners, cleared particle array, cancelled rAF | Safely callable multiple times without throwing double-free or null pointer errors. | Performance Target |
| F13 | TDD Verification | Automated TDD Node Test Suite | Node.js test script (`tests/suite.js`) validating contracts, DOM structure, particle math, and zero key leaks. | Node.js test runner | Terminal test status (pass/fail summary and exit code 0/1) | Reports explicit failure details for broken assertions. | `AGENTS.md` & `SPEC.md` |

---

### Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| E1 | Proximity Repulsion | Mouse cursor placed directly on top of particle (`dx = 0, dy = 0`). | Distance `d = 0`. Division by zero handled by setting random slight nudge angle or skipping force addition. |
| E2 | Canvas Resize | Window resized to zero width/height (e.g. tab backgrounded or iframe hidden). | Canvas dimension clamped to `Math.max(1, width)` and `Math.max(1, height)`; animation loop safely pauses or skips draw pass. |
| E3 | Particle Bounds | Particle drifts outside canvas boundaries (`x < -50` or `x > canvas.width + 50`). | Toroidal wrapping: particle wraps smoothly to opposite edge with velocity preserved. |
| E4 | Rapid UI Slider Drag | User rapidly drags Particle Density slider from 10 to 300 and back. | Lodash `_.range` or array slicing resizes particle array without dropping references or leaving orphaned animation loop loops. |
| E5 | Touch Devices | Multi-touch drag or tap release. | `preventDefault()` applied to canvas touch events where needed to prevent page scrolling during canvas touch interaction. `mouse.active` correctly cleared on `touchend`. |
| E6 | High-DPI Screens | Display with `devicePixelRatio = 2` or `3` (Apple Retina, 4K displays). | Canvas buffer resolution set to `width * dpr`, CSS style set to `width * 1px`, `ctx.scale(dpr, dpr)` applied to maintain razor-sharp rendering at 60 FPS. |
| E7 | Browser Background Tab | User switches to a different browser tab. | `requestAnimationFrame` automatically throttles by browser; background clock delta calculation clamped to max `100ms` frame step to prevent giant particle jumps on tab return. |

---

## 3. Detailed Requirements Breakdown

### R1. Minimalist Animated Canvas Background Component
- **Component Interface**: Pure JavaScript class / module (e.g., `ParticleCanvas`) instantiated on a target `<canvas>` element or container element.
- **Particle Types**:
  1. **Bubble Particle**:
     - Geometry: Circular dot (`ctx.arc`).
     - Dynamics: Base radius `r` oscillating smoothly via sine wave (`r_current = r_base + Math.sin(phase) * amplitude`).
     - Render: Radial gradient fill or semi-transparent stroke with subtle glow (`shadowBlur` minimal/disabled for mobile performance budget).
  2. **Spinning Line Particle**:
     - Geometry: Straight line segment of length `L` rendered from `(-L/2, 0)` to `(L/2, 0)` under local 2D rotation matrix (`ctx.translate`, `ctx.rotate`).
     - Dynamics: Continuous angular rotation `angle += angularVelocity * dt`.
     - Render: Solid or gradient stroke line with capped line width (1px – 2.5px).
- **Distribution**: 50/50 mix or user-configurable ratio between Bubbles and Lines.

### R2. Interactive Mouse & Touch Physics
- **Repulsion Force Field**:
  - Distance formula: $d = \sqrt{(x_p - x_m)^2 + (y_p - y_m)^2}$.
  - Force magnitude: $F = \max(0, 1 - \frac{d}{R_{\text{mouse}}}) \times F_{\text{max}}$.
  - Repulsion vector: $\vec{v}_{\text{push}} = F \times \frac{\vec{p} - \vec{m}}{d}$.
- **Web Line Connections**:
  - Pairwise distance check between particle pairs and particle-mouse pairs within $R_{\text{connect}}$ (default 120px).
  - Alpha transparency: $\alpha = (1 - \frac{d}{R_{\text{connect}}}) \times \alpha_{\text{max}}$.
  - Line stroke color matches secondary text accent (`rgba(229, 229, 229, alpha)` or themed stroke).
- **Click Impulse Wave**:
  - Active shockwave ring object initialized at click position $(x_c, y_c)$ with creation time $t_0$.
  - Radius expansion: $R_{\text{shock}}(t) = v_{\text{shock}} \times (t - t_0)$.
  - Wave thickness: Ring band between $R_{\text{shock}} - \delta$ and $R_{\text{shock}} + \delta$.
  - Impulse force applied to particles intersecting the ring band, pushing them radially outward with velocity boost.

### R3. Lodash Utilities Integration
- **Lodash CDN / Dependency**: Lodash 4.17.21 (loaded via CDN `<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>` or ES module import).
- **Mandatory Lodash Function Usage**:
  - `_.random(min, max, floating)`: Generating particle initial positions, velocities, radii, and rotation speeds.
  - `_.clamp(number, lower, upper)`: Clamping particle speeds, radii, and alpha values within physical bounds.
  - `_.sample(collection)`: Selecting particle shape types (Bubble vs Line) or random color accents.
  - `_.range(start, end)`: Initializing and scaling particle array collections.
  - `_.debounce(func, wait)`: Debouncing canvas window resize handlers (150ms delay).
  - `_.throttle(func, wait)`: Throttling pointer movement events (16ms / 60Hz rate limit).
  - `_.forEach(collection, iteratee)` & `_.filter(collection, predicate)`: Iterating animation updates and cleaning up expired shockwaves.

### R4. Live Interactive Demo Page & UI Controls
- **Page Layout & Aesthetics**:
  - Full-screen or header canvas container `#particle-canvas`.
  - V Labs Luxury Dark Mode background: CSS linear gradient `linear-gradient(135deg, #4A0000 0%, #1A0202 100%)`.
  - Glassmorphic Floating Control Panel (`.glass-card`) positioned in bottom-right or top-right with backdrop blur and CSS `@supports not (backdrop-filter: blur(12px))` solid fallback background `rgba(45, 5, 5, 0.95)`.
- **UI Controls Map**:
  - **Density Control**: Slider (`range`, min: 20, max: 250, default: 80). Updates `config.density`.
  - **Speed Multiplier**: Slider (`range`, min: 0.1, max: 3.0, step: 0.1, default: 1.0). Updates `config.speedScale`.
  - **Mouse Physics**: Toggle Switch / Checkbox (default: ON). Enables/disables mouse push & connecting lines.
  - **Shape Mode Selector**: Dropdown or Pill Segment (`Both`, `Bubbles Only`, `Lines Only`).
  - **Theme Palette Selector**: Dropdown options:
    1. *Luxury Crimson & Gold* (Default): Background `#4A0000` to `#1A0202`, accents `#FFFFFF`, `#F59E0B`, `#E11D48`.
    2. *Cyber Neon Rose*: Background `#1E001E` to `#0A000D`, accents `#FF007F`, `#00F0FF`, `#FFFFFF`.
    3. *Monochrome Elegance*: Background `#121212` to `#050505`, accents `#FFFFFF`, `#A3A3A3`, `#525252`.
    4. *Emerald Glow*: Background `#002B18` to `#000F08`, accents `#10B981`, `#6EE7B7`, `#FFFFFF`.
  - **Play / Pause Button**: Icon button toggling between `fa-pause` and `fa-play`.
  - **Impulse Blast Button**: Action button triggering full-screen center impulse wave.
  - **Human Escape Hatch**: Always present "Chat on WhatsApp" escape hatch button linking to `https://wa.me/996655273`.

---

## 4. Performance Targets & Optimization Specifications

### 60 FPS Animation Engine
- **Target Frame Rate**: Consistent 60 FPS (16.67ms frame budget) on standard desktop and mobile browsers.
- **Render Loop Architecture**:
  - Standard `requestAnimationFrame(loop)` engine.
  - Delta time calculation: `dt = (currentTime - lastTime) / 1000`, capped at `0.1s` to prevent frame jumping on tab switch.
  - Batching: Single `ctx.clearRect(0, 0, width, height)` per frame.
  - Path Minimization: Group lines by stroke color to minimize state changes (`ctx.strokeStyle` and `ctx.stroke()` calls).

### Debounced Resize & High-DPI Display Scaling
- **Debounce Specification**: Window resize listener wrapped in `_.debounce(handleResize, 150)`.
- **DPI Adjustment**:
  ```javascript
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx.scale(dpr, dpr);
  ```
- **Zero Layout Shifts**: Canvas wrapper maintains explicit CSS aspect ratio or absolute overlay positioning (`position: absolute; inset: 0; z-index: 0; pointer-events: none;`) to eliminate Cumulative Layout Shift (CLS = 0).

### Memory Management & Garbage Collection Hygiene
- **Zero Object Allocation in Loop**: No `new` objects, closures, or array allocations created inside the `requestAnimationFrame` loop.
- **Pre-allocated Particle Arrays**: Particles are initialized once into a fixed-size buffer array. Adjusting density re-uses existing objects or trims array length without creating detached references.
- **Event Listener Unbinding**: The component exposes a `destroy()` method that explicitly removes window `resize`, `mousemove`, `touchstart`, `touchmove`, `touchend`, and `mouseleave` event handlers.

---

## 5. Ponytail Minimalist Constraints & Engineering Principles

In alignment with the **Ponytail** engineering methodology (from `C:\Users\dell\.gemini\config\plugins\agent-skills\skills\ponytail\SKILL.md`):

1. **The Ladder Application**:
   - *Rung 1 (YAGNI)*: Skip complex 3D renderers (Three.js, WebGL, Pixi.js) and heavy physics engines (Matter.js, Cannon.js). Use pure native 2D Canvas context.
   - *Rung 2 (Codebase reuse)*: Reuse existing V Labs styling tokens, `.glass-card` classes, and testing conventions (`tests/suite.js`).
   - *Rung 3 (Stdlib / Native)*: Use native `Math.sin`, `Math.cos`, `Math.atan2`, `Math.hypot`, and `requestAnimationFrame`.
   - *Rung 4 (Dependencies)*: Use already-specified lightweight Lodash utility functions for debouncing and collection math.
2. **Code Footprint Rules**:
   - Single cohesive component file (e.g. `canvas_particle_bg/particle-canvas.js`) and single standalone demo page (`canvas_particle_bg/index.html`).
   - Zero unneeded abstractions: No abstract particle inheritance hierarchies, factory wrappers, or multi-class boilerplate.
   - Self-contained, highly legible code structure.

---

## 6. Automated TDD & Test Suite Requirements (`tests/suite.js`)

The component and live demo must be fully testable via Node.js TDD test suite (`node tests/suite.js`).

### Unit Test Requirements
1. **Particle Initialization Verification**:
   - Test particle creation helpers with Lodash (`_.random`, `_.sample`).
   - Assert initial coordinates fall within canvas boundary `[0, width]` and `[0, height]`.
   - Assert bubble particles contain valid base radius and pulse parameters.
   - Assert line particles contain valid length, angle, and angular velocity.
2. **Physics Vector & Proximity Math Tests**:
   - Verify Euclidean distance calculation between point $(x_1, y_1)$ and $(x_2, y_2)$.
   - Verify repulsion force direction points away from cursor.
   - Verify proximity web line alpha calculation is 0 when $d \ge R_{\text{connect}}$ and $>0$ when $d < R_{\text{connect}}$.
3. **Lodash Integration Tests**:
   - Verify `_.debounce` creates a debounced function wrapper.
   - Verify `_.clamp` correctly restricts out-of-bounds values.

### Integration & Structural Contract Tests
1. **DOM Contract Verification**:
   - Assert demo `index.html` contains `#particle-canvas` element.
   - Assert UI control elements exist (`#density-slider`, `#speed-slider`, `#physics-toggle`, `#theme-select`, `#play-pause-btn`, `#impulse-btn`).
   - Assert WhatsApp escape hatch `https://wa.me/996655273` is present on the page.
   - Assert glassmorphic fallback CSS rule `@supports not (backdrop-filter: blur(12px))` is included.
2. **Security & Key Exposure Rules**:
   - Assert client JavaScript files contain NO Gemini API keys or credentials.

---

## 7. Visual Design & Theme System

### Color Palettes Definition Table
| Theme ID | Name | Canvas Background | Primary Accent | Secondary Accent | Web Line Accent |
|----------|------|-------------------|----------------|------------------|-----------------|
| `luxury-crimson` (Default) | Luxury Crimson & Gold | Gradient `#4A0000` to `#1A0202` | `#FFFFFF` (Pure White) | `#F59E0B` (Amber Gold) | `rgba(229, 229, 229, 0.15)` |
| `cyber-rose` | Cyber Neon Rose | Gradient `#1E001E` to `#0A000D` | `#FF007F` (Neon Pink) | `#00F0FF` (Cyan) | `rgba(0, 240, 255, 0.15)` |
| `monochrome` | Monochrome Elegance | Gradient `#121212` to `#050505` | `#FFFFFF` (Pure White) | `#A3A3A3` (Light Gray) | `rgba(255, 255, 255, 0.12)` |
| `emerald-glow` | Emerald Glow | Gradient `#002B18` to `#000F08` | `#10B981` (Emerald) | `#6EE7B7` (Mint) | `rgba(110, 231, 183, 0.15)` |

### Glassmorphic Control Panel CSS Specification
```css
.glass-card {
    background: rgba(45, 5, 5, 0.75);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    border-radius: 1rem;
}

/* Fallback for non-supporting browsers */
@supports not (backdrop-filter: blur(12px)) {
    .glass-card {
        background: rgba(45, 5, 5, 0.95) !important;
    }
}
```

---

## 8. Verification & Acceptance Criteria

1. **Visual Criteria**: Smooth 60 FPS animation loop displaying alternating floating bubbles and spinning lines.
2. **Physics Criteria**: Repulsion displacement, web line connections, and click shockwave perform fluidly at 60 FPS.
3. **Responsive Criteria**: Debounced window resize updates canvas dimensions and DPI scaling cleanly without layout shifts.
4. **Code Quality Criteria**: Ponytail minimalist implementation, zero memory leaks, clean unbinding on disposal, Lodash integration.
5. **Testing Criteria**: All unit, integration, and structural contract tests pass cleanly via `node tests/suite.js`.
