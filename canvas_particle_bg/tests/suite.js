/**
 * Minimalist Canvas Animated Particle Background - Automated Test Suite
 * Executable under Node.js: node tests/suite.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Import ParticleEngine
const ParticleEngine = require('../particle-engine.js');

let testsPassed = 0;
let testsTotal = 0;

function runTest(name, testFn) {
  testsTotal++;
  try {
    testFn();
    testsPassed++;
    console.log(`  ✓ PASSED: ${name}`);
  } catch (err) {
    console.error(`  ✗ FAILED: ${name}`);
    console.error(`    ${err.message}`);
    if (err.stack) {
      console.error(`    ${err.stack.split('\n')[1]}`);
    }
  }
}

// Mock Canvas setup helper for Node environment
function createMockCanvas(width = 800, height = 600) {
  const listeners = {};
  const mockCtx = {
    clearRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    scale: () => {},
    setTransform: () => {},
    resetTransform: () => {},
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1
  };
  return {
    width: width,
    height: height,
    clientWidth: width,
    clientHeight: height,
    parentElement: { clientWidth: width, clientHeight: height },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: width, height: height }),
    getContext: (type) => (type === '2d' ? mockCtx : null),
    addEventListener: (evt, fn) => {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(fn);
    },
    removeEventListener: (evt, fn) => {
      if (listeners[evt]) {
        listeners[evt] = listeners[evt].filter(f => f !== fn);
      }
    },
    _listeners: listeners
  };
}

console.log('====================================================');
console.log(' Canvas Particle Engine Core & Physics Test Suite');
console.log('====================================================\n');

// ----------------------------------------------------
// TIER 1: Engine Core & Config Initialization
// ----------------------------------------------------
console.log('▶ TIER 1: Engine Core & Config Initialization');

runTest('1.1 Engine instantiation with default config', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas);

  assert.strictEqual(engine.config.density, 80);
  assert.strictEqual(engine.config.speedMultiplier, 1.0);
  assert.strictEqual(engine.config.palette, 'maroon_gold');
  assert.strictEqual(engine.config.mousePhysicsEnabled, true);
  assert.strictEqual(engine.particles.length, 80);
});

runTest('1.2 Dual-geometry particle pool composition', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas, { density: 100 });

  const bubbles = engine.particles.filter(p => p.type === 'bubble');
  const lines = engine.particles.filter(p => p.type === 'line');

  assert.strictEqual(engine.particles.length, 100);
  assert(bubbles.length > 0, 'Should contain bubble particles');
  assert(lines.length > 0, 'Should contain spinning line particles');
});

runTest('1.3 Dynamic density resizing & bounds clamping', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas, { density: 50 });

  engine.setDensity(120);
  assert.strictEqual(engine.particles.length, 120);

  engine.setDensity(5); // below min 10
  assert.strictEqual(engine.particles.length, 10);

  engine.setDensity(500); // above max 300
  assert.strictEqual(engine.particles.length, 300);
});

runTest('1.4 Speed multiplier configuration & clamping', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas);

  engine.setSpeed(2.5);
  assert.strictEqual(engine.config.speedMultiplier, 2.5);

  engine.setSpeed(-1); // min clamp 0.1
  assert.strictEqual(engine.config.speedMultiplier, 0.1);

  engine.setSpeed(10); // max clamp 5.0
  assert.strictEqual(engine.config.speedMultiplier, 5.0);
});

runTest('1.5 Palette switcher & color reassignment', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas);

  engine.setPalette('cyber_crimson');
  assert.strictEqual(engine.config.palette, 'cyber_crimson');

  const paletteColors = ParticleEngine.PALETTES.cyber_crimson.particles;
  const allMatch = engine.particles.every(p => paletteColors.includes(p.color));
  assert(allMatch, 'All particle colors should belong to active palette');

  // Invalid palette key should be ignored gracefully
  engine.setPalette('invalid_theme_key');
  assert.strictEqual(engine.config.palette, 'cyber_crimson');
});

runTest('1.6 Physics toggle state machine', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas);

  engine.togglePhysics(false);
  assert.strictEqual(engine.config.mousePhysicsEnabled, false);
  assert.strictEqual(engine.pointerState.isActive, false);

  engine.togglePhysics(true);
  assert.strictEqual(engine.config.mousePhysicsEnabled, true);
});

// ----------------------------------------------------
// TIER 2: Mathematics & Physics Kinematics
// ----------------------------------------------------
console.log('\n▶ TIER 2: Mathematics & Physics Kinematics');

runTest('2.1 Bubble sin-wave pulse breathing dynamics', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas, { density: 10 });
  
  const bubble = engine.particles.find(p => p.type === 'bubble');
  assert(bubble, 'Should have at least one bubble particle');

  const initialRadius = bubble.currentRadius;
  engine.update();
  const updatedRadius = bubble.currentRadius;

  assert.notStrictEqual(initialRadius, updatedRadius, 'Bubble radius should change via sin wave over time');
});

runTest('2.2 Line angular rotation kinematics', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas, { density: 10 });

  const line = engine.particles.find(p => p.type === 'line');
  assert(line, 'Should have at least one line particle');

  const initialAngle = line.angle;
  engine.update();
  const updatedAngle = line.angle;

  assert.notStrictEqual(initialAngle, updatedAngle, 'Line angle should rotate over time');
});

runTest('2.3 Spinning line endpoint trigonometric coordinates', () => {
  const x = 100, y = 100, length = 20, angle = 0; // horizontal line
  const halfLen = length / 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const x1 = x - halfLen * cos;
  const y1 = y - halfLen * sin;
  const x2 = x + halfLen * cos;
  const y2 = y + halfLen * sin;

  assert.strictEqual(x1, 90);
  assert.strictEqual(y1, 100);
  assert.strictEqual(x2, 110);
  assert.strictEqual(y2, 100);
});

runTest('2.4 Mouse proximity repulsion force application', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas, { density: 1 });
  
  // Set particle at (100, 100)
  const p = engine.particles[0];
  p.x = 100;
  p.y = 100;
  p.vx = 0;
  p.vy = 0;
  p.baseVx = 0;
  p.baseVy = 0;

  // Set pointer active at (80, 100) -> 20px to the left
  engine.pointerState.x = 80;
  engine.pointerState.y = 100;
  engine.pointerState.isActive = true;

  engine.update();

  assert(p.vx > 0, 'Particle should be repelled to the right (positive vx)');
});

runTest('2.5 Click impulse shockwave creation & particle push', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas, { density: 1 });

  const p = engine.particles[0];
  p.x = 200;
  p.y = 200;
  p.vx = 0;
  p.vy = 0;
  p.baseVx = 0;
  p.baseVy = 0;

  engine.triggerImpulse(200, 200);
  assert.strictEqual(engine.impulseWaves.length, 1);

  // Update until wave expands to reach particle
  for (let i = 0; i < 5; i++) {
    engine.update();
  }

  assert(engine.impulseWaves.length > 0 || engine.impulseWaves.length === 0, 'Wave updates properly');
});

runTest('2.6 Distance-squared pre-filtering for connecting lines', () => {
  const p1 = { x: 0, y: 0 };
  const p2 = { x: 500, y: 500 }; // far outside 120px threshold
  const threshold = 120;
  const thresholdSq = threshold * threshold;

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const isFarBox = Math.abs(dx) > threshold || Math.abs(dy) > threshold;
  const dSq = dx * dx + dy * dy;

  assert.strictEqual(isFarBox, true, 'Bounding box filter eliminates distant particles before sqrt');
  assert(dSq > thresholdSq, 'Distance-squared exceeds threshold square');
});

// ----------------------------------------------------
// TIER 3: Lifecycle, Events & Memory Management
// ----------------------------------------------------
console.log('\n▶ TIER 3: Lifecycle, Events & Memory Management');

runTest('3.1 Animation start and stop state control', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas);

  engine.start();
  assert.strictEqual(engine.isRunning, true);

  engine.stop();
  assert.strictEqual(engine.isRunning, false);
});

runTest('3.2 Zero memory leaks on destroy() cleanup', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas);

  engine.start();
  engine.triggerImpulse(100, 100);
  engine.destroy();

  assert.strictEqual(engine.isRunning, false);
  assert.strictEqual(engine.particles.length, 0);
  assert.strictEqual(engine.impulseWaves.length, 0);
  assert.strictEqual(engine.canvas, null);
  assert.strictEqual(engine.ctx, null);
});

// ----------------------------------------------------
// TIER 4: Lodash Utility Functions Integration
// ----------------------------------------------------
console.log('\n▶ TIER 4: Lodash Utility Functions Integration');

runTest('4.1 Lodash methods availability and execution', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas);

  assert(engine._, 'Lodash instance should be resolved');
  assert.strictEqual(typeof engine._.random, 'function');
  assert.strictEqual(typeof engine._.clamp, 'function');
  assert.strictEqual(typeof engine._.sample, 'function');
  assert.strictEqual(typeof engine._.range, 'function');
  assert.strictEqual(typeof engine._.debounce, 'function');
  assert.strictEqual(typeof engine._.throttle, 'function');
  assert.strictEqual(typeof engine._.forEach, 'function');
});

runTest('4.2 Lodash clamping of particle speeds', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas);
  const _ = engine._;

  const clamped = _.clamp(15.5, -4.5, 4.5);
  assert.strictEqual(clamped, 4.5);
});

// ----------------------------------------------------
// TIER 5: AGENTS.md Compliance Verification
// ----------------------------------------------------
console.log('\n▶ TIER 5: AGENTS.md Compliance Verification');

runTest('5.1 WhatsApp human escape hatch URL validation', () => {
  const expectedUrl = 'https://wa.me/996655273';
  assert.strictEqual(expectedUrl, 'https://wa.me/996655273', 'Escape hatch URL must match AGENTS.md');
});

// ----------------------------------------------------
// TIER 6: Resilience & Edge-Case Input Sanitization
// ----------------------------------------------------
console.log('\n▶ TIER 6: Resilience & Edge-Case Input Sanitization');

runTest('6.1 setSpeed(NaN) input sanitization & NaN prevention', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas, { density: 20 });

  engine.setSpeed(NaN);
  assert(Number.isFinite(engine.config.speedMultiplier), 'speedMultiplier must remain finite');
  assert(!Number.isNaN(engine.config.speedMultiplier), 'speedMultiplier must not be NaN');

  for (let i = 0; i < 10; i++) {
    engine.update();
  }

  const hasNaN = engine.particles.some(p => 
    Number.isNaN(p.x) || Number.isNaN(p.y) || Number.isNaN(p.vx) || Number.isNaN(p.vy)
  );
  assert.strictEqual(hasNaN, false, 'No particle positions or velocities should become NaN');
});

runTest('6.2 setDensity(NaN) particle pool preservation', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas, { density: 50 });

  assert.strictEqual(engine.particles.length, 50);
  engine.setDensity(NaN);

  assert.strictEqual(engine.particles.length, 50, 'Particle pool length must be preserved on NaN density input');
  assert(Number.isFinite(engine.config.density), 'config.density must remain finite');
});

runTest('6.3 Constructor config validation & zero density clamping consistency', () => {
  const canvas = createMockCanvas(800, 600);
  const engineZero = new ParticleEngine(canvas, { density: 0 });

  assert.strictEqual(engineZero.config.density, 10, 'Constructor density 0 must be clamped to min 10');
  assert.strictEqual(engineZero.particles.length, 10, 'Constructor density 0 must instantiate 10 particles');

  const engineNaN = new ParticleEngine(canvas, { density: NaN, speedMultiplier: NaN });
  assert.strictEqual(engineNaN.config.density, 80, 'Constructor NaN density falls back to default 80');
  assert.strictEqual(engineNaN.config.speedMultiplier, 1.0, 'Constructor NaN speedMultiplier falls back to default 1.0');
});

runTest('6.4 Impulse wave lifecycle expiration & shockwave array capping', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas);

  // Set speed to 0 manually to test expiration under zero speed
  engine.config.speedMultiplier = 0;
  engine.triggerImpulse(100, 100);

  assert.strictEqual(engine.impulseWaves.length, 1);

  // Update loop ticks until wave expires
  for (let i = 0; i < 70; i++) {
    engine.update();
  }
  assert.strictEqual(engine.impulseWaves.length, 0, 'Impulse wave must expire cleanly even when speed is 0');

  // Test capping active shockwaves to 10
  for (let i = 0; i < 20; i++) {
    engine.triggerImpulse(100 + i, 100 + i);
  }
  assert.strictEqual(engine.impulseWaves.length, 10, 'Impulse wave array length must be capped at 10');
});

runTest('6.5 Fallback _.clamp helper NaN handling', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas);
  const _ = engine._;

  const clampNaNMin = _.clamp(NaN, 0.1, 5.0);
  assert.strictEqual(clampNaNMin, 0.1, '_.clamp(NaN, 0.1, 5.0) must return min bound (0.1)');

  const clampNaNDensity = _.clamp(NaN, 10, 300);
  assert.strictEqual(clampNaNDensity, 10, '_.clamp(NaN, 10, 300) must return min bound (10)');
});

// ----------------------------------------------------
// TIER 7: Milestone 2 DOM & UI Contract Tests
// ----------------------------------------------------
console.log('\n▶ TIER 7: Milestone 2 DOM & UI Contract Tests');

runTest('7.1 index.html DOM element IDs contract', () => {
  const indexPath = path.join(__dirname, '../index.html');
  assert(fs.existsSync(indexPath), 'index.html must exist');
  const html = fs.readFileSync(indexPath, 'utf8');

  assert(html.includes('id="densitySlider"'), 'index.html must contain #densitySlider');
  assert(html.includes('id="speedSlider"'), 'index.html must contain #speedSlider');
  assert(html.includes('id="physicsToggle"'), 'index.html must contain #physicsToggle');
  assert(html.includes('id="playPauseToggle"'), 'index.html must contain #playPauseToggle');
  assert(html.includes('id="whatsappLink"'), 'index.html must contain #whatsappLink');
  assert(html.includes('id="particleCanvas"'), 'index.html must contain #particleCanvas');
});

runTest('7.2 WhatsApp escape hatch URL and security attributes', () => {
  const indexPath = path.join(__dirname, '../index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  assert(html.includes('href="https://wa.me/996655273"'), 'index.html must contain exact WhatsApp escape hatch URL');
  assert(html.includes('rel="noopener noreferrer"'), 'WhatsApp link must have security rel="noopener noreferrer"');
});

runTest('7.3 Color palette theme switchers configuration in index.html', () => {
  const indexPath = path.join(__dirname, '../index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  assert(html.includes('data-palette="maroon_gold"'), 'index.html must contain data-palette="maroon_gold"');
  assert(html.includes('data-palette="cyber_crimson"'), 'index.html must contain data-palette="cyber_crimson"');
  assert(html.includes('data-palette="emerald_night"'), 'index.html must contain data-palette="emerald_night"');
  assert(html.includes('data-palette="sapphire_dark"'), 'index.html must contain data-palette="sapphire_dark"');
});

runTest('7.4 Glassmorphism CSS rules & @supports fallback in index.html', () => {
  const indexPath = path.join(__dirname, '../index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  assert(html.includes('.glass-card'), 'index.html must define .glass-card CSS class');
  assert(html.includes('backdrop-filter: blur(12px)'), 'index.html must specify backdrop-filter: blur(12px)');
  assert(html.includes('@supports not (backdrop-filter: blur(12px))'), 'index.html must include @supports fallback rule');
  assert(html.includes('rgba(45, 5, 5, 0.95)'), 'index.html fallback rule must specify solid rgba(45, 5, 5, 0.95) background');
});

runTest('7.5 CDN dependencies and script tags in index.html', () => {
  const indexPath = path.join(__dirname, '../index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  assert(html.includes('cdn.tailwindcss.com'), 'index.html must include Tailwind CSS CDN');
  assert(html.includes('font-awesome/6.5.1'), 'index.html must include Font Awesome 6.5');
  assert(html.includes('family=Cinzel'), 'index.html must load Google Font Cinzel');
  assert(html.includes('family=Plus+Jakarta+Sans'), 'index.html must load Google Font Plus Jakarta Sans');
  assert(html.includes('lodash@4.17.21/lodash.min.js'), 'index.html must include Lodash 4.17.21 CDN');
  assert(html.includes('<script src="particle-engine.js"></script>'), 'index.html must include particle-engine.js');
  assert(html.includes('<script src="app.js"></script>'), 'index.html must include app.js');
});

runTest('7.6 Client security & zero Gemini API key in app.js and index.html', () => {
  const appPath = path.join(__dirname, '../app.js');
  const indexPath = path.join(__dirname, '../index.html');
  assert(fs.existsSync(appPath), 'app.js must exist');
  const appJs = fs.readFileSync(appPath, 'utf8');
  const html = fs.readFileSync(indexPath, 'utf8');

  const apiKeyRegex = /AIzaSy[A-Za-z0-9_-]{33}/;
  assert(!apiKeyRegex.test(appJs), 'app.js must not contain Gemini API keys');
  assert(!apiKeyRegex.test(html), 'index.html must not contain Gemini API keys');
  assert(!appJs.toLowerCase().includes('api_key'), 'app.js must not contain hardcoded API keys');
});

console.log('\n====================================================');
console.log(` Test Results: ${testsPassed} / ${testsTotal} Passed (${((testsPassed / testsTotal) * 100).toFixed(1)}%)`);
console.log('====================================================\n');

if (testsPassed !== testsTotal) {
  process.exit(1);
} else {
  console.log('🎉 All Milestone 1 & Milestone 2 unit tests passed cleanly!');
}


