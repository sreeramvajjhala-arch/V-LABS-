/**
 * Empirical Stress Harness for ParticleEngine
 * Tests edge cases, NaN propagation, boundary conditions, rapid impulses, zero density, and memory leaks.
 */

const assert = require('assert');
const ParticleEngine = require('../../canvas_particle_bg/particle-engine.js');

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
console.log(' EMPIRICAL STRESS HARNESS — PARTICLE ENGINE');
console.log('====================================================\n');

const results = [];

function testCase(id, description, testFn) {
  try {
    const outcome = testFn();
    console.log(`[PASS] ${id}: ${description}`);
    if (outcome) console.log(`       Details: ${JSON.stringify(outcome)}`);
    results.push({ id, description, status: 'PASS', outcome });
  } catch (err) {
    console.error(`[FAIL] ${id}: ${description}`);
    console.error(`       Error: ${err.message}`);
    results.push({ id, description, status: 'FAIL', error: err.message, stack: err.stack });
  }
}

// ----------------------------------------------------
// SCENARIO 1: NaN Propagation via setSpeed(NaN)
// ----------------------------------------------------
testCase('STRESS-1.1', 'setSpeed(NaN) propagation test', () => {
  const canvas = createMockCanvas();
  const engine = new ParticleEngine(canvas, { density: 20 });
  
  engine.setSpeed(NaN);
  engine.update();
  engine.render();

  const nanPositions = engine.particles.filter(p => Number.isNaN(p.x) || Number.isNaN(p.y));
  const nanVelocities = engine.particles.filter(p => Number.isNaN(p.vx) || Number.isNaN(p.vy));

  // Try to recover by setting speed back to 1.0
  engine.setSpeed(1.0);
  engine.update();

  const postRecoveryNanPositions = engine.particles.filter(p => Number.isNaN(p.x) || Number.isNaN(p.y));

  if (nanPositions.length > 0 || postRecoveryNanPositions.length > 0) {
    throw new Error(`NaN propagated to ${nanPositions.length} particles and ${postRecoveryNanPositions.length} remained corrupted after setSpeed(1.0)`);
  }

  return { nanParticles: nanPositions.length, postRecovery: postRecoveryNanPositions.length };
});

// ----------------------------------------------------
// SCENARIO 2: NaN Propagation via setDensity(NaN)
// ----------------------------------------------------
testCase('STRESS-1.2', 'setDensity(NaN) particle pool destruction test', () => {
  const canvas = createMockCanvas();
  const engine = new ParticleEngine(canvas, { density: 50 });

  engine.setDensity(NaN);

  if (Number.isNaN(engine.config.density) || engine.particles.length === 0) {
    throw new Error(`setDensity(NaN) destroyed particle pool. particles.length = ${engine.particles.length}, config.density = ${engine.config.density}`);
  }

  return { particleCount: engine.particles.length };
});

// ----------------------------------------------------
// SCENARIO 3: Zero Density Initialization vs setDensity(0)
// ----------------------------------------------------
testCase('STRESS-2.1', 'Zero density constructor vs setDensity(0) consistency', () => {
  const canvas1 = createMockCanvas();
  const engine1 = new ParticleEngine(canvas1, { density: 0 });

  const count1 = engine1.particles.length;

  const canvas2 = createMockCanvas();
  const engine2 = new ParticleEngine(canvas2, { density: 50 });
  engine2.setDensity(0);
  const count2 = engine2.particles.length;

  if (count1 !== count2) {
    throw new Error(`Inconsistency: constructor({density: 0}) gives ${count1} particles, but setDensity(0) gives ${count2} particles!`);
  }

  return { constructorZero: count1, setDensityZero: count2 };
});

