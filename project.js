/* ════════════════════════════════════════════
   BindCraft – script.js
   ════════════════════════════════════════════ */

'use strict';

/* ── DATA ── */
const DESIGNS = [
  { id: 1, cat: 'photo', title: 'Wanderlust', desc: 'Travel memories in a lay-flat panoramic format.', price: '₹1499', badge: 'Bestseller', img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=90' },
  { id: 2, cat: 'album', title: 'Timeless Vows', desc: 'Heirloom wedding albums with leather binding.', price: '₹2999', badge: 'Popular', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=90' },
  { id: 3, cat: 'journal', title: 'Mindful Pages', desc: 'Dot-grid journal with guided prompts.', price: '₹1999', badge: null, img: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=90' },
  { id: 4, cat: 'corporate', title: 'Brand Legacy', desc: 'Impress clients with premium brand books.', price: '₹2499', badge: 'New', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=90' },
  { id: 5, cat: 'photo', title: 'Family Chapters', desc: 'Multi-generation family photo collections.', price: '₹2999', badge: null, img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=90' },
  { id: 6, cat: 'album', title: 'Golden Years', desc: 'Anniversary albums in gold-foiled covers.', price: '₹2999', badge: 'Premium', img: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&q=90' },
  { id: 7, cat: 'journal', title: 'Writer\'s Keep', desc: 'Lined journal with a ribbon bookmark.', price: '₹999', badge: null, img: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=600&q=90' },
  { id: 8, cat: 'corporate', title: 'Annual Report', desc: 'Full-color glossy annual reports.', price: '₹2099', badge: 'B2B', img: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=90' },
  { id: 9, cat: 'photo', title: 'Baby Milestones', desc: 'Cherish every first moment in stunning print.', price: '₹1799', badge: '✨ New', img: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=600&q=90' },
];

const PRICES_SOFT = [
  { name: 'Starter', amount: 999, suffix: '/book', desc: 'Perfect for small gifts and journals.', features: ['Up to 40 pages', 'A5 or A4 size', '3 paper stocks', 'Digital proof review', null, null], featured: false },
  { name: 'Story', amount: 1599, suffix: '/book', desc: 'Our most popular photo book package.', features: ['Up to 100 pages', 'All sizes', '15 paper stocks', 'Digital proof review', 'Free spine text', 'Free gift wrapping'], featured: true },
  { name: 'Heirloom', amount: 1299, suffix: '/book', desc: 'Luxury books that last generations.', features: ['Up to 200 pages', 'All sizes + panoramic', '50+ paper stocks', 'Print manager assigned', 'Gold foil option', 'Express shipping'], featured: false },
];
const PRICES_HARD = [
  { name: 'Starter', amount: 1199, suffix: '/book', desc: 'Perfect for small gifts and journals.', features: ['Up to 40 pages', 'A5 or A4 size', '3 paper stocks', 'Digital proof review', null, null], featured: false },
  { name: 'Story', amount: 1499, suffix: '/book', desc: 'Our most popular photo book package.', features: ['Up to 100 pages', 'All sizes', '15 paper stocks', 'Digital proof review', 'Free spine text', 'Free gift wrapping'], featured: true },
  { name: 'Heirloom', amount: 1599, suffix: '/book', desc: 'Luxury books that last generations.', features: ['Up to 200 pages', 'All sizes + panoramic', '50+ paper stocks', 'Print manager assigned', 'Gold foil option', 'Express shipping'], featured: false },
];

const REVIEWS = [
  { stars: 5, text: 'Absolutely breathtaking quality. My wedding album is exactly what I dreamed of — the colors are vivid, the binding is solid, and it arrived beautifully packaged.', name: 'Sophia M.', book: 'Timeless Vows album', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { stars: 5, text: 'I ordered a travel photo book and was blown away. The lay-flat pages are perfect for panoramic shots. Already ordered three more for family members.', name: 'James K.', book: 'Wanderlust Photo Book', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
  { stars: 5, text: 'The corporate brand book we received was exceptional. Clients were genuinely impressed at our pitch. Will be ordering yearly editions.', name: 'Rachel T.', book: 'Brand Legacy book', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
  { stars: 4, text: 'Love the dot-grid journal. Paper quality is superb — fountain pen ink doesn\'t bleed at all. The linen cover is beautiful.', name: 'David R.', book: 'Mindful Pages Journal', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
  { stars: 5, text: 'Gifted the Golden Years album to my parents for their anniversary. They cried. Perfect craftsmanship and it arrived exactly on time.', name: 'Priya N.', book: 'Golden Years Album', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&q=80' },
  { stars: 5, text: 'Third year ordering from BindCraft. Consistent quality, responsive team, and the paper selection is unmatched.', name: 'Marco V.', book: 'Family Chapters', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80' },
];

const PAPER_SWATCHES = [
  { name: 'Classic White', color: '#ffffff', note: 'Bright white — crisp, clean, professional',background: '#ffffff'},
  { name: 'Warm Cream', color: '#fdf6e3', note: 'Warm cream — cosy, vintage, timeless',background:'#fdf6e3' },
  { name: 'Natural Ivory', color: '#f5ead8', note: 'Natural ivory — earthy, organic feel',background: '#f5ead8'},
  { name: 'Parchment', color: '#ede0c4', note: 'Parchment — heritage, aged elegance' , background:'#ede0c4'},
  { name: 'Blush', color: '#fde8e8', note: 'Blush — romantic and delicate',background:'#fde8e8' },
  { name: 'Sage', color: '#e8f0e8', note: 'Sage — calm, nature-inspired',background: '#e8f0e8'},
  { name: 'Steel Blue', color: '#e0e8f0', note: 'Steel blue — modern and cool' ,background:'#e0e8f0'},
  { name: 'Slate Grey', color: '#e4e4e8', note: 'Slate grey — minimal and refined',background: '#e4e4e8' },
  { name: 'Sand', color: '#f0e8d0', note: 'Sand — travel-inspired warmth' ,background: '#f0e8d0'},
  { name: 'Midnight', color: '#1a1a2e', note: 'Midnight — dramatic luxury' ,background:'#1a1a2e'},
];

/* ── STATE ── */
const state = {
  currentStep: 1,
  selectedType: null,
  selectedCover: 'hardcover',
  selectedPageColor: 'white',
  selectedSize: 'a4',
  pageCount: 40,
  uploadedFiles: [],
  reviewRating: 0,
  carouselIndex: 0,
  isHardcover: true,
};

/* ── HELPERS ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function showToast(msg, type = '') {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3500);
}

function openModal(html) {
  $('#modalContent').innerHTML = html;
  $('#modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('#modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
// Pre-selects book type in the Order form, closes modal, scrolls to #order
window._customiseDesign = function(bookType) {
  closeModal();

  // Small delay so modal closes before scroll
  setTimeout(() => {
    // 1. Scroll to order section
    const orderSection = document.getElementById('order');
    if (orderSection) orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 2. Go to step 1
    $$('.order-panel').forEach(p => p.classList.remove('active'));
$('#panel-1').classList.add('active');
$$('.step').forEach(s => s.classList.remove('active', 'done'));
$$('.step[data-step="1"]').forEach(s => s.classList.add('active'));

    // 3. Select the matching radio card
    const radio = document.querySelector(`input[name="bookType"][value="${bookType}"]`);
    if (radio) {
      radio.checked = true;
      state.selectedType = bookType;
      // Highlight the type-card visually
      $$('.type-card').forEach(tc => tc.classList.remove('selected'));
      radio.closest('.type-card')?.classList.add('selected');
    }

    // 4. Flash the selected card so the user sees it was pre-picked
    setTimeout(() => {
      const selected = radio?.closest('.type-card');
      if (selected) {
        selected.style.transition = 'box-shadow 0.3s ease';
        selected.style.boxShadow = '0 0 0 3px #f0c96a';
        setTimeout(() => { selected.style.boxShadow = ''; }, 1200);
      }
    }, 600);
  }, 300);
};

/* ── CURSOR ── */
(function initCursor() {
  const cursor = $('#cursor');
  const follower = $('#cursorFollower');
  if (!cursor || window.matchMedia('(hover: none)').matches) return;

  let mx = -100, my = -100, fx = -100, fy = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  (function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(animateFollower);
  })();
})();

/* ── PARTICLE CANVAS ── */
(function initParticles() {
  const canvas = $('#particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor(W * H / 18000), 80);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() < 0.5 ? `rgba(201,151,59,` : `rgba(240,201,106,`
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.opacity + ')';
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); createParticles(); }, 200);
  });
})();

/* ── NAVBAR ── */
(function initNavbar() {
  const nav = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  $$('.nav-link, .nav-cta', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active nav highlight on scroll
  const sections = $$('section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        $$('.nav-link').forEach(l => l.classList.remove('active'));
        const active = $(`.nav-link[href="#${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
})();

/* ── REVEAL ON SCROLL ── */
(function initReveal() {
  const els = $$('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ── COUNTER ANIMATION ── */
(function initCounters() {
  const counters = $$('.stat-num[data-target]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.target;
      const duration = 1800;
      const start = performance.now();
      const easeOut = t => 1 - Math.pow(1 - t, 3);

      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(easeOut(t) * target).toLocaleString();
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
})();

/* ── QUALITY BARS ── */
(function initQualityBars() {
  const bars = $$('.quality-fill');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.width + '%';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  bars.forEach(b => io.observe(b));
})();

/* ── PAPER PALETTE ── */
(function initPalette() {
  const container = $('#paletteSwatch');
  const note = $('#paletteNote');
  if (!container) return;

  PAPER_SWATCHES.forEach((sw, i) => {
    const div = document.createElement('div');
    div.className = 'swatch' + (i === 0 ? ' active' : '');
    div.style.background = sw.color;
    div.title = sw.name;
    div.setAttribute('data-note', sw.note);

    div.addEventListener('mouseenter', () => {
      note.textContent = `${sw.name} — ${sw.note}`;
      note.style.color = 'var(--gold-dark)';
    });
    div.addEventListener('mouseleave', () => {
      note.textContent = 'Hover a swatch to preview';
      note.style.color = '';
    });
    div.addEventListener('click', () => {
  $$('.swatch').forEach(s => s.classList.remove('active'));
  div.classList.add('active');

  // Change website background theme
  document.body.style.background = sw.background;

  // Update section backgrounds
  const sections = document.querySelectorAll(
    '.about, .quality, .contact, .reviews, .designs'
  );

  sections.forEach(section => {
    section.style.background = sw.background;
  });

  // Change text color for dark themes
  if (sw.name === 'Midnight') {
    document.body.style.color = '#ffffff';

    sections.forEach(section => {
      section.style.color = '#ffffff';
    });
  } else {
    document.body.style.color = '';

    sections.forEach(section => {
      section.style.color = '';
    });
  }
});
    container.appendChild(div);
  });
})();

/* ── DESIGNS GRID ── */
(function initDesigns() {
  const grid = $('#designsGrid');
  if (!grid) return;

  function renderCards(filter = 'all') {
    const filtered = filter === 'all' ? DESIGNS : DESIGNS.filter(d => d.cat === filter);
    grid.innerHTML = '';
    const catIcons = { photo: '📷', album: '💍', journal: '✍️', corporate: '💼' };
    filtered.forEach((d, i) => {
      const card = document.createElement('div');
      card.className = 'design-card reveal';
      card.dataset.cat = d.cat;
      card.style.transitionDelay = (i * 0.07) + 's';
      card.innerHTML = `
        <div class="design-card-img">
          ${d.badge ? `<div class="design-card-badge">${d.badge}</div>` : ''}
          <div class="design-card-cat-pill">${catIcons[d.cat] || '✦'} ${d.cat}</div>
          <img src="${d.img}" alt="${d.title}" loading="lazy"/>
          <div class="design-card-img-overlay"></div>
        </div>
        <div class="design-card-body">
          <div class="design-card-title">${d.title}</div>
          <div class="design-card-desc">${d.desc}</div>
          <div class="design-card-footer">
            <div class="design-card-price-wrap">
              <span class="design-card-from">from</span>
              <div class="design-card-price">${d.price}</div>
            </div>
            <button class="design-card-btn" data-id="${d.id}" data-cat="${d.cat}">Customise →</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
      setTimeout(() => {
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
          });
        }, { threshold: 0.1 });
        io.observe(card);
      }, 10);
      card.querySelector('.design-card-btn').addEventListener('click', (evt) => {
        evt.stopPropagation();
        openModal(`
          <div style="text-align:center">
            <img src="${d.img}" alt="${d.title}" style="width:100%;height:220px;object-fit:cover;border-radius:14px;margin-bottom:1.5rem;box-shadow:0 8px 32px rgba(0,0,0,0.15)"/>
            <div class="section-tag">✦ ${d.cat.toUpperCase()}</div>
            <h2 style="font-family:var(--font-display);font-size:1.75rem;margin:0.5rem 0;color:var(--ink)">${d.title}</h2>
            <p style="color:rgba(58,42,18,0.65);margin-bottom:1.5rem">${d.desc}</p>
            <p style="font-family:var(--font-display);font-size:2rem;background:var(--grad-gold);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Starting from ${d.price}</p>
            <button id="bc-modal-go" data-cat="${d.cat}" style="display:inline-flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,#c9973b,#f0c96a);color:#1a1008;font-weight:700;padding:.875rem 1.75rem;border-radius:50px;margin-top:1.5rem;font-size:.9rem;cursor:pointer;border:none;font-family:inherit">Customise This Style →</button>
          </div>
        `);
        setTimeout(() => {
          const goBtn = document.getElementById('bc-modal-go');
          if (goBtn) {
            goBtn.addEventListener('click', () => {
              closeModal();
              const radio = document.querySelector(`input[name="bookType"][value="${d.cat}"]`);
              if (radio) { radio.checked = true; if (typeof state !== 'undefined') state.selectedType = d.cat; }
              setTimeout(() => {
                document.querySelectorAll('.order-panel').forEach(p => p.classList.remove('active'));
                document.getElementById('panel-1').classList.add('active');
                document.querySelectorAll('.step').forEach(s => { s.classList.remove('active','done'); if(s.dataset.step==='1') s.classList.add('active'); });
                document.getElementById('order').scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 350);
            });
          }
        }, 50);
      });
    });
  }

  renderCards();

  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCards(btn.dataset.filter);
    });
  });
})();

/* ── PRICING ── */
(function initPricing() {
  const grid = $('#pricingGrid');
  if (!grid) return;

  function renderPricing(prices) {
    grid.innerHTML = '';
    prices.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'pricing-card reveal' + (p.featured ? ' featured' : '');
      card.style.transitionDelay = (i * 0.08) + 's';
      card.innerHTML = `
        ${p.featured ? '<div class="featured-badge">✦ Most Popular</div>' : ''}
        <div class="pricing-name">${p.name}</div>
        <div class="pricing-price">
          <span class="amount">₹${p.amount.toLocaleString('en-IN')}</span>
          <span class="suffix">${p.suffix}</span>
        </div>
        <div class="pricing-desc">${p.desc}</div>
        <ul class="pricing-features">
          ${p.features.map(f => f ? `<li>${f}</li>` : `<li class="not">Not included</li>`).join('')}
        </ul>
        <a href="#order" class="btn-primary" style="margin-top:auto;justify-content:center;">Choose ${p.name}</a>
      `;
      grid.appendChild(card);
      setTimeout(() => {
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
        }, { threshold: 0.1 });
        io.observe(card);
      }, 10);
    });
  }

  /* Button-based toggle */
  window.switchCover = function(type) {
    const softBtn = document.getElementById('ptoggle-soft');
    const hardBtn = document.getElementById('ptoggle-hard');
    if (type === 'hard') {
      softBtn && softBtn.classList.remove('ptoggle-active');
      hardBtn && hardBtn.classList.add('ptoggle-active');
      state.isHardcover = true;
      renderPricing(PRICES_HARD);
    } else {
      hardBtn && hardBtn.classList.remove('ptoggle-active');
      softBtn && softBtn.classList.add('ptoggle-active');
      state.isHardcover = false;
      renderPricing(PRICES_SOFT);
    }
  };

  renderPricing(PRICES_SOFT);

  /* Legacy toggle fallback */
  const toggle = $('#pricingToggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      window.switchCover(toggle.checked ? 'hard' : 'soft');
    });
  }
})();

