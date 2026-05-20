/* ════════════════════════════════════════════
   BindCraft – auth-gate.js
   Add AFTER all other scripts in index.html:
   <script src="auth-gate.js"></script>

   What it does:
   • Intercepts "Start Creating" / "Design Your Book"
     clicks and redirects to auth.html if the user
     is not signed in.
   • If the user IS signed in, shows a welcome pill
     in the navbar and lets the click through normally.
   • Provides bc_logout() helper.
   ════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Selectors for every CTA that should gate ── */
  var GATED_SELECTORS = [
    '.nav-cta',                    /* "Start Creating" in navbar */
    'a[href="#order"].btn-primary', /* "Design Your Book" hero btn */
    '.design-card-btn',            /* Customise card buttons */
    '#bc-modal-go',                /* Modal "Customise This Style" */
    '[data-action="customise-go"]',
  ];

  /* ── Helpers ── */
  function getToken()  { return localStorage.getItem('bc_token'); }
  function getUser()   {
    try { return JSON.parse(localStorage.getItem('bc_user')); }
    catch (e) { return null; }
  }

  function isLoggedIn() { return !!getToken(); }

  function getCartCount() {
    try { return JSON.parse(localStorage.getItem('bc_cart') || '[]').length; }
    catch(e) { return 0; }
  }

  /* ── Redirect to auth page ── */
  function goAuth(returnTo) {
    var tab = 'signup';
    var url = 'auth.html?tab=' + tab;
    if (returnTo) url += '&return=' + encodeURIComponent(returnTo);
    window.location.href = url;
  }

  /* ── Intercept gated clicks ── */
  document.addEventListener('click', function (e) {
    if (isLoggedIn()) return; /* Already signed in — let through */

    for (var i = 0; i < GATED_SELECTORS.length; i++) {
      var el = e.target.closest(GATED_SELECTORS[i]);
      if (el) {
        e.preventDefault();
        e.stopImmediatePropagation();
        goAuth(window.location.href);
        return;
      }
    }
  }, true); /* capture = true so we run before card.js etc. */

  /* ── Show user pill in navbar when signed in ── */
  function injectUserPill() {
    var user = getUser();
    if (!user) return;

    var nav = document.getElementById('navLinks');
    if (!nav) return;

    /* Remove existing pill if any */
    var existing = document.getElementById('bc-user-pill');
    if (existing) existing.remove();

    var li = document.createElement('li');
    li.id  = 'bc-user-pill';

    var initial = (user.firstName || 'U').charAt(0).toUpperCase();
    li.innerHTML =
      '<div style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;" onclick="window.bc_showUserMenu()">' +
        '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#c9973b,#f0c96a);' +
             'display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;color:#1a1008;' +
             'flex-shrink:0;box-shadow:0 0 12px rgba(201,151,59,0.4);">' +
          initial +
        '</div>' +
        '<span style="font-size:0.82rem;font-weight:600;color:rgba(253,248,240,0.8);">' +
          escapeHTML(user.firstName) +
        '</span>' +
      '</div>';

    /* Insert before the last li (the CTA "Start Creating") */
    var lis = nav.querySelectorAll('li');
    var last = lis[lis.length - 1];
    nav.insertBefore(li, last);

    /* Also change "Start Creating" text to "My Account" */
    var cta = nav.querySelector('.nav-cta');
    if (cta) {
      var cartCount = getCartCount();
      cta.innerHTML = 'My Orders' + (cartCount > 0 ? ' <span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#c9973b,#f0c96a);color:#1a1008;font-size:0.65rem;font-weight:800;margin-left:4px;">' + cartCount + '</span>' : '');
      cta.href = '#';
      cta.onclick = function(e) {
        e.preventDefault();
        window.bc_showUserMenu();
      };
    }
  }

  /* ── Simple dropdown user menu ── */
  window.bc_showUserMenu = function () {
    var existing = document.getElementById('bc-user-menu');
    if (existing) { existing.remove(); return; }

    var user = getUser();
    var menu = document.createElement('div');
    menu.id = 'bc-user-menu';
    menu.style.cssText =
      'position:fixed;top:70px;right:1.5rem;z-index:9999;' +
      'background:#2a1a08;border:1px solid rgba(201,151,59,0.25);border-radius:14px;' +
      'padding:0.5rem;min-width:200px;box-shadow:0 16px 48px rgba(0,0,0,0.5);' +
      'animation:bc-menu-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both;';

    var style = document.createElement('style');
    style.textContent = '@keyframes bc-menu-in { from { opacity:0; transform:translateY(-8px) scale(0.96); } to { opacity:1; transform:none; } }';
    document.head.appendChild(style);

    var name = (user ? user.firstName + ' ' + (user.lastName || '') : '').trim();
    menu.innerHTML =
      '<div style="padding:0.6rem 0.75rem 0.5rem;border-bottom:1px solid rgba(201,151,59,0.15);margin-bottom:0.25rem;">' +
        '<div style="font-size:0.82rem;font-weight:700;color:#f0c96a;font-family:\'Playfair Display\',serif;">' + escapeHTML(name) + '</div>' +
        '<div style="font-size:0.72rem;color:rgba(253,248,240,0.4);">' + escapeHTML(user ? user.email : '') + '</div>' +
      '</div>' +
      menuItem('📦', 'My Orders',   function() { document.getElementById('order').scrollIntoView({behavior:'smooth'}); close(); }) +
      menuItem('🛒', 'My Cart (' + getCartCount() + ')',  function() { window.location.href = 'cart.html'; close(); }) +
      menuItem('📅', 'My Sessions', function() { document.getElementById('reservation').scrollIntoView({behavior:'smooth'}); close(); }) +
      menuItem('⭐', 'My Reviews',  function() { document.getElementById('reviews').scrollIntoView({behavior:'smooth'}); close(); }) +
      '<div style="border-top:1px solid rgba(201,151,59,0.12);margin-top:0.25rem;padding-top:0.25rem;">' +
        menuItem('🚪', 'Sign Out', function() { window.bc_logout(); }) +
      '</div>';

    document.body.appendChild(menu);

    function close() {
      if (menu.parentNode) menu.parentNode.removeChild(menu);
    }

    setTimeout(function () {
      document.addEventListener('click', function outsideClick(e) {
        if (!menu.contains(e.target)) {
          close();
          document.removeEventListener('click', outsideClick);
        }
      });
    }, 100);
  };

  function menuItem(icon, label, fn) {
    var id = 'bc-mi-' + Math.random().toString(36).slice(2);
    setTimeout(function() {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    }, 0);
    return '<div id="' + id + '" style="display:flex;align-items:center;gap:0.6rem;padding:0.55rem 0.75rem;border-radius:9px;cursor:pointer;font-size:0.82rem;color:rgba(253,248,240,0.75);transition:all 0.15s;" ' +
           'onmouseenter="this.style.background=\'rgba(201,151,59,0.1)\';this.style.color=\'#f0c96a\';" ' +
           'onmouseleave="this.style.background=\'\';this.style.color=\'rgba(253,248,240,0.75)\';">' +
             '<span>' + icon + '</span><span>' + escapeHTML(label) + '</span>' +
           '</div>';
  }

  /* ── Logout ── */
  window.bc_logout = function () {
    var token = getToken();
    if (token) {
      fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
      }).catch(function() {});
    }
    localStorage.removeItem('bc_token');
    localStorage.removeItem('bc_user');
    location.reload();
  };

  /* ── Return from auth.html with token in localStorage ── */
  function checkReturnFromAuth() {
    /* auth.html already stored token; we just need to update UI */
    if (isLoggedIn()) {
      injectUserPill();
    }
  }

  /* ── Escape HTML helper ── */
  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Init ── */
  function init() {
    checkReturnFromAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
