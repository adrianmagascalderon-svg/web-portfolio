// Views: turn the content data into rows of puzzle pieces.
// Nothing is rendered for empty content, and the number of pieces follows the data.

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const has = v => (Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim()));
const pad2 = n => String(n).padStart(2, '0');

const safeUrl = u => {
  const s = String(u || '').trim();
  if (!s) return '';
  if (/^(https?:\/\/|mailto:)/i.test(s)) return s;
  return /^[a-z][a-z0-9+.-]*:/i.test(s) ? '' : s;
};
const paras = s => String(s || '').split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
  .map(p => `<p>${esc(p)}</p>`).join('');
const bullets = a => `<ul class="bul">${a.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
const tags = a => `<ul class="tags">${a.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;

// Balanced split: 7 items, max 3 per row -> 3,2,2
function chunk(arr, per) {
  if (!arr.length) return [];
  const groups = Math.ceil(arr.length / per);
  const base = Math.floor(arr.length / groups);
  const rem = arr.length % groups;
  const out = [];
  let i = 0;
  for (let g = 0; g < groups; g++) {
    const size = base + (g < rem ? 1 : 0);
    out.push(arr.slice(i, i + size));
    i += size;
  }
  return out;
}
const flow = (items, per) => chunk(items, per).map(items => ({ items }));
const pick = (cols, d, t, m) => (cols >= 12 ? d : cols >= 8 ? t : m);

function pair(a, b, cols, wa, wb) {
  const items = [a, b].filter(Boolean);
  if (items.length < 2 || cols < 8) return items.map(i => ({ items: [i] }));
  return [{ items: [{ ...a, weight: wa }, { ...b, weight: wb }] }];
}

export const META = {
  projects: { label: 'Projects', blurb: 'Selected work' },
  about: { label: 'About Me', blurb: 'Who I am' },
  skills: { label: 'Skills & Technologies', blurb: 'What I work with' },
  learning: { label: 'Learning Journey', blurb: 'Certificates & growth' },
  milestones: { label: 'Milestones', blurb: 'Steps along the way' },
  contact: { label: 'Contact', blurb: 'Say hello' },
  socials: { label: 'GitHub & Socials', blurb: 'Find me online' },
};

export function sectionsOf(d) {
  const a = d.about || {};
  const l = d.learning || {};
  const ids = [];
  if (has(d.projects)) ids.push('projects');
  if (has(a.bio) || has(a.interests) || has(a.philosophy) || has(a.approach)) ids.push('about');
  if (Object.values(d.skills || {}).some(has)) ids.push('skills');
  if (['certificates', 'current', 'exploring', 'experiments', 'goals'].some(k => has(l[k]))) ids.push('learning');
  if (has(d.milestones)) ids.push('milestones');
  const c = d.contact || {};
  if (has(c.email) || has(c.phone) || safeUrl(c.facebook) || c.form) ids.push('contact');
  if ((d.socials || []).some(s => safeUrl(s.url))) ids.push('socials');
  return ids;
}

const blurbOf = (id, d) => {
  if (id === 'projects') {
    const n = d.projects.length;
    return `${n} selected work${n === 1 ? '' : 's'}`;
  }
  if (id === 'learning') {
    const n = ((d.learning || {}).certificates || []).filter(c => has(c.title)).length;
    if (n) return `${n} certificate${n === 1 ? '' : 's'}`;
  }
  return META[id].blurb;
};

const titlePiece = (backHash, backLabel, title, desc) => ({
  id: 'back', cls: 'title', go: backHash, label: backLabel, minRows: 2,
  html: `<span class="kicker">&larr; ${esc(backLabel)}</span>`
    + `<h2 class="section-title">${esc(title)}</h2>`
    + (desc ? `<p class="muted">${esc(desc)}</p>` : ''),
});

/* ---------------- HOME: PORTFOLIO in the middle, tiles all around ---------------- */
// Fixed, predictable arrangement (no randomness): the filled tiles sit on a checkerboard,
// spread evenly, in the same reading order every time.
function chooseSlots(slots, n) {
  if (n <= 0) return [];
  const p0 = slots.filter(s => (s.r + s.c) % 2 === 0);
  const p1 = slots.filter(s => (s.r + s.c) % 2 === 1);
  const [first, second] = p0.length >= p1.length ? [p0, p1] : [p1, p0];
  let chosen;
  if (n <= first.length) {
    chosen = Array.from({ length: n }, (_, i) => first[Math.floor(((i + 0.5) * first.length) / n)]);
  } else {
    chosen = first.slice();
    const rest = second.slice();
    while (chosen.length < n && rest.length) {
      const near = s => chosen.filter(o => Math.abs(o.r - s.r) + Math.abs(o.c - s.c) === 1).length;
      rest.sort((a, b) => near(a) - near(b));
      chosen.push(rest.shift());
    }
  }
  return chosen.sort((a, b) => a.r - b.r || a.c - b.c);
}

function homeView(d, cols, env) {
  const ids = sectionsOf(d);
  const s = d.site || {};
  const n = ids.length;

  // Every tile row is exactly 2 grid cells high and the rows share the screen height,
  // so the whole home page always fits the screen: nothing is cut, nothing scrolls.
  const per = cols >= 8 ? 4 : 2;                       // tiles per row (the hero row is special)
  const slotsFor = R => (per === 4 ? (R - 1) * 4 + 2 : (R - 1) * 2);
  let R = Math.max(3, Math.min(5, Math.round(env.H / (env.W / per / 1.4))));
  while (slotsFor(R) < 2 * n && R < 5 && env.H / (R + 1) >= 150) R++;   // room for a true checkerboard, tiles stay big
  while (slotsFor(R) < n) R++;                         // always enough room for every section
  const mid = Math.floor((R - 1) / 2);

  const slots = [];
  for (let r = 0; r < R; r++) {
    if (r === mid) { if (per === 4) slots.push({ r, c: 0 }, { r, c: 3 }); continue; }
    for (let c = 0; c < per; c++) slots.push({ r, c });
  }
  const chosen = chooseSlots(slots, n);
  const at = new Map(chosen.map((sl, i) => [`${sl.r},${sl.c}`, ids[i]]));

  const tile = id => ({
    id: `nav-${id}`, cls: 'tile', fixed: true, go: `#/${id}`, label: `Open ${META[id].label}`,
    html: `<div class="tile-in"><h2 class="tile-title">${esc(META[id].label)}</h2>`
      + `<p class="tile-blurb">${esc(blurbOf(id, d))}</p></div>`,
  });
  const hero = {
    id: 'hero', cls: 'hero', fixed: true, still: true,
    html: `<div class="hero-wrap"><h2 class="hero-title">PORTFOLIO</h2></div>`
      + `<p class="hero-name">${esc(s.name)}</p>`
      + `<p class="hero-hint"><span class="hint-mouse">hover a tile</span><span class="hint-touch">tap a tile, tap again to open</span></p>`,
  };
  const cell = (r, c) => {
    const id = at.get(`${r},${c}`);
    return id ? tile(id) : { id: `blank-${r}-${c}`, cls: 'tile blank', html: '', fixed: true };
  };

  const rows = [];
  for (let r = 0; r < R; r++) {
    let items;
    if (r === mid) items = per === 4 ? [cell(r, 0), { ...hero, weight: 2 }, cell(r, 3)] : [hero];
    else items = Array.from({ length: per }, (_, c) => cell(r, c));
    rows.push({ items, minRows: r === mid ? 3 : 2 });   // hero row 3 cells high, the others 2
  }
  return { rows, crumb: [] };
}

/* ---------------- PROJECTS ---------------- */
// Up to 3 images per project (extra ones are ignored). The first image is the card thumbnail.
const projectImages = p => (Array.isArray(p.images) ? p.images : []).map(safeUrl).filter(Boolean).slice(0, 3);
const thumb = (p, cls = 'thumb') => {
  const first = projectImages(p)[0];
  return first
    ? `<img class="${cls}" src="${esc(first)}" alt="${esc(p.name)} preview" loading="lazy">`
    : `<div class="${cls} ph"><span>Image placeholder</span></div>`;
};

function projectsView(d, cols, page) {
  const all = d.projects;
  const size = pick(cols, 6, 6, 4);
  const pages = Math.max(1, Math.ceil(all.length / size));
  const cur = Math.min(page || 1, pages);
  const slice = all.slice((cur - 1) * size, cur * size);

  const items = slice.map(p => ({
    id: `project-${p.slug}`, cls: 'project', go: `#/projects/${p.slug}`,
    label: `Open project ${p.name}`, minRows: 3,
    html: thumb(p)
      + `<div class="p-meta"><span class="kicker">${esc(p.category)}</span>`
      + (has(p.status) ? `<span class="status">${esc(p.status)}</span>` : '') + `</div>`
      + `<h3>${esc(p.name)}</h3><p class="muted">${esc(p.summary)}</p>`
      + (has(p.tech) ? tags(p.tech) : ''),
  }));

  const per = slice.length <= 3 ? slice.length : pick(cols, slice.length === 4 ? 2 : 3, 2, 1);
  const rows = [{ items: [titlePiece('#/', 'Back to Home', 'Projects', `${all.length} selected work${all.length === 1 ? '' : 's'}. Select a piece to open it.`)] }];
  rows.push(...flow(items, Math.max(1, cols >= 8 ? per : 1)));

  if (pages > 1) {
    const nav = [];
    if (cur > 1) nav.push({ id: 'prev', cls: 'pager', go: `#/projects/page/${cur - 1}`, label: 'Previous page', minRows: 2, html: `<span class="kicker">Page ${cur - 1}</span><h3>&larr; Previous</h3>` });
    if (cur < pages) nav.push({ id: 'next', cls: 'pager', go: `#/projects/page/${cur + 1}`, label: 'Next page', minRows: 2, html: `<span class="kicker">Page ${cur + 1}</span><h3>Next &rarr;</h3>` });
    rows.push({ items: nav });
  }
  return { rows, crumb: ['Projects'] };
}

// One video per project: a YouTube link, or a video file (.mp4 / .webm) inside the site.
// Before it is clicked it shows the project's FIRST image as the poster, with a play button.
// Clicking it opens the preview and plays the video there.
function videoOf(src, title, poster) {
  const u = String(src || '').trim();
  if (!u) return '';
  let kind = '';
  let data = '';
  const yt = u.match(/(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i);
  if (yt) { kind = 'yt'; data = `https://www.youtube-nocookie.com/embed/${yt[1]}`; }
  else {
    const file = safeUrl(u);
    if (file && /\.(mp4|webm|ogg)(\?.*)?$/i.test(file)) { kind = 'file'; data = file; }
  }
  if (!kind) return '';
  const art = poster
    ? `<img src="${esc(poster)}" alt="" loading="lazy">`
    : `<span class="vposter-ph">Video</span>`;
  return `<button type="button" class="vposter" data-zoom="video" data-kind="${kind}" data-src="${esc(data)}" aria-label="Play video: ${esc(title)}">`
    + `${art}<span class="play" aria-hidden="true">&#9654;</span></button>`;
}

function projectDetail(p, cols) {
  const all = projectImages(p);
  const vid = videoOf(p.video, p.name, all[0]);
  // with a video, the first image is its poster, so only the other images go in the grid
  const imgs = vid ? all.slice(1) : all;
  const gal = imgs.length
    ? `<div class="gal n${imgs.length}">${imgs.map((src, i) => `<img class="gimg" src="${esc(src)}" alt="${esc(p.name)} image ${i + 1}" loading="lazy" data-zoom="image" tabindex="0" role="button" aria-label="Enlarge ${esc(p.name)} image ${i + 1}">`).join('')}</div>`
    : '';
  const empty = (!vid && !gal) ? `<div class="shot ph"><span>Image placeholder</span></div>` : '';
  const gallery = {
    id: 'gallery', cls: 'detail', minRows: 4, label: '',
    html: `<div class="media">${vid}${gal}${empty}</div>`,
  };
  const overview = {
    id: 'overview', cls: 'detail',
    html: `<div class="p-meta"><span class="kicker">${esc(p.category)}</span>`
      + (has(p.status) ? `<span class="status">${esc(p.status)}</span>` : '') + `</div>`
      + `<h3 class="big">${esc(p.name)}</h3>${paras(p.overview || p.summary)}`,
  };
  const role = has(p.role) ? { id: 'role', cls: 'detail', html: `<h4>My role</h4>${paras(p.role)}` } : null;
  const tech = has(p.tech) ? { id: 'tech', cls: 'detail', html: `<h4>Built with</h4>${tags(p.tech)}` } : null;
  const demo = safeUrl(p.demo);
  const repo = safeUrl(p.repo);
  const links = (demo || repo) ? {
    id: 'links', cls: 'detail',
    html: `<h4>Links</h4><div class="btns">`
      + (demo ? `<a class="btn" href="${esc(demo)}" target="_blank" rel="noopener">Live demo &nearr;</a>` : '')
      + (repo ? `<a class="btn ghost" href="${esc(repo)}" target="_blank" rel="noopener">GitHub repo &nearr;</a>` : '')
      + `</div>`,
  } : null;

  const rows = [{ items: [titlePiece('#/projects', 'Back to Projects', p.name, '')] }];
  rows.push(...pair(gallery, overview, cols, 7, 5));
  rows.push(...flow([role, tech, links].filter(Boolean), pick(cols, 3, 3, 1)));
  return { rows, crumb: ['Projects', p.name] };
}

/* ---------------- ABOUT ---------------- */
function aboutView(d, cols) {
  const a = d.about;
  const photo = {
    id: 'photo', cls: 'detail',
    html: `<figure class="portrait">${safeUrl(a.photo)
      ? `<img src="${esc(safeUrl(a.photo))}" alt="Portrait of ${esc(d.site.name)}" loading="lazy">`
      : '<div class="ph"><span>Profile photo placeholder</span></div>'}</figure>`,
  };
  // if the bio starts with the same name as the headline, don't repeat it
  const headline = has(a.headline) ? a.headline : d.site.name;
  const norm = t => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const bioParts = String(a.bio || '').split(/\n{2,}/);
  const bioText = (bioParts.length > 1 && norm(bioParts[0]) === norm(headline)) ? bioParts.slice(1).join('\n\n') : String(a.bio || '');
  // the name is the headline at the top of the tile, the "Background" label sits right below it
  const bio = has(bioText) ? { id: 'bio', cls: 'detail', html: `<h3 class="bio-name">${esc(headline)}</h3><h4>Background</h4>${paras(bioText)}` } : null;
  const interests = has(a.interests) ? { id: 'interests', cls: 'detail', html: `<h4>Frontend interests</h4>${bullets(a.interests)}` } : null;
  const phil = has(a.philosophy) ? { id: 'philosophy', cls: 'detail', html: `<h4>Design philosophy</h4>${paras(a.philosophy)}` } : null;
  const appr = has(a.approach) ? { id: 'approach', cls: 'detail', html: `<h4>How I solve problems</h4>${paras(a.approach)}` } : null;

  const rows = [{ items: [titlePiece('#/', 'Back to Home', 'About Me', '')] }];
  rows.push(...(bio ? pair(photo, bio, cols, 4, 8) : [{ items: [photo] }]));
  rows.push(...flow([interests, phil, appr].filter(Boolean), pick(cols, 3, 2, 1)));
  return { rows, crumb: ['About Me'] };
}

/* ---------------- SKILLS ---------------- */
function skillsView(d, cols) {
  const items = Object.entries(d.skills).filter(([, v]) => has(v)).map(([name, list]) => ({
    id: `skill-${name.toLowerCase().replace(/\W+/g, '-')}`, cls: 'detail',
    html: `<h4>${esc(name)}</h4>${tags(list)}`,
  }));
  const rows = [{ items: [titlePiece('#/', 'Back to Home', 'Skills & Technologies', 'Technologies I actually work with.')] }];
  rows.push(...flow(items, pick(cols, 3, 2, 1)));
  return { rows, crumb: ['Skills'] };
}

/* ---------------- LEARNING ---------------- */
function learningView(d, cols) {
  const l = d.learning;
  const certs = (l.certificates || []).filter(c => has(c.title)).map((c, i) => {
    const img = safeUrl(c.image);
    const meta = [c.issuer, c.date].filter(has).join(' \u00b7 ');
    return {
      id: `cert-${i}`, cls: 'detail cert', minRows: 3,
      html: (img ? `<img class="cert-img" src="${esc(img)}" alt="${esc(c.title)} certificate" loading="lazy" data-zoom="image" tabindex="0" role="button" aria-label="Enlarge certificate: ${esc(c.title)}">`
        : `<div class="cert-img ph"><span>Certificate image</span></div>`)
        + (meta ? `<span class="kicker">${esc(meta)}</span>` : '')
        + `<h3>${esc(c.title)}</h3>`
        + (has(c.description) ? `<p class="muted">${esc(c.description)}</p>` : ''),
    };
  });
  const items = [];
  if (has(l.current)) items.push({ id: 'l-current', cls: 'detail', html: `<h4>Currently learning</h4>${bullets(l.current)}` });
  if (has(l.exploring)) items.push({ id: 'l-exploring', cls: 'detail', html: `<h4>Technologies I am exploring</h4>${tags(l.exploring)}` });
  if (has(l.experiments)) {
    items.push({
      id: 'l-experiments', cls: 'detail',
      html: `<h4>Experiments &amp; challenges</h4><p class="note">Practice work, not production projects.</p>`
        + `<ul class="bul">${l.experiments.map(x => `<li><strong>${esc(x.name)}</strong>${x.note ? `. ${esc(x.note)}` : ''}</li>`).join('')}</ul>`,
    });
  }
  if (has(l.goals)) items.push({ id: 'l-goals', cls: 'detail', html: `<h4>Next learning goals</h4>${bullets(l.goals)}` });

  const desc = certs.length ? `${certs.length} certificate${certs.length === 1 ? '' : 's'} earned along the way.` : 'Curious, consistent, still growing.';
  const rows = [{ items: [titlePiece('#/', 'Back to Home', 'Learning Journey', desc)] }];
  rows.push(...flow(certs, cols >= 16 ? 5 : pick(cols, 3, 2, 1)));
  rows.push(...flow(items, pick(cols, 2, 2, 1)));
  return { rows, crumb: ['Learning Journey'] };
}

/* ---------------- MILESTONES ---------------- */
function milestonesView(d, cols) {
  const items = d.milestones.map((m, i) => ({
    id: `milestone-${i}`, cls: 'detail',
    html: `<span class="kicker">${esc(m.year)}${m.type ? ` &middot; ${esc(m.type)}` : ''}</span><h3>${esc(m.title)}</h3>${m.detail ? `<p class="muted">${esc(m.detail)}</p>` : ''}`,
  }));
  const rows = [{ items: [titlePiece('#/', 'Back to Home', 'Milestones', '')] }];
  rows.push(...flow(items, pick(cols, 3, 2, 1)));
  return { rows, crumb: ['Milestones'] };
}

/* ---------------- CONTACT ---------------- */
function contactView(d, cols) {
  const c = d.contact;
  const card = (id, label, value, href, valCls = '') => ({
    id, cls: 'detail contact', minRows: 3,
    ...(href ? { href, label: `${label} (opens in a new tab)` } : {}),
    html: `<span class="kicker">${esc(label)}</span><h3 class="c-val ${valCls}">${esc(value)}</h3>`
      + (href ? `<span class="arrow" aria-hidden="true">&rarr;</span>` : ''),
  });
  const fb = safeUrl(c.facebook);
  const items = [
    fb && card('c-fb', 'Facebook', c.facebookName || 'My Facebook page', fb),
    has(c.email) && card('c-mail', 'Gmail', String(c.email).trim().toLowerCase(), '', 'is-mail'),
    has(c.phone) && card('c-phone', 'Contact number', c.phone, ''),
  ].filter(Boolean);

  const form = c.form ? {
    id: 'form', cls: 'detail form', minRows: 4,
    html: `<h4>Send a message</h4>`
      + `<form id="contact-form" action="contact.php" method="post">`
      + `<input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">`
      + `<label>Name<input type="text" name="name" required maxlength="100" autocomplete="name"></label>`
      + `<label>Email<input type="email" name="email" required maxlength="150" autocomplete="email"></label>`
      + `<label>Message<textarea name="message" rows="4" required maxlength="2000"></textarea></label>`
      + `<div class="form-row"><button class="btn" type="submit">Send message</button><p class="form-status" role="status" aria-live="polite"></p></div>`
      + `</form>`,
  } : null;

  const rows = [{ items: [titlePiece('#/', 'Back to Home', 'Contact', c.note || 'Pick the easiest way to reach me.')] }];
  rows.push(...flow(items, cols >= 8 ? 3 : 1));
  if (form) rows.push({ items: [form] });
  return { rows, crumb: ['Contact'] };
}

/* ---------------- SOCIALS ---------------- */
function socialsView(d, cols) {
  const items = d.socials.filter(s => safeUrl(s.url)).map((s, i) => ({
    id: `social-${i}`, cls: 'nav social', href: safeUrl(s.url), label: `${s.label} (opens in a new tab)`, minRows: 2,
    html: `<span class="num">${esc((s.label || '?').slice(0, 2).toUpperCase())}</span>`
      + `<div><h3 class="nav-title">${esc(s.label)}</h3>${s.handle ? `<p class="nav-blurb">${esc(s.handle)}</p>` : ''}</div>`
      + `<span class="arrow" aria-hidden="true">&nearr;</span>`,
  }));
  const rows = [{ items: [titlePiece('#/', 'Back to Home', 'GitHub & Socials', '')] }];
  rows.push(...flow(items, pick(cols, 3, 2, 2)));
  return { rows, crumb: ['GitHub & Socials'] };
}

/* ---------------- entry ---------------- */
export function getView(route, d, cols, env) {
  if (route.key === 'home') return homeView(d, cols, env);
  if (route.id === 'project') {
    const p = (d.projects || []).find(x => x.slug === route.slug);
    return p ? projectDetail(p, cols) : null;
  }
  if (!sectionsOf(d).includes(route.id)) return null;
  switch (route.id) {
    case 'projects': return projectsView(d, cols, route.page);
    case 'about': return aboutView(d, cols);
    case 'skills': return skillsView(d, cols);
    case 'learning': return learningView(d, cols);
    case 'milestones': return milestonesView(d, cols);
    case 'contact': return contactView(d, cols);
    case 'socials': return socialsView(d, cols);
    default: return null;
  }
}
