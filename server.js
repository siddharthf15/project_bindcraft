/* ════════════════════════════════════════════
   BindCraft – server.js  (v2 — with Auth)
   Node.js / Express backend

   Setup:
     npm install
     node server.js        (or: npm start)

   NEW in v2:
     POST /api/auth/register   — create account
     POST /api/auth/login      — sign in, get JWT
     GET  /api/auth/me         — get current user (JWT required)
     PUT  /api/auth/me         — update profile   (JWT required)
     POST /api/auth/logout     — invalidate token

   Existing routes unchanged:
     POST /api/orders
     GET  /api/orders/:id
     POST /api/reservations
     GET  /api/reservations
     POST /api/contact
     POST /api/reviews
     GET  /api/reviews
     GET  /api/health
   ════════════════════════════════════════════ */

'use strict';

const express  = require('express');
const cors     = require('cors');
const fs       = require('fs');
const path     = require('path');
const crypto   = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3001;

/* ────────────────────────────────────────────
   JWT secret — in production set via env var:
   JWT_SECRET=your_secret_here node server.js
   ──────────────────────────────────────────── */
const JWT_SECRET = process.env.JWT_SECRET || 'bindcraft-dev-secret-change-in-prod';

/* ── Middleware ── */
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));   // serve index.html & assets

/* ════════════════════════════════════
   SIMPLE FILE DATABASE
   Swap with MongoDB / Postgres in prod
   ════════════════════════════════════ */
const DB_FILE = path.join(__dirname, 'db.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const seed = { users: [], orders: [], reservations: [], contacts: [], reviews: [], payments: [], revokedTokens: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
  const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  // ensure new collections exist in old db files
  if (!raw.users)         raw.users         = [];
  if (!raw.payments)      raw.payments      = [];
  if (!raw.revokedTokens) raw.revokedTokens = [];
  return raw;
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/* ════════════════════════════════════
   UTILITIES
   ════════════════════════════════════ */
function uid()  { return crypto.randomBytes(8).toString('hex'); }
function now()  { return new Date().toISOString(); }

function respond(res, data, status = 200) {
  res.status(status).json({ success: true, ...data });
}
function err(res, msg, status = 400) {
  res.status(status).json({ success: false, error: msg });
}

/* ────────────── PASSWORD HASHING ──────────── */
/* Uses Node's built-in crypto — no bcrypt dep  */
function hashPwd(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return salt + ':' + hash;
}

function verifyPwd(password, stored) {
  const [salt, hash] = stored.split(':');
  const attempt = crypto.scryptSync(password, salt, 64).toString('hex');
  return attempt === hash;
}

/* ────────────── JWT (hand-rolled, no dep) ─── */
function b64url(str)    { return Buffer.from(str).toString('base64url'); }
function b64urlDec(str) { return Buffer.from(str, 'base64url').toString('utf8'); }

function jwtSign(payload, expiresInSec = 7 * 24 * 3600) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const pl     = b64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSec, iat: Math.floor(Date.now() / 1000) }));
  const sig    = crypto.createHmac('sha256', JWT_SECRET).update(header + '.' + pl).digest('base64url');
  return header + '.' + pl + '.' + sig;
}

function jwtVerify(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, pl, sig] = parts;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(header + '.' + pl).digest('base64url');
  if (sig !== expected) return null;
  const payload = JSON.parse(b64urlDec(pl));
  if (payload.exp < Math.floor(Date.now() / 1000)) return null; // expired
  return payload;
}

/* ────────────── AUTH MIDDLEWARE ─────────── */
function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return err(res, 'Authentication required.', 401);

  /* Check revoked list */
  const db = readDB();
  if (db.revokedTokens.includes(token)) return err(res, 'Token has been revoked.', 401);

  const payload = jwtVerify(token);
  if (!payload) return err(res, 'Invalid or expired token.', 401);

  req.user  = payload;
  req.token = token;
  next();
}

/* ════════════════════════════════════
   AUTH ROUTES
   ════════════════════════════════════ */

