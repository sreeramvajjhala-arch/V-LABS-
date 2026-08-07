/**
 * V LABS — Automated TDD Test Suite (tests/suite.js)
 * Run with Node.js to verify contracts, HTML structure, app.js logic, and backend specifications.
 */

const fs = require('fs');
const path = require('path');

// Test Runner Counter
let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        failed++;
    }
}

console.log('==================================================');
console.log('  V LABS — AUTOMATED TDD SUITE VERIFICATION');
console.log('==================================================\n');

// --------------------------------------------------
// 1. HTML DOM Contract & Semantic Structure Tests
// --------------------------------------------------
console.log('[Suite 1: index.html DOM Contract & Structure]');
const htmlPath = path.join(__dirname, '../index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

assert(htmlContent.includes('V LABS'), 'Contains brand title V LABS');
assert(htmlContent.includes('assets/vlabs-logo.jpg'), 'Contains official emblem logo image assets/vlabs-logo.jpg');
assert(htmlContent.includes('https://wa.me/996655273'), 'WhatsApp escape hatch points to wa.me/996655273');
assert(htmlContent.includes('fa-robot'), 'Floating AI button uses clean robot icon');
assert(htmlContent.includes('Plus Jakarta Sans'), 'Includes Plus Jakarta Sans Google Font');
assert(htmlContent.includes('Cinzel'), 'Includes Cinzel Google Font');
assert(htmlContent.includes('#4A0000') || htmlContent.includes('crimson'), 'Uses deep crimson color palette');
assert(htmlContent.includes('viewport-fit=cover'), 'Includes viewport-fit=cover for notched device safe areas');
assert(htmlContent.includes('id="mobile-menu-btn"'), 'Includes mobile menu hamburger button');
assert(htmlContent.includes('id="mobile-menu"'), 'Includes mobile menu drawer container');
assert(htmlContent.includes('text-base md:text-sm'), 'Uses text-base on mobile input to prevent iOS Safari auto-zoom');
assert(htmlContent.includes('@supports not (backdrop-filter: blur(12px))'), 'Includes solid glass fallback CSS rule');
console.log('');

// --------------------------------------------------
// 2. Client Application Logic Tests (app.js)
// --------------------------------------------------
console.log('[Suite 2: app.js Logic & Security Specifications]');
const appJsPath = path.join(__dirname, '../app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

assert(!appJsContent.includes('GEMINI_API_KEY') && !appJsContent.includes('AIzaSy'), 'CRITICAL SECURITY: No Gemini API Key in app.js');
assert(!appJsContent.includes('YOUR_GEMINI_KEY'), 'No placeholder Gemini key in client JavaScript');
assert(appJsContent.includes("redirect: 'follow'"), 'Uses redirect: follow for Apps Script fetch requests');
assert(appJsContent.includes('useCasesData'), 'Contains 4-industry use-cases tab data');
assert(appJsContent.includes('initHeroTerminalTypewriter'), 'Contains typewriter simulation engine');
assert(appJsContent.includes('toggleMobileMenu'), 'Contains toggleMobileMenu function for responsive mobile navigation');
assert(appJsContent.includes('escapeHtml'), 'Contains HTML escaping helper to prevent XSS');
assert(appJsContent.includes('https://v-labs-phone-repair-shop-demo.hello-vlabs-tech.workers.dev/'), 'Retail & Phone Shops industry Demo button links to Cloudflare Workers live demo');
assert(appJsContent.includes('https://wa.me/9966555273'), 'Deploy For Your Business button links to WhatsApp wa.me/9966555273');
console.log('');

// --------------------------------------------------
// 3. Pure Logic Unit Function Execution Tests
// --------------------------------------------------
console.log('[Suite 3: app.js Functional Execution Unit Tests]');

// Evaluate pure functions from app.js in a mini isolated scope
const extractedHelpers = {};
try {
    const fnMatchEscape = appJsContent.match(/function escapeHtml[\s\S]*?\n}/);
    const fnMatchFallback = appJsContent.match(/function getFallbackAiResponse[\s\S]*?\n}/);
    
    if (fnMatchEscape) eval(`extractedHelpers.escapeHtml = ${fnMatchEscape[0].replace('function escapeHtml', 'function')}`);
    if (fnMatchFallback) eval(`extractedHelpers.getFallbackAiResponse = ${fnMatchFallback[0].replace('function getFallbackAiResponse', 'function')}`);
} catch (e) {
    console.error('Failed to parse app.js helper functions:', e);
}

if (extractedHelpers.escapeHtml) {
    const rawXss = '<script>alert("xss")</script>';
    const escaped = extractedHelpers.escapeHtml(rawXss);
    assert(escaped === '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;', 'escapeHtml correctly sanitizes HTML tags and quotes');

    const nullEscaped = extractedHelpers.escapeHtml(null);
    assert(nullEscaped === '', 'escapeHtml gracefully handles null input without throwing');

    const numEscaped = extractedHelpers.escapeHtml(42);
    assert(numEscaped === '42', 'escapeHtml gracefully handles numeric input without throwing');
} else {
    assert(false, 'escapeHtml function could be loaded for execution');
}

