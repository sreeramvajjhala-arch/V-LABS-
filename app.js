/**
 * V LABS — Application JavaScript Engine
 * UI Updates: Centralized VLabsState engine, LocalStorage persistence,
 * Quick-Prompt chips handler, clear chat history, and RAF Typewriter.
 */

// ==========================================
// CONFIGURATION & CENTRALIZED STATE ENGINE
// ==========================================
const APPS_SCRIPT_WEBHOOK_URL = 'YOUR_APPS_SCRIPT_WEBHOOK_URL';
const STORAGE_KEY = 'vlabs_chat_history';

// Centralized Reactive Application State
const VLabsState = {
    activeTab: 'healthcare',
    chatHistory: loadPersistedHistory(),
    isChatOpen: false,
    isSubmitting: false,
    leadCaptured: false,

    setTab(tabKey) {
        this.activeTab = tabKey;
        switchTab(tabKey);
    },
    addMessage(role, content) {
        this.chatHistory.push({ role, content });
        persistHistory(this.chatHistory);
    },
    clearHistory() {
        this.chatHistory = [];
        persistHistory([]);
    }
};

// Global conversation history pointer for backward compatibility with tests and proxy
let conversationHistory = VLabsState.chatHistory;

function loadPersistedHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

function persistHistory(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

// ==========================================
// 1. HERO TERMINAL TYPEWRITER ANIMATION (RAF Optimized)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initHeroTerminalTypewriter();
    switchTab(VLabsState.activeTab); // Initialize active tab state
    renderPersistedChatFeed();

    // Initialize ambient HTML5 Canvas Particle Engine background if present
    const particleCanvas = document.getElementById('particleCanvas');
    if (particleCanvas && typeof ParticleEngine !== 'undefined') {
        const bgEngine = new ParticleEngine(particleCanvas, {
            density: 75,
            speedMultiplier: 0.9,
            palette: 'maroon_gold',
            mousePhysicsEnabled: true
        });
        bgEngine.start();
    }

    // Keyboard accessibility: Close chat modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && VLabsState.isChatOpen) {
            toggleChatModal();
        }
    });

    // Backdrop dismissal: Close chat modal on outer backdrop click
    const modal = document.getElementById('chat-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal && VLabsState.isChatOpen) {
                toggleChatModal();
            }
        });
    }
});

function initHeroTerminalTypewriter() {
    const botMsgContainer = document.getElementById('hero-bot-msg');
    if (!botMsgContainer) return;

    const fullResponse = "Yes! We are open from 9 AM to 8 PM. Would you like to book a slot?";
    botMsgContainer.innerHTML = '<span id="typewriter-text"></span><span class="inline-block w-1.5 h-4 bg-white ml-1 animate-caret"></span>';
    
    const textSpan = document.getElementById('typewriter-text');
    let index = 0;
    let lastTime = 0;
    const interval = 40;

    function typeStep(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const progress = timestamp - lastTime;

        if (progress >= interval) {
            if (index < fullResponse.length) {
                textSpan.textContent += fullResponse.charAt(index);
                index++;
                lastTime = timestamp;
            } else {
                return; // Finished
            }
        }
        requestAnimationFrame(typeStep);
    }

    setTimeout(() => {
        requestAnimationFrame(typeStep);
    }, 600);
}