/* ── POST /api/auth/register ── */
app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName) return err(res, 'First and last name are required.');
  if (!email)    return err(res, 'Email is required.');
  if (!password) return err(res, 'Password is required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err(res, 'Invalid email address.');
  if (password.length < 8) return err(res, 'Password must be at least 8 characters.');

  const db = readDB();
  const existing = db.users.find(u => u.email === email.toLowerCase());
  if (existing) return err(res, 'An account with this email already exists.', 409);

  const user = {
    id:        uid(),
    firstName: firstName.trim(),
    lastName:  lastName.trim(),
    email:     email.trim().toLowerCase(),
    password:  hashPwd(password),
    role:      'customer',   // 'customer' | 'admin'
    createdAt: now(),
    lastLogin: now(),
  };

  db.users.push(user);
  writeDB(db);

  const token = jwtSign({ sub: user.id, email: user.email, role: user.role, firstName: user.firstName });

  console.log(`[AUTH]   Register  ${user.id}  <${user.email}>`);
  respond(res, {
    token,
    user: safeUser(user),
  }, 201);
});

/* ── POST /api/auth/login ── */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return err(res, 'Email and password are required.');

  const db   = readDB();
  const user = db.users.find(u => u.email === email.toLowerCase());
  if (!user) return err(res, 'No account found with that email address.', 404);

  if (!verifyPwd(password, user.password)) {
    return err(res, 'Incorrect password. Please try again.', 401);
  }

  /* Update last login */
  user.lastLogin = now();
  writeDB(db);

  const token = jwtSign({ sub: user.id, email: user.email, role: user.role, firstName: user.firstName });

  console.log(`[AUTH]   Login     ${user.id}  <${user.email}>`);
  respond(res, { token, user: safeUser(user) });
});

/* ── GET /api/auth/me ── */
app.get('/api/auth/me', authRequired, (req, res) => {
  const db   = readDB();
  const user = db.users.find(u => u.id === req.user.sub);
  if (!user) return err(res, 'User not found.', 404);
  respond(res, { user: safeUser(user) });
});

/* ── PUT /api/auth/me ── update profile ── */
app.put('/api/auth/me', authRequired, (req, res) => {
  const { firstName, lastName, currentPassword, newPassword } = req.body;

  const db   = readDB();
  const user = db.users.find(u => u.id === req.user.sub);
  if (!user) return err(res, 'User not found.', 404);

  if (firstName) user.firstName = firstName.trim();
  if (lastName)  user.lastName  = lastName.trim();

  /* Password change */
  if (newPassword) {
    if (!currentPassword) return err(res, 'Current password is required to set a new one.');
    if (!verifyPwd(currentPassword, user.password)) return err(res, 'Current password is incorrect.', 401);
    if (newPassword.length < 8) return err(res, 'New password must be at least 8 characters.');
    user.password = hashPwd(newPassword);
  }

  writeDB(db);
  respond(res, { user: safeUser(user) });
});

/* ── POST /api/auth/logout ── */
app.post('/api/auth/logout', authRequired, (req, res) => {
  const db = readDB();
  db.revokedTokens.push(req.token);
  /* Keep revoked list tidy — prune tokens that are already expired */
  db.revokedTokens = db.revokedTokens.filter(t => {
    const p = jwtVerify(t);
    return p !== null; // keep only still-valid (not-yet-expired) tokens
  });
  writeDB(db);
  respond(res, { message: 'Logged out successfully.' });
});

/* Strip password from user object */
function safeUser(u) {
  const { password, ...safe } = u;
  return safe;
}

/* ════════════════════════════════════
   ORDERS  –  POST /api/orders
              GET  /api/orders/:id
   ════════════════════════════════════ */
