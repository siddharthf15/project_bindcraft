/* ════════════════════════════════════════════
   BindCraft – api.js  (v3 – Cart + Payment)
   Connects all frontend forms to the backend.
   Loaded LAST, after all other scripts.
   ════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Config ── */
  var API = 'http://localhost:3001/api';   // change to your server URL in production

  /* ── Tiny helpers ── */
  function toast(msg, type) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className   = 'toast ' + (type || '') + ' show';
    setTimeout(function () { t.classList.remove('show'); }, 4000);
  }

  function post(endpoint, data) {
    return fetch(API + endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }).then(function (r) { return r.json(); });
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  /* ════════════════════════════════════
     CART HELPERS
     ════════════════════════════════════ */
  function getCart() {
    try { return JSON.parse(localStorage.getItem('bc_cart') || '[]'); }
    catch (e) { return []; }
  }

  function saveCart(items) {
    localStorage.setItem('bc_cart', JSON.stringify(items));
  }

  function addToCart(order) {
    var cart = getCart();
    /* Avoid duplicates by order id */
    var exists = cart.some(function (c) { return c.id && c.id === order.id; });
    if (!exists) { cart.unshift(order); saveCart(cart); }
    updateCartBadge();
  }

  function updateCartBadge() {
    var count = getCart().length;
    var badge = document.getElementById('bc-cart-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  /* Cart is accessed via the My Orders / user menu dropdown, not in navbar */

  /* ════════════════════════════════════
     1. ORDER – patch "Place Order" btn
     ════════════════════════════════════ */
  ready(function () {
    var placeBtn = document.getElementById('placeOrderBtn');
    if (!placeBtn) return;

    /* Clone to strip any other listeners then re-attach */
    var fresh = placeBtn.cloneNode(true);
    placeBtn.parentNode.replaceChild(fresh, placeBtn);
    placeBtn = fresh;

    placeBtn.addEventListener('click', function () {

      /* --- collect form values --- */
      var nameEl  = document.querySelector('#panel-4 input[type="text"]');
      var emailEl = document.querySelector('#panel-4 input[type="email"]');
      var notesEl = document.querySelector('#panel-4 textarea');

      var name  = nameEl  ? nameEl.value.trim()  : '';
      var email = emailEl ? emailEl.value.trim()  : '';
      var notes = notesEl ? notesEl.value.trim()  : '';

      if (!name)  { toast('Please enter your full name.',    'error'); return; }
      if (!email) { toast('Please enter your email address.', 'error'); return; }

      /* collect stepper selections */
      var typeRadio     = document.querySelector('input[name="bookType"]:checked');
      var activeCover   = document.querySelector('#coverOptions .custom-opt.active');
      var activeColor   = document.querySelector('#pageColorOptions .custom-opt.active');
      var activeSize    = document.querySelector('#sizeOptions .custom-opt.active');
      var pageSlider    = document.getElementById('pageSlider');

      var payload = {
        name,
        email,
        bookType:  typeRadio   ? typeRadio.value        : 'photo',
        cover:     activeCover ? activeCover.dataset.val : 'hardcover',
        pageColor: activeColor ? activeColor.dataset.val : 'white',
        size:      activeSize  ? activeSize.dataset.val  : 'a4',
        pageCount: pageSlider  ? pageSlider.value        : 40,
        notes,
      };

      /* --- show processing state --- */
      placeBtn.innerHTML  = '<span>Processing…</span>';
      placeBtn.disabled   = true;

      post('/orders', payload)
        .then(function (res) {
          if (!res.success) throw new Error(res.error || 'Server error');

          placeBtn.innerHTML        = '✓ Added to Cart!';
          placeBtn.style.background = 'linear-gradient(135deg,#3a8a3a,#60c060)';
          placeBtn.disabled         = true;

          /* ── ADD ORDER TO CART ── */
          var savedOrder = res.order || Object.assign({}, payload, { id: res.orderId, status: 'received', createdAt: new Date().toISOString() });
          addToCart(savedOrder);

          toast('🛒 Order #' + res.orderId.substring(0,8).toUpperCase() + ' added to your cart!', 'success');

          /* Inject "Go to Cart" + "New Order" buttons */
          var backBtn = document.querySelector('#panel-4 .panel-nav .btn-ghost');
          if (backBtn) {
            backBtn.classList.remove('prev-step');
            backBtn.removeAttribute('data-prev');
            backBtn.textContent = '＋ New Order';
            backBtn.onclick = function (e) {
              e.stopImmediatePropagation();
              location.reload();
            };
          }

          /* Add a "View Cart & Pay" button next to Place Order */
          if (!document.getElementById('bc-goto-cart-btn')) {
            var cartBtn = document.createElement('a');
            cartBtn.id   = 'bc-goto-cart-btn';
            cartBtn.href = 'cart.html';
            cartBtn.style.cssText =
              'display:inline-flex;align-items:center;gap:0.5rem;' +
              'background:linear-gradient(135deg,#c9973b,#f0c96a);' +
              'color:#1a1008;border:none;border-radius:50px;' +
              'padding:0.75rem 1.5rem;font-size:0.9rem;font-weight:700;' +
              'cursor:pointer;text-decoration:none;' +
              'animation:none;margin-top:0.5rem;';
            cartBtn.textContent = '🛒 View Cart & Pay →';
            placeBtn.parentNode.appendChild(cartBtn);
          }
        })
        .catch(function (e) {
          placeBtn.innerHTML = '<span>Place Order</span>';
          placeBtn.disabled  = false;
          placeBtn.style.background = '';
          toast('❌ ' + e.message, 'error');
          console.error('[ORDER]', e);
        });
    });
  });

  /* ════════════════════════════════════
     2. RESERVATION – "Reserve My Session"
     ════════════════════════════════════ */
  ready(function () {
    var btn = document.getElementById('reserveBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var section  = document.getElementById('reservation');
      var inputs   = section ? section.querySelectorAll('.form-input') : [];
      var name  = inputs[0] ? inputs[0].value.trim() : '';
      var email = inputs[1] ? inputs[1].value.trim() : '';
      var date  = inputs[2] ? inputs[2].value.trim() : '';
      var time  = inputs[3] ? inputs[3].value.trim() : '';
      var notes = inputs[4] ? inputs[4].value.trim() : '';

      if (!name)  { toast('Please enter your name.',  'error'); return; }
      if (!email) { toast('Please enter your email.', 'error'); return; }
      if (!date)  { toast('Please choose a date.',    'error'); return; }
      if (!time)  { toast('Please choose a time.',    'error'); return; }

      var original = btn.textContent;
      btn.textContent = 'Booking…';
      btn.disabled    = true;

      post('/reservations', { name, email, date, time, notes })
        .then(function (res) {
          if (!res.success) throw new Error(res.error || 'Server error');
          btn.textContent = '✓ Session Reserved!';
          btn.style.background = 'linear-gradient(135deg,#3a8a3a,#60c060)';
          toast('📅 Session booked for ' + date + ' at ' + time + '!', 'success');
        })
        .catch(function (e) {
          btn.textContent = original;
          btn.disabled    = false;
          btn.style.background = '';
          toast('❌ ' + e.message, 'error');
        });
    });
  });

  /* ════════════════════════════════════
     3. CONTACT FORM – "Send Message"
     ════════════════════════════════════ */
  ready(function () {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var inputs  = form.querySelectorAll('.form-input');
      var name    = inputs[0] ? inputs[0].value.trim() : '';
      var email   = inputs[1] ? inputs[1].value.trim() : '';
      var subject = inputs[2] ? inputs[2].value.trim() : '';
      var message = inputs[3] ? inputs[3].value.trim() : '';

      if (!name || !email || !message) {
        toast('Please fill in all required fields.', 'error'); return;
      }

      var submitBtn = document.getElementById('contactSubmitBtn');
      var original  = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.innerHTML = '<span>Sending…</span>';
        submitBtn.disabled  = true;
      }

      post('/contact', { name, email, subject, message })
        .then(function (res) {
          if (!res.success) throw new Error(res.error || 'Server error');
          if (submitBtn) {
            submitBtn.innerHTML = '✓ Message Sent!';
            submitBtn.style.background = 'linear-gradient(135deg,#3a8a3a,#60c060)';
          }
          toast('📨 Message sent! We\'ll reply within 24 hours.', 'success');
          form.reset();
          setTimeout(function () {
            if (submitBtn) {
              submitBtn.innerHTML = original;
              submitBtn.disabled  = false;
              submitBtn.style.background = '';
            }
          }, 3000);
        })
        .catch(function (e) {
          if (submitBtn) {
            submitBtn.innerHTML = original;
            submitBtn.disabled  = false;
            submitBtn.style.background = '';
          }
          toast('❌ ' + e.message, 'error');
        });
    });
  });

  /* ════════════════════════════════════
     4. REVIEW FORM – submit
     ════════════════════════════════════ */
  ready(function () {
    var submitBtn = document.getElementById('submitReviewBtn');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', function () {
      var form      = document.getElementById('reviewForm');
      if (!form) return;
      var inputs    = form.querySelectorAll('input');
      var textarea  = form.querySelector('textarea');
      var nameVal   = inputs[0] ? inputs[0].value.trim() : '';
      var bookVal   = inputs[1] ? inputs[1].value.trim() : '';
      var textVal   = textarea  ? textarea.value.trim()  : '';
      var starSpans = document.querySelectorAll('#starInput span');
      var rating    = 0;
      starSpans.forEach(function (s) {
        if (s.style.color === 'rgb(201, 151, 59)') rating++;
      });

      if (!rating || !nameVal || !textVal) return;

      post('/reviews', { name: nameVal, bookTitle: bookVal, rating, text: textVal })
        .catch(function (e) { console.warn('[REVIEW API]', e.message); });
    }, false);
  });

  /* ════════════════════════════════════
     5. Chatbot launcher → live chat btn
     Handled by project.js → bc_openChat()
     ════════════════════════════════════ */

  /* ════════════════════════════════════
     6. Init cart badge on load
     ════════════════════════════════════ */
  ready(function () { updateCartBadge(); });

})();