/* ── ORDER STEPPER ── */
(function initOrderStepper() {
  function goToStep(n) {
    if (n < 1 || n > 4) return;
    // Validate step 1
    if (n > 1 && !document.querySelector('input[name="bookType"]:checked')) {
      showToast('Please select a book type first.', 'error'); return;
    }
    state.currentStep = n;

    $$('.order-panel').forEach(p => p.classList.remove('active'));
    $(`#panel-${n}`).classList.add('active');

    $$('.step').forEach(s => {
      const sn = +s.dataset.step;
      s.classList.remove('active', 'done');
      if (sn === n) s.classList.add('active');
      if (sn < n) s.classList.add('done');
    });

    if (n === 4) buildSummary();
    $('section#order').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $$('.next-step').forEach(btn => btn.addEventListener('click', () => goToStep(+btn.dataset.next)));
  $$('.prev-step').forEach(btn => btn.addEventListener('click', () => goToStep(+btn.dataset.prev)));
  $$('.step').forEach(s => s.addEventListener('click', () => goToStep(+s.dataset.step)));

  // Custom option toggles
  $$('[id$="Options"]').forEach(group => {
    $$('.custom-opt', group).forEach(opt => {
      opt.addEventListener('click', () => {
        $$('.custom-opt', group).forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const key = group.id === 'coverOptions' ? 'selectedCover'
          : group.id === 'pageColorOptions' ? 'selectedPageColor'
          : 'selectedSize';
        state[key] = opt.dataset.val;

        /* For color swatches, show the name as a brief toast hint */
        if (opt.classList.contains('swatch-opt') && opt.title) {
          const label = document.getElementById('bc-swatch-label');
          if (label) {
            label.textContent = opt.title;
            label.style.opacity = '1';
            clearTimeout(label._t);
            label._t = setTimeout(() => { label.style.opacity = '0'; }, 1800);
          }
        }
      });
    });
  });

  /* Inject swatch label element next to pageColorOptions */
  const pco = document.getElementById('pageColorOptions');
  if (pco && !document.getElementById('bc-swatch-label')) {
    const lbl = document.createElement('span');
    lbl.id = 'bc-swatch-label';
    lbl.style.cssText = 'font-size:0.75rem;color:rgba(253,248,240,0.6);margin-left:0.5rem;transition:opacity 0.4s ease;opacity:0;align-self:center;';
    pco.parentNode.insertBefore(lbl, pco.nextSibling);
  }

  // Page slider
  const slider = $('#pageSlider');
  const pageNum = $('#pageCount');
  if (slider) {
    slider.addEventListener('input', () => {
      state.pageCount = slider.value;
      pageNum.textContent = slider.value;
    });
  }

  // Book type
  $$('input[name="bookType"]').forEach(r => {
    r.addEventListener('change', () => { state.selectedType = r.value; });
  });

  function buildSummary() {
    const el = $('#confirmSummary');
    const typeMap = { photo: 'Photo Book', journal: 'Journal', album: 'Wedding Album', corporate: 'Corporate Book' };
    const basePrice = state.isHardcover ? 89 : 59;
    const pageExtra = Math.max(0, Math.round((state.pageCount - 40) / 10) * 3);
    const total = basePrice + pageExtra;

    el.innerHTML = `
      <div class="summary-row"><span class="summary-key">Book Type:</span><span class="summary-val">${typeMap[state.selectedType] || 'Not selected'}</span></div>
      <div class="summary-row"><span class="summary-key">Cover:</span><span class="summary-val">${state.selectedCover}</span></div>
      <div class="summary-row"><span class="summary-key">Page Color:</span><span class="summary-val">${state.selectedPageColor}</span></div>
      <div class="summary-row"><span class="summary-key">Size:</span><span class="summary-val">${state.selectedSize.toUpperCase()}</span></div>
      <div class="summary-row"><span class="summary-key">Pages:</span><span class="summary-val">${state.pageCount}</span></div>
      <div class="summary-row"><span class="summary-key">Photos:</span><span class="summary-val">${state.uploadedFiles.length} uploaded</span></div>
      <div class="summary-price">Estimated Total: <strong>$${total}</strong></div>
    `;
  }
  $('#placeOrderBtn').addEventListener('click', () => {
    const btn = $('#placeOrderBtn');

    // Validate name and email
    const nameInput = $('#panel-4 input[type="text"]');
    const emailInput = $('#panel-4 input[type="email"]');
    if (nameInput && !nameInput.value.trim()) {
      showToast('Please enter your full name.', 'error'); return;
    }
    if (emailInput && !emailInput.value.trim()) {
      showToast('Please enter your email address.', 'error'); return;
    }

    btn.innerHTML = '<span>Processing…</span>';
    btn.disabled = true;

    setTimeout(() => {
      // Show success state
      btn.innerHTML = '✓ Order Placed!';
      btn.style.background = 'linear-gradient(135deg, #3a8a3a, #60c060)';
      showToast('🎉 Order placed! Check your email for confirmation.', 'success');

      // Replace the Back button with a "Start New Order" button so user can't go back
      const panelNav = $('#panel-4 .panel-nav');
      const backBtn = panelNav ? panelNav.querySelector('.prev-step') : null;
      if (backBtn) {
        backBtn.textContent = '＋ New Order';
        backBtn.classList.remove('prev-step');
        backBtn.removeAttribute('data-prev');
        backBtn.classList.add('bc-new-order-btn');
      }

      // Disable place order button permanently for this session
      setTimeout(() => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'default';
      }, 500);

    }, 2000);
  });

  // Handle "New Order" click — reset everything
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('bc-new-order-btn')) {
      // Reset state
      state.selectedType = null;
      state.selectedCover = 'hardcover';
      state.selectedPageColor = 'white';
      state.selectedSize = 'a4';
      state.pageCount = 40;
      state.uploadedFiles = [];

      // Uncheck book type radios
      document.querySelectorAll('input[name="bookType"]').forEach(r => r.checked = false);

      // Reset customise options
      document.querySelectorAll('#coverOptions .custom-opt').forEach((o,i) => o.classList.toggle('active', i===0));
      document.querySelectorAll('#pageColorOptions .custom-opt').forEach((o,i) => o.classList.toggle('active', i===0));
      document.querySelectorAll('#sizeOptions .custom-opt').forEach((o,i) => o.classList.toggle('active', i===0));
      const slider = document.getElementById('pageSlider');
      const pageNum = document.getElementById('pageCount');
      if (slider) slider.value = 40;
      if (pageNum) pageNum.textContent = '40';

      // Clear uploads
      const preview = document.getElementById('uploadPreview');
      if (preview) preview.innerHTML = '';

      // Clear confirm form inputs
      document.querySelectorAll('#panel-4 .form-input').forEach(i => i.value = '');

      // Restore Back button
      const backBtn = document.querySelector('.bc-new-order-btn');
      if (backBtn) {
        backBtn.textContent = '← Back';
        backBtn.classList.remove('bc-new-order-btn');
        backBtn.classList.add('prev-step');
        backBtn.setAttribute('data-prev', '3');
      }

      // Restore Place Order button
      const placeBtn = document.getElementById('placeOrderBtn');
      if (placeBtn) {
        placeBtn.innerHTML = '<span>Place Order</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
        placeBtn.disabled = false;
        placeBtn.style.background = '';
        placeBtn.style.opacity = '';
        placeBtn.style.cursor = '';
      }

      // Go back to step 1
      document.querySelectorAll('.order-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('panel-1').classList.add('active');
      document.querySelectorAll('.step').forEach(s => {
        s.classList.remove('active', 'done');
        if (s.dataset.step === '1') s.classList.add('active');
      });

      document.getElementById('order').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  
})();
/* ════════════════════════════════════
     PAGE COLOR THEME SWITCHER
     Changes website background when user
     clicks a paper swatch
  ════════════════════════════════════ */
  (function initThemeSwitcher() {
    const THEME_MAP = {
      'Classic White':  { cls: '',              bg: '#fffdf8', accent: 'rgba(201,151,59,0.08)' },
      'Warm Cream':     { cls: 'theme-cream',   bg: '#fdf6e3', accent: 'rgba(201,151,59,0.12)' },
      'Natural Ivory':  { cls: 'theme-cream',   bg: '#f5ead8', accent: 'rgba(201,151,59,0.1)'  },
      'Parchment':      { cls: 'theme-cream',   bg: '#ede0c4', accent: 'rgba(154,112,40,0.15)' },
      'Blush':          { cls: 'theme-blush',   bg: '#fff0f0', accent: 'rgba(212,96,122,0.08)' },
      'Sage':           { cls: 'theme-sage',    bg: '#f0f5f0', accent: 'rgba(58,138,138,0.08)' },
      'Steel Blue':     { cls: 'theme-grey',    bg: '#e8eef5', accent: 'rgba(58,138,180,0.08)' },
      'Slate Grey':     { cls: 'theme-grey',    bg: '#f0f0f4', accent: 'rgba(100,100,120,0.08)'},
      'Sand':           { cls: 'theme-sand',    bg: '#f5f0e8', accent: 'rgba(180,150,80,0.1)'  },
      'Midnight':       { cls: 'theme-midnight',bg: '#0d0d1a', accent: 'rgba(201,151,59,0.12)' },
    };

    const ALL_THEME_CLS = ['theme-cream','theme-blush','theme-sage','theme-grey','theme-sand','theme-midnight'];

    // Watch for swatch clicks — we hook into the existing palette init
    // by observing DOM changes on the swatch container
    const paletteContainer = document.getElementById('paletteSwatch');
    const previewBar = document.getElementById('palettePreviewBar');
    const paletteNote = document.getElementById('paletteNote');

    // Override: hook into click events after palette renders
    const observer = new MutationObserver(() => {
      const swatches = paletteContainer.querySelectorAll('.swatch');
      swatches.forEach(sw => {
        if (sw.dataset.themeHooked) return;
        sw.dataset.themeHooked = 'true';

        sw.addEventListener('click', () => {
          const name = sw.getAttribute('title');
          const theme = THEME_MAP[name];
          if (!theme) return;

          // Remove all theme classes
          document.body.classList.remove(...ALL_THEME_CLS);
          if (theme.cls) document.body.classList.add(theme.cls);

          // Animate bg change with a ripple flash
          const flash = document.createElement('div');
          flash.style.cssText = `
            position:fixed;inset:0;background:${theme.bg};
            pointer-events:none;z-index:9999;
            opacity:0;transition:opacity 0.4s ease;
          `;
          document.body.appendChild(flash);
          requestAnimationFrame(() => {
            flash.style.opacity = '0.35';
            setTimeout(() => {
              flash.style.opacity = '0';
              setTimeout(() => flash.remove(), 500);
            }, 200);
          });

          // Update preview bar color
          if (previewBar) {
            previewBar.style.background = theme.bg === '#0d0d1a'
              ? 'linear-gradient(135deg, #c9973b, #f0c96a)'
              : sw.style.background;
          }

          // Show toast
          const toastEl = document.getElementById('toast');
          if (toastEl) {
            toastEl.textContent = `🎨 Theme changed to "${name}"`;
            toastEl.className = 'toast show';
            setTimeout(() => toastEl.classList.remove('show'), 2500);
          }

          // Update note
          if (paletteNote) {
            paletteNote.style.color = 'var(--gold-dark)';
            paletteNote.textContent = `✨ Website theme set to "${name}" — beautiful choice!`;
            setTimeout(() => {
              paletteNote.style.color = '';
              paletteNote.textContent = 'Click a swatch to transform the website\'s look';
            }, 3000);
          }
        });
      });
    });

    observer.observe(paletteContainer, { childList: true });
  })();

/* ── FILE UPLOAD ── */
(function initUpload() {
  const area = $('#uploadArea');
  const input = $('#fileInput');
  const preview = $('#uploadPreview');
  if (!area || !input || !preview) return;

  function handleFiles(files) {
    [...files].forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        state.uploadedFiles.push({ name: file.name, src: e.target.result });
        renderPreviews();
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPreviews() {
    preview.innerHTML = '';
    state.uploadedFiles.forEach((f, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'preview-img-wrap';
      wrap.innerHTML = `
        <img src="${f.src}" alt="${f.name}"/>
        <div class="preview-remove" data-idx="${i}">✕</div>
      `;
      wrap.querySelector('.preview-remove').addEventListener('click', () => {
        state.uploadedFiles.splice(i, 1);
        renderPreviews();
      });
      preview.appendChild(wrap);
    });
  }

  area.addEventListener('click', () => input.click());
  input.addEventListener('change', () => handleFiles(input.files));

  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });
})();