app.post('/api/orders', (req, res) => {
  const { name, email, bookType, cover, pageColor, size, pageCount, notes } = req.body;

  if (!name || !email) return err(res, 'Name and email are required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err(res, 'Invalid email address.');
  if (!bookType) return err(res, 'Book type is required.');

  const db    = readDB();
  const order = {
    id:        uid(),
    name:      name.trim(),
    email:     email.trim().toLowerCase(),
    bookType,
    cover:     cover     || 'hardcover',
    pageColor: pageColor || 'white',
    size:      size      || 'a4',
    pageCount: Number(pageCount) || 40,
    notes:     (notes || '').trim(),
    status:    'received',    // received → processing → shipped → delivered
    createdAt: now(),
  };

  db.orders.push(order);
  writeDB(db);

  console.log(`[ORDER]  ${order.id}  ${order.name}  <${order.email}>`);
  respond(res, { orderId: order.id, order }, 201);
});

app.get('/api/orders/:id', (req, res) => {
  const db    = readDB();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return err(res, 'Order not found.', 404);
  respond(res, { order });
});

/* ── PATCH /api/orders/:id/status — update order status ── */
app.patch('/api/orders/:id/status', authRequired, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['received', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return err(res, 'Invalid status. Must be one of: ' + validStatuses.join(', '));

  const db    = readDB();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return err(res, 'Order not found.', 404);

  /* Only the order owner or an admin may update */
  if (order.email !== req.user.email && req.user.role !== 'admin')
    return err(res, 'Forbidden.', 403);

  order.status    = status;
  order.updatedAt = now();
  writeDB(db);

  console.log(`[ORDER]  Status → ${status}  ${order.id}  <${order.email}>`);
  respond(res, { order });
});

/* ── GET /api/stats — admin dashboard summary ── */
app.get('/api/stats', authRequired, (req, res) => {
  if (req.user.role !== 'admin') return err(res, 'Admin access required.', 403);

  const db    = readDB();
  const today = new Date().toISOString().split('T')[0];

  const totalRevenue   = (db.payments || []).reduce((sum, p) => sum + (Number(p.total) || 0), 0);
  const statusBreakdown = ['received','processing','shipped','delivered','cancelled'].reduce((acc, s) => {
    acc[s] = db.orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  respond(res, {
    users:            db.users.length,
    orders:           db.orders.length,
    ordersToday:      db.orders.filter(o => o.createdAt.startsWith(today)).length,
    revenue:          totalRevenue,
    reservations:     db.reservations.length,
    reviews:          db.reviews.filter(r => r.approved).length,
    contacts:         db.contacts.length,
    pendingOrders:    db.orders.filter(o => o.status === 'received').length,
    statusBreakdown,
  });
});

/* ── GET /api/orders — all orders for logged-in user ── */
app.get('/api/orders', authRequired, (req, res) => {
  const db = readDB();
  const userEmail = req.user.email;
  const mine = db.orders.filter(o => o.email === userEmail).reverse();
  respond(res, { orders: mine, total: mine.length });
});

/* ════════════════════════════════════
   RESERVATIONS  –  POST /api/reservations
                    GET  /api/reservations
   ════════════════════════════════════ */
app.post('/api/reservations', (req, res) => {
  const { name, email, date, time, notes } = req.body;

  if (!name || !email) return err(res, 'Name and email are required.');
  if (!date || !time)  return err(res, 'Date and time are required.');

  const db          = readDB();
  const reservation = {
    id:        uid(),
    name:      name.trim(),
    email:     email.trim().toLowerCase(),
    date,
    time,
    notes:     (notes || '').trim(),
    status:    'pending',     // pending → confirmed → cancelled
    createdAt: now(),
  };

  db.reservations.push(reservation);
  writeDB(db);

  console.log(`[RSVP]   ${reservation.id}  ${reservation.name}  ${date} ${time}`);
  respond(res, { reservationId: reservation.id, reservation }, 201);
});

app.get('/api/reservations', (_req, res) => {
  const db = readDB();
  respond(res, { reservations: db.reservations });
});

/* ════════════════════════════════════
   CONTACT MESSAGES  –  POST /api/contact
   ════════════════════════════════════ */
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) return err(res, 'Name, email and message are required.');

  const db  = readDB();
  const msg = {
    id:        uid(),
    name:      name.trim(),
    email:     email.trim().toLowerCase(),
    subject:   (subject || 'No subject').trim(),
    message:   message.trim(),
    createdAt: now(),
  };

  db.contacts.push(msg);
  writeDB(db);

  console.log(`[MSG]    ${msg.id}  ${msg.name}  "${msg.subject}"`);
  respond(res, { messageId: msg.id }, 201);
});

/* ════════════════════════════════════
   REVIEWS  –  POST /api/reviews
               GET  /api/reviews
   ════════════════════════════════════ */
app.post('/api/reviews', (req, res) => {
  const { name, bookTitle, rating, text } = req.body;

  if (!name || !text)              return err(res, 'Name and review text are required.');
  if (!rating || rating < 1 || rating > 5) return err(res, 'Rating must be 1–5.');

  const db     = readDB();
  const review = {
    id:        uid(),
    name:      name.trim(),
    bookTitle: (bookTitle || 'BindCraft Book').trim(),
    rating:    Number(rating),
    text:      text.trim(),
    approved:  true,
    createdAt: now(),
  };

  db.reviews.push(review);
  writeDB(db);

  console.log(`[REVIEW] ${review.id}  ${review.name}  ${review.rating}★`);
  respond(res, { reviewId: review.id, review }, 201);
});

