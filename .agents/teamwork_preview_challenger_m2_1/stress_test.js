/**
 * Empirical Stress Test Harness for Milestone 2 UI Controls & DOM Contracts
 * 
 * Verifies app.js, index.html, particle-engine.js interactions under normal and extreme conditions.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const particleEnginePath = path.resolve(__dirname, '../../canvas_particle_bg/particle-engine.js');
const indexPath = path.resolve(__dirname, '../../canvas_particle_bg/index.html');
const appPath = path.resolve(__dirname, '../../canvas_particle_bg/app.js');

const ParticleEngine = require(particleEnginePath);

console.log('====================================================');
console.log(' Empirical Stress Test Harness — Milestone 2');
console.log('====================================================\n');

let passed = 0;
let total = 0;

function runEmpiricalTest(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ PASSED: ${name}`);
  } catch (err) {
    console.error(`  ✗ FAILED: ${name}`);
    console.error(`    Error: ${err.message}`);
    if (err.stack) console.error(`    ${err.stack.split('\n')[1]}`);
  }
}

// Standard DOMTokenList mock
class MockClassList {
  constructor(initialClassString = '') {
    this._tokens = new Set((initialClassString || '').split(/\s+/).filter(Boolean));
  }

  add(...tokens) {
    tokens.forEach(t => {
      if (t) this._tokens.add(t);
    });
  }

  remove(...tokens) {
    tokens.forEach(t => {
      if (t) this._tokens.delete(t);
    });
  }

  contains(token) {
    return this._tokens.has(token);
  }

  toString() {
    return Array.from(this._tokens).join(' ');
  }
}

// Simple DOM Mock Generator
function createMockDOMEnvironment() {
  class MockElement {
    constructor(tagName, id = '', attributes = {}, textContent = '') {
      this.tagName = tagName.toUpperCase();
      this.id = id;
      this.attributes = attributes;
      this.textContent = textContent;
      this.classList = new MockClassList(attributes.class || '');
      this.value = attributes.value || '';
      this.listeners = {};
    }

    getAttribute(name) {
      if (name === 'class') return this.classList.toString();
      return this.attributes[name] || null;
    }

    setAttribute(name, val) {
      this.attributes[name] = val;
      if (name === 'class') {
        this.classList = new MockClassList(val);
      }
    }

    addEventListener(event, handler) {
      this.listeners[event] = this.listeners[event] || [];
      this.listeners[event].push(handler);
    }

    removeEventListener(event, handler) {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(h => h !== handler);
      }
    }

    dispatchEvent(eventObj) {
      const handlers = this.listeners[eventObj.type] || [];
      handlers.forEach(h => h(eventObj));
    }

    getBoundingClientRect() {
      return { left: 0, top: 0, width: 800, height: 600 };
    }

    get className() {
      return this.classList.toString();
    }

    set className(val) {
      this.classList = new MockClassList(val);
    }
  }

  const canvas = new MockElement('canvas', 'particleCanvas');
  canvas.getContext = (type) => (type === '2d' ? {
    clearRect: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {},
    arc: () => {}, fill: () => {}, stroke: () => {}, scale: () => {}, setTransform: () => {}, resetTransform: () => {}
  } : null);

  const densitySlider = new MockElement('input', 'densitySlider', { type: 'range', min: '20', max: '200', step: '1', value: '80' });
  const densityValue = new MockElement('span', 'densityValue', {}, '80');
  const speedSlider = new MockElement('input', 'speedSlider', { type: 'range', min: '0.2', max: '3.0', step: '0.1', value: '1.0' });
  const speedValue = new MockElement('span', 'speedValue', {}, '1.0x');
  const physicsToggle = new MockElement('button', 'physicsToggle', { class: 'py-2.5 px-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300' });
  const physicsToggleText = new MockElement('span', 'physicsToggleText', {}, 'Physics: ON');
  const physicsToggleIcon = new MockElement('i', 'physicsToggleIcon', { class: 'fa-solid fa-hand-pointer text-amber-400' });
  const playPauseToggle = new MockElement('button', 'playPauseToggle', { class: 'py-2.5 px-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300' });
  const playPauseText = new MockElement('span', 'playPauseText', {}, 'Animation: Playing');
  const playPauseIcon = new MockElement('i', 'playPauseIcon', { class: 'fa-solid fa-pause text-emerald-400' });
  
  const paletteBtns = [
    new MockElement('button', '', { 'data-palette': 'maroon_gold', class: 'palette-btn active border-amber-500/60 bg-amber-500/20 text-white' }),
    new MockElement('button', '', { 'data-palette': 'cyber_crimson', class: 'palette-btn border-white/10 bg-white/5 text-gray-300' }),
    new MockElement('button', '', { 'data-palette': 'emerald_night', class: 'palette-btn border-white/10 bg-white/5 text-gray-300' }),
    new MockElement('button', '', { 'data-palette': 'sapphire_dark', class: 'palette-btn border-white/10 bg-white/5 text-gray-300' })
  ];

  const whatsappLink = new MockElement('a', 'whatsappLink', {
    href: 'https://wa.me/996655273',
    target: '_blank',
    rel: 'noopener noreferrer'
  });

  const elementsMap = {
    particleCanvas: canvas,
    densitySlider: densitySlider,
    densityValue: densityValue,
    speedSlider: speedSlider,
    speedValue: speedValue,
    physicsToggle: physicsToggle,
    physicsToggleText: physicsToggleText,
    physicsToggleIcon: physicsToggleIcon,
    playPauseToggle: playPauseToggle,
    playPauseText: playPauseText,
    playPauseIcon: playPauseIcon,
    whatsappLink: whatsappLink
  };

  const docListeners = {};

  const documentMock = {
    getElementById: (id) => elementsMap[id] || null,
    querySelectorAll: (selector) => {
      if (selector === '[data-palette]') return paletteBtns;
      return [];
    },
    addEventListener: (evt, handler) => {
      docListeners[evt] = docListeners[evt] || [];
      docListeners[evt].push(handler);
    },
    dispatchEvent: (evtObj) => {
      if (docListeners[evtObj.type]) {
        docListeners[evtObj.type].forEach(h => h(evtObj));
      }
    }
  };

  return { documentMock, elementsMap, paletteBtns, docListeners };
}

// ----------------------------------------------------
// CHALLENGE 1: DOM Contract Compliance Verification
// ----------------------------------------------------
console.log('▶ Challenge 1: DOM Contract Compliance Verification');

runEmpiricalTest('1.1 index.html contains all required UI element IDs & classes', () => {
  const html = fs.readFileSync(indexPath, 'utf8');
  const requiredIds = [
    'particleCanvas', 'densitySlider', 'densityValue', 'speedSlider',
    'speedValue', 'physicsToggle', 'physicsToggleText', 'physicsToggleIcon',
    'playPauseToggle', 'playPauseText', 'playPauseIcon', 'paletteSwitcher', 'whatsappLink'
  ];

  requiredIds.forEach(id => {
    assert(html.includes(`id="${id}"`), `Missing required element ID: #${id}`);
  });
});

runEmpiricalTest('1.2 Slider attribute bounds in HTML match SPEC (Density: 20-200, Speed: 0.2-3.0)', () => {
  const html = fs.readFileSync(indexPath, 'utf8');
  assert(html.includes('id="densitySlider"') && html.includes('min="20"') && html.includes('max="200"'), 'Density slider min/max bounds mismatch');
  assert(html.includes('id="speedSlider"') && html.includes('min="0.2"') && html.includes('max="3.0"'), 'Speed slider min/max bounds mismatch');
});

runEmpiricalTest('1.3 Escape hatch WhatsApp URL exact format & security tags', () => {
  const html = fs.readFileSync(indexPath, 'utf8');
  assert(html.includes('href="https://wa.me/996655273"'), 'Escape hatch URL must be exactly https://wa.me/996655273');
  assert(html.includes('target="_blank"'), 'Escape hatch must open in new tab target="_blank"');
  assert(html.includes('rel="noopener noreferrer"'), 'Escape hatch must include security attribute rel="noopener noreferrer"');
});

// ----------------------------------------------------
// CHALLENGE 2: Interactive UI Event Handling Simulation
// ----------------------------------------------------
console.log('\n▶ Challenge 2: Interactive UI Event Handling Simulation');

runEmpiricalTest('2.1 Density slider input event updates engine & DOM readout synchronously', () => {
  const env = createMockDOMEnvironment();
  global.document = env.documentMock;
  global.ParticleEngine = ParticleEngine;

  const appCode = fs.readFileSync(appPath, 'utf8');
  eval(appCode);
  env.docListeners['DOMContentLoaded'].forEach(fn => fn());

  const densitySlider = env.elementsMap.densitySlider;
  const densityValue = env.elementsMap.densityValue;

  densitySlider.value = '150';
  densitySlider.dispatchEvent({ type: 'input', target: { value: '150' } });

  assert.strictEqual(densityValue.textContent, 150, 'DOM densityValue text must update to 150');
});

runEmpiricalTest('2.2 Speed slider input event updates engine & formatted DOM readout', () => {
  const env = createMockDOMEnvironment();
  global.document = env.documentMock;
  global.ParticleEngine = ParticleEngine;

  const appCode = fs.readFileSync(appPath, 'utf8');
  eval(appCode);
  env.docListeners['DOMContentLoaded'].forEach(fn => fn());

  const speedSlider = env.elementsMap.speedSlider;
  const speedValue = env.elementsMap.speedValue;

  speedSlider.value = '2.3';
  speedSlider.dispatchEvent({ type: 'input', target: { value: '2.3' } });

  assert.strictEqual(speedValue.textContent, '2.3x', 'DOM speedValue text must update to 2.3x');
});

runEmpiricalTest('2.3 Physics toggle button switches state, text, icon, and button styling', () => {
  const env = createMockDOMEnvironment();
  global.document = env.documentMock;
  global.ParticleEngine = ParticleEngine;

  const appCode = fs.readFileSync(appPath, 'utf8');
  eval(appCode);
  env.docListeners['DOMContentLoaded'].forEach(fn => fn());

  const toggleBtn = env.elementsMap.physicsToggle;
  const textSpan = env.elementsMap.physicsToggleText;
  const iconEl = env.elementsMap.physicsToggleIcon;

  // Click 1: Turn OFF
  toggleBtn.dispatchEvent({ type: 'click' });
  assert.strictEqual(textSpan.textContent, 'Physics: OFF');
  assert.strictEqual(iconEl.className, 'fa-solid fa-ban text-gray-400');
  assert(toggleBtn.classList.contains('border-gray-600'), 'Inactive style class border-gray-600 must be present');

  // Click 2: Turn ON
  toggleBtn.dispatchEvent({ type: 'click' });
  assert.strictEqual(textSpan.textContent, 'Physics: ON');
  assert.strictEqual(iconEl.className, 'fa-solid fa-hand-pointer text-amber-400');
  assert(toggleBtn.classList.contains('border-amber-500/40'), 'Active style class border-amber-500/40 must be present');
});

runEmpiricalTest('2.4 Play/Pause toggle button toggles state, icon, text, and button styling', () => {
  const env = createMockDOMEnvironment();
  global.document = env.documentMock;
  global.ParticleEngine = ParticleEngine;

  const appCode = fs.readFileSync(appPath, 'utf8');
  eval(appCode);
  env.docListeners['DOMContentLoaded'].forEach(fn => fn());

  const toggleBtn = env.elementsMap.playPauseToggle;
  const textSpan = env.elementsMap.playPauseText;
  const iconEl = env.elementsMap.playPauseIcon;

  // Click 1: Pause animation
  toggleBtn.dispatchEvent({ type: 'click' });
  assert.strictEqual(textSpan.textContent, 'Animation: Paused');
  assert.strictEqual(iconEl.className, 'fa-solid fa-play text-amber-400');
  assert(toggleBtn.classList.contains('border-amber-500/40'));

  // Click 2: Resume animation
  toggleBtn.dispatchEvent({ type: 'click' });
  assert.strictEqual(textSpan.textContent, 'Animation: Playing');
  assert.strictEqual(iconEl.className, 'fa-solid fa-pause text-emerald-400');
  assert(toggleBtn.classList.contains('border-emerald-500/40'));
});

// ----------------------------------------------------
// CHALLENGE 3: Palette Switcher Mutual Exclusivity
// ----------------------------------------------------
console.log('\n▶ Challenge 3: Palette Switcher Mutual Exclusivity & Active State');

runEmpiricalTest('3.1 Palette button click updates active state and clears active classes on others', () => {
  const env = createMockDOMEnvironment();
  global.document = env.documentMock;
  global.ParticleEngine = ParticleEngine;

  const appCode = fs.readFileSync(appPath, 'utf8');
  eval(appCode);
  env.docListeners['DOMContentLoaded'].forEach(fn => fn());

  const btns = env.paletteBtns;

  // Click Cyber Crimson (index 1)
  btns[1].dispatchEvent({ type: 'click' });

  assert(btns[1].classList.contains('active'), 'Cyber Crimson swatch should have active class');
  assert(btns[1].classList.contains('border-amber-500/60'), 'Cyber Crimson swatch should have highlight border');

  assert(!btns[0].classList.contains('active'), 'Maroon/Gold swatch should NOT have active class');
  assert(!btns[2].classList.contains('active'), 'Emerald Night swatch should NOT have active class');
  assert(!btns[3].classList.contains('active'), 'Sapphire Dark swatch should NOT have active class');

  // Click Emerald Night (index 2)
  btns[2].dispatchEvent({ type: 'click' });
  assert(btns[2].classList.contains('active'), 'Emerald Night swatch should have active class');
  assert(!btns[1].classList.contains('active'), 'Cyber Crimson swatch should NO LONGER have active class');
});

// ----------------------------------------------------
// CHALLENGE 4: Stress Testing & Resilience
// ----------------------------------------------------
console.log('\n▶ Challenge 4: Stress Testing & Edge Cases');

runEmpiricalTest('4.1 Rapid 50x play/pause toggle execution stability', () => {
  const env = createMockDOMEnvironment();
  global.document = env.documentMock;
  global.ParticleEngine = ParticleEngine;

  const appCode = fs.readFileSync(appPath, 'utf8');
  eval(appCode);
  env.docListeners['DOMContentLoaded'].forEach(fn => fn());

  const toggleBtn = env.elementsMap.playPauseToggle;
  for (let i = 0; i < 50; i++) {
    toggleBtn.dispatchEvent({ type: 'click' });
  }

  assert.strictEqual(env.elementsMap.playPauseText.textContent, 'Animation: Playing');
});

runEmpiricalTest('4.2 Canvas click impulse triggers shockwave only when physics enabled', () => {
  const env = createMockDOMEnvironment();
  global.document = env.documentMock;
  global.ParticleEngine = ParticleEngine;

  let impulseCallCount = 0;
  const originalTrigger = ParticleEngine.prototype.triggerImpulse;
  ParticleEngine.prototype.triggerImpulse = function(...args) {
    impulseCallCount++;
    return originalTrigger.apply(this, args);
  };

  try {
    const appCode = fs.readFileSync(appPath, 'utf8');
    eval(appCode);
    env.docListeners['DOMContentLoaded'].forEach(fn => fn());

    const canvas = env.elementsMap.particleCanvas;

    // Click canvas with physics ON
    canvas.listeners['click'].forEach(fn => fn({ clientX: 100, clientY: 150 }));
    assert.strictEqual(impulseCallCount, 1, 'Should trigger 1 impulse wave');

    // Turn physics OFF
    env.elementsMap.physicsToggle.dispatchEvent({ type: 'click' });

    // Click canvas with physics OFF
    canvas.listeners['click'].forEach(fn => fn({ clientX: 200, clientY: 250 }));
    assert.strictEqual(impulseCallCount, 1, 'Should NOT trigger additional impulse wave when physics is OFF');
  } finally {
    ParticleEngine.prototype.triggerImpulse = originalTrigger;
  }
});

runEmpiricalTest('4.3 Edge Case: Slider input handles NaN/out-of-bounds without crashing or corrupting DOM', () => {
  const env = createMockDOMEnvironment();
  global.document = env.documentMock;
  global.ParticleEngine = ParticleEngine;

  const appCode = fs.readFileSync(appPath, 'utf8');
  eval(appCode);
  env.docListeners['DOMContentLoaded'].forEach(fn => fn());

  const densitySlider = env.elementsMap.densitySlider;
  const speedSlider = env.elementsMap.speedSlider;

  // Dispatch invalid non-numeric input
  densitySlider.dispatchEvent({ type: 'input', target: { value: 'invalid_string' } });
  speedSlider.dispatchEvent({ type: 'input', target: { value: 'nan_string' } });

  // DOM readouts should not become NaN
  assert.notStrictEqual(env.elementsMap.densityValue.textContent, 'NaN');
  assert.notStrictEqual(env.elementsMap.speedValue.textContent, 'NaNx');
});

console.log('\n====================================================');
console.log(` Empirical Stress Test Results: ${passed} / ${total} Passed (${((passed / total) * 100).toFixed(1)}%)`);
console.log('====================================================\n');

if (passed !== total) {
  process.exit(1);
}
