/* ════════════════════════════════════════════
   BindCraft – review-fix.js
   Add LAST in your HTML before </body>:
   <script src="review-fix.js"></script>
   ════════════════════════════════════════════ */

(function () {

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {

    /* ── Elements ── */
    var writeBtn   = document.getElementById('writeReviewBtn');
    var form       = document.getElementById('reviewForm');
    var starWrap   = document.getElementById('starInput');
    var oldSubmit  = document.getElementById('submitReviewBtn');

    if (!writeBtn || !form || !starWrap || !oldSubmit) return;

    /* ── Clone submit button to kill ALL old listeners ── */
    var submitBtn = oldSubmit.cloneNode(true);
    oldSubmit.parentNode.replaceChild(submitBtn, oldSubmit);

    /* ── Star rating state ── */
    var currentRating = 0;
    var starSpans = starWrap.querySelectorAll('span');

    /* Re-attach star interactions cleanly */
    starSpans.forEach(function (star) {
      /* Clone each star to wipe old listeners */
      var newStar = star.cloneNode(true);
      star.parentNode.replaceChild(newStar, star);
    });

    /* Re-grab after cloning */
    starSpans = starWrap.querySelectorAll('span');

    starSpans.forEach(function (star) {
      star.style.cursor = 'pointer';
      star.style.fontSize = '2rem';
      star.style.color = 'rgba(201,151,59,0.25)';
      star.style.transition = 'color 0.15s ease';

      star.addEventListener('mouseenter', function () {
        var n = parseInt(star.dataset.star, 10);
        starSpans.forEach(function (s) {
          s.style.color = parseInt(s.dataset.star, 10) <= n
            ? '#c9973b' : 'rgba(201,151,59,0.25)';
        });
      });

      star.addEventListener('mouseleave', function () {
        starSpans.forEach(function (s) {
          s.style.color = parseInt(s.dataset.star, 10) <= currentRating
            ? '#c9973b' : 'rgba(201,151,59,0.25)';
        });
      });

      star.addEventListener('click', function () {
        currentRating = parseInt(star.dataset.star, 10);
        starSpans.forEach(function (s) {
          s.style.color = parseInt(s.dataset.star, 10) <= currentRating
            ? '#c9973b' : 'rgba(201,151,59,0.25)';
        });
      });
    });

    /* ── Write Review toggle ── */
    var newWriteBtn = writeBtn.cloneNode(true);
    writeBtn.parentNode.replaceChild(newWriteBtn, writeBtn);
    writeBtn = newWriteBtn;

    writeBtn.addEventListener('click', function () {
      var isOpen = form.classList.contains('open');
      if (isOpen) {
        form.classList.remove('open');
        writeBtn.textContent = 'Write a Review';
      } else {
        form.classList.add('open');
        writeBtn.textContent = '✕ Cancel';
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    /* ── Toast helper ── */
    function showToast(msg, type) {
      var t = document.getElementById('toast');
      if (t) {
        t.textContent = msg;
        t.className = 'toast ' + (type || '') + ' show';
        setTimeout(function () { t.classList.remove('show'); }, 3500);
      }
    }

    /* ── Reset form helper ── */
    function resetForm() {
      /* Clear all inputs and textarea inside the form */
      form.querySelectorAll('input, textarea').forEach(function (el) {
        el.value = '';
      });

      /* Reset stars */
      currentRating = 0;
      starSpans.forEach(function (s) {
        s.style.color = 'rgba(201,151,59,0.25)';
      });

      /* Close form */
      form.classList.remove('open');
      writeBtn.textContent = '✍️ Write a Review';
    }

    /* ── Submit handler ── */
    submitBtn.addEventListener('click', function () {

      /* Collect values */
      var inputs   = form.querySelectorAll('input');
      var textarea = form.querySelector('textarea');
      var nameVal  = inputs[0] ? inputs[0].value.trim() : '';
      var bookVal  = inputs[1] ? inputs[1].value.trim() : '';
      var textVal  = textarea  ? textarea.value.trim()  : '';

      /* Validate */
      if (!currentRating) {
        showToast('⭐ Please select a star rating first.', 'error');
        return;
      }
      if (!nameVal) {
        showToast('Please enter your name.', 'error');
        return;
      }
      if (!textVal) {
        showToast('Please write your review text.', 'error');
        return;
      }

      /* Build stars string */
      var starsHTML = '';
      for (var i = 1; i <= 5; i++) {
        starsHTML += i <= currentRating ? '★' : '☆';
      }

      /* Inject new review card at the front of the carousel */
      var track = document.getElementById('reviewsTrack');
      if (track) {
        var card = document.createElement('div');
        card.className = 'review-card';
        card.style.cssText = 'animation:panel-in 0.4s ease both;';
        card.innerHTML =
          '<div class="review-stars" style="color:#c9973b;font-size:1.1rem;letter-spacing:2px">' + starsHTML + '</div>' +
          '<div class="review-text">\u201c' + escapeHTML(textVal) + '\u201d</div>' +
          '<div class="review-author">' +
            '<div class="review-avatar" style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#c9973b,#f0c96a);display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;color:#1a1008;flex-shrink:0;">' +
              escapeHTML(nameVal.charAt(0).toUpperCase()) +
            '</div>' +
            '<div>' +
              '<div class="review-name">' + escapeHTML(nameVal) + '</div>' +
              '<div class="review-book">' + escapeHTML(bookVal || 'BindCraft Book') + '</div>' +
            '</div>' +
          '</div>';

        track.insertBefore(card, track.firstChild);
      }

      /* Toast & reset */
      showToast('🌟 Thank you, ' + nameVal + '! Your review has been added.', 'success');
      resetForm();
    });

    /* ── HTML escape helper ── */
    function escapeHTML(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

  });

})();