// ==========================================
// 2. INDUSTRY USE-CASES TAB SWITCHER
// ==========================================
const useCasesData = {
    healthcare: {
        title: "Healthcare & Specialized Clinics",
        badge: "24/7 Patient Triage & Appointment Booking",
        icon: "fa-user-doctor",
        flow: [
            { step: "1. Patient Inquiry", desc: "Patient texts on WhatsApp: 'Do you have dental consultation available tomorrow evening?'" },
            { step: "2. Gemini AI Reply (3s)", desc: "AI checks doctor schedules, replies: 'Yes! Dr. Sharma is available at 6:30 PM. Shall I confirm your slot?'" },
            { step: "3. Auto CRM Logging", desc: "Patient name, mobile #, and appointment timestamp logged straight to clinic Google Sheet." }
        ],
        impact: "Zero missed appointments outside OPD hours & 4x faster patient onboarding."
    },
    gyms: {
        title: "High-Ticket Fitness Gyms & Studios",
        badge: "Instant Lead Capture & Day-Pass Booking",
        icon: "fa-dumbbell",
        flow: [
            { step: "1. Visitor Inquiry", desc: "Prospect scans QR code or clicks Instagram ad: 'What are your monthly membership rates?'" },
            { step: "2. Gemini AI Reply (3s)", desc: "AI replies: 'Our VIP All-Access pass starts at ₹2,999/mo. Would you like a FREE 1-Day Trial Pass today?'" },
            { step: "3. Lead Conversion", desc: "Prospect provides phone #; trial pass generated and lead details pushed to Sales Team sheet." }
        ],
        impact: "300% boost in trial pass redemptions without hiring extra front-desk staff."
    },
    retail: {
        title: "Retail & Electronics Phone Shops",
        badge: "Stock Inquiries & Trade-in Price Quotes",
        icon: "fa-mobile-screen-button",
        demoUrl: "https://v-labs-phone-repair-shop-demo.hello-vlabs-tech.workers.dev/",
        flow: [
            { step: "1. Customer Inquiry", desc: "Customer texts: 'Do you have iPhone 15 Pro Max 256GB Natural Titanium in stock?'" },
            { step: "2. Gemini AI Reply (3s)", desc: "AI replies: 'Yes, 2 units left at ₹1,29,900! Want me to reserve one for pick-up at our Jagadamba branch?'" },
            { step: "3. Direct Reservation", desc: "Reserve token sent to customer WhatsApp and manager notified instantly." }
        ],
        impact: "Prevents shoppers from buying from competitors while waiting for shop replies."
    },
    caterers: {
        title: "Event Caterers & Function Halls",
        badge: "Instant Menu Selection & Price Estimation",
        icon: "fa-utensils",
        flow: [
            { step: "1. Host Inquiry", desc: "Client texts: 'Need catering for 250 guests wedding reception next month in MVP Colony.'" },
            { step: "2. Gemini AI Reply (3s)", desc: "AI sends PDF menu link, calculates approximate estimate, and offers tasting session booking." },
            { step: "3. Sheet Lead Sync", desc: "Event date, guest count, and contact logged to owner's master booking sheet." }
        ],
        impact: "Qualifies high-budget leads automatically 24 hours a day."
    }
};