if (extractedHelpers.getFallbackAiResponse) {
    const priceRes = extractedHelpers.getFallbackAiResponse('What is your price?');
    assert(priceRes.includes('flat one-time fee'), 'getFallbackAiResponse handles pricing intent');

    const demoRes = extractedHelpers.getFallbackAiResponse('I need a prototype demo');
    assert(demoRes.includes('in 24 hours'), 'getFallbackAiResponse handles prototype/demo intent');

    const phoneRes = extractedHelpers.getFallbackAiResponse('My number is 9966552730');
    assert(phoneRes.includes('contact you on WhatsApp'), 'getFallbackAiResponse detects 10-digit mobile number');

    const defaultRes = extractedHelpers.getFallbackAiResponse('Hello there');
    assert(defaultRes.includes("I'm V Labs AI"), 'getFallbackAiResponse returns default welcoming prompt');
} else {
    assert(false, 'getFallbackAiResponse function could be loaded for execution');
}
console.log('');

// --------------------------------------------------
// 4. Google Apps Script Backend Specifications (backend.gs)
// --------------------------------------------------
console.log('[Suite 4: backend.gs Security, CORS & FAQ Fast-Path Specifications]');
const backendGsPath = path.join(__dirname, '../backend.gs');
const backendGsContent = fs.readFileSync(backendGsPath, 'utf8');

assert(backendGsContent.includes('function doOptions(e)'), 'Contains doOptions(e) for CORS preflight handling');
assert(backendGsContent.includes('Access-Control-Allow-Origin'), 'Sets Access-Control-Allow-Origin CORS header');
assert(backendGsContent.includes('UrlFetchApp.fetch'), 'Proxies Gemini API using UrlFetchApp.fetch() on server side');
assert(backendGsContent.includes('GEMINI_API_KEY'), 'Securely stores GEMINI_API_KEY in server script');
assert(backendGsContent.includes('logLeadToSheet'), 'Contains logLeadToSheet function for Google Sheets CRM');
assert(backendGsContent.includes('<25 words'), 'System prompt restricts responses to <25 words');
assert(backendGsContent.includes('FAQ_FAST_PATH'), 'Contains FAQ_FAST_PATH instant response cache table');
assert(backendGsContent.includes('checkFastPathFaq'), 'Contains checkFastPathFaq function for sub-100ms FAQ evaluation');
assert(backendGsContent.includes('substring(0, 1000)'), 'Truncates user message input at 1,000 characters to prevent payload bloat');

// Evaluate checkFastPathFaq function in isolated scope
const backendHelpers = {};
try {
    const fnMatchFastPath = backendGsContent.match(/var FAQ_FAST_PATH = [\s\S]*?\];/);
    const fnMatchCheckFastPath = backendGsContent.match(/function checkFastPathFaq[\s\S]*?\n}/);
    if (fnMatchFastPath && fnMatchCheckFastPath) {
        eval(`${fnMatchFastPath[0]}; backendHelpers.checkFastPathFaq = ${fnMatchCheckFastPath[0].replace('function checkFastPathFaq', 'function')}`);
    }
} catch (e) {
    console.error('Failed to parse backend.gs helper functions:', e);
}

if (backendHelpers.checkFastPathFaq) {
    const priceRes = backendHelpers.checkFastPathFaq('What are your prices?');
    assert(priceRes && priceRes.includes('flat one-time fees'), 'checkFastPathFaq correctly matches price inquiries instantly');

    const demoRes = backendHelpers.checkFastPathFaq('Can I get a 24h prototype demo?');
    assert(demoRes && demoRes.includes('working prototypes'), 'checkFastPathFaq correctly matches demo inquiries instantly');

    const nullRes = backendHelpers.checkFastPathFaq('Random unknown string 1234');
    assert(nullRes === null, 'checkFastPathFaq returns null for non-FAQ queries so Gemini API handles them');
} else {
    assert(false, 'checkFastPathFaq function could be loaded for execution');
}
console.log('');

// --------------------------------------------------
// 5. Reactive State & Modern UI Integration Specifications
// --------------------------------------------------
console.log('[Suite 5: Reactive State Engine & Modern UI Specifications]');

assert(appJsContent.includes('VLabsState'), 'Contains VLabsState centralized application state store');
assert(appJsContent.includes('STORAGE_KEY'), 'Contains STORAGE_KEY for LocalStorage persistence');
assert(appJsContent.includes('clearChatHistory'), 'Contains clearChatHistory function to reset conversation');
assert(appJsContent.includes('requestAnimationFrame'), 'Uses requestAnimationFrame for GPU-friendly typewriter animation');

assert(htmlContent.includes('clearChatHistory()'), 'Includes Reset button in chat modal header pointing to clearChatHistory()');
assert(htmlContent.includes('Pricing & Plans'), 'Includes Pricing & Plans quick prompt chip');
assert(htmlContent.includes('24h Prototype Demo'), 'Includes 24h Prototype Demo quick prompt chip');
assert(htmlContent.includes('Healthcare Setup'), 'Includes Healthcare Setup quick prompt chip');
console.log('');

// --------------------------------------------------
// Final Summary Report
// --------------------------------------------------
console.log('==================================================');
console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('==================================================');

if (failed > 0) {
    process.exit(1);
}


