# Project: Minimalist Canvas Animated Particle Background & Live Demo

## Architecture
- **Engine Core**: `particle-engine.js` — Pure Vanilla JS + HTML5 2D Canvas + Lodash 4.17.21.
- **Physics Engine**: Radial repulsion, distance-squared connecting web lines, and impulse shockwave propagation.
- **Demo UI**: `index.html` + `app.js` — Tailwind CSS CDN + Font Awesome 6.5 + Google Fonts (`Cinzel` & `Plus Jakarta Sans`) + V Labs luxury dark mode theme (#4A0000 to #1A0202).
- **Test Infrastructure**: `tests/suite.js` — Independent Node.js TDD assertion suite running 28+ unit tests and 48+ integration tests across 7 tiers.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Bubble Particles | Drifting circles/dots with sin-wave breathing/pulse dynamics | M1 | R1 |
| 2 | Spinning Lines | Rotating line segments with center rotation kinematics | M1 | R1 |
| 3 | Lodash Integration | `_.random`, `_.clamp`, `_.sample`, `_.range`, `_.debounce`, `_.throttle`, `_.forEach` | M1 | R3 |
| 4 | Proximity Repulsion | Cursor & touch displacement force with velocity damping | M1 | R2 |
| 5 | Connecting Web Lines | Opacity-decay connecting lines with $d^2$ distance pre-filtering | M1 | R2 |
| 6 | Click Impulse Wave | Radial shockwave propagating outward from click/touch location | M1 | R2 |
| 7 | Debounced Resize & Events | 300ms debounced window resize & 16ms throttled mouse movement | M1 | R3 |
| 8 | Luxury Dark UI | #4A0000 crimson to #1A0202 maroon gradient with glassmorphism | M2 | R4 |
| 9 | Density & Speed Sliders | Real-time particle density (20-200) & speed (0.2x-3.0x) control | M2 | R4 |
| 10 | Physics & Play Controls | Mouse physics toggle button & Animation Play/Pause toggle button | M2 | R4 |
| 11 | Color Palette Switcher | 4 luxury color palettes (Maroon/Gold, Cyber Crimson, Emerald Night, Sapphire Dark) | M2 | R4 |
| 12 | Escape Hatch & Layout | Manual WhatsApp escape hatch (`https://wa.me/996655273`) & responsive UI | M2 | R4 |
| 13 | Automated TDD Suite | Node test suite (`node tests/suite.js`) covering Tiers 1-7 & performance checks | M3 | AC |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Canvas Particle Engine & Physics | `particle-engine.js` (R1, R2, R3) | None | DONE |
| M2 | Live Interactive Demo Page & UI | `index.html`, `app.js` (R4) | M1 | DONE |
| M3 | Automated Test Suite & Audit | `tests/suite.js`, `README.md` (AC, Tiers 1-7, Audit) | M1, M2 | DONE |

## Interface Contracts

### Canvas Particle Engine Interface (`ParticleEngine`)
```js
class ParticleEngine {
  constructor(canvasElement, configOptions = {})
  init() // Initialize canvas dimensions, DPI scaling, particles
  start() // Start 60 FPS animation loop
  stop() // Pause animation loop
  destroy() // Clean up event listeners & timers (zero memory leak)
  setDensity(count) // Update particle count
  setSpeed(multiplier) // Update speed multiplier
  setPalette(paletteKey) // Update active color palette
  togglePhysics(enabled) // Toggle mouse/touch interaction
  triggerImpulse(x, y) // Spawn radial click impulse shockwave
}
```

### Color Palettes
1. `maroon_gold`: Gold `#F59E0B`, White `#FFFFFF`, Rose `#FDA4AF`, Line `rgba(245, 158, 11, 0.25)`
2. `cyber_crimson`: Crimson `#E11D48`, Neon Pink `#F43F5E`, Soft Gray `#E5E5E5`, Line `rgba(225, 29, 72, 0.25)`
3. `emerald_night`: Emerald `#10B981`, Mint `#34D399`, Ice White `#F0FDF4`, Line `rgba(16, 185, 129, 0.25)`
4. `sapphire_dark`: Sapphire `#3B82F6`, Sky `#38BDF8`, Pearl `#F0F9FF`, Line `rgba(59, 130, 246, 0.25)`

## Code Layout
```
c:\Users\dell\OneDrive\Documents\V_labs\canvas_particle_bg\
├── index.html                     # Live demo page with luxury dark mode UI & canvas
├── app.js                         # Demo page controller, UI event bindings, theme swapper
├── particle-engine.js             # Minimalist Canvas particle engine core & physics
├── README.md                      # Project documentation & usage guide
└── tests/
    └── suite.js                   # Automated TDD Node.js test runner (28+ tests)
```
