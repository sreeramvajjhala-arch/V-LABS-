# Original User Request

## 2026-08-08T09:52:42Z

Build an ambient Minimalist Canvas Animated Particle Background component and live demo featuring drifting geometric shapes (alternating between floating bubbles and spinning lines) with interactive mouse physics, Lodash-assisted math/utilities, and Ponytail minimalist architecture.

Working directory: c:\Users\dell\OneDrive\Documents\V_labs\canvas_particle_bg
Integrity mode: development

## Requirements

### R1. Minimalist Animated Canvas Background Component (Ponytail + UI/UX Pro Max)
Develop an ambient HTML5 Canvas particle system generating a field of drifting geometric shapes using Ponytail design principles (lean, high-efficiency, zero unnecessary boilerplate). The animation must alternate between floating "bubbles" (circles/dots with subtle breathing/pulse dynamics) and spinning "lines" (rotating line segments) creating an organic yet technical atmosphere.

### R2. Interactive Mouse & Touch Physics
Implement responsive cursor & touch interactions:
- Mouse proximity repulsion/displacement (particles gently push away from cursor position).
- Dynamic connecting web lines when particles or mouse cursor come within threshold distance.
- Click ripple/impulse wave that temporarily accelerates nearby particles outward.

### R3. Lodash Utilities Integration
Integrate Lodash to assist with particle calculations, array transformations, random shape generation, distance calculations, and debounced resize & mouse movement events.

### R4. Live Interactive Demo Page & UI Controls
Provide a live demo showcasing the animated canvas header background with V Labs luxury dark mode aesthetic (#4A0000 crimson to #1A0202 maroon), customizable particle density/speed controls, mouse interaction toggle, color palette switcher, and pause/play controls.

## Acceptance Criteria

### Visual & Motion Quality
- Render smooth 60 FPS HTML5 Canvas animation featuring both drifting bubbles and rotating line particles.
- Mouse proximity displacement, proximity connecting lines, and click impulse effect perform fluidly at 60 FPS without lag.
- Canvas auto-resizes responsively to full window/container dimensions with debounced resize handlers.
- Aesthetics strictly follow luxury dark mode palette (#4A0000 crimson to #1A0202 maroon) with crisp white/gold/rose particle accents.

### Code Quality & Minimalist Architecture (Ponytail)
- Minimalist implementation without unnecessary external frameworks or bloat.
- Clean modular architecture with Lodash integration for particle updates, distance math, and debounced event handling.
- No memory leaks, layout shifts, or performance degradation during long animation loops or rapid mouse movement.
