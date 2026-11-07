// App: mounts the puzzle, handles reveal/hover/touch/keyboard, routing and the all-piece flip transition.
import { buildPiecePath } from './geometry.js';
import { buildLayout } from './layout.js';
import { getView, sectionsOf, META, esc } from './views.js';

const data = JSON.parse(document.getElementById('puzzle-data').textContent);
const main = document.getElementById('main');
const stage = document.getElementById('stage');
const measureEl = document.getElementById('measure');
const liveEl = document.getElementById('live');
const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

const PAD_K = 0.27;       // content padding, as a fraction of a cell
const FLIP_OUT = 300;     // ms
const FLIP_IN = 340;      // ms
const EASE_OUT = 'cubic-bezier(.55,.06,.68,.19)';
const EASE_IN = 'cubic-bezier(.22,.61,.36,1)';

let current = null;       // { route, view, layout, cs, cols, seed, items }
let busy = false;
let pendingRoute = null;
let pendingOrigin = null;
let resizeAfter = false;
let lit = null;
let lastType = window.matchMedia('(hover: none)').matches ? 'touch' : 'mouse';

/* ---------- routing ---------- */
function parseRoute(hash) {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (!parts.length) return { key: 'home', id: 'home' };
  if (parts[0] === 'projects') {
    if (parts[1] === 'page') {
      const page = Math.max(1, parseInt(parts[2], 10) || 1);
      return { key: `projects/page/${page}`, id: 'projects', page };
    }
    if (parts[1]) return { key: `projects/${parts[1]}`, id: 'project', slug: parts[1] };
    return { key: 'projects', id: 'projects', page: 1 };
  }
  return { key: parts[0], id: parts[0] };
}

/* ---------- measuring + layout ---------- */
const colsFor = w => (w < 700 ? 4 : w < 1050 ? 8 : w < 1500 ? 12 : 16);

function measure(item, width) {
  measureEl.className = `content ${item.cls || ''} measure`;
  measureEl.style.width = `${width}px`;
  measureEl.innerHTML = item.measureHtml || item.html;
  return measureEl.offsetHeight;
}

// The puzzle fills the whole screen: cell width = screen width / columns,
// and the rows are stretched so the pieces also cover the full height.
function layoutFor(route) {
  const W = document.documentElement.clientWidth;
  const H = window.innerHeight;
  const cols = colsFor(W);
  main.dataset.cols = cols;
  const cw = W / cols;
  const env = { W, H };
  let view = getView(route, data, cols, env);
  if (!view) {
    route = parseRoute('#/');
    view = getView(route, data, cols, env);
    history.replaceState(null, '', '#/');
  }
  const pad = Math.round(cw * PAD_K);
  const layout = buildLayout(view.rows, { cols, cs: cw, pad, measure });
  // home: exactly the screen height (always fits). other pages: at least the screen height.
  const total = route.key === 'home' ? H : Math.max(H, layout.rows * cw);
  const ch = total / layout.rows;
  const seed = route.key;   // fixed: the piece shapes never change between visits
  return { route, view, layout, cw, ch, W, total, cols, seed };
}

/* ---------- mounting ---------- */
function mount(ctx) {
  const { layout, cw, ch, W, total } = ctx;
  const pad = Math.round(cw * PAD_K);
  stage.className = 'stage';
  document.body.classList.toggle('fit', ctx.route.key === 'home');   // home never scrolls
  stage.style.width = `${W}px`;
  stage.style.height = `${total}px`;

  const items = new Map();
  let html = '';
  for (const p of layout.pieces) {
    const g = buildPiecePath(p, layout.ownerAt, cw, ch, ctx.seed);
    const it = p.item;
    items.set(p.id, it);
    const interactive = it.go || it.href || it.action;
    const attrs = interactive
      ? ` role="${it.href ? 'link' : 'button'}" tabindex="0" aria-label="${esc(it.label || '')}"`
      : ' aria-hidden="true"';
    const { width: BW, height: BH } = g.box;
    html += `<div class="cell" data-piece="${esc(p.id)}" style="left:${g.box.left}px;top:${g.box.top}px;width:${BW}px;height:${BH}px">`
      + `<div class="hit"${attrs} style="clip-path:path('${g.d}')"></div>`
      + `<div class="piece"><svg viewBox="0 0 ${BW} ${BH}" width="${BW}" height="${BH}" aria-hidden="true" focusable="false">`
      + `<path class="face" d="${g.d}"/><path class="sheen" d="${g.d}"/><path class="edge" d="${g.d}"/></svg>`
      + `<div class="content ${it.cls || ''}" style="left:${g.m + pad}px;top:${g.m + pad}px;width:${p.w * cw - 2 * pad}px;height:${p.h * ch - 2 * pad}px">${it.html}</div>`
      + `</div></div>`;
  }
  stage.innerHTML = html;
  ctx.items = items;
  lit = null;
}

