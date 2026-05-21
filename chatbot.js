/* ════════════════════════════════════════════
   BindCraft – chatbot.js
   AI-powered assistant using Claude API
   Features: FAQ answers, site navigation,
   order help, pricing info, smart suggestions
   ════════════════════════════════════════════ */

'use strict';

(function initBindCraftBot() {

  /* ── KNOWLEDGE BASE ── */
  const BC_SYSTEM_PROMPT = `You are Paige, a warm, witty, and knowledgeable customer assistant for BindCraft Studio — a premium custom book printing and binding studio. You're passionate about books and storytelling.

PRODUCTS:
- Photo Books: lay-flat panoramic pages, vivid archival prints
- Wedding Albums: heirloom quality, leather/linen binding, gold-foil options
- Journals: dot-grid, lined, blank — with ribbon bookmarks and premium paper
- Corporate Books: brand books, annual reports, client presentations

PRICING:
- Softcover: Starter ₹999, Story ₹1599, Heirloom ₹1299 per book
- Hardcover: Starter ₹1200, Story ₹1499, Heirloom ₹1599 per book
- All prices include free digital proof review
- Free gift wrapping on Story & Heirloom tiers
- Bulk discounts available for 10+ books — ask for a custom quote

CUSTOMISATION OPTIONS:
- Cover: hardcover, softcover, linen, leather, vegan leather
- Sizes: A4 (21×30cm), Square (30×30cm), A5 (15×21cm), Panoramic (30×15cm)
- Pages: 20 to 200 pages
- Paper colors: white, cream, light grey, blush
- 50+ premium paper stocks from 80gsm to 350gsm

QUALITY:
- 2400 DPI archival printing with ICC-profiled presses
- Pigment-based inks that resist fading 200+ years
- Hand-sewn binding by trained artisans
- Soft-proofing ensures screen colors match final print

CONTACT & LOCATION:
- Email: hello@bindcraft.studio
- Phone: +1 (555) 012-3456
- Studio: Studio 12, The Bindery, Old Town, NY 10001
- Hours: Mon–Sat 9am–6pm

STUDIO VISITS:
- 60-minute hands-on consultation sessions
- Feel papers, bindings, and print samples in person
- Our designers guide you through every option

SHIPPING & TURNAROUND:
- Worldwide shipping available
- Standard: 7–10 business days
- Express options available at checkout
- Free shipping on orders over ₹3000

CURRENT PROMOTIONS:
- 10% off first order with code FIRSTBOOK
- Free spine text engraving on all hardcover books this month
- Complimentary gift box with every wedding album

WEBSITE NAVIGATION — tell users where to find things:
- Designs/Gallery → #designs section
- Place an order → #order section
- View pricing → #pricing section
- Book a consultation → #reservation section
- Contact/support → #contact section
- About us → #about section
- Customer reviews → #reviews section

PERSONALITY GUIDELINES:
- Warm, enthusiastic about books and storytelling
- Use literary references occasionally ("as Hemingway said, the first draft is just telling yourself the story")
- Ask follow-up questions to understand their needs better
- Offer specific recommendations based on what they share
- If they mention a special occasion (wedding, anniversary, baby), acknowledge its significance warmly
- Keep responses to 2–4 sentences unless they need detailed info
- Use tasteful book/print related metaphors

IMPORTANT RULES:
- When suggesting a website section, end your message with: NAV:sectionId (e.g., NAV:order)
- Never invent prices or policies not listed above
- If genuinely unsure, direct to contact team
- Always be helpful, never dismissive
- If they ask to compare options, give a clear recommendation`;

  /* ── BINDCRAFT SVG LOGO (used in place of emoji) ── */
  const BC_LOGO_SVG = `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bcLogoGoldChat" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#f0c96a"/>
        <stop offset="100%" stop-color="#c9973b"/>
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="5" height="28" rx="2" fill="url(#bcLogoGoldChat)" opacity="0.9"/>
    <rect x="9" y="4" width="23" height="28" rx="2" fill="url(#bcLogoGoldChat)" opacity="0.25"/>
    <rect x="9" y="4" width="23" height="28" rx="2" stroke="url(#bcLogoGoldChat)" stroke-width="1.5"/>
    <line x1="13" y1="12" x2="28" y2="12" stroke="#f0c96a" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
    <line x1="13" y1="17" x2="26" y2="17" stroke="#f0c96a" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
    <line x1="13" y1="22" x2="24" y2="22" stroke="#f0c96a" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
    <circle cx="28" cy="10" r="3" fill="#f0c96a"/>
    <text x="28" y="11.5" text-anchor="middle" font-size="4" fill="#1a1008" font-weight="bold">✦</text>
  </svg>`;

  /* ── QUICK FAQ MAP (instant, no API call) ── */
  const QUICK_FAQ = {
    'price|pricing|cost|how much|₹': {
      answer: 'Our books start from <strong>₹999 (Softcover)</strong> or <strong>₹1,200 (Hardcover)</strong>. Three tiers: Starter, Story, and Heirloom — each with more features. 💡 First order? Use code <strong>FIRSTBOOK</strong> for 10% off!',
      nav: 'pricing',
      navLabel: 'View All Pricing'
    },
    'discount|promo|coupon|offer|deal': {
      answer: '✨ Current offers: <strong>10% off</strong> your first order (code: FIRSTBOOK), <strong>free spine engraving</strong> on all hardcovers this month, and a <strong>complimentary gift box</strong> with every wedding album!',
      nav: 'order',
      navLabel: 'Order Now'
    },
    'shipping|deliver|worldwide|international': {
      answer: 'We ship <strong>worldwide</strong>! 🌍 Standard: 7–10 business days. Express options available at checkout. Orders over <strong>₹3,000 get free shipping</strong>.',
      nav: null
    },
    'paper|stock|gsm|matte|gloss|silk': {
      answer: 'We offer <strong>50+ premium paper stocks</strong> from 80gsm to 350gsm — matte, gloss, silk, metallic, recycled, and specialty stocks. Visit the studio to feel them in person! ✋',
      nav: 'reservation',
      navLabel: 'Book Studio Visit'
    },
    'visit|studio|consultation|appointment|session': {
      answer: 'Our studio is open <strong>Mon–Sat, 9am–6pm</strong> for 60-minute hands-on sessions. Feel papers, touch binding styles, meet our artisans — it\'s a wonderful experience! 📍',
      nav: 'reservation',
      navLabel: 'Reserve a Slot'
    },
    'contact|email|phone|support|help': {
      answer: 'Reach us at <strong>hello@bindcraft.studio</strong> or <strong>+1 (555) 012-3456</strong>. We reply within 24 hours. Or use the contact form for detailed queries!',
      nav: 'contact',
      navLabel: 'Contact Page'
    },
    'wedding|album|heirloom': {
      answer: 'Our <strong>Timeless Vows</strong> wedding albums are heirloom pieces — leather binding, archival lay-flat pages, optional gold foil. Couples cry happy tears when they open them 💍 From ₹2,999.',
      nav: 'order',
      navLabel: 'Design Yours'
    },
    'review|testimonial|customer|feedback': {
      answer: '<strong>98% satisfaction</strong> across 12,000+ books made — many customers order again year after year. See what they\'re saying:',
      nav: 'reviews',
      navLabel: 'Read Reviews'
    },
    'order|create|design|start|begin|make': {
      answer: 'Creating your book is a joy! ✦ Choose type → customise cover & size → upload photos → confirm. Just minutes, and you\'ll get a digital proof before we print.',
      nav: 'order',
      navLabel: 'Start Creating'
    },
    'turnaround|ready|time|days|quick|fast': {
      answer: 'Standard turnaround is <strong>7–10 business days</strong> from proof approval. Need it for a special date? Mention it in your order notes and we\'ll do our best! 🚀',
      nav: null
    },
    'eco|recycled|environment|sustainable|green': {
      answer: 'We care 🌿 — <strong>eco-friendly archival inks</strong>, FSC-certified and recycled paper options, and fully recyclable packaging. Beautiful books, light footprint.',
      nav: null
    },
    'gift|wrap|present': {
      answer: 'Story and Heirloom books come with <strong>complimentary gift wrapping</strong> 🎁 — kraft box, ribbon, personalised card. Wedding albums include a premium keepsake box.',
      nav: 'order',
      navLabel: 'Order a Gift'
    },
    'bulk|corporate|wholesale|multiple': {
      answer: '<strong>Bulk discounts</strong> available for 10+ books — perfect for corporate gifts, event favours, or family projects. Contact us for a custom quote!',
      nav: 'contact',
      navLabel: 'Get a Quote'
    },
    'journal|diary|notebook': {
      answer: 'Our journals use <strong>premium fountain-pen-friendly paper</strong> ✍️ — dot-grid, lined, or blank — with ribbon bookmarks and linen or leather covers. From ₹999.',
      nav: 'order',
      navLabel: 'Design a Journal'
    },
  };

  /* ── CONVERSATION HISTORY ── */
  let conversationHistory = [];
  let isLoading = false;

  /* ── BUILD UI ── */
  function buildUI() {
    // Launcher button
    const launcher = document.createElement('button');
    launcher.id = 'bc-launcher';
    launcher.setAttribute('aria-label', 'Open chat assistant');
    launcher.innerHTML = `
      <svg class="bc-icon-chat" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1008" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
      <svg class="bc-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1008" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      <div class="bc-dot"></div>
    `;

    // Chat window
    const win = document.createElement('div');
    win.id = 'bc-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'BindCraft chat assistant');
    win.innerHTML = `
      <div class="bc-header">
        <div class="bc-avatar">${BC_LOGO_SVG}</div>
        <div class="bc-header-info">
          <div class="bc-header-name">Paige — BindCraft Assistant</div>
          <div class="bc-header-status">
            <div class="bc-status-dot"></div>
            <span>Online now</span>
          </div>
        </div>
        <div class="bc-header-actions">
          <button class="bc-hdr-btn" id="bc-clear-btn" title="Clear chat" aria-label="Clear conversation">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
          </button>
          <button class="bc-hdr-btn" id="bc-close-btn" aria-label="Close chat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div class="bc-messages" id="bc-messages"></div>

      <div class="bc-suggestions" id="bc-suggestions">
        <button class="bc-suggest-chip" data-q="What are your prices?">💰 Pricing</button>
        <button class="bc-suggest-chip" data-q="Do you have any discounts?">🎁 Offers</button>
        <button class="bc-suggest-chip" data-q="How do I place an order?">📦 Order</button>
        <button class="bc-suggest-chip" data-q="What paper stocks do you offer?">📄 Paper</button>
        <button class="bc-suggest-chip" data-q="Book a studio consultation">📅 Book visit</button>
        <button class="bc-suggest-chip" data-q="How long does delivery take?">🚚 Shipping</button>
      </div>

      <div class="bc-input-area">
        <div class="bc-input-row">
          <textarea
            id="bc-input"
            placeholder="Ask me anything about BindCraft…"
            rows="1"
            aria-label="Type your message"
            maxlength="500"
          ></textarea>
          <button id="bc-send" aria-label="Send message">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
        <div class="bc-input-footer">Powered by Claude AI · BindCraft Studio</div>
      </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(win);
  }

  /* ── HELPERS ── */
  function getTime() {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function scrollToBottom() {
    const msgs = document.getElementById('bc-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  function navigateTo(sectionId) {
  const target = document.getElementById(sectionId);
  if (target) {
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  }
}

  /* ── RENDER MESSAGE ── */
  function addMessage(role, html, navTarget = null, navLabel = null) {
    const msgs = document.getElementById('bc-messages');
    if (!msgs) return;

    // Remove quick-actions panel once user starts chatting
    const qa = msgs.querySelector('.bc-quick-actions-wrap');
    if (qa && role === 'user') qa.remove();

    const wrap = document.createElement('div');
    wrap.className = `bc-msg ${role}`;

    let chipsHTML = '';
    if (navTarget && navLabel) {
      chipsHTML = `
        <div class="bc-nav-chips">
          <button class="bc-nav-chip" data-nav="${navTarget}">${navLabel} →</button>
        </div>
      `;
    }

    if (role === 'assistant') {
      wrap.innerHTML = `
        <div class="bc-msg-avatar">${BC_LOGO_SVG}</div>
        <div>
          <div class="bc-bubble">${html}${chipsHTML}</div>
          <div class="bc-time">${getTime()}</div>
        </div>
      `;
    } else {
      wrap.innerHTML = `
        <div>
          <div class="bc-bubble">${html}</div>
          <div class="bc-time" style="text-align:right">${getTime()}</div>
        </div>
      `;
    }

    msgs.appendChild(wrap);

    // Bind nav chip clicks
    wrap.querySelectorAll('.bc-nav-chip[data-nav]').forEach(chip => {
  chip.addEventListener('click', () => {
    navigateTo(chip.dataset.nav);
    chip.textContent = '✓ Navigated';
    chip.classList.add('navigated');
  });
});

    scrollToBottom();
    return wrap;
  }

  /* ── TYPING INDICATOR ── */
  function showTyping() {
    const msgs = document.getElementById('bc-messages');
    if (!msgs) return null;
    const wrap = document.createElement('div');
    wrap.className = 'bc-msg assistant bc-typing';
    wrap.id = 'bc-typing-indicator';
    wrap.innerHTML = `
      <div class="bc-msg-avatar">${BC_LOGO_SVG}</div>
      <div class="bc-bubble">
        <div class="bc-typing-dot"></div>
        <div class="bc-typing-dot"></div>
        <div class="bc-typing-dot"></div>
      </div>
    `;
    msgs.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function hideTyping() {
    const t = document.getElementById('bc-typing-indicator');
    if (t) t.remove();
  }

  /* ── QUICK FAQ MATCH ── */
  function matchQuickFAQ(text) {
    const lower = text.toLowerCase();
    for (const [pattern, data] of Object.entries(QUICK_FAQ)) {
      const keywords = pattern.split('|');
      if (keywords.some(k => lower.includes(k))) {
        return data;
      }
    }
    return null;
  }

  /* ── API CALL — direct to Anthropic (no backend needed) ── */
  /* Set your API key here ↓ or in the BINDCRAFT_API_KEY env/global var   */
  const BC_API_KEY = (typeof BINDCRAFT_API_KEY !== 'undefined' ? BINDCRAFT_API_KEY : '')
                     || 'YOUR_API_KEY_HERE';   // ← paste your sk-ant-… key

  async function callClaude(userText) {
    conversationHistory.push({ role: 'user', content: userText });

    try {
      /* 10-second abort so the typing indicator never hangs forever */
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type':                          'application/json',
          'x-api-key':                             BC_API_KEY,
          'anthropic-version':                     '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system:     BC_SYSTEM_PROMPT,
          messages:   conversationHistory.slice(-20),
        }),
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const raw  = data.content?.[0]?.text || "I'm sorry, I couldn't get a response. Please try again.";

      /* Parse NAV directive */
      const navMatch  = raw.match(/\nNAV:(\w+)\s*$/);
      const navTarget = navMatch ? navMatch[1] : null;
      const cleanText = raw.replace(/\nNAV:\w+\s*$/, '').trim();

      /* Format: **bold** → <strong>, newlines → <br> */
      const formatted = cleanText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

      conversationHistory.push({ role: 'assistant', content: cleanText });
      return { text: formatted, nav: navTarget };

    } catch (e) {
      console.error('BindCraft chatbot error:', e);
      conversationHistory.pop(); // remove failed user message

      /* Friendly message depending on error type */
      const isAbort   = e.name === 'AbortError';
      const isAuthErr = e.message && e.message.includes('401');
      const isKeyErr  = BC_API_KEY === 'YOUR_API_KEY_HERE' || BC_API_KEY === '';

      let msg = 'Hmm, I\'m having a little trouble connecting right now. You can reach our team at <strong>hello@bindcraft.studio</strong> or call <strong>+1 (555) 012-3456</strong>.';
      if (isKeyErr)  msg = '⚙️ The AI key isn\'t configured yet — please add your Anthropic API key to chatbot.js. In the meantime, try the quick-answer buttons above or email us at <strong>hello@bindcraft.studio</strong>!';
      else if (isAbort) msg = '⏱ That took a bit too long — please try again.';
      else if (isAuthErr) msg = '🔑 API key issue. Please check the <strong>BC_API_KEY</strong> in chatbot.js.';

      return { text: msg, nav: null };
    }
  }

  /* ── SEND MESSAGE ── */
  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;
    isLoading = true;

    const input = document.getElementById('bc-input');
    if (input) { input.value = ''; input.style.height = 'auto'; }

    // Add user bubble
    addMessage('user', text.replace(/</g, '&lt;').replace(/>/g, '&gt;'));

    // Check quick FAQ first (instant, no API call)
    const quick = matchQuickFAQ(text);
    if (quick) {
      showTyping();
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      hideTyping();
      addMessage('assistant', quick.answer, quick.nav, quick.navLabel);
      if (quick.nav) {
        conversationHistory.push(
          { role: 'user', content: text },
          { role: 'assistant', content: quick.answer }
        );
      }
      isLoading = false;
      return;
    }

    // Full AI response
    const typing = showTyping();
    const result = await callClaude(text);
    hideTyping();

    // Determine nav label from sectionId
    const navLabels = {
      order: 'Go to Order', pricing: 'See Pricing', designs: 'View Gallery',
      reservation: 'Book a Session', contact: 'Contact Us', about: 'About Us',
      reviews: 'Read Reviews', quality: 'Quality Details'
    };
    const navLabel = result.nav ? (navLabels[result.nav] || 'Go there →') : null;

    addMessage('assistant', result.text, result.nav, navLabel);

    // Auto-navigate if bot says so
    if (result.nav) {
      setTimeout(() => navigateTo(result.nav), 800);
    }

    isLoading = false;
  }

  /* ── WELCOME MESSAGE ── */
  function showWelcome() {
    const msgs = document.getElementById('bc-messages');
    if (!msgs) return;

    // Timestamp
    const time = document.createElement('div');
    time.className = 'bc-time';
    time.textContent = getTime();
    msgs.appendChild(time);

    // Welcome bubble
    addMessage('assistant', `
      Hello! I\'m <strong>Paige</strong>, your BindCraft guide. ✦<br><br>
      Whether you\'re preserving wedding memories, creating a travel journal, or gifting something truly special — I\'m here to help you craft the perfect book. What brings you here today?
    `);

    // Quick-action buttons
    const wrap = document.createElement('div');
    wrap.className = 'bc-quick-actions-wrap';
    wrap.innerHTML = `
      <div class="bc-quick-actions">
        <div class="bc-quick-title">Popular questions</div>
        <button class="bc-quick-btn" data-q="What types of books do you make?"><span class="bc-qicon">📚</span> What books do you make?</button>
        <button class="bc-quick-btn" data-q="What are your prices?"><span class="bc-qicon">💰</span> Show me pricing</button>
        <button class="bc-quick-btn" data-q="Do you have any discounts or promotions?"><span class="bc-qicon">🎁</span> Any current offers?</button>
        <button class="bc-quick-btn" data-q="How do I upload my photos and place an order?"><span class="bc-qicon">📷</span> How does ordering work?</button>
        <button class="bc-quick-btn" data-q="Can I visit the studio?"><span class="bc-qicon">📍</span> Book a studio visit</button>
        <button class="bc-quick-btn" data-q="What is the turnaround time?"><span class="bc-qicon">⏱</span> How long does it take?</button>
      </div>
    `;
    msgs.appendChild(wrap);

    // Bind quick-action clicks
    wrap.querySelectorAll('.bc-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sendMessage(btn.dataset.q);
      });
    });

    scrollToBottom();
  }

  /* ── TOGGLE ── */
  let isOpen = false;

  function toggleChat() {
    isOpen = !isOpen;
    const launcher = document.getElementById('bc-launcher');
    const win = document.getElementById('bc-window');
    launcher.classList.toggle('open', isOpen);
    win.classList.toggle('open', isOpen);

    if (isOpen) {
      const msgs = document.getElementById('bc-messages');
      if (msgs && msgs.children.length === 0) showWelcome();
      setTimeout(() => document.getElementById('bc-input')?.focus(), 350);
    }
  }

  function clearChat() {
    conversationHistory = [];
    const msgs = document.getElementById('bc-messages');
    if (msgs) msgs.innerHTML = '';
    showWelcome();
  }

  /* ── INIT ── */
  /* Global helper so any script can open the chat */
  window.bc_openChat = function () {
    if (!isOpen) toggleChat();
    setTimeout(function () {
      var input = document.getElementById('bc-input');
      if (input) input.focus();
    }, 400);
  };

  function init() {
    buildUI();

    const launcher = document.getElementById('bc-launcher');
    const closeBtn = document.getElementById('bc-close-btn');
    const clearBtn = document.getElementById('bc-clear-btn');
    const sendBtn = document.getElementById('bc-send');
    const input = document.getElementById('bc-input');
    const suggestions = document.getElementById('bc-suggestions');

    launcher.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    clearBtn.addEventListener('click', clearChat);

    sendBtn.addEventListener('click', () => sendMessage(input.value.trim()));

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value.trim());
      }
    });

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });

    // Suggestion chips
    suggestions.querySelectorAll('.bc-suggest-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (!isOpen) toggleChat();
        setTimeout(() => sendMessage(chip.dataset.q), isOpen ? 0 : 450);
      });
    });

    // Keyboard: ESC closes
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) toggleChat();
    });

    // Show greeting toast after 4 seconds (if not already opened)
    setTimeout(() => {
      if (!isOpen) {
        const dot = document.querySelector('#bc-launcher .bc-dot');
        if (dot) dot.style.animation = 'bc-pulse-dot 0.5s ease-in-out 3';
      }
    }, 4000);
  }

  // Wait for DOM
  function initAndSignal() {
    init();
    /* Signal that the chatbot is ready so other scripts can react */
    document.dispatchEvent(new CustomEvent('bc:ready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAndSignal);
  } else {
    initAndSignal();
  }

})();