function switchTab(tabKey) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'border-white', 'bg-white', 'text-crimson-950', 'font-bold');
        btn.classList.add('border-mutedGray-300/30', 'bg-crimson-900/60', 'text-mutedGray-200', 'font-medium');
        btn.setAttribute('aria-selected', 'false');
    });

    const activeBtn = document.getElementById(`tab-${tabKey}`);
    if (activeBtn) {
        activeBtn.classList.remove('border-mutedGray-300/30', 'bg-crimson-900/60', 'text-mutedGray-200', 'font-medium');
        activeBtn.classList.add('active', 'border-white', 'bg-white', 'text-crimson-950', 'font-bold');
        activeBtn.setAttribute('aria-selected', 'true');
    }

    const container = document.getElementById('use-case-content');
    const data = useCasesData[tabKey];
    if (!container || !data) return;

    const demoBtnHtml = data.demoUrl ? `
        <a href="${data.demoUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-crimson-950 font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-lg no-underline">
            <i class="fa-solid fa-play"></i>
            <span>Demo</span>
        </a>
    ` : '';

    const deployBtnHtml = `
        <a href="https://wa.me/9966555273" target="_blank" rel="noopener noreferrer" class="flex-1 bg-white hover:bg-mutedGray-200 text-crimson-950 font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-lg no-underline">
            <i class="fa-brands fa-whatsapp text-emerald-600 text-base"></i>
            <span>Deploy For Your Business</span>
            <i class="fa-solid fa-arrow-right"></i>
        </a>
    `;

    const actionBtnHtml = `
        <div class="flex flex-col sm:flex-row gap-3 w-full">
            ${demoBtnHtml}
            ${deployBtnHtml}
        </div>
    `;

    container.innerHTML = `
        <div class="flex flex-col lg:flex-row items-start justify-between gap-8 animate-fadeIn">
            <div class="lg:w-1/2 space-y-4">
                <div class="inline-flex items-center space-x-2 bg-white/10 border border-white/30 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    <i class="fa-solid ${data.icon}"></i>
                    <span>${data.badge}</span>
                </div>
                <h3 class="font-heading text-2xl sm:text-3xl font-bold text-white">${data.title}</h3>
                
                <div class="space-y-3 pt-2">
                    ${data.flow.map(item => `
                        <div class="bg-crimson-950/60 border border-mutedGray-300/20 p-4 rounded-xl">
                            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-1">${item.step}</h4>
                            <p class="text-sm text-mutedGray-200">${item.desc}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="lg:w-1/2 w-full glass-card bg-crimson-950/90 rounded-2xl p-6 border-white/40 relative">
                <div class="flex items-center justify-between border-b border-mutedGray-300/20 pb-3 mb-4">
                    <span class="text-xs font-mono text-white flex items-center space-x-2">
                        <i class="fa-solid fa-chart-line text-emerald-400"></i>
                        <span>Expected Business ROI</span>
                    </span>
                    <span class="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">24h Turnkey Ready</span>
                </div>

                <div class="bg-crimson-900/60 p-5 rounded-xl border border-mutedGray-300/20 space-y-3 mb-4">
                    <p class="text-xs text-mutedGray-300 font-semibold uppercase tracking-wider">Business Impact:</p>
                    <p class="text-lg font-bold text-white leading-snug">${data.impact}</p>
                </div>

                ${actionBtnHtml}
            </div>
        </div>
    `;
}

// ==========================================
// 3. MOBILE MENU & CHAT MODAL LOGIC
// ==========================================
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('mobile-menu-icon');
    if (!menu) return;

    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        if (icon) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        }
        setTimeout(() => {
            menu.classList.remove('opacity-0', '-translate-y-2');
        }, 10);
    } else {
        menu.classList.add('opacity-0', '-translate-y-2');
        if (icon) {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
        setTimeout(() => {
            menu.classList.add('hidden');
        }, 300);
    }
}

function toggleChatModal() {
    const modal = document.getElementById('chat-modal');
    const modalCard = document.getElementById('chat-modal-card');
    if (!modal) return;

    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        VLabsState.isChatOpen = true;
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            if (modalCard) modalCard.classList.remove('translate-y-full');
        }, 10);
    } else {
        modal.classList.add('opacity-0');
        if (modalCard) modalCard.classList.add('translate-y-full');
        VLabsState.isChatOpen = false;
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

function openChatModal(prefillMessage = '') {
    const modal = document.getElementById('chat-modal');
    if (modal && modal.classList.contains('hidden')) {
        toggleChatModal();
    }
    if (prefillMessage) {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = prefillMessage;
            chatInput.focus();
        }
    }
}

function sendQuickPrompt(promptText) {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = promptText;
        handleChatSubmit(new Event('submit'));
    }
}

function clearChatHistory() {
    VLabsState.clearHistory();
    conversationHistory = VLabsState.chatHistory;
    const feed = document.getElementById('chat-feed');
    if (feed) {
        feed.innerHTML = `
            <div class="text-center py-4 text-xs text-mutedGray-300/70 border-b border-white/10 mb-2">
                <i class="fa-solid fa-sparkles text-amber-400 mr-1"></i>
                <span>Conversation reset. Ask V Labs AI anything!</span>
            </div>
        `;
    }
}

function renderPersistedChatFeed() {
    const feed = document.getElementById('chat-feed');
    if (!feed || VLabsState.chatHistory.length === 0) return;

    VLabsState.chatHistory.forEach(item => {
        const sender = item.role === 'user' ? 'user' : 'bot';
        appendChatMessage(sender, item.content, false);
    });
}

// ==========================================
// 4. SECURE BACKEND GATEWAY CHAT SUBMISSION
// ==========================================
async function handleChatSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const inputEl = document.getElementById('chat-input');
    if (!inputEl) return;

    const userMessage = inputEl.value.trim();
    if (!userMessage || VLabsState.isSubmitting) return;

    VLabsState.isSubmitting = true;

    // Display user message in chat UI
    appendChatMessage('user', userMessage);
    inputEl.value = '';

    // Append to local state and storage
    VLabsState.addMessage('user', userMessage);
    conversationHistory = VLabsState.chatHistory;

    // Show loading spinner
    const loadingId = appendLoadingIndicator();

    try {
        let aiReplyText = '';

        if (APPS_SCRIPT_WEBHOOK_URL === 'YOUR_APPS_SCRIPT_WEBHOOK_URL' || !APPS_SCRIPT_WEBHOOK_URL) {
            // Local fallback simulation when Webhook URL is unconfigured
            await new Promise(r => setTimeout(r, 650));
            aiReplyText = getFallbackAiResponse(userMessage);
        } else {
            // SECURE FETCH TO GOOGLE APPS SCRIPT WEBHOOK PROXY
            const payload = {
                action: 'chat',
                message: userMessage,
                history: VLabsState.chatHistory
            };

            const response = await fetch(APPS_SCRIPT_WEBHOOK_URL, {
                method: 'POST',
                redirect: 'follow', // Crucial for Google Apps Script redirects
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const resData = await response.json();
            aiReplyText = resData.reply || getFallbackAiResponse(userMessage);
        }

        // Save AI reply to history state
        VLabsState.addMessage('model', aiReplyText);

        removeChatMessage(loadingId);
        appendChatMessage('bot', aiReplyText);

    } catch (error) {
        console.warn('Backend proxy fetch failed, relying on client safety fallback:', error);
        removeChatMessage(loadingId);
        const fallbackText = getFallbackAiResponse(userMessage);
        VLabsState.addMessage('model', fallbackText);
        appendChatMessage('bot', fallbackText);
    } finally {
        VLabsState.isSubmitting = false;
    }
}

// Client Fallback Intelligence Generator
function getFallbackAiResponse(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes('price') || lower.includes('cost') || lower.includes('fee')) {
        return "Our turnkey setup is a flat one-time fee with 0 monthly retainers! What is your business name and WhatsApp number to send full details?";
    }
    if (lower.includes('demo') || lower.includes('prototype') || lower.includes('24h') || lower.includes('schedule')) {
        return "Awesome! We deliver full prototype websites with AI receptionists in 24 hours. What's your WhatsApp number & business name?";
    }
    if (/\d{10}/.test(msg) || lower.includes('phone') || lower.includes('number')) {
        return "Thank you! Got your details. Our Vizag team will contact you on WhatsApp within 2 hours with your prototype preview.";
    }
    return "Hello! I'm V Labs AI. We build 24h custom websites & WhatsApp bots. Could you share your business name and WhatsApp number?";
}

// UI Helpers for Chat Messages with Official Emblem & Markdown Formatting
function getTimeString() {
    try {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
}

function formatMessageText(str) {
    if (typeof str !== 'string') return '';
    let safe = escapeHtml(str);
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    safe = safe.replace(/`([^`]+)`/g, '<code class="bg-crimson-950/80 px-1.5 py-0.5 rounded text-[11px] font-mono text-amber-300 border border-white/10">$1</code>');
    safe = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-amber-300 underline hover:text-white transition-colors">$1</a>');
    safe = safe.replace(/\n/g, '<br>');
    return safe;
}