function syncChrome(ctx) {
  const name = data.site.name || 'Portfolio';
  document.title = ctx.route.key === 'home'
    ? `${name} | THE PUZZLE`
    : `${ctx.view.crumb.join(' / ')} | ${name} | THE PUZZLE`;
  liveEl.textContent = ctx.route.key === 'home' ? 'Showing home' : `Showing ${ctx.view.crumb.join(', ')}`;
}

/* ---------- reveal state ---------- */
const cellById = id => stage.querySelector(`.cell[data-piece="${CSS.escape(id)}"]`);

function setLit(id) {
  if (id && current?.items?.get(id)?.still) id = null;   // the cover never lifts
  if (lit === id) return;
  if (lit) cellById(lit)?.classList.remove('is-lit');
  lit = id;
  if (id) cellById(id)?.classList.add('is-lit');
}

stage.addEventListener('pointerdown', e => { lastType = e.pointerType === 'pen' ? 'mouse' : e.pointerType; });
document.addEventListener('keydown', () => { lastType = 'keyboard'; }, true);
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('#stage')) setLit(null);
});

stage.addEventListener('pointermove', e => {
  if (busy || e.pointerType === 'touch') return;
  const id = e.target.closest?.('[data-piece]')?.dataset.piece || null;
  setLit(id);
});
stage.addEventListener('pointerleave', e => {
  if (e.pointerType !== 'touch') setLit(null);
});

stage.addEventListener('focusin', e => {
  const cell = e.target.closest('.cell');
  if (!cell || busy) return;
  setLit(cell.dataset.piece);
  if (e.target.matches(':focus-visible')) cell.classList.add('is-focus');
});
stage.addEventListener('focusout', e => {
  const cell = e.target.closest('.cell');
  if (!cell) return;
  cell.classList.remove('is-focus');
  if (lastType === 'keyboard' && !cell.contains(e.relatedTarget)) setLit(null);
});

/* ---------- activation ---------- */
function activate(id) {
  if (busy || !current) return;
  const it = current.items.get(id);
  if (!it) return;
  if (it.go) {
    if (it.go === location.hash || (it.go === '#/' && !location.hash)) return;
    pendingOrigin = id;
    location.hash = it.go;
  } else if (it.href) {
    if (/^(mailto|tel):/i.test(it.href)) location.href = it.href;
    else window.open(it.href, '_blank', 'noopener');
  }
}

stage.addEventListener('click', e => {
  if (busy) return;
  const zoom = e.target.closest('[data-zoom]');
  if (zoom) { openLightbox(zoom); return; }
  const hit = e.target.closest('.hit');
  if (!hit) return;
  const id = hit.parentElement.dataset.piece;
  // touch: first tap reveals the piece, second tap opens it
  if (lastType === 'touch' && lit !== id && !current.items.get(id)?.still) { setLit(id); return; }
  activate(id);
});

stage.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const img = e.target.closest?.('img[data-zoom]');
  if (img) { e.preventDefault(); openLightbox(img); return; }
  const hit = e.target.closest?.('.hit[role]');
  if (!hit) return;
  e.preventDefault();
  activate(hit.parentElement.dataset.piece);
});

/* ---------- lightbox: preview images and videos ---------- */
const lb = document.createElement('div');
lb.id = 'lightbox';
lb.hidden = true;
lb.setAttribute('role', 'dialog');
lb.setAttribute('aria-modal', 'true');
lb.setAttribute('aria-label', 'Preview');
lb.innerHTML = '<button type="button" class="lb-btn lb-close" aria-label="Close preview">&times;</button>'
  + '<button type="button" class="lb-btn lb-prev" aria-label="Previous image">&lsaquo;</button>'
  + '<button type="button" class="lb-btn lb-next" aria-label="Next image">&rsaquo;</button>'
  + '<figure class="lb-fig"><div class="lb-media"></div><figcaption class="lb-cap"></figcaption></figure>';
document.body.appendChild(lb);
const lbMedia = lb.querySelector('.lb-media');
const lbCap = lb.querySelector('.lb-cap');
const lbPrev = lb.querySelector('.lb-prev');
const lbNext = lb.querySelector('.lb-next');
let lbList = [];
let lbIndex = 0;
let lbOpener = null;

