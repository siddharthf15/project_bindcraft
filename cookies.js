/* ════════════════════════════════════════════
   BindCraft – cookies.js
   Full cookie consent system with:
   • Consent banner (first visit)
   • Granular preferences (analytics, marketing, functional)
   • Preference centre modal
   • Cookie helpers: set / get / remove
   • Google Analytics stub (fires only if analytics accepted)
   • LocalStorage mirrors for SPA-friendly access
   • Respects Do Not Track
   • GDPR / cookie law compliant

   Add AFTER all other scripts in index.html:
   <script src="cookies.js"></script>
   ════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Brand colours (keep in sync with project.css) ── */
  var GOLD    = '#c9973b';
  var GOLD_LT = '#f0c96a';
  var INK     = '#1a1008';
  var PAGE    = '#fdf8f0';
  var DARK    = '#2a1a08';
  var DARKER  = '#1a1008';

  /* ── Cookie categories ── */
  var CATS = {
    necessary:  { label: 'Strictly Necessary', locked: true,  default: true  },
    functional: { label: 'Functional',          locked: false, default: false },
    analytics:  { label: 'Analytics',           locked: false, default: false },
    marketing:  { label: 'Marketing',           locked: false, default: false },
  };

  var CONSENT_KEY   = 'bc_cookie_consent';   // localStorage key for the consent object
  var CONSENT_VER   = '1';                    // bump to re-prompt after policy change

  /* ════════════════════
     COOKIE UTILITIES
     ════════════════════ */

  /** Set a browser cookie */
  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + d.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
  }

  /** Get a browser cookie value */
  function getCookie(name) {
    var nameEQ = name + '=';
    var parts  = document.cookie.split(';');
    for (var i = 0; i < parts.length; i++) {
      var c = parts[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  }

  /** Remove a browser cookie */
  function removeCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999; path=/';
  }

  /* Expose globally so other scripts can use them */
  window.bcCookies = {
    set:    setCookie,
    get:    getCookie,
    remove: removeCookie,
  };

  /* ════════════════════
     CONSENT STATE
     ════════════════════ */

  function loadConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (obj.version !== CONSENT_VER) return null; // policy changed → re-prompt
      return obj;
    } catch (e) { return null; }
  }

  function saveConsent(prefs) {
    var obj = {
      version:   CONSENT_VER,
      timestamp: new Date().toISOString(),
      prefs:     prefs,
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(obj));
    /* Also set a summary cookie so the server can read it */
    var summary = Object.keys(prefs).filter(function (k) { return prefs[k]; }).join(',');
    setCookie('bc_consent', summary, 365);
    return obj;
  }

  function getDefaultPrefs() {
    var p = {};
    Object.keys(CATS).forEach(function (k) { p[k] = CATS[k].default; });
    p.necessary = true; // always on
    return p;
  }

  function acceptAll() {
    var p = {};
    Object.keys(CATS).forEach(function (k) { p[k] = true; });
    var consent = saveConsent(p);
    applyConsent(consent.prefs);
    hideBanner();
    hideModal();
  }

  function rejectNonEssential() {
    var p = getDefaultPrefs();
    var consent = saveConsent(p);
    applyConsent(consent.prefs);
    hideBanner();
    hideModal();
  }

  function saveCustom() {
    var p = { necessary: true };
    Object.keys(CATS).forEach(function (k) {
      if (CATS[k].locked) { p[k] = true; return; }
      var toggle = document.getElementById('bc-cookie-toggle-' + k);
      p[k] = toggle ? toggle.checked : false;
    });
    var consent = saveConsent(p);
    applyConsent(consent.prefs);
    hideBanner();
    hideModal();
    showToast('Cookie preferences saved ✓');
  }

  /* ── Apply consent decisions ── */
  function applyConsent(prefs) {
    /* Analytics */
    if (prefs.analytics) {
      enableAnalytics();
    } else {
      disableAnalytics();
    }
    /* Marketing */
    if (prefs.marketing) {
      enableMarketing();
    } else {
      disableMarketing();
    }
    /* Dispatch custom event so other scripts can react */
    document.dispatchEvent(new CustomEvent('bc:consentUpdated', { detail: prefs }));
  }

  /* ── Analytics stub ── */
  function enableAnalytics() {
    /* Replace with real GA / Plausible / Mixpanel init */
    if (window._bcAnalyticsEnabled) return;
    window._bcAnalyticsEnabled = true;
    /* Example: Google Analytics 4
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
    var s = document.createElement('script');
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    s.async = true;
    document.head.appendChild(s);
    */
    setCookie('bc_analytics', '1', 365);
    console.log('[BindCraft Cookies] Analytics enabled');
  }
  function disableAnalytics() {
    window._bcAnalyticsEnabled = false;
    removeCookie('bc_analytics');
    removeCookie('_ga'); removeCookie('_gid'); removeCookie('_gat');
  }

  /* ── Marketing stub ── */
  function enableMarketing() {
    if (window._bcMarketingEnabled) return;
    window._bcMarketingEnabled = true;
    setCookie('bc_marketing', '1', 365);
    console.log('[BindCraft Cookies] Marketing enabled');
  }
  function disableMarketing() {
    window._bcMarketingEnabled = false;
    removeCookie('bc_marketing');
    removeCookie('_fbp'); removeCookie('_fbc');
  }

  /* ════════════════════
     TOAST HELPER
     ════════════════════ */
  function showToast(msg) {
    var t = document.getElementById('toast');
    if (t) {
      t.textContent = msg;
      t.className = 'toast success show';
      setTimeout(function () { t.classList.remove('show'); }, 3500);
    }
  }

  /* ════════════════════
     INJECT CSS
     ════════════════════ */
  function injectCSS() {
    var style = document.createElement('style');
    style.id  = 'bc-cookie-styles';
    style.textContent = [
      /* Banner */
      '#bc-cookie-banner {',
      '  position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%);',
      '  width:min(680px,calc(100vw - 2rem));',
      '  background:' + DARK + ';',
      '  border:1px solid rgba(201,151,59,0.28);',
      '  border-radius:18px;',
      '  padding:1.25rem 1.5rem;',
      '  z-index:19999;',
      '  box-shadow:0 24px 80px rgba(0,0,0,0.55),0 0 0 1px rgba(201,151,59,0.08);',
      '  font-family:"DM Sans",system-ui,sans-serif;',
      '  display:flex; gap:1.25rem; align-items:center; flex-wrap:wrap;',
      '  animation:bc-banner-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both;',
      '}',
      '@keyframes bc-banner-in {',
      '  from{opacity:0;transform:translateX(-50%) translateY(20px);}',
      '  to{opacity:1;transform:translateX(-50%) translateY(0);}',
      '}',
      '#bc-cookie-banner.hide {',
      '  animation:bc-banner-out 0.3s ease both;',
      '}',
      '@keyframes bc-banner-out {',
      '  to{opacity:0;transform:translateX(-50%) translateY(20px);}',
      '}',
      '.bc-cb-icon { font-size:1.8rem; flex-shrink:0; }',
      '.bc-cb-text { flex:1; min-width:200px; }',
      '.bc-cb-title {',
      '  font-size:0.92rem; font-weight:700; color:' + GOLD_LT + ';',
      '  font-family:"Playfair Display",serif; margin-bottom:0.25rem;',
      '}',
      '.bc-cb-desc {',
      '  font-size:0.78rem; color:rgba(253,248,240,0.6); line-height:1.55;',
      '}',
      '.bc-cb-desc a { color:' + GOLD_LT + '; text-underline-offset:2px; }',
      '.bc-cb-btns {',
      '  display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;',
      '}',
      '.bc-btn-accept {',
      '  background:linear-gradient(135deg,' + GOLD + ',' + GOLD_LT + ');',
      '  color:' + INK + '; border:none; border-radius:50px;',
      '  padding:0.55rem 1.1rem; font-size:0.82rem; font-weight:700;',
      '  cursor:pointer; white-space:nowrap;',
      '  transition:transform 0.2s ease,box-shadow 0.2s ease;',
      '  box-shadow:0 4px 14px rgba(201,151,59,0.35);',
      '}',
      '.bc-btn-accept:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(201,151,59,0.5); }',
      '.bc-btn-reject {',
      '  background:rgba(253,248,240,0.07); color:rgba(253,248,240,0.7);',
      '  border:1px solid rgba(253,248,240,0.15); border-radius:50px;',
      '  padding:0.55rem 1rem; font-size:0.82rem; font-weight:600;',
      '  cursor:pointer; white-space:nowrap; transition:all 0.2s ease;',
      '}',
      '.bc-btn-reject:hover { background:rgba(253,248,240,0.12); color:rgba(253,248,240,0.95); }',
      '.bc-btn-prefs {',
      '  background:none; border:none; color:' + GOLD_LT + ';',
      '  font-size:0.78rem; font-weight:600; cursor:pointer;',
      '  text-decoration:underline; text-underline-offset:2px; padding:0.25rem;',
      '}',

      /* Modal overlay */
      '#bc-cookie-modal-overlay {',
      '  position:fixed; inset:0; background:rgba(0,0,0,0.65);',
      '  z-index:20000; display:flex; align-items:center; justify-content:center;',
      '  padding:1rem; backdrop-filter:blur(4px);',
      '  animation:bc-overlay-in 0.25s ease both;',
      '}',
      '@keyframes bc-overlay-in { from{opacity:0;} to{opacity:1;} }',
      '#bc-cookie-modal-overlay.hide { animation:bc-overlay-out 0.2s ease both; }',
      '@keyframes bc-overlay-out { to{opacity:0;} }',
      '#bc-cookie-modal {',
      '  background:' + DARK + '; border:1px solid rgba(201,151,59,0.25);',
      '  border-radius:20px; width:min(540px,100%); max-height:90vh;',
      '  overflow-y:auto; box-shadow:0 32px 100px rgba(0,0,0,0.6);',
      '  font-family:"DM Sans",system-ui,sans-serif;',
      '  animation:bc-modal-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both;',
      '}',
      '@keyframes bc-modal-in { from{opacity:0;transform:scale(0.93) translateY(12px);} to{opacity:1;transform:none;} }',
      '.bc-modal-head {',
      '  padding:1.5rem 1.5rem 1rem;',
      '  border-bottom:1px solid rgba(201,151,59,0.15);',
      '  display:flex; align-items:center; gap:0.75rem;',
      '}',
      '.bc-modal-head-icon { font-size:1.5rem; }',
      '.bc-modal-head-title {',
      '  font-family:"Playfair Display",serif;',
      '  font-size:1.1rem; font-weight:700; color:' + GOLD_LT + '; flex:1;',
      '}',
      '.bc-modal-close {',
      '  width:30px; height:30px; border-radius:50%; border:1px solid rgba(253,248,240,0.15);',
      '  background:rgba(253,248,240,0.07); color:rgba(253,248,240,0.6);',
      '  cursor:pointer; display:flex; align-items:center; justify-content:center;',
      '  font-size:1rem; transition:all 0.2s ease;',
      '}',
      '.bc-modal-close:hover { background:rgba(201,151,59,0.2); color:' + GOLD_LT + '; }',
      '.bc-modal-body { padding:1.25rem 1.5rem; display:flex; flex-direction:column; gap:1rem; }',
      '.bc-modal-intro { font-size:0.83rem; color:rgba(253,248,240,0.6); line-height:1.6; }',

      /* Category rows */
      '.bc-cat-row {',
      '  background:rgba(253,248,240,0.04); border:1px solid rgba(201,151,59,0.12);',
      '  border-radius:12px; padding:1rem;',
      '}',
      '.bc-cat-top { display:flex; align-items:center; gap:0.75rem; margin-bottom:0.4rem; }',
      '.bc-cat-name {',
      '  flex:1; font-size:0.88rem; font-weight:700; color:rgba(253,248,240,0.9);',
      '}',
      '.bc-cat-badge {',
      '  font-size:0.68rem; background:rgba(201,151,59,0.18); color:' + GOLD_LT + ';',
      '  padding:0.15rem 0.5rem; border-radius:50px; font-weight:600;',
      '}',
      '.bc-cat-desc { font-size:0.78rem; color:rgba(253,248,240,0.45); line-height:1.55; }',

      /* Toggle switch */
      '.bc-toggle {',
      '  position:relative; width:42px; height:24px; flex-shrink:0;',
      '}',
      '.bc-toggle input { opacity:0; width:0; height:0; position:absolute; }',
      '.bc-toggle-track {',
      '  position:absolute; inset:0; border-radius:24px;',
      '  background:rgba(253,248,240,0.12); cursor:pointer;',
      '  transition:background 0.25s ease;',
      '}',
      '.bc-toggle input:checked + .bc-toggle-track {',
      '  background:linear-gradient(135deg,' + GOLD + ',' + GOLD_LT + ');',
      '}',
      '.bc-toggle-track::after {',
      '  content:""; position:absolute; top:3px; left:3px;',
      '  width:18px; height:18px; border-radius:50%; background:#fff;',
      '  transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1);',
      '  box-shadow:0 1px 4px rgba(0,0,0,0.3);',
      '}',
      '.bc-toggle input:checked + .bc-toggle-track::after { transform:translateX(18px); }',
      '.bc-toggle input:disabled + .bc-toggle-track { opacity:0.5; cursor:not-allowed; }',

      /* Modal footer */
      '.bc-modal-foot {',
      '  padding:1rem 1.5rem 1.5rem;',
      '  border-top:1px solid rgba(201,151,59,0.12);',
      '  display:flex; gap:0.75rem; flex-wrap:wrap;',
      '}',
      '.bc-btn-save-custom {',
      '  flex:1; background:linear-gradient(135deg,' + GOLD + ',' + GOLD_LT + ');',
      '  color:' + INK + '; border:none; border-radius:50px;',
      '  padding:0.7rem 1.25rem; font-size:0.85rem; font-weight:700;',
      '  cursor:pointer; transition:all 0.2s ease;',
      '  box-shadow:0 4px 14px rgba(201,151,59,0.35);',
      '}',
      '.bc-btn-save-custom:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(201,151,59,0.5); }',
      '.bc-btn-accept-all-modal {',
      '  background:rgba(253,248,240,0.07); color:rgba(253,248,240,0.8);',
      '  border:1px solid rgba(253,248,240,0.15); border-radius:50px;',
      '  padding:0.7rem 1.1rem; font-size:0.85rem; font-weight:600;',
      '  cursor:pointer; transition:all 0.2s ease;',
      '}',
      '.bc-btn-accept-all-modal:hover { background:rgba(201,151,59,0.15); color:' + GOLD_LT + '; }',

      /* Floating "cookie settings" button */
      '#bc-cookie-settings-btn {',
      '  position:fixed; bottom:2rem; left:1.5rem; z-index:8900;',
      '  background:' + DARKER + '; border:1px solid rgba(201,151,59,0.3);',
      '  color:rgba(253,248,240,0.6); border-radius:50px;',
      '  padding:0.45rem 0.9rem; font-size:0.72rem; font-weight:600;',
      '  cursor:pointer; display:flex; align-items:center; gap:0.4rem;',
      '  font-family:"DM Sans",system-ui,sans-serif;',
      '  transition:all 0.2s ease; box-shadow:0 4px 16px rgba(0,0,0,0.3);',
      '}',
      '#bc-cookie-settings-btn:hover {',
      '  background:rgba(201,151,59,0.15); color:' + GOLD_LT + ';',
      '  border-color:rgba(201,151,59,0.5);',
      '}',

      /* Mobile */
      '@media(max-width:480px){',
      '  #bc-cookie-banner{ flex-direction:column; align-items:flex-start; bottom:0;',
      '    left:0; right:0; transform:none; width:100%; border-radius:18px 18px 0 0; }',
      '  #bc-cookie-banner.hide { animation:bc-banner-out-mob 0.3s ease both; }',
      '  @keyframes bc-banner-out-mob { to{opacity:0;transform:translateY(100%);} }',
      '  .bc-cb-btns { width:100%; }',
      '  .bc-btn-accept, .bc-btn-reject { flex:1; text-align:center; }',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ════════════════════
     BANNER
     ════════════════════ */
  function buildBanner() {
    var el = document.createElement('div');
    el.id  = 'bc-cookie-banner';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Cookie consent');
    el.innerHTML =
      '<div class="bc-cb-icon" aria-hidden="true">🍪</div>' +
      '<div class="bc-cb-text">' +
        '<div class="bc-cb-title">We use cookies</div>' +
        '<div class="bc-cb-desc">We use cookies to enhance your experience, analyse traffic, and personalise content. ' +
          'See our <a href="#" onclick="window.bcConsent.openModal();return false;">Cookie Policy</a> for details.</div>' +
      '</div>' +
      '<div class="bc-cb-btns">' +
        '<button class="bc-btn-accept" id="bc-cb-accept-all">Accept All</button>' +
        '<button class="bc-btn-reject" id="bc-cb-reject">Necessary Only</button>' +
        '<button class="bc-btn-prefs" id="bc-cb-prefs">Manage Preferences</button>' +
      '</div>';
    document.body.appendChild(el);

    document.getElementById('bc-cb-accept-all').addEventListener('click', acceptAll);
    document.getElementById('bc-cb-reject').addEventListener('click', rejectNonEssential);
    document.getElementById('bc-cb-prefs').addEventListener('click', function () {
      buildModal();
      openModal();
    });
  }

  function hideBanner() {
    var el = document.getElementById('bc-cookie-banner');
    if (!el) return;
    el.classList.add('hide');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
  }

  /* ════════════════════
     PREFERENCES MODAL
     ════════════════════ */
  function buildModal() {
    if (document.getElementById('bc-cookie-modal-overlay')) return; // already built

    var existing = loadConsent();
    var prefs    = existing ? existing.prefs : getDefaultPrefs();

    var overlay = document.createElement('div');
    overlay.id  = 'bc-cookie-modal-overlay';

    /* Category rows HTML */
    var catsHTML = Object.keys(CATS).map(function (k) {
      var cat     = CATS[k];
      var checked = prefs[k] ? 'checked' : '';
      var disabled = cat.locked ? 'disabled' : '';
      return (
        '<div class="bc-cat-row">' +
          '<div class="bc-cat-top">' +
            '<span class="bc-cat-name">' + cat.label + '</span>' +
            (cat.locked ? '<span class="bc-cat-badge">Always On</span>' : '') +
            '<label class="bc-toggle" aria-label="' + cat.label + '">' +
              '<input type="checkbox" id="bc-cookie-toggle-' + k + '" ' + checked + ' ' + disabled + '>' +
              '<span class="bc-toggle-track"></span>' +
            '</label>' +
          '</div>' +
          '<div class="bc-cat-desc">' + catDesc(k) + '</div>' +
        '</div>'
      );
    }).join('');

    overlay.innerHTML =
      '<div id="bc-cookie-modal" role="dialog" aria-modal="true" aria-label="Cookie preferences">' +
        '<div class="bc-modal-head">' +
          '<span class="bc-modal-head-icon">⚙️</span>' +
          '<span class="bc-modal-head-title">Cookie Preferences</span>' +
          '<button class="bc-modal-close" id="bc-modal-close-btn" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="bc-modal-body">' +
          '<p class="bc-modal-intro">Choose which cookies you allow BindCraft Studio to use. ' +
            'Strictly necessary cookies cannot be disabled as they are essential for the site to function.</p>' +
          catsHTML +
        '</div>' +
        '<div class="bc-modal-foot">' +
          '<button class="bc-btn-save-custom" id="bc-modal-save">Save My Preferences</button>' +
          '<button class="bc-btn-accept-all-modal" id="bc-modal-accept-all">Accept All</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    /* Bind modal events */
    document.getElementById('bc-modal-close-btn').addEventListener('click', function () { hideModal(); });
    document.getElementById('bc-modal-save').addEventListener('click', saveCustom);
    document.getElementById('bc-modal-accept-all').addEventListener('click', acceptAll);

    /* Close on overlay click */
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) hideModal();
    });
  }

  function catDesc(k) {
    var descs = {
      necessary:  'Login sessions, cart, security tokens. The site cannot work without these.',
      functional: 'Remember your preferences like language, cover choices, and stepper state.',
      analytics:  'Anonymous usage data to understand how visitors interact with the site (e.g. Google Analytics).',
      marketing:  'Personalised ads and remarketing on partner networks (e.g. Facebook Pixel).',
    };
    return descs[k] || '';
  }

  function openModal() {
    buildModal();
    var overlay = document.getElementById('bc-cookie-modal-overlay');
    if (overlay) overlay.style.display = 'flex';
  }

  function hideModal() {
    var overlay = document.getElementById('bc-cookie-modal-overlay');
    if (!overlay) return;
    overlay.classList.add('hide');
    setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 250);
  }

  /* ════════════════════
     FLOATING SETTINGS BTN
     (always visible after consent given)
     ════════════════════ */
  function buildSettingsBtn() {
    if (document.getElementById('bc-cookie-settings-btn')) return;
    var btn = document.createElement('button');
    btn.id  = 'bc-cookie-settings-btn';
    btn.setAttribute('aria-label', 'Cookie settings');
    btn.innerHTML = '🍪 Cookie settings';
    btn.addEventListener('click', function () { openModal(); });
    document.body.appendChild(btn);
  }

  /* ════════════════════
     PUBLIC API
     ════════════════════ */
  window.bcConsent = {
    acceptAll:          acceptAll,
    rejectNonEssential: rejectNonEssential,
    openModal:          openModal,
    getConsent: function () { return loadConsent(); },
    hasConsented: function (category) {
      var c = loadConsent();
      return c ? !!c.prefs[category] : false;
    },
    reset: function () {
      localStorage.removeItem(CONSENT_KEY);
      removeCookie('bc_consent');
      location.reload();
    },
  };

  /* ════════════════════
     INIT
     ════════════════════ */
  function init() {
    injectCSS();

    /* Respect Do Not Track */
    var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';

    var existing = loadConsent();
    if (existing) {
      /* User already chose — just apply and show settings button */
      applyConsent(existing.prefs);
      buildSettingsBtn();
    } else if (dnt) {
      /* DNT set — save necessary-only silently */
      var p = getDefaultPrefs();
      saveConsent(p);
      applyConsent(p);
      buildSettingsBtn();
    } else {
      /* First visit — show banner */
      buildBanner();
      buildSettingsBtn();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
