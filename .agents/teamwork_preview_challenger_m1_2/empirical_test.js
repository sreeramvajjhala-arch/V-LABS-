/**
 * Empirical Stress Test Harness for ParticleEngine
 * Challenger Agent: teamwork_preview_challenger_m1_2
 */

const assert = require('assert');
const path = require('path');
const ParticleEngine = require('../../canvas_particle_bg/particle-engine.js');

// Mock Canvas Setup
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
    addEventListener: (evt, fn, opts) => {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push({ fn, opts });
    },
    removeEventListener: (evt, fn) => {
      if (listeners[evt]) {
        listeners[evt] = listeners[evt].filter(item => item.fn !== fn);
      }
    },
    _listeners: listeners
  };
}

// Mock Window Setup
function createMockWindow() {
  const listeners = {};
  return {
    devicePixelRatio: 2,
    addEventListener: (evt, fn, opts) => {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push({ fn, opts });
    },
    removeEventListener: (evt, fn) => {
      if (listeners[evt]) {
        listeners[evt] = listeners[evt].filter(item => item.fn !== fn);
      }
    },
    _listeners: listeners
  };
}

console.log('===========================================================');
console.log(' EMPIRICAL CHALLENGE HARNESS: ParticleEngine');
console.log('===========================================================\n');

let totalTests = 0;
let passedTests = 0;
const findings = [];

function challenge(title, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`[PASS] ${title}`);
  } catch (err) {
    console.error(`[FAIL] ${title}`);
    console.error(`       Error: ${err.message}`);
    findings.push({ title, error: err.message, stack: err.stack });
  }
}

// -------------------------------------------------------------
// TEST GROUP 1: Distance-Squared & Math.sqrt Pre-Filtering Performance
// -------------------------------------------------------------
console.log('--- TEST GROUP 1: Performance & Distance-Squared Optimization ---');

challenge('1.1 Benchmark 300 particles over 1,000 frames (High Density Stress)', () => {
  const canvas = createMockCanvas(1920, 1080);
  const engine = new ParticleEngine(canvas, { density: 300 });
  
  // Enable mouse interaction
  engine.pointerState.x = 960;
  engine.pointerState.y = 540;
  engine.pointerState.isActive = true;

  // Add 5 active impulse shockwaves
  for (let i = 0; i < 5; i++) {
    engine.triggerImpulse(200 * i, 200 * i);
  }

  const startMs = Date.now();
  for (let frame = 0; frame < 1000; frame++) {
    engine.update();
    engine.render();
  }
  const durationMs = Date.now() - startMs;
  const fpsEquivalent = (1000 / (durationMs / 1000)).toFixed(0);

  console.log(`       Rendered 1,000 frames (300 particles + 5 impulses + mouse) in ${durationMs} ms (${fpsEquivalent} equiv FPS)`);
  assert(durationMs < 3000, `Execution too slow: took ${durationMs} ms for 1,000 frames`);
});

challenge('1.2 Verify Math.sqrt invocation count vs d^2 filtering', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas, { density: 100 });
  
  // Track Math.sqrt calls
  let sqrtCount = 0;
  const origSqrt = Math.sqrt;
  Math.sqrt = function(val) {
    sqrtCount++;
    return origSqrt(val);
  };

  try {
    engine.render();
    console.log(`       100 particles render executed ${sqrtCount} Math.sqrt calls (max possible without filter: ${100 * 99 / 2})`);
    assert(sqrtCount < 4950, `d^2 pre-filtering failed to reduce Math.sqrt calls (${sqrtCount} vs 4950 max)`);
  } finally {
    Math.sqrt = origSqrt;
  }
});

challenge('1.3 Long animation loop stability (100,000 ticks numeric drift test)', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas, { density: 50 });

  for (let t = 0; t < 100000; t++) {
    engine.update();
  }

  const isAnyNaN = engine.particles.some(p => Number.isNaN(p.x) || Number.isNaN(p.y) || Number.isNaN(p.vx) || Number.isNaN(p.vy) || Number.isNaN(p.angle));
  assert(!isAnyNaN, 'Particles accumulated NaN values during 100,000 update ticks');
  
  const allInBounds = engine.particles.every(p => p.x >= -50 && p.x <= 850 && p.y >= -50 && p.y <= 650);
  assert(allInBounds, 'Particles escaped wrap-around boundaries after 100,000 ticks');
});

// -------------------------------------------------------------
// TEST GROUP 2: Memory Cleanup & Leak Investigation
// -------------------------------------------------------------
console.log('\n--- TEST GROUP 2: Memory Cleanup & Destroy Lifecycle ---');

challenge('2.1 Memory usage after 1,000 create/destroy cycles', () => {
  if (global.gc) global.gc();
  const initialMem = process.memoryUsage().heapUsed;

  for (let i = 0; i < 1000; i++) {
    const canvas = createMockCanvas(800, 600);
    const engine = new ParticleEngine(canvas, { density: 100 });
    engine.start();
    engine.triggerImpulse(100, 100);
    engine.update();
    engine.destroy();
  }

  if (global.gc) global.gc();
  const finalMem = process.memoryUsage().heapUsed;
  const memDiffMb = ((finalMem - initialMem) / 1024 / 1024).toFixed(2);
  console.log(`       Heap diff after 1,000 cycles: ${memDiffMb} MB`);
  assert(finalMem - initialMem < 15 * 1024 * 1024, `Memory leak detected: heap grew by ${memDiffMb} MB`);
});

