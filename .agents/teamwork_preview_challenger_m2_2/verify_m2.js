/**
 * Custom Empirical Stress Test Suite for M2 Preview Challenge
 * Executed by teamwork_preview_challenger_m2_2
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const basePath = path.join(__dirname, '../../canvas_particle_bg');
const htmlPath = path.join(basePath, 'index.html');
const appJsPath = path.join(basePath, 'app.js');
const engineJsPath = path.join(basePath, 'particle-engine.js');

console.log('==================================================');
console.log(' EMPIRICAL CHALLENGE VERIFICATION SUITE (M2)');
console.log('==================================================\n');

let passed = 0;
let total = 0;

function check(title, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  [PASS] ${title}`);
  } catch (err) {
    console.error(`  [FAIL] ${title}: ${err.message}`);
  }
}

// 1. Verify File Existence
check('1. All required M2 files exist', () => {
  assert(fs.existsSync(htmlPath), 'index.html missing');
  assert(fs.existsSync(appJsPath), 'app.js missing');
  assert(fs.existsSync(engineJsPath), 'particle-engine.js missing');
});

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');
const engineJsContent = fs.readFileSync(engineJsPath, 'utf8');

// 2. Glassmorphism CSS Fallback Verification
check('2. Glassmorphic fallback @supports not (backdrop-filter: blur(12px))', () => {
  assert(htmlContent.includes('@supports not (backdrop-filter: blur(12px))'), '@supports not rule missing');
  assert(htmlContent.includes('background: rgba(45, 5, 5, 0.95)'), 'Solid background fallback rgba(45, 5, 5, 0.95) missing');
  assert(htmlContent.includes('-webkit-backdrop-filter: blur(12px)'), '-webkit prefix missing for Safari support');
});

// 3. Tailwind CDN Integration
check('3. Tailwind CSS CDN integration', () => {
  assert(htmlContent.includes('src="https://cdn.tailwindcss.com"'), 'Tailwind CDN script tag missing');
  assert(htmlContent.includes('sm:p-6'), 'Tailwind responsive padding missing');
  assert(htmlContent.includes('max-w-4xl'), 'Tailwind max-width container missing');
  assert(htmlContent.includes('flex'), 'Tailwind flexbox utilities missing');
});

// 4. Google Fonts Imports (Cinzel & Plus Jakarta Sans)
check('4. Font imports for Cinzel & Plus Jakarta Sans', () => {
  assert(htmlContent.includes('family=Cinzel:wght@500;700;900'), 'Cinzel font import missing or invalid weights');
  assert(htmlContent.includes('family=Plus+Jakarta+Sans:wght@400;500;600;700'), 'Plus Jakarta Sans font import missing or invalid weights');
  assert(htmlContent.includes("font-family: 'Plus Jakarta Sans', sans-serif;"), 'Body font-family declaration missing');
  assert(htmlContent.includes("font-family: 'Cinzel', serif;"), 'Serif font-family declaration missing');
});

// 5. Font Awesome 6.5 Icons
check('5. Font Awesome 6.5 CSS load & Icon classes', () => {
  assert(htmlContent.includes('cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'), 'Font Awesome CDN link missing');
  const icons = ['fa-bolt', 'fa-sliders', 'fa-cubes', 'fa-gauge-high', 'fa-hand-pointer', 'fa-pause', 'fa-palette', 'fa-whatsapp'];
  for (const icon of icons) {
    assert(htmlContent.includes(icon), `Icon ${icon} missing in index.html`);
  }
});

// 6. Script Load Order
check('6. Script load order: Lodash -> particle-engine.js -> app.js', () => {
  const lodashIdx = htmlContent.indexOf('lodash.min.js');
  const engineIdx = htmlContent.indexOf('particle-engine.js');
  const appIdx = htmlContent.indexOf('app.js');

  assert(lodashIdx !== -1, 'Lodash script missing');
  assert(engineIdx !== -1, 'particle-engine script missing');
  assert(appIdx !== -1, 'app.js script missing');

  assert(lodashIdx < engineIdx, 'Lodash must load BEFORE particle-engine.js');
  assert(engineIdx < appIdx, 'particle-engine.js must load BEFORE app.js');
});

// 7. Client Security & Zero API Key Exposure
check('7. Zero Gemini API Key Exposure in app.js and index.html', () => {
  const apiKeyRegex = /AIzaSy[A-Za-z0-9_-]{33}/;
  assert(!apiKeyRegex.test(appJsContent), 'Gemini API key pattern found in app.js');
  assert(!apiKeyRegex.test(htmlContent), 'Gemini API key pattern found in index.html');
  assert(!apiKeyRegex.test(engineJsContent), 'Gemini API key pattern found in particle-engine.js');
  assert(!appJsContent.toLowerCase().includes('api_key'), 'app.js contains api_key string');
});

// 8. Human Escape Hatch WhatsApp URL & Attributes
check('8. WhatsApp escape hatch URL and security attributes', () => {
  assert(htmlContent.includes('href="https://wa.me/996655273"'), 'Exact WhatsApp URL wa.me/996655273 required');
  assert(htmlContent.includes('target="_blank"'), 'WhatsApp link target="_blank" required');
  assert(htmlContent.includes('rel="noopener noreferrer"'), 'WhatsApp link rel="noopener noreferrer" required');
});

// 9. All 4 Color Palettes Configured in DOM
check('9. Color palette switcher data-palette attributes', () => {
  const palettes = ['maroon_gold', 'cyber_crimson', 'emerald_night', 'sapphire_dark'];
  for (const p of palettes) {
    assert(htmlContent.includes(`data-palette="${p}"`), `data-palette="${p}" missing in index.html`);
  }
});

// 10. Interactive Control Elements Present & Wired in app.js
check('10. DOM ID elements contract alignment with app.js', () => {
  const domIdsHtml = [
    'particleCanvas',
    'densitySlider',
    'densityValue',
    'speedSlider',
    'speedValue',
    'physicsToggle',
    'physicsToggleText',
    'physicsToggleIcon',
    'playPauseToggle',
    'playPauseText',
    'playPauseIcon',
    'whatsappLink'
  ];
  for (const id of domIdsHtml) {
    assert(htmlContent.includes(`id="${id}"`), `DOM element id="${id}" missing in index.html`);
  }

  const jsHandledIds = [
    'particleCanvas',
    'densitySlider',
    'densityValue',
    'speedSlider',
    'speedValue',
    'physicsToggle',
    'physicsToggleText',
    'physicsToggleIcon',
    'playPauseToggle',
    'playPauseText',
    'playPauseIcon'
  ];
  for (const id of jsHandledIds) {
    assert(appJsContent.includes(id), `DOM ID ${id} not queried in app.js`);
  }
});

console.log(`\nResults: ${passed} / ${total} Checks Passed (${((passed / total) * 100).toFixed(1)}%)\n`);

if (passed !== total) {
  process.exit(1);
} else {
  console.log('SUCCESS: All M2 empirical challenge checks passed!');
}
