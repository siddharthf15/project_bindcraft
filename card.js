/* ════════════════════════════════════════════
   BindCraft – customise-fix.js
   Add LAST in your HTML, after all other scripts:
   <script src="customise-fix.js"></script>
   ════════════════════════════════════════════ */

(function () {
  function goToOrder(cat) {
    /* 1. Pre-select the matching book type radio */
    var catMap = { photo: 'photo', album: 'album', journal: 'journal', corporate: 'corporate' };
    var val = catMap[cat] || 'photo';
    var radio = document.querySelector('input[name="bookType"][value="' + val + '"]');
    if (radio) radio.checked = true;

    /* 2. Reset stepper to step 1 */
    document.querySelectorAll('.order-panel').forEach(function (p) { p.classList.remove('active'); });
    var p1 = document.getElementById('panel-1');
    if (p1) p1.classList.add('active');
    document.querySelectorAll('.step').forEach(function (s) {
      s.classList.remove('active', 'done');
      if (s.dataset.step === '1') s.classList.add('active');
    });

    /* 3. Scroll to order section */
    var orderEl = document.getElementById('order');
    if (orderEl) orderEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── Intercept ALL clicks on the page ── */
  document.addEventListener('click', function (e) {

    /* Case 1: clicked a .design-card-btn (Customise → on card) */
    var cardBtn = e.target.closest('.design-card-btn');
    if (cardBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();

      /* Find which design this card belongs to */
      var card = cardBtn.closest('.design-card');
      var cat = cardBtn.dataset.cat || (card && card.dataset.cat) || 'photo';

      /* Close any open modal first, then navigate */
      var overlay = document.getElementById('modalOverlay');
      if (overlay && overlay.classList.contains('open')) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(function () { goToOrder(cat); }, 350);
      } else {
        goToOrder(cat);
      }
      return;
    }

    /* Case 2: clicked the "Customise This Style →" button INSIDE the modal */
    var modalBtn = e.target.closest('#bc-modal-go, [data-action="customise-go"]');
    if (modalBtn) {
      e.preventDefault();
      var cat2 = modalBtn.dataset.cat || 'photo';
      var overlay2 = document.getElementById('modalOverlay');
      if (overlay2) {
        overlay2.classList.remove('open');
        document.body.style.overflow = '';
      }
      setTimeout(function () { goToOrder(cat2); }, 350);
      return;
    }

    /* Case 3: any anchor/button inside modal that links to #order */
    var orderLink = e.target.closest('a[href="#order"], button[href="#order"]');
    if (orderLink) {
      var insideModal = orderLink.closest('#modalOverlay, .modal');
      if (insideModal) {
        e.preventDefault();
        var overlay3 = document.getElementById('modalOverlay');
        if (overlay3) {
          overlay3.classList.remove('open');
          document.body.style.overflow = '';
        }
        setTimeout(function () { goToOrder('photo'); }, 350);
      }
    }
  }, true); /* useCapture = true so we run BEFORE existing listeners */

  /* ── Also patch cards: store cat on the button from the card image area ── */
  function patchCards() {
    document.querySelectorAll('.design-card').forEach(function (card) {
      var btn = card.querySelector('.design-card-btn');
      if (!btn) return;

      /* Try to read cat from data attribute set by renderCards */
      if (!btn.dataset.cat) {
        /* Fallback: guess from badge or title text */
        var badge = card.querySelector('.design-card-badge');
        var title = card.querySelector('.design-card-title');
        var text = (badge ? badge.textContent : '') + (title ? title.textContent : '');
        if (/wedding|album|vow|golden/i.test(text)) btn.dataset.cat = 'album';
        else if (/journal|keep|mindful|writer/i.test(text)) btn.dataset.cat = 'journal';
        else if (/corporate|brand|annual|report/i.test(text)) btn.dataset.cat = 'corporate';
        else btn.dataset.cat = 'photo';
      }
    });
  }

  /* Run on load and whenever the grid re-renders (filter clicks) */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchCards);
  } else {
    patchCards();
  }

  /* Watch for grid re-renders caused by filter buttons */
  var grid = document.getElementById('designsGrid');
  if (grid && window.MutationObserver) {
    new MutationObserver(patchCards).observe(grid, { childList: true });
  }
})();