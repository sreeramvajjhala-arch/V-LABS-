const fs = require('fs');
const path = require('path');
const ParticleEngine = require('../../canvas_particle_bg/particle-engine.js');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASSED: ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAILED: ${message}`);
    failCount++;
  }
}

// Mock Canvas Context 2D
function createMockCanvas(width = 800, height = 600) {
  const listeners = [];
  const ctxCalls = [];
  const ctx = {
    clearRect: (...args) => ctxCalls.push({ fn: 'clearRect', args }),
    beginPath: (...args) => ctxCalls.push({ fn: 'beginPath', args }),
    moveTo: (...args) => ctxCalls.push({ fn: 'moveTo', args }),
    lineTo: (...args) => ctxCalls.push({ fn: 'lineTo', args }),
    stroke: (...args) => ctxCalls.push({ fn: 'stroke', args }),
    arc: (...args) => ctxCalls.push({ fn: 'arc', args }),
    fill: (...args) => ctxCalls.push({ fn: 'fill', args }),
    resetTransform: () => ctxCalls.push({ fn: 'resetTransform', args: [] }),
    setTransform: (...args) => ctxCalls.push({ fn: 'setTransform', args }),
    scale: (...args) => ctxCalls.push({ fn: 'scale', args }),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1
  };

  const canvas = {
    width: width,
    height: height,
    getContext: (type) => (type === '2d' ? ctx : null),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: width, height: height }),
    parentElement: { clientWidth: width, clientHeight: height },
    addEventListener: (type, fn, opts) => {
      listeners.push({ type, fn, opts });
    },
    removeEventListener: (type, fn, opts) => {
      const idx = listeners.findIndex(l => l.type === type && l.fn === fn);
      if (idx !== -1) listeners.splice(idx, 1);
    },
    _listeners: listeners,
    _ctxCalls: ctxCalls,
    _ctx: ctx
  };

  return canvas;
}

// Mock Window & Global Environment setup
function setupMockEnvironment(dpr = 1) {
  const windowListeners = [];
  const mockWindow = {
    devicePixelRatio: dpr,
    addEventListener: (type, fn, opts) => {
      windowListeners.push({ type, fn, opts });
    },
    removeEventListener: (type, fn, opts) => {
      const idx = windowListeners.findIndex(l => l.type === type && l.fn === fn);
      if (idx !== -1) windowListeners.splice(idx, 1);
    },
    _listeners: windowListeners
  };

  global.window = mockWindow;
  global.document = {
    body: { clientWidth: 800, clientHeight: 600 }
  };
  global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
  global.cancelAnimationFrame = (id) => clearTimeout(id);

  return mockWindow;
}

console.log('====================================================');
console.log(' Empirical Challenge & Stress Test Suite (M3.2)');
console.log('====================================================\n');

// ----------------------------------------------------
// 1. Performance Benchmark (Max Density 300 Particles)
// ----------------------------------------------------
console.log('▶ EMPIRICAL CHECK 1: Performance Benchmark (Max Density 300 Particles)');
{
  setupMockEnvironment(1);
  const canvas = createMockCanvas(1920, 1080);
  const engine = new ParticleEngine(canvas, { density: 300, mousePhysicsEnabled: true });
  
  // Set pointer active inside canvas to include particle-to-mouse line physics & repulsion
  engine.pointerState.isActive = true;
  engine.pointerState.x = 400;
  engine.pointerState.y = 300;

  const iterations = 1000;
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    engine.update();
    engine.render();
  }
  const elapsed = performance.now() - start;
  const avgFrameMs = elapsed / iterations;
  const theoreticalFps = 1000 / avgFrameMs;

  console.log(`    Total time for ${iterations} frames (300 particles @ 1920x1080): ${elapsed.toFixed(2)} ms`);
  console.log(`    Average frame execution time: ${avgFrameMs.toFixed(4)} ms`);
  console.log(`    Theoretical throughput: ${theoreticalFps.toFixed(0)} FPS`);

  assert(avgFrameMs < 16.67, `Average frame execution time (${avgFrameMs.toFixed(4)} ms) is within 16.67 ms 60 FPS budget`);
  assert(avgFrameMs < 5.0, `Engine achieves high efficiency (< 5.0 ms/frame for 300 particles)`);
  engine.destroy();
}

console.log('');

// ----------------------------------------------------
// 2. d^2 Distance Pre-filtering & Bounding Box Check
// ----------------------------------------------------
console.log('▶ EMPIRICAL CHECK 2: d^2 Distance Pre-filtering & Bounding Box Optimization');
{
  setupMockEnvironment(1);
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas, { density: 4, mousePhysicsEnabled: false });

  // Explicitly position 4 particles:
  // p0: (100, 100)
  // p1: (150, 100) -> dx = 50, dy = 0 -> inside bounding box (50 <= 120), dist = 50 <= 120 -> Math.sqrt called!
  // p2: (500, 500) -> dx = 400, dy = 400 -> outside bounding box (|dx| = 400 > 120) -> Math.sqrt SKIPPED!
  // p3: (500, 510) -> relative to p2: dx = 0, dy = 10 -> inside bounding box, dist = 10 <= 120 -> Math.sqrt called!
  engine.particles = [
    { type: 'bubble', x: 100, y: 100, vx: 0, vy: 0, baseVx: 0, baseVy: 0, rBase: 5, currentRadius: 5, pulseAmp: 1, pulseFreq: 0.03, pulsePhase: 0, color: '#FFFFFF' },
    { type: 'bubble', x: 150, y: 100, vx: 0, vy: 0, baseVx: 0, baseVy: 0, rBase: 5, currentRadius: 5, pulseAmp: 1, pulseFreq: 0.03, pulsePhase: 0, color: '#FFFFFF' },
    { type: 'bubble', x: 500, y: 500, vx: 0, vy: 0, baseVx: 0, baseVy: 0, rBase: 5, currentRadius: 5, pulseAmp: 1, pulseFreq: 0.03, pulsePhase: 0, color: '#FFFFFF' },
    { type: 'bubble', x: 500, y: 510, vx: 0, vy: 0, baseVx: 0, baseVy: 0, rBase: 5, currentRadius: 5, pulseAmp: 1, pulseFreq: 0.03, pulsePhase: 0, color: '#FFFFFF' }
  ];

  const origSqrt = Math.sqrt;
  let sqrtCallCount = 0;
  Math.sqrt = function(...args) {
    sqrtCallCount++;
    return origSqrt.apply(Math, args);
  };

  engine.render();

  Math.sqrt = origSqrt;

  // Total pairs for 4 particles = 6 pairs.
  // Pair (0,1): dx=50, dy=0 -> abs(dx)<=120, abs(dy)<=120 -> dSq = 2500 <= 14400 -> Math.sqrt called.
  // Pair (0,2): dx=400, dy=400 -> abs(dx)=400 > 120 -> SKIPPED (no Math.sqrt).
  // Pair (0,3): dx=400, dy=410 -> abs(dx)=400 > 120 -> SKIPPED (no Math.sqrt).
  // Pair (1,2): dx=350, dy=400 -> abs(dx)=350 > 120 -> SKIPPED (no Math.sqrt).
  // Pair (1,3): dx=350, dy=410 -> abs(dx)=350 > 120 -> SKIPPED (no Math.sqrt).
  // Pair (2,3): dx=0, dy=10 -> abs(dx)<=120, abs(dy)<=120 -> dSq = 100 <= 14400 -> Math.sqrt called.
  // Expected Math.sqrt calls = EXACTLY 2 (instead of 6).

  console.log(`    Total pairs: 6. Math.sqrt calls with d^2 pre-filtering: ${sqrtCallCount}`);
  assert(sqrtCallCount === 2, `Bounding box pre-filtering skipped Math.sqrt for 4 out of 6 distant pairs (expected 2 calls, got ${sqrtCallCount})`);

  engine.destroy();
}

console.log('');

// ----------------------------------------------------
// 3. Zero Memory Leak Guarantees
// ----------------------------------------------------
console.log('▶ EMPIRICAL CHECK 3: Zero Memory Leak Guarantees on destroy()');
{
  const mockWin = setupMockEnvironment(1);
  const canvas = createMockCanvas(800, 600);
  const engine = new ParticleEngine(canvas, { density: 50 });
  engine.start();

  const windowListenersCount = mockWin._listeners.length;
  const canvasListenersCount = canvas._listeners.length;

  assert(windowListenersCount > 0, `Window resize listener registered (${windowListenersCount})`);
  assert(canvasListenersCount > 0, `Canvas mouse/touch listeners registered (${canvasListenersCount})`);
  assert(engine.particles.length === 50, `Particles array populated (${engine.particles.length})`);
  assert(engine.isRunning === true, `Engine animation running`);

  // Teardown
  engine.destroy();

  assert(engine.isRunning === false, `destroy() stopped animation loop (isRunning === false)`);
  assert(engine.animFrameId === null, `destroy() cleared animFrameId`);
  assert(engine.particles.length === 0, `destroy() emptied particles array`);
  assert(engine.impulseWaves.length === 0, `destroy() emptied impulseWaves array`);
  assert(engine.ctx === null, `destroy() nulled context reference`);
  assert(engine.canvas === null, `destroy() nulled canvas reference`);
  assert(mockWin._listeners.length === 0, `destroy() unregistered all window event listeners`);
  assert(canvas._listeners.length === 0, `destroy() unregistered all canvas event listeners`);
}

console.log('');

// ----------------------------------------------------
// 4. High-DPI / Retina Canvas Scaling
// ----------------------------------------------------
console.log('▶ EMPIRICAL CHECK 4: High-DPI Canvas Resolution Scaling');
{
  // Test DPR = 1
  {
    setupMockEnvironment(1);
    const canvas = createMockCanvas(800, 600);
    const engine = new ParticleEngine(canvas);
    assert(canvas.width === 800 && canvas.height === 600, `DPR=1: canvas resolution 800x600`);
    assert(engine.dpr === 1, `DPR=1: engine.dpr matches 1`);
    engine.destroy();
  }

  // Test DPR = 2 (Retina Display)
  {
    setupMockEnvironment(2);
    const canvas = createMockCanvas(800, 600);
    const engine = new ParticleEngine(canvas);
    assert(canvas.width === 1600 && canvas.height === 1200, `DPR=2 (Retina): canvas resolution scaled 2x to 1600x1200`);
    assert(engine.dpr === 2, `DPR=2: engine.dpr matches 2`);
    
    // Check if scale(2, 2) was executed on 2D context
    const scaleCalls = canvas._ctxCalls.filter(c => c.fn === 'scale');
    assert(scaleCalls.length > 0 && scaleCalls[0].args[0] === 2 && scaleCalls[0].args[1] === 2, `DPR=2: ctx.scale(2, 2) invoked on 2D context`);
    engine.destroy();
  }

  // Test DPR = 3 (Ultra-High DPI / Mobile 4K)
  {
    setupMockEnvironment(3);
    const canvas = createMockCanvas(800, 600);
    const engine = new ParticleEngine(canvas);
    assert(canvas.width === 2400 && canvas.height === 1800, `DPR=3 (4K/Retina HD): canvas resolution scaled 3x to 2400x1800`);
    assert(engine.dpr === 3, `DPR=3: engine.dpr matches 3`);
    engine.destroy();
  }
}

console.log('');

// ----------------------------------------------------
// 5. WhatsApp Escape Hatch URL Validation
// ----------------------------------------------------
console.log('▶ EMPIRICAL CHECK 5: WhatsApp Escape Hatch URL Format Validation (https://wa.me/996655273)');
{
  const expectedUrl = 'https://wa.me/996655273';

  // Read canvas_particle_bg/index.html
  const bgHtmlPath = path.join(__dirname, '../../canvas_particle_bg/index.html');
  const bgHtml = fs.readFileSync(bgHtmlPath, 'utf8');
  const bgHasUrl = bgHtml.includes(`href="${expectedUrl}"`);
  assert(bgHasUrl, `canvas_particle_bg/index.html contains exact WhatsApp URL '${expectedUrl}'`);

  // Read root index.html
  const rootHtmlPath = path.join(__dirname, '../../index.html');
  const rootHtml = fs.readFileSync(rootHtmlPath, 'utf8');
  const rootHasUrl = rootHtml.includes(`href="${expectedUrl}"`);
  assert(rootHasUrl, `root index.html contains exact WhatsApp URL '${expectedUrl}'`);

  // Read canvas_particle_bg/README.md
  const bgReadmePath = path.join(__dirname, '../../canvas_particle_bg/README.md');
  const bgReadme = fs.readFileSync(bgReadmePath, 'utf8');
  const bgReadmeHasUrl = bgReadme.includes(expectedUrl);
  assert(bgReadmeHasUrl, `canvas_particle_bg/README.md contains WhatsApp URL '${expectedUrl}'`);

  // Read root README.md
  const rootReadmePath = path.join(__dirname, '../../README.md');
  const rootReadme = fs.readFileSync(rootReadmePath, 'utf8');
  const rootReadmeHasUrl = rootReadme.includes('wa.me/996655273');
  assert(rootReadmeHasUrl, `root README.md contains WhatsApp URL wa.me/996655273`);

  // Verify security attributes rel="noopener noreferrer" and target="_blank" on HTML anchor tags
  assert(bgHtml.includes('target="_blank"') && bgHtml.includes('rel="noopener noreferrer"'), `canvas_particle_bg/index.html uses secure target="_blank" and rel="noopener noreferrer"`);
  assert(rootHtml.includes('target="_blank"') && rootHtml.includes('rel="noopener noreferrer"'), `root index.html uses secure target="_blank" and rel="noopener noreferrer"`);
}

console.log('\n====================================================');
console.log(` EMPIRICAL VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