app.get('/api/reviews', (_req, res) => {
  const db      = readDB();
  const approved = db.reviews.filter(r => r.approved).reverse();
  respond(res, { reviews: approved, total: approved.length });
});

/* ════════════════════════════════════
   PAYMENTS  –  POST /api/payments
               GET  /api/payments (auth)
   ════════════════════════════════════ */
app.post('/api/payments', (req, res) => {
  const { items, address, paymentMethod, total } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0)
    return err(res, 'No items provided.');
  if (!address || !address.email)
    return err(res, 'Delivery address with email is required.');
  if (!paymentMethod)
    return err(res, 'Payment method is required.');

  const db = readDB();

  const payment = {
    id:            uid(),
    paymentId:     'PAY-' + uid().toUpperCase().substring(0, 8),
    orderIds:      items.map(o => o.id).filter(Boolean),
    items:         items,
    address,
    paymentMethod,
    total:         Number(total) || 0,
    status:        paymentMethod === 'cod' ? 'pending_cod' : 'paid',
    createdAt:     now(),
    email:         address.email.trim().toLowerCase(),
  };

  // Mark linked orders as paid/processing
  payment.orderIds.forEach(oid => {
    const order = db.orders.find(o => o.id === oid);
    if (order) {
      order.status        = 'processing';
      order.paymentId     = payment.paymentId;
      order.deliveryAddr  = address;
    }
  });

  if (!db.payments) db.payments = [];
  db.payments.push(payment);
  writeDB(db);

  console.log(`[PAY]    ${payment.paymentId}  ${address.email}  ₹${total}  via ${paymentMethod}`);
  respond(res, { paymentId: payment.paymentId, payment }, 201);
});

app.get('/api/payments', authRequired, (req, res) => {
  const db   = readDB();
  const mine = (db.payments || []).filter(p => p.email === req.user.email).reverse();
  respond(res, { payments: mine, total: mine.length });
});

/* ════════════════════════════════════
   CHATBOT PROXY  –  POST /api/chat
   Forwards messages to Claude API so
   the API key never touches the browser.
   Set env var:  ANTHROPIC_API_KEY=sk-...
   ════════════════════════════════════ */
const https = require('https');

app.post('/api/chat', (req, res) => {
  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return err(res, 'messages array is required.');
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
  if (!ANTHROPIC_KEY) {
    return err(res, 'Chatbot is not configured (missing ANTHROPIC_API_KEY on server).', 503);
  }

  const payload = JSON.stringify({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system:     system || '',
    messages:   messages.slice(-20), // keep last 20 turns to avoid huge payloads
  });

  const options = {
    hostname: 'api.anthropic.com',
    path:     '/v1/messages',
    method:   'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length':    Buffer.byteLength(payload),
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', chunk => { data += chunk; });
    proxyRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (proxyRes.statusCode !== 200) {
          return res.status(proxyRes.statusCode).json({ success: false, error: parsed.error?.message || 'API error' });
        }
        const text = parsed.content?.[0]?.text || '';
        res.json({ success: true, text });
      } catch (e) {
        res.status(500).json({ success: false, error: 'Failed to parse API response.' });
      }
    });
  });

  proxyReq.on('error', (e) => {
    console.error('[CHAT PROXY ERROR]', e.message);
    res.status(502).json({ success: false, error: 'Could not reach AI service.' });
  });

  proxyReq.write(payload);
  proxyReq.end();
});

/* ── Health-check ── */
app.get('/api/health', (_req, res) => {
  const db = readDB();
  respond(res, {
    status: 'ok',
    counts: {
      users:        db.users.length,
      orders:       db.orders.length,
      reservations: db.reservations.length,
      contacts:     db.contacts.length,
      reviews:      db.reviews.length,
    },
  });
});

/* ── 404 fallback for API routes ── */
app.use('/api', (_req, res) => err(res, 'Endpoint not found.', 404));

/* ── Start ── */
app.listen(PORT, () => {
  console.log(`\n✦ BindCraft server (v2) → http://localhost:${PORT}`);
  console.log(`  Auth register → POST /api/auth/register`);
  console.log(`  Auth login    → POST /api/auth/login`);
  console.log(`  Health check  → GET  /api/health\n`);
});
