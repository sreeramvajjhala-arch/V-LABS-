/**
 * V Labs - Minimalist Canvas Animated Particle Background Demo Controller
 * 
 * Binds DOM controls to ParticleEngine instance and manages UI state.
 * ZERO Gemini API keys in app.js.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) {
    console.error('Particle canvas element #particleCanvas not found.');
    return;
  }

  // Check ParticleEngine availability
  if (typeof ParticleEngine === 'undefined') {
    console.error('ParticleEngine class is not loaded.');
    return;
  }

  // 1. Initialize ParticleEngine Instance
  const engine = new ParticleEngine(canvas, {
    density: 80,
    speedMultiplier: 1.0,
    palette: 'maroon_gold',
    mousePhysicsEnabled: true
  });

  // Start 60 FPS animation loop
  engine.start();

  // 2. Query UI Control Elements
  const densitySlider = document.getElementById('densitySlider');
  const densityValue = document.getElementById('densityValue');
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  const physicsToggle = document.getElementById('physicsToggle');
  const physicsToggleText = document.getElementById('physicsToggleText');
  const physicsToggleIcon = document.getElementById('physicsToggleIcon');
  const playPauseToggle = document.getElementById('playPauseToggle');
  const playPauseText = document.getElementById('playPauseText');
  const playPauseIcon = document.getElementById('playPauseIcon');
  const paletteBtns = document.querySelectorAll('[data-palette]');

  // 3. Bind Density Slider Handler
  if (densitySlider) {
    densitySlider.addEventListener('input', (e) => {
      const count = parseInt(e.target.value, 10);
      if (!isNaN(count)) {
        engine.setDensity(count);
        if (densityValue) densityValue.textContent = count;
      }
    });
  }

  // 4. Bind Speed Slider Handler
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      const speed = parseFloat(e.target.value);
      if (!isNaN(speed)) {
        engine.setSpeed(speed);
        if (speedValue) speedValue.textContent = speed.toFixed(1) + 'x';
      }
    });
  }

  // 5. Bind Physics Interaction Toggle Handler
  if (physicsToggle) {
    physicsToggle.addEventListener('click', () => {
      const newState = !engine.config.mousePhysicsEnabled;
      engine.togglePhysics(newState);

      if (physicsToggleText) {
        physicsToggleText.textContent = newState ? 'Physics: ON' : 'Physics: OFF';
      }

      if (physicsToggleIcon) {
        physicsToggleIcon.className = newState 
          ? 'fa-solid fa-hand-pointer text-amber-400'
          : 'fa-solid fa-ban text-gray-400';
      }

      if (newState) {
        physicsToggle.classList.remove('border-gray-600', 'bg-gray-800/40', 'text-gray-400');
        physicsToggle.classList.add('border-amber-500/40', 'bg-amber-500/10', 'text-amber-300');
      } else {
        physicsToggle.classList.remove('border-amber-500/40', 'bg-amber-500/10', 'text-amber-300');
        physicsToggle.classList.add('border-gray-600', 'bg-gray-800/40', 'text-gray-400');
      }
    });
  }

  // 6. Bind Animation Play / Pause Toggle Handler
  if (playPauseToggle) {
    playPauseToggle.addEventListener('click', () => {
      if (engine.isRunning) {
        engine.stop();
        if (playPauseText) playPauseText.textContent = 'Animation: Paused';
        if (playPauseIcon) playPauseIcon.className = 'fa-solid fa-play text-amber-400';
        playPauseToggle.classList.remove('border-emerald-500/40', 'bg-emerald-500/10', 'text-emerald-300');
        playPauseToggle.classList.add('border-amber-500/40', 'bg-amber-500/10', 'text-amber-300');
      } else {
        engine.start();
        if (playPauseText) playPauseText.textContent = 'Animation: Playing';
        if (playPauseIcon) playPauseIcon.className = 'fa-solid fa-pause text-emerald-400';
        playPauseToggle.classList.remove('border-amber-500/40', 'bg-amber-500/10', 'text-amber-300');
        playPauseToggle.classList.add('border-emerald-500/40', 'bg-emerald-500/10', 'text-emerald-300');
      }
    });
  }

  // 7. Bind Color Palette Switcher Handlers
  if (paletteBtns && paletteBtns.length > 0) {
    paletteBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const paletteKey = btn.getAttribute('data-palette');
        if (paletteKey && ParticleEngine.PALETTES[paletteKey]) {
          engine.setPalette(paletteKey);

          // Update active highlight style on palette swatches
          paletteBtns.forEach((b) => {
            b.classList.remove('border-amber-500/60', 'bg-amber-500/20', 'text-white', 'active');
            b.classList.add('border-white/10', 'bg-white/5', 'text-gray-300');
          });

          btn.classList.remove('border-white/10', 'bg-white/5', 'text-gray-300');
          btn.classList.add('border-amber-500/60', 'bg-amber-500/20', 'text-white', 'active');
        }
      });
    });
  }

  // 8. Explicit Canvas Click Shockwave Event
  canvas.addEventListener('click', (e) => {
    if (!engine.config.mousePhysicsEnabled) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    engine.triggerImpulse(x, y);
  });
});
