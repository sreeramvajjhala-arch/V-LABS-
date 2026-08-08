/**
 * ParticleEngine - Minimalist HTML5 Canvas 2D Animated Particle Background System
 * 
 * Features:
 * - Dual-geometry particle system (floating bubbles & spinning lines)
 * - Sin-wave pulse breathing dynamics for bubbles
 * - Center rotation kinematics for spinning lines
 * - Interactive mouse/touch proximity repulsion force with velocity damping
 * - Dynamic connecting web lines with opacity decay & d^2 pre-filtering
 * - Click impulse shockwave wave propagation
 * - High performance: 60 FPS requestAnimationFrame loop, high-DPI scaling
 * - 300ms debounced window resize & 16ms throttled event handling
 * - Zero memory leaks on destroy()
 * - Lodash 4.17.21 utility integration (_.random, _.clamp, _.sample, _.range, _.debounce, _.throttle, _.forEach)
 * - Ponytail Minimalist Architecture
 */

// Helper to resolve Lodash instance or lightweight fallback
const _resolveLodash = () => {
  if (typeof window !== 'undefined' && window._) return window._;
  if (typeof global !== 'undefined' && global._) return global._;
  try {
    const req = require('lodash');
    if (req) return req;
  } catch (e) {
    // Fallback if lodash is not loaded in environment
  }
  return {
    random: (a, b, floating) => {
      const min = floating ? a : Math.ceil(a);
      const max = floating ? b : Math.floor(b);
      const rand = Math.random() * (max - min) + min;
      return floating ? rand : Math.floor(rand);
    },
    clamp: (val, min, max) => {
      if (typeof val !== 'number' || !Number.isFinite(val)) return min;
      return Math.min(Math.max(val, min), max);
    },
    sample: (arr) => arr[Math.floor(Math.random() * arr.length)],
    range: (n) => Array.from({ length: Math.max(0, n) }, (_, i) => i),
    debounce: (fn, wait) => {
      let timeout;
      const debounced = function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), wait);
      };
      debounced.cancel = () => clearTimeout(timeout);
      return debounced;
    },
    throttle: (fn, wait) => {
      let last = 0;
      return function(...args) {
        const now = Date.now();
        if (now - last >= wait) {
          last = now;
          fn.apply(this, args);
        }
      };
    },
    forEach: (arr, iteratee) => {
      if (arr && Array.isArray(arr)) arr.forEach(iteratee);
    }
  };
};