// ----------------------------------------------------
// SCENARIO 4: Impulse Wave Memory Leak under speedMultiplier = 0 / low speed
// ----------------------------------------------------
testCase('STRESS-3.1', 'Impulse wave accumulation under zero / low speedMultiplier', () => {
  const canvas = createMockCanvas();
  const engine = new ParticleEngine(canvas);
  
  // Force speedMultiplier to 0 (e.g. directly or via extreme setting)
  engine.config.speedMultiplier = 0;

  for (let i = 0; i < 50; i++) {
    engine.triggerImpulse(100, 100);
    engine.update();
  }

  const accumulatedWaves = engine.impulseWaves.length;

  if (accumulatedWaves >= 50) {
    throw new Error(`Impulse waves fail to progress or expire when speedMultiplier is 0! Waves accumulated: ${accumulatedWaves}`);
  }

  return { accumulatedWaves };
});

// ----------------------------------------------------
// SCENARIO 5: Rapid Impulse Waves Load & Performance
// ----------------------------------------------------
testCase('STRESS-4.1', 'Rapid impulse wave stress (1,000 impulses)', () => {
  const canvas = createMockCanvas();
  const engine = new ParticleEngine(canvas, { density: 100 });

  const start = Date.now();
  for (let i = 0; i < 1000; i++) {
    engine.triggerImpulse(Math.random() * 800, Math.random() * 600);
  }

  const waveCountBeforeUpdate = engine.impulseWaves.length;
  engine.update();
  engine.render();
  const duration = Date.now() - start;

  return { waveCount: waveCountBeforeUpdate, executionMs: duration };
});

// ----------------------------------------------------
// SCENARIO 6: Pointer Position NaN Handling
// ----------------------------------------------------
testCase('STRESS-1.3', 'Pointer position NaN handling in render & update', () => {
  const canvas = createMockCanvas();
  const engine = new ParticleEngine(canvas, { density: 20 });

  engine.pointerState.x = NaN;
  engine.pointerState.y = NaN;
  engine.pointerState.isActive = true;

  engine.update();
  
  // Render should execute without throwing error
  let renderError = null;
  try {
    engine.render();
  } catch (e) {
    renderError = e.message;
  }

  const nanParticles = engine.particles.filter(p => Number.isNaN(p.x) || Number.isNaN(p.y));

  if (renderError || nanParticles.length > 0) {
    throw new Error(`Pointer NaN corrupted particles or threw error: ${renderError}`);
  }

  return { renderSuccess: true, nanParticles: nanParticles.length };
});

// ----------------------------------------------------
// SCENARIO 7: Lodash Fallback vs Native Lodash clamp(NaN)
// ----------------------------------------------------
testCase('STRESS-5.1', 'Lodash clamp fallback behavior with NaN', () => {
  const canvas = createMockCanvas();
  const engine = new ParticleEngine(canvas);
  const _ = engine._;

  const clampResult = _.clamp(NaN, 0.1, 5.0);

  if (Number.isNaN(clampResult)) {
    throw new Error(`_.clamp(NaN, 0.1, 5.0) returned NaN instead of fallback min (0.1)!`);
  }

  return { clampResult };
});

// ----------------------------------------------------
// SCENARIO 8: High Density Performance & Memory
// ----------------------------------------------------
testCase('STRESS-6.1', 'Max density (300 particles) frame update benchmark', () => {
  const canvas = createMockCanvas();
  const engine = new ParticleEngine(canvas, { density: 300 });

  const start = Date.now();
  for (let i = 0; i < 100; i++) {
    engine.update();
    engine.render();
  }
  const elapsed = Date.now() - start;
  const avgFrameTimeMs = elapsed / 100;

  if (avgFrameTimeMs > 16.6) {
    throw new Error(`Average frame update time (${avgFrameTimeMs.toFixed(2)}ms) exceeds 16.6ms frame budget!`);
  }

  return { avgFrameTimeMs: avgFrameTimeMs.toFixed(2) };
});

console.log('\n====================================================');
console.log(' STRESS HARNESS SUMMARY');
console.log('====================================================');
const failed = results.filter(r => r.status === 'FAIL');
console.log(`Passed: ${results.length - failed.length} / ${results.length}`);
console.log(`Failed: ${failed.length} / ${results.length}`);