function lbShowImage(i) {
  lbIndex = (i + lbList.length) % lbList.length;
  const src = lbList[lbIndex];
  const img = document.createElement('img');
  img.src = src.currentSrc || src.src;
  img.alt = src.alt || '';
  lbMedia.replaceChildren(img);
  lbCap.textContent = src.alt || '';
  lbPrev.hidden = lbNext.hidden = lbList.length < 2;
}

function openLightbox(trigger) {
  // stop anything that is playing behind the preview
  stage.querySelectorAll('video').forEach(v => v.pause());
  stage.querySelectorAll('iframe').forEach(f => { f.src = f.src; });
  lbOpener = trigger;
  if (trigger.dataset.zoom === 'video') {
    lbList = [];
    let el;
    if (trigger.dataset.kind === 'yt') {
      el = document.createElement('iframe');
      el.src = `${trigger.dataset.src}?autoplay=1&rel=0`;
      el.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      el.allowFullscreen = true;
      el.title = 'Video preview';
    } else {
      el = document.createElement('video');
      el.src = trigger.dataset.src;
      el.controls = true;
      el.autoplay = true;
      el.playsInline = true;
    }
    el.className = 'lb-vid';
    lbMedia.replaceChildren(el);
    lbCap.textContent = '';
    lbPrev.hidden = lbNext.hidden = true;
  } else {
    lbList = [...stage.querySelectorAll('img[data-zoom="image"]')];   // arrows flip through this page's images
    lbShowImage(Math.max(0, lbList.indexOf(trigger)));
  }
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
  lb.querySelector('.lb-close').focus();
}

function closeLightbox() {
  if (lb.hidden) return;
  lb.hidden = true;
  lbMedia.replaceChildren();          // also stops the video
  document.body.style.overflow = '';
  if (lbOpener && document.contains(lbOpener)) lbOpener.focus({ preventScroll: true });
  lbOpener = null;
}

lb.addEventListener('click', e => {
  if (e.target.closest('.lb-close')) return closeLightbox();
  if (e.target.closest('.lb-prev')) return lbShowImage(lbIndex - 1);
  if (e.target.closest('.lb-next')) return lbShowImage(lbIndex + 1);
  if (!e.target.closest('.lb-fig')) closeLightbox();      // click on the dark background
});

// capture phase: while the preview is open, Esc closes ONLY the preview (not the page behind it)
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeLightbox(); return; }
  if (e.key === 'ArrowLeft' && lbList.length > 1) { e.preventDefault(); lbShowImage(lbIndex - 1); return; }
  if (e.key === 'ArrowRight' && lbList.length > 1) { e.preventDefault(); lbShowImage(lbIndex + 1); return; }
  if (e.key === 'Tab') {                                   // keep keyboard focus inside the preview
    const btns = [...lb.querySelectorAll('button')].filter(b => !b.hidden);
    const first = btns[0];
    const last = btns[btns.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}, true);
window.addEventListener('hashchange', closeLightbox);

/* ---------- contact form (real backend call) ---------- */
stage.addEventListener('submit', async e => {
  const form = e.target.closest('#contact-form');
  if (!form) return;
  e.preventDefault();
  const status = form.querySelector('.form-status');
  const btn = form.querySelector('button[type="submit"]');
  status.className = 'form-status';
  status.textContent = 'Sending…';
  btn.disabled = true;
  try {
    const res = await fetch(form.action, {
      method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' },
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json && json.ok) {
      status.classList.add('ok');
      status.textContent = 'Thanks, your message was received.';
      form.reset();
    } else {
      status.classList.add('err');
      status.textContent = (json && json.error) || 'Could not send your message. Please try again or email me directly.';
    }
  } catch {
    status.classList.add('err');
    status.textContent = 'Network error. Please try again.';
  }
  btn.disabled = false;
});

/* ---------- flip animation ---------- */
function originPoint(id) {
  const cell = id && cellById(id);
  if (cell) return { x: cell.offsetLeft + cell.offsetWidth / 2, y: cell.offsetTop + cell.offsetHeight / 2 };
  return { x: stage.offsetWidth / 2, y: stage.offsetHeight / 2 };
}

function order(cells, pt) {
  return cells
    .map(c => ({ c, d: Math.hypot(c.offsetLeft + c.offsetWidth / 2 - pt.x, c.offsetTop + c.offsetHeight / 2 - pt.y) }))
    .sort((a, b) => a.d - b.d)
    .map(o => o.c);
}

const stagger = n => Math.max(25, Math.min(40, 420 / n));
const rot = deg => `perspective(1100px) rotateY(${deg}deg)`;

function flipOut(pt) {
  const cells = order([...stage.querySelectorAll('.cell')], pt);
  const step = stagger(cells.length);
  return Promise.all(cells.map((c, i) => c.animate(
    [{ transform: rot(0) }, { transform: rot(-90) }],
    { duration: FLIP_OUT, delay: i * step, easing: EASE_OUT, fill: 'forwards' },
  ).finished));
}

async function flipIn(pt) {
  const cells = order([...stage.querySelectorAll('.cell')], pt);
  const step = stagger(cells.length);
  const anims = [];
  cells.forEach((c, i) => {
    const delay = i * step;
    anims.push(c.animate(
      [{ transform: rot(90), opacity: 0 }, { opacity: 1, offset: 0.12 }, { transform: rot(0), opacity: 1 }],
      { duration: FLIP_IN, delay, easing: EASE_IN, fill: 'backwards' },
    ));
    const content = c.querySelector('.content');
    if (content) {
      anims.push(content.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 380, delay: delay + 200, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' },
      ));
    }
  });
  await Promise.all(anims.map(a => a.finished));
  anims.forEach(a => a.cancel());
}