const PALETTES = {
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

class ParticleEngine {
  static get PALETTES() {
    return PALETTES;
  }

  constructor(canvasElement, configOptions = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    
    // Resolve Lodash
    this._ = _resolveLodash();

    // Default configuration
    this.config = {
      density: 80,
      speedMultiplier: 1.0,
      palette: 'maroon_gold',
      mousePhysicsEnabled: true,
      shapeRatio: 0.5, // 50% bubbles, 50% spinning lines
      ...configOptions
    };

    // Sanitize and clamp config boundaries
    const rawDensity = Number.isFinite(this.config.density) ? Math.round(this.config.density) : 80;
    this.config.density = this._.clamp(rawDensity, 10, 300);

    const rawSpeed = Number.isFinite(this.config.speedMultiplier) ? this.config.speedMultiplier : 1.0;
    this.config.speedMultiplier = this._.clamp(rawSpeed, 0.1, 5.0);

    // State tracking
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.particles = [];
    this.impulseWaves = [];
    this.animFrameId = null;
    this.isRunning = false;
    this.tick = 0;

    // Pointer state for mouse & touch interaction
    this.pointerState = {
      x: null,
      y: null,
      isActive: false,
      isPressed: false,
      radius: 150
    };

    // Bound event handlers for cleanup
    this._handleResize = this._.debounce(() => this.resize(), 300);
    this._handlePointerMove = this._.throttle((e) => this._updatePointerPosition(e), 16);
    this._handlePointerLeave = () => {
      this.pointerState.isActive = false;
      this.pointerState.x = null;
      this.pointerState.y = null;
    };
    this._handlePointerEnter = (e) => {
      this.pointerState.isActive = true;
      this._updatePointerPosition(e);
    };
    this._handleClick = (e) => {
      if (!this.config.mousePhysicsEnabled) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.triggerImpulse(x, y);
    };
    this._handleTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        this.pointerState.isActive = true;
        this.pointerState.isPressed = true;
        this._updatePointerPosition(e.touches[0]);
        if (this.config.mousePhysicsEnabled) {
          const rect = this.canvas.getBoundingClientRect();
          const x = e.touches[0].clientX - rect.left;
          const y = e.touches[0].clientY - rect.top;
          this.triggerImpulse(x, y);
        }
      }
    };
    this._handleTouchMove = this._.throttle((e) => {
      if (e.touches && e.touches.length > 0) {
        this.pointerState.isActive = true;
        this._updatePointerPosition(e.touches[0]);
      }
    }, 16);
    this._handleTouchEnd = () => {
      this.pointerState.isActive = false;
      this.pointerState.isPressed = false;
      this.pointerState.x = null;
      this.pointerState.y = null;
    };

    if (this.canvas) {
      this.init();
    }
  }

  init() {
    if (!this.canvas) return;

    this.resize();
    this._bindEvents();
    this.particles = this._createParticlePool(this.config.density);
  }

  resize() {
    if (!this.canvas) return;

    const win = typeof window !== 'undefined' ? window : null;
    const parent = this.canvas.parentElement || (win && win.document ? win.document.body : null);
    const rect = this.canvas.getBoundingClientRect();

    // Determine viewport/canvas width and height accurately
    const w = (win && win.innerWidth) ? win.innerWidth : (rect.width || (parent && parent.clientWidth) || 800);
    const h = (win && win.innerHeight) ? win.innerHeight : (rect.height || (parent && parent.clientHeight) || 600);

    const prevW = this.width;
    const prevH = this.height;

    this.width = Math.max(w, 100);
    this.height = Math.max(h, 100);

    // High-DPI scaling
    this.dpr = (win && win.devicePixelRatio) || 1;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    if (this.ctx) {
      this.ctx.resetTransform ? this.ctx.resetTransform() : this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
    }

    // Scale existing particle positions proportionally on resize or redistrib if initial resize
    if (prevW > 0 && prevH > 0 && (prevW !== this.width || prevH !== this.height) && this.particles && this.particles.length > 0) {
      const scaleX = this.width / prevW;
      const scaleY = this.height / prevH;
      this._.forEach(this.particles, (p) => {
        p.x = Math.max(0, Math.min(this.width, p.x * scaleX));
        p.y = Math.max(0, Math.min(this.height, p.y * scaleY));
      });
    }
  }

  _createParticlePool(count) {
    const _ = this._;
    const palette = PALETTES[this.config.palette] || PALETTES.maroon_gold;
    const win = typeof window !== 'undefined' ? window : null;
    const w = (this.width && this.width > 100) ? this.width : ((win && win.innerWidth) || 800);
    const h = (this.height && this.height > 100) ? this.height : ((win && win.innerHeight) || 600);

    return _.range(count).map(() => {
      const type = _.sample(['bubble', 'line']);
      const color = _.sample(palette.particles);
      const vx = _.random(-0.6, 0.6, true);
      const vy = _.random(-0.6, 0.6, true);

      if (type === 'bubble') {
        const rBase = _.random(2, 7, true);
        return {
          type: 'bubble',
          x: _.random(0, w, true),
          y: _.random(0, h, true),
          vx: vx,
          vy: vy,
          baseVx: vx,
          baseVy: vy,
          rBase: rBase,
          currentRadius: rBase,
          pulseAmp: _.random(0.5, 1.8, true),
          pulseFreq: _.random(0.02, 0.05, true),
          pulsePhase: _.random(0, Math.PI * 2, true),
          color: color
        };
      } else {
        return {
          type: 'line',
          x: _.random(0, w, true),
          y: _.random(0, h, true),
          vx: vx,
          vy: vy,
          baseVx: vx,
          baseVy: vy,
          length: _.random(10, 24, true),
          lineWidth: _.random(1, 2, true),
          angle: _.random(0, Math.PI * 2, true),
          rotSpeed: _.random(-0.035, 0.035, true),
          color: color
        };
      }
    });
  }

  _updatePointerPosition(e) {
    if (!this.canvas || !e) return;
    const rect = this.canvas.getBoundingClientRect();
    this.pointerState.x = e.clientX - rect.left;
    this.pointerState.y = e.clientY - rect.top;
    this.pointerState.isActive = true;
  }

  _bindEvents() {
    if (typeof window === 'undefined' || !this.canvas) return;

    window.addEventListener('resize', this._handleResize);
    this.canvas.addEventListener('mousemove', this._handlePointerMove);
    this.canvas.addEventListener('mouseleave', this._handlePointerLeave);
    this.canvas.addEventListener('mouseenter', this._handlePointerEnter);
    this.canvas.addEventListener('click', this._handleClick);

    this.canvas.addEventListener('touchstart', this._handleTouchStart, { passive: true });
    this.canvas.addEventListener('touchmove', this._handleTouchMove, { passive: true });
    this.canvas.addEventListener('touchend', this._handleTouchEnd, { passive: true });
    this.canvas.addEventListener('touchcancel', this._handleTouchEnd, { passive: true });
  }

  _unbindEvents() {
    if (typeof window === 'undefined' || !this.canvas) return;

    window.removeEventListener('resize', this._handleResize);
    if (this._handleResize.cancel) this._handleResize.cancel();

    this.canvas.removeEventListener('mousemove', this._handlePointerMove);
    this.canvas.removeEventListener('mouseleave', this._handlePointerLeave);
    this.canvas.removeEventListener('mouseenter', this._handlePointerEnter);
    this.canvas.removeEventListener('click', this._handleClick);

    this.canvas.removeEventListener('touchstart', this._handleTouchStart);
    this.canvas.removeEventListener('touchmove', this._handleTouchMove);
    this.canvas.removeEventListener('touchend', this._handleTouchEnd);
    this.canvas.removeEventListener('touchcancel', this._handleTouchEnd);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const loop = () => {
      if (!this.isRunning) return;
      this.update();
      this.render();
      if (typeof requestAnimationFrame !== 'undefined') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };

    if (typeof requestAnimationFrame !== 'undefined') {
      this.animFrameId = requestAnimationFrame(loop);
    } else {
      // Node fallback loop tick for testing
      this.update();
      this.render();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animFrameId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  destroy() {
    this.stop();
    this._unbindEvents();
    this.particles = [];
    this.impulseWaves = [];
    this.ctx = null;
    this.canvas = null;
  }

  setDensity(count) {
    const _ = this._;
    const currentDensity = (this.config && Number.isFinite(this.config.density)) ? this.config.density : 80;
    const safeCount = Number.isFinite(count) ? Math.round(count) : currentDensity;
    const validCount = _.clamp(safeCount, 10, 300);
    this.config.density = validCount;

    if (this.particles.length === validCount) return;

    if (this.particles.length < validCount) {
      const extra = this._createParticlePool(validCount - this.particles.length);
      this.particles.push(...extra);
    } else {
      this.particles = this.particles.slice(0, validCount);
    }
  }

  setSpeed(multiplier) {
    const _ = this._;
    const currentSpeed = (this.config && Number.isFinite(this.config.speedMultiplier)) ? this.config.speedMultiplier : 1.0;
    const safeMult = Number.isFinite(multiplier) ? multiplier : currentSpeed;
    this.config.speedMultiplier = _.clamp(safeMult, 0.1, 5.0);
  }

  setPalette(paletteKey) {
    if (!PALETTES[paletteKey]) return;
    this.config.palette = paletteKey;
    const palette = PALETTES[paletteKey];
    const _ = this._;

    // Re-assign colors to existing particles cleanly
    _.forEach(this.particles, (p) => {
      p.color = _.sample(palette.particles);
    });
  }

  togglePhysics(enabled) {
    this.config.mousePhysicsEnabled = !!enabled;
    if (!enabled) {
      this.pointerState.isActive = false;
    }
  }

  triggerImpulse(x, y) {
    const safeX = Number.isFinite(x) ? x : 0;
    const safeY = Number.isFinite(y) ? y : 0;

    // Cap max active shockwaves array to 10
    while (this.impulseWaves.length >= 10) {
      this.impulseWaves.shift();
    }

    this.impulseWaves.push({
      x: safeX,
      y: safeY,
      radius: 0,
      maxRadius: 220,
      speed: 7,
      thickness: 25,
      force: 12,
      active: true,
      age: 0
    });
  }

  update() {
    const _ = this._;
    const speedMult = this.config.speedMultiplier;
    const w = this.width || 800;
    const h = this.height || 600;
    const margin = 30;

    this.tick += 0.016;

    // 1. Update Impulse Waves lifecycle
    for (let i = this.impulseWaves.length - 1; i >= 0; i--) {
      const wave = this.impulseWaves[i];
      wave.age = (wave.age || 0) + 1;
      const step = Math.max(wave.speed * speedMult, 1.5);
      wave.radius += step;
      if (wave.radius > wave.maxRadius || wave.age > 60) {
        wave.active = false;
        this.impulseWaves.splice(i, 1);
      }
    }

    const mouseActive = this.config.mousePhysicsEnabled && this.pointerState.isActive && this.pointerState.x !== null;
    const pointerX = this.pointerState.x;
    const pointerY = this.pointerState.y;
    const repelRadius = this.pointerState.radius;
    const repelRadiusSq = repelRadius * repelRadius;

    // 2. Update Particles
    _.forEach(this.particles, (p) => {
      // Dynamic breathing pulse for bubbles
      if (p.type === 'bubble') {
        p.currentRadius = p.rBase + p.pulseAmp * Math.sin(p.pulseFreq * (this.tick * 60) + p.pulsePhase);
      }

      // Angular rotation for lines
      if (p.type === 'line') {
        p.angle = (p.angle + p.rotSpeed * speedMult) % (Math.PI * 2);
      }

      // Position update
      p.x += p.vx * speedMult;
      p.y += p.vy * speedMult;

      // Wrap-around bounds
      if (p.x < -margin) p.x = w + margin;
      else if (p.x > w + margin) p.x = -margin;

      if (p.y < -margin) p.y = h + margin;
      else if (p.y > h + margin) p.y = -margin;

      // Mouse proximity repulsion force
      if (mouseActive) {
        const dx = p.x - pointerX;
        const dy = p.y - pointerY;

        // Bounding box pre-filter
        if (Math.abs(dx) <= repelRadius && Math.abs(dy) <= repelRadius) {
          const dSq = dx * dx + dy * dy;
          if (dSq < repelRadiusSq && dSq > 0) {
            const dist = Math.sqrt(dSq);
            const normX = dx / dist;
            const normY = dy / dist;
            const factor = (1 - dist / repelRadius);
            const force = factor * factor * 3.5 * speedMult;

            p.vx += normX * force * 0.15;
            p.vy += normY * force * 0.15;
          }
        }
      }

      // Impulse shockwave force push
      for (let i = 0; i < this.impulseWaves.length; i++) {
        const wave = this.impulseWaves[i];
        const dx = p.x - wave.x;
        const dy = p.y - wave.y;
        const dSq = dx * dx + dy * dy;
        const dist = Math.sqrt(dSq);

        if (Math.abs(dist - wave.radius) <= wave.thickness && dist > 0) {
          const normX = dx / dist;
          const normY = dy / dist;
          const waveForce = wave.force * (1 - wave.radius / wave.maxRadius) * speedMult;

          p.vx += normX * waveForce * 0.25;
          p.vy += normY * waveForce * 0.25;
        }
      }

      // Velocity damping back to base drift speeds
      p.vx = p.vx * 0.95 + p.baseVx * 0.05;
      p.vy = p.vy * 0.95 + p.baseVy * 0.05;

      // Speed velocity clamping
      const maxSpd = 4.5 * speedMult;
      p.vx = _.clamp(p.vx, -maxSpd, maxSpd);
      p.vy = _.clamp(p.vy, -maxSpd, maxSpd);
    });
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.width || 800;
    const h = this.height || 600;
    const palette = PALETTES[this.config.palette] || PALETTES.maroon_gold;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    const particles = this.particles;
    const count = particles.length;

    // 1. Draw Connecting Web Lines (Particle to Particle)
    const p2pThreshold = 120;
    const p2pThresholdSq = p2pThreshold * p2pThreshold;

    for (let i = 0; i < count; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < count; j++) {
        const p2 = particles[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        // Pre-filter with bounding box
        if (Math.abs(dx) > p2pThreshold || Math.abs(dy) > p2pThreshold) continue;

        const dSq = dx * dx + dy * dy;
        if (dSq <= p2pThresholdSq) {
          const dist = Math.sqrt(dSq);
          const alpha = 0.35 * (1 - dist / p2pThreshold);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${palette.webLine}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // 2. Draw Connecting Web Lines (Particle to Mouse Pointer)
    if (this.config.mousePhysicsEnabled && this.pointerState.isActive && this.pointerState.x !== null) {
      const p2mThreshold = 150;
      const p2mThresholdSq = p2mThreshold * p2mThreshold;
      const px = this.pointerState.x;
      const py = this.pointerState.y;

      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const dx = p.x - px;
        const dy = p.y - py;

        if (Math.abs(dx) > p2mThreshold || Math.abs(dy) > p2mThreshold) continue;

        const dSq = dx * dx + dy * dy;
        if (dSq <= p2mThresholdSq) {
          const dist = Math.sqrt(dSq);
          const alpha = 0.5 * (1 - dist / p2mThreshold);

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(${palette.webLine}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      }
    }

    // 3. Render Impulse Waves (Shockwave Visual Rings)
    for (let i = 0; i < this.impulseWaves.length; i++) {
      const wave = this.impulseWaves[i];
      const alpha = (1 - wave.radius / wave.maxRadius) * 0.6;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${palette.webLine}, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 2.0;
      ctx.stroke();
    }

    // 4. Render Particles
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      if (p.type === 'bubble') {
        ctx.beginPath();
        const r = Math.max(0.1, p.currentRadius);
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else if (p.type === 'line') {
        const halfLen = p.length / 2;
        const cos = Math.cos(p.angle);
        const sin = Math.sin(p.angle);
        const x1 = p.x - halfLen * cos;
        const y1 = p.y - halfLen * sin;
        const x2 = p.x + halfLen * cos;
        const y2 = p.y + halfLen * sin;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.lineWidth;
        ctx.stroke();
      }
    }
  }
}

// UMD / CommonJS / Browser Global Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticleEngine;
}
if (typeof window !== 'undefined') {
  window.ParticleEngine = ParticleEngine;
}