challenge('2.2 Window & Canvas Event listener removal completeness', () => {
  const mockWin = createMockWindow();
  global.window = mockWin;

  try {
    const canvas = createMockCanvas(800, 600);
    const engine = new ParticleEngine(canvas);

    // Verify listeners attached
    assert(mockWin._listeners['resize'] && mockWin._listeners['resize'].length === 1, 'Resize listener attached to window');
    assert(canvas._listeners['mousemove'] && canvas._listeners['mousemove'].length === 1, 'Mousemove listener attached to canvas');
    assert(canvas._listeners['touchstart'] && canvas._listeners['touchstart'].length === 1, 'Touchstart listener attached to canvas');

    // Call destroy
    engine.destroy();

    // Verify listeners detached
    assert(!mockWin._listeners['resize'] || mockWin._listeners['resize'].length === 0, 'Resize listener NOT removed from window on destroy()');
    assert(!canvas._listeners['mousemove'] || canvas._listeners['mousemove'].length === 0, 'Mousemove listener NOT removed from canvas on destroy()');
    assert(!canvas._listeners['touchstart'] || canvas._listeners['touchstart'].length === 0, 'Touchstart listener NOT removed from canvas on destroy()');
  } finally {
    delete global.window;
  }
});

challenge('2.3 Post-destroy invocation resilience (No unhandled crashes)', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas);
  engine.destroy();

  // Test calling methods post-destroy
  assert.doesNotThrow(() => engine.update(), 'engine.update() threw exception post-destroy');
  assert.doesNotThrow(() => engine.render(), 'engine.render() threw exception post-destroy');
  assert.doesNotThrow(() => engine.resize(), 'engine.resize() threw exception post-destroy');
  assert.doesNotThrow(() => engine.setPalette('cyber_crimson'), 'engine.setPalette() threw exception post-destroy');
  assert.doesNotThrow(() => engine.setSpeed(2.0), 'engine.setSpeed() threw exception post-destroy');
  assert.doesNotThrow(() => engine.triggerImpulse(50, 50), 'engine.triggerImpulse() threw exception post-destroy');
});

// -------------------------------------------------------------
// TEST GROUP 3: Lodash Integration & Execution Integrity
// -------------------------------------------------------------
console.log('\n--- TEST GROUP 3: Lodash Integration & Execution Integrity ---');

challenge('3.1 Verify Lodash resolution under Node environment', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas);

  const _ = engine._;
  assert(_, 'Lodash instance must resolve');
  
  // Test all required Lodash methods
  const randVal = _.random(10, 20, true);
  assert(randVal >= 10 && randVal <= 20, '_.random failed');

  const clampVal = _.clamp(50, 0, 10);
  assert.strictEqual(clampVal, 10, '_.clamp failed');

  const sampleVal = _.sample([1, 2, 3]);
  assert([1, 2, 3].includes(sampleVal), '_.sample failed');

  const rangeArr = _.range(5);
  assert.deepStrictEqual(rangeArr, [0, 1, 2, 3, 4], '_.range failed');

  let iterCount = 0;
  _.forEach([10, 20, 30], (val) => iterCount += val);
  assert.strictEqual(iterCount, 60, '_.forEach failed');
});

challenge('3.2 Verify Lodash resolution in Browser simulated environment (window._)', () => {
  const mockLodash = {
    random: (a, b) => a + 1,
    clamp: (val, min, max) => val,
    sample: (arr) => arr[0],
    range: (n) => [0],
    debounce: (fn) => fn,
    throttle: (fn) => fn,
    forEach: (arr, fn) => arr.forEach(fn),
    _isMock: true
  };

  const mockWin = createMockWindow();
  mockWin._ = mockLodash;
  global.window = mockWin;

  try {
    const canvas = createMockCanvas(800, 600);
    const engine = new ParticleEngine(canvas);

    assert(engine._._isMock, 'Engine failed to use window._ when window._ is present in window environment');
  } finally {
    delete global.window;
  }
});

challenge('3.3 Verify Lodash fallback when require fails and window._ is missing', () => {
  // Simulate window present but no window._
  const mockWin = createMockWindow();
  global.window = mockWin;

  try {
    const canvas = createMockCanvas(800, 600);
    const engine = new ParticleEngine(canvas);

    const _ = engine._;
    assert(_, 'Fallback Lodash object must be returned when window._ is missing');
    assert.strictEqual(typeof _.random, 'function');
    assert.strictEqual(typeof _.clamp, 'function');
    assert.strictEqual(typeof _.sample, 'function');
    assert.strictEqual(typeof _.range, 'function');
    assert.strictEqual(typeof _.debounce, 'function');
    assert.strictEqual(typeof _.throttle, 'function');
    assert.strictEqual(typeof _.forEach, 'function');
  } finally {
    delete global.window;
  }
});

challenge('3.4 Edge Case: Malformed / NaN inputs in setDensity and setSpeed', () => {
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas);

  // NaN input to setSpeed
  engine.setSpeed(NaN);
  assert(!Number.isNaN(engine.config.speedMultiplier), 'setSpeed(NaN) resulted in NaN speedMultiplier');

  // NaN input to setDensity
  engine.setDensity(NaN);
  assert(!Number.isNaN(engine.config.density), 'setDensity(NaN) resulted in NaN density');
  assert(engine.particles.length >= 10, 'setDensity(NaN) destroyed particle pool');
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n===========================================================');
console.log(` EMPIRICAL RESULTS: ${passedTests} / ${totalTests} Passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log('===========================================================\n');

if (findings.length > 0) {
  console.log('FINDINGS / FAILURE DETAILS:');
  findings.forEach((f, i) => {
    console.log(`${i + 1}. ${f.title}`);
    console.log(`   Error: ${f.error}`);
  });
  process.exit(1);
} else {
  console.log('ALL EMPIRICAL CHALLENGES PASSED! No flaws detected.');
  process.exit(0);
}
