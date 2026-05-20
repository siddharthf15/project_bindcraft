/* ════════════════════════════════════════════
   BindCraft – order-fix.js
   Add LAST in your HTML before </body>:
   <script src="order-fix.js"></script>
   ════════════════════════════════════════════ */

(function () {

  /* Wait for DOM to be ready */
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {

    /* ── Grab elements ── */
    var placeBtn = document.getElementById('placeOrderBtn');
    if (!placeBtn) return; /* safety */

    /* ── Clone the button to strip ALL old listeners ── */
    var newBtn = placeBtn.cloneNode(true);
    placeBtn.parentNode.replaceChild(newBtn, placeBtn);
    placeBtn = newBtn;

    /* ── Helper: show toast (reuse existing or fallback) ── */
    function toast(msg, type) {
      var t = document.getElementById('toast');
      if (t) {
        t.textContent = msg;
        t.className = 'toast ' + (type || '') + ' show';
        setTimeout(function () { t.classList.remove('show'); }, 3500);
      }
    }

    /* ── Helper: go to a step ── */
    function goStep(n) {
      document.querySelectorAll('.order-panel').forEach(function (p) {
        p.classList.remove('active');
      });
      var panel = document.getElementById('panel-' + n);
      if (panel) panel.classList.add('active');

      document.querySelectorAll('.step').forEach(function (s) {
        s.classList.remove('active', 'done');
        var sn = parseInt(s.dataset.step, 10);
        if (sn === n) s.classList.add('active');
        if (sn < n)  s.classList.add('done');
      });

      var orderEl = document.getElementById('order');
      if (orderEl) orderEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* ── Helper: full reset ── */
    function resetOrder() {
      /* Uncheck all book type radios */
      document.querySelectorAll('input[name="bookType"]').forEach(function (r) {
        r.checked = false;
      });

      /* Reset customise options to first item */
      ['coverOptions', 'pageColorOptions', 'sizeOptions'].forEach(function (id) {
        var opts = document.querySelectorAll('#' + id + ' .custom-opt');
        opts.forEach(function (o, i) {
          o.classList.toggle('active', i === 0);
        });
      });

      /* Reset page slider */
      var slider = document.getElementById('pageSlider');
      var pageCount = document.getElementById('pageCount');
      if (slider)    slider.value = 40;
      if (pageCount) pageCount.textContent = '40';

      /* Clear upload preview */
      var preview = document.getElementById('uploadPreview');
      if (preview) preview.innerHTML = '';

      /* Clear confirm form */
      document.querySelectorAll('#panel-4 .form-input').forEach(function (el) {
        el.value = '';
      });

      /* Restore Place Order button */
      placeBtn.innerHTML = '<span>Place Order</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      placeBtn.disabled    = false;
      placeBtn.style.background = '';
      placeBtn.style.opacity    = '';
      placeBtn.style.cursor     = '';

      /* Restore Back button */
      restoreBackBtn();

      /* Go to step 1 */
      goStep(1);
    }

    /* ── Back button reference & restore helper ── */
    function getBackBtn() {
      return document.querySelector('#panel-4 .panel-nav .btn-ghost');
    }

    function restoreBackBtn() {
      var btn = getBackBtn();
      if (!btn) return;
      btn.textContent = '← Back';
      btn.onclick = null;
      btn.classList.add('prev-step');
      btn.setAttribute('data-prev', '3');
    }

    function replaceBackWithNewOrder() {
      var btn = getBackBtn();
      if (!btn) return;
      /* Remove its stepper behaviour */
      btn.classList.remove('prev-step');
      btn.removeAttribute('data-prev');
      btn.textContent = '＋ Start New Order';
      /* Use onclick so it's easy to clear later */
      btn.onclick = function (e) {
        e.stopImmediatePropagation();
        resetOrder();
      };
    }

    /* ── Main: Place Order click ── */
    placeBtn.addEventListener('click', function () {

      /* Basic validation */
      var nameEl  = document.querySelector('#panel-4 input[type="text"]');
      var emailEl = document.querySelector('#panel-4 input[type="email"]');
      if (nameEl && !nameEl.value.trim()) {
        toast('Please enter your full name.', 'error'); return;
      }
      if (emailEl && !emailEl.value.trim()) {
        toast('Please enter your email address.', 'error'); return;
      }

      /* Processing state */
      placeBtn.innerHTML  = '<span>Processing…</span>';
      placeBtn.disabled   = true;

      setTimeout(function () {
        /* Success state */
        placeBtn.innerHTML       = '✓ Order Placed!';
        placeBtn.style.background = 'linear-gradient(135deg,#3a8a3a,#60c060)';
        placeBtn.style.opacity    = '1';
        placeBtn.disabled         = true;

        toast('🎉 Order placed! Check your email for confirmation.', 'success');

        /* Swap Back → New Order */
        replaceBackWithNewOrder();

      }, 2000);
    });

    /* ── Fix currency symbol in buildSummary ── */
    /* We override the confirm step button to rebuild summary with ₹ */
    document.querySelectorAll('.next-step[data-next="4"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        /* Small delay so original buildSummary runs first, then we patch it */
        setTimeout(function () {
          var priceEl = document.querySelector('.summary-price strong');
          if (priceEl) {
            priceEl.textContent = priceEl.textContent.replace('$', '₹');
          }
          /* Also fix "Not selected" label if book type is chosen */
          var bookTypeVal = document.querySelector('input[name="bookType"]:checked');
          var summaryRows = document.querySelectorAll('.summary-row');
          if (bookTypeVal && summaryRows.length > 0) {
            var typeMap = { photo: 'Photo Book', journal: 'Journal', album: 'Wedding Album', corporate: 'Corporate Book' };
            summaryRows.forEach(function (row) {
              var key = row.querySelector('.summary-key');
              var val = row.querySelector('.summary-val');
              if (key && val && key.textContent.includes('Book Type')) {
                val.textContent = typeMap[bookTypeVal.value] || bookTypeVal.value;
                val.style.color = '';
              }
            });
          }
        }, 50);
      });
    });

  }); /* end ready() */

})();