function appendChatMessage(sender, text, shouldScroll = true) {
    const feed = document.getElementById('chat-feed');
    if (!feed) return;

    const msgDiv = document.createElement('div');
    const timeStr = getTimeString();

    if (sender === 'user') {
        msgDiv.className = 'flex items-start space-x-2.5 justify-end animate-msg';
        msgDiv.innerHTML = `
            <div class="bg-gradient-to-r from-crimson-700 to-crimson-800 border border-white/25 rounded-2xl rounded-tr-xs p-3.5 sm:p-4 text-white max-w-[85%] shadow-md">
                <div class="flex items-center justify-between border-b border-white/10 pb-1 mb-1.5 text-[10px] text-mutedGray-200">
                    <span class="font-semibold text-white">You</span>
                    <span>${timeStr}</span>
                </div>
                <div class="leading-relaxed text-xs sm:text-sm">${formatMessageText(text)}</div>
            </div>
        `;
    } else {
        msgDiv.className = 'flex items-start space-x-3 animate-msg';
        msgDiv.innerHTML = `
            <img src="assets/vlabs-logo.jpg" alt="V Labs Bot" class="w-8 h-8 rounded-xl border border-white/30 object-cover shrink-0 shadow-md">
            <div class="bg-crimson-800/90 border border-white/20 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 text-white max-w-[85%] shadow-lg">
                <div class="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                    <span class="text-xs font-bold text-amber-300 flex items-center space-x-1">
                        <i class="fa-solid fa-sparkles text-[10px]"></i>
                        <span>V Labs AI Assistant</span>
                    </span>
                    <span class="text-[10px] text-mutedGray-300">${timeStr}</span>
                </div>
                <div class="leading-relaxed text-xs sm:text-sm text-mutedGray-100">${formatMessageText(text)}</div>
            </div>
        `;
    }

    feed.appendChild(msgDiv);
    if (shouldScroll) {
        feed.scrollTop = feed.scrollHeight;
    }
}

function appendLoadingIndicator() {
    const feed = document.getElementById('chat-feed');
    if (!feed) return null;

    const id = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = id;
    loadingDiv.className = 'flex items-start space-x-3 animate-msg';
    loadingDiv.innerHTML = `
        <img src="assets/vlabs-logo.jpg" alt="V Labs Bot" class="w-8 h-8 rounded-xl border border-white/30 object-cover shrink-0 shadow-md">
        <div class="bg-crimson-800/90 border border-white/20 rounded-2xl rounded-tl-xs px-4 py-3 text-white flex items-center space-x-2 shadow-lg">
            <span class="text-xs text-mutedGray-200 font-medium">V Labs AI is typing</span>
            <div class="flex items-center space-x-1 pl-1">
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></span>
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
        </div>
    `;
    feed.appendChild(loadingDiv);
    feed.scrollTop = feed.scrollHeight;
    return id;
}

function removeChatMessage(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
}

function escapeHtml(str) {
    if (typeof str !== 'string') return String(str ?? '');
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