/* ── REVIEWS CAROUSEL ── */
(function initReviews() {
  const track = $('#reviewsTrack');
  const dotsWrap = $('#carouselDots');
  if (!track) return;

  REVIEWS.forEach(r => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
      <div class="review-text">"${r.text}"</div>
      <div class="review-author">
        <div class="review-avatar"><img src="${r.avatar}" alt="${r.name}" loading="lazy"/></div>
        <div>
          <div class="review-name">${r.name}</div>
          <div class="review-book">${r.book}</div>
        </div>
      </div>
    `;
    track.appendChild(card);
  });

  const cards = $$('.review-card');
  const perView = () => window.innerWidth > 1024 ? 3 : window.innerWidth > 640 ? 2 : 1;
  const GAP = 24;

  function dotCount() { return Math.max(1, REVIEWS.length - perView() + 1); }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < dotCount(); i++) {
      const d = document.createElement('div');
      d.className = 'carousel-dot' + (i === state.carouselIndex ? ' active' : '');
      d.addEventListener('click', () => setSlide(i));
      dotsWrap.appendChild(d);
    }
  }

  function setSlide(i) {
    const pv = perView();
    const max = Math.max(0, cards.length - pv);
    state.carouselIndex = Math.max(0, Math.min(i, max));
    if (!cards[0]) return;
    const cardW = cards[0].offsetWidth + GAP;
    track.style.transform = `translateX(-${state.carouselIndex * cardW}px)`;
    $$('.carousel-dot').forEach((d, j) => d.classList.toggle('active', j === state.carouselIndex));
  }

  buildDots();

  const prevBtn = document.getElementById('prevReview');
  const nextBtn = document.getElementById('nextReview');
  if (prevBtn) prevBtn.addEventListener('click', () => setSlide(state.carouselIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => setSlide(state.carouselIndex + 1));
  window.addEventListener('resize', () => { buildDots(); setSlide(0); });

  // Auto-slide
  setInterval(() => setSlide((state.carouselIndex + 1) % dotCount()), 5500);

  // Swipe
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = tx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) setSlide(state.carouselIndex + (dx > 0 ? 1 : -1));
  });
})();

/* ── REVIEW FORM ── */
(function initReviewForm() {
  const btn = $('#writeReviewBtn');
  const form = $('#reviewForm');
  const stars = $$('#starInput span');
  const submitBtn = $('#submitReviewBtn');
  if (!btn || !form) return;

  btn.addEventListener('click', () => {
    form.classList.toggle('open');
    btn.textContent = form.classList.contains('open') ? '✕ Cancel' : '✍️ Write a Review';
  });

  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const n = +star.dataset.star;
      stars.forEach(s => s.classList.toggle('lit', +s.dataset.star <= n));
    });
    star.addEventListener('click', () => {
      state.reviewRating = +star.dataset.star;
      stars.forEach(s => s.classList.toggle('lit', +s.dataset.star <= state.reviewRating));
    });
  });
  $('#starInput').addEventListener('mouseleave', () => {
    stars.forEach(s => s.classList.toggle('lit', +s.dataset.star <= state.reviewRating));
  });

  submitBtn.addEventListener('click', () => {
    /* Validate star rating */
    if (!state.reviewRating) {
      showToast('Please select a star rating.', 'error');
      return;
    }

    /* Grab input values */
    const inputs = form.querySelectorAll('input.form-input');
    const nameVal  = inputs[0] ? inputs[0].value.trim() : '';
    const bookVal  = inputs[1] ? inputs[1].value.trim() : '';
    const textarea = form.querySelector('textarea.form-input');
    const textVal  = textarea ? textarea.value.trim() : '';

    /* Validate fields */
    if (!nameVal) { showToast('Please enter your name.', 'error'); return; }
    if (!textVal) { showToast('Please write your review.', 'error'); return; }

    /* Build and prepend new review card into the carousel */
    const track = document.getElementById('reviewsTrack');
    if (track) {
      const newCard = document.createElement('div');
      newCard.className = 'review-card';
      newCard.style.animation = 'panel-in 0.4s ease';
      newCard.innerHTML = `
        <div class="review-stars">${'★'.repeat(state.reviewRating)}${'☆'.repeat(5 - state.reviewRating)}</div>
        <div class="review-text">"${textVal}"</div>
        <div class="review-author">
          <div class="review-avatar" style="background:linear-gradient(135deg,#c9973b,#f0c96a);display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;color:#1a1008;">
            ${nameVal.charAt(0).toUpperCase()}
          </div>
          <div>
            <div class="review-name">${nameVal}</div>
            <div class="review-book">${bookVal || 'BindCraft Book'}</div>
          </div>
        </div>
      `;
      track.prepend(newCard);
    }

    /* Success toast */
    showToast('🌟 Thank you for your review!', 'success');

    /* Reset everything */
    state.reviewRating = 0;
    stars.forEach(s => s.classList.remove('lit'));
    form.querySelectorAll('input.form-input').forEach(i => i.value = '');
    if (textarea) textarea.value = '';

    /* Close form and restore button */
    form.classList.remove('open');
    btn.textContent = '✍️ Write a Review';
  });
})();

/* ── RESERVATION ── */
(function initReservation() {
  const btn = $('#reserveBtn');
  if (!btn) return;

  // Set min date to today
  const dateInput = $('#resDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
  // Initialize the smooth time picker
flatpickr("#resTime", {
  enableTime: true,          // Activates time selection
  noCalendar: true,          // Hides the calendar interface
  dateFormat: "h:i K",       // Outputs user-friendly time format (e.g., "1:45 PM")
  minuteIncrement: 5,        // Snap minutes by 5s for easier clicking (or change to 1)
  time_24hr: false,          // Uses clean 12-hour AM/PM toggles
  animate: true,             // Forces smooth opening transitions
});

  btn.addEventListener('click', () => {
  const date = $('#resDate').value;
  const rawTime = $('#resTime').value; // 1. Grabs the raw time (e.g., "14:30")

  // 2. Enhanced validation: Check if BOTH date and time are picked
  if (!date || !rawTime) { 
    showToast('Please select both a date and time for your visit.', 'error'); 
    return; 
  }

  // 3. Convert 24-hour string ("14:30") to a clean 12-hour AM/PM string ("2:30 PM")
  const [hours, minutes] = rawTime.split(':');
  const hourInt = parseInt(hours, 10);
  const ampm = hourInt >= 12 ? 'PM' : 'AM';
  const formattedHour = hourInt % 12 || 12; // Converts "00" or "13+" to 12-hour format
  const time = `${formattedHour}:${minutes} ${ampm}`;

  // --- Your remaining original code stays exactly the same ---
  btn.textContent = 'Booking...';
  btn.disabled = true;
  
  setTimeout(() => {
    btn.textContent = '✓ Session Reserved!';
    btn.style.background = 'linear-gradient(135deg, #3a8a3a, #60c060)';
    
    // This will now beautifully output your readable format!
    showToast(`📅 Session reserved for ${date} at ${time}!`, 'success');
    
    setTimeout(() => {
      btn.textContent = 'Reserve My Session';
      btn.disabled = false;
      btn.style.background = '';
    }, 3000);
  }, 1500);
});
})();

/* ── CONTACT FORM ── */
(function initContact() {
  const form = $('#contactForm');
  const btn = $('#contactSubmitBtn');
  if (!form) return;

  form.addEventListener('submit', () => {
    btn.innerHTML = '<span>Sending…</span>';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = '✓ Message Sent!';
      btn.style.background = 'linear-gradient(135deg, #3a8a3a, #60c060)';
      showToast('✉️ Message sent! We\'ll reply within 24 hours.', 'success');
      form.reset();
      setTimeout(() => {
        btn.innerHTML = 'Send Message <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
        btn.disabled = false;
        btn.style.background = '';
      }, 3000);
    }, 1800);
  });

  $('#liveChatBtn')?.addEventListener('click', () => {
    /* bc_openChat is exposed by chatbot.js after it initialises */
    if (typeof window.bc_openChat === 'function') {
      window.bc_openChat();
    } else {
      /* chatbot.js not ready yet — wait for it */
      document.addEventListener('bc:ready', function () {
        window.bc_openChat();
      }, { once: true });
    }
  });
})();

/* ── MODAL CLOSE ── */
$('#modalClose')?.addEventListener('click', closeModal);
$('#modalOverlay')?.addEventListener('click', e => { if (e.target === $('#modalOverlay')) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
window.closeModal = closeModal;

/* ── HOVER TILT ON CARDS ── */
(function initTilt() {
  $$('[data-hover="true"]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
      card.style.transform = `translateY(-6px) rotateX(${y}deg) rotateY(${x}deg)`;
      card.style.transformStyle = 'preserve-3d';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transformStyle = '';
    });
  });
})();

/* ── SMOOTH SCROLL ── */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── NAV ACTIVE STYLE ── */
document.head.insertAdjacentHTML('beforeend', `<style>.nav-link.active{color:var(--gold-light)!important}.nav-link.active::after{width:100%!important}</style>`);

/* ── PAGE LOAD ANIMATION ── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
});

/* ── LOGO LOADER DISMISS ── */
window.addEventListener('load', function () {
  var loader = document.getElementById('bc-loader');
  if (loader) {
    setTimeout(function () { loader.classList.add('hidden'); }, 700);
  }
});