async function fade(el, from, to, duration) {
  const a = el.animate([{ opacity: from }, { opacity: to }], { duration, fill: 'forwards' });
  await a.finished;
  return a;
}

/* ---------- run a transition ---------- */
async function run(route, originId) {
  busy = true;
  stage.classList.add('is-busy');
  setLit(null);
  const ctx = layoutFor(route);
  const pt = originPoint(originId);
  const reduce = reduceMq.matches;

  if (reduce) {
    const a = await fade(stage, 1, 0, 140);
    mount(ctx); current = ctx; syncChrome(ctx);
    a.cancel();
    await fade(stage, 0, 1, 200).then(x => x.cancel());
  } else {
    await flipOut(pt);
    mount(ctx); current = ctx; syncChrome(ctx);
    await flipIn(pt);
  }

  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
  busy = false;
  stage.classList.remove('is-busy');
  afterRun();
}

function afterRun() {
  if (resizeAfter) { resizeAfter = false; rerender(); }
  if (pendingRoute && pendingRoute.key !== current.route.key) {
    const r = pendingRoute; pendingRoute = null;
    run(r, null);
  } else {
    pendingRoute = null;
  }
}

function navigate(route) {
  if (busy) { pendingRoute = route; return; }
  if (current && route.key === current.route.key) return;
  const origin = pendingOrigin; pendingOrigin = null;
  run(route, origin);
}

window.addEventListener('hashchange', () => navigate(parseRoute(location.hash)));
// Esc goes one level back (project -> projects -> home)
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || busy || !current || current.route.key === 'home') return;
  pendingOrigin = null;
  location.hash = current.route.id === 'project' ? '#/projects' : '#/';
});

/* ---------- resize ---------- */
function rerender() {
  const ctx = layoutFor(current.route);
  mount(ctx); current = ctx;
}
let lastWidth = document.documentElement.clientWidth;
let lastHeight = window.innerHeight;
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (!current) return;
    const w = document.documentElement.clientWidth;
    const h = window.innerHeight;
    // on phones the height changes while scrolling (address bar), so only react to width there
    if (w === lastWidth && (colsFor(w) === 4 || h === lastHeight)) return;
    lastWidth = w; lastHeight = h;
    if (busy) { resizeAfter = true; return; }
    rerender();
  }, 150);
});

/* ---------- start ---------- */
// the cartoon fonts must be loaded BEFORE measuring, or the text heights would be wrong
async function loadFonts() {
  if (!document.fonts || !document.fonts.load) return;
  const load = Promise.all([
    document.fonts.load('1em "Bangers"', 'PORTFOLIO'),
    document.fonts.load('400 1em "Fredoka"', 'Aa'),
    document.fonts.load('600 1em "Fredoka"', 'Aa'),
  ]).then(() => document.fonts.ready).catch(() => {});
  await Promise.race([load, new Promise(r => setTimeout(r, 2500))]);
}

async function start() {
  await loadFonts();
  const ctx = layoutFor(parseRoute(location.hash));
  mount(ctx); current = ctx; syncChrome(ctx);
  document.body.classList.add('ready');
  if (reduceMq.matches) return;
  busy = true;
  stage.classList.add('is-busy');
  await flipIn({ x: stage.offsetWidth / 2, y: stage.offsetHeight / 2 });
  busy = false;
  stage.classList.remove('is-busy');
  afterRun();
}
start();
