// Static site generator for Chemistry Notes. No dependencies: `node build.mjs`.
import fs from 'node:fs';
import path from 'node:path';
import { COURSES as CONTENT, STREAMS, LEVELS } from './src/data/content.mjs';
import { EXT, COURSE_EXT, GROUPS } from './src/data/resources.mjs';
import { LINKS } from './src/data/links.mjs';

const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const OUT = process.env.OUT ? path.resolve(process.env.OUT) : path.join(ROOT, 'dist');
const BASE = process.env.BASE ?? '/Chemistry-Notes/';
const VER = Date.now().toString(36);
const SITE = 'Chemistry Notes';
const REPO = 'https://github.com/HirushaW/Chemistry-Notes';
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8'));
const courses = read('courses.json'), files = read('files.json'), books = read('books.json'), elements = read('elements.json'), videos = read('videos.json');

/* ---------- helpers ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const u = p => BASE + p;
const slug = s => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const cUrl = c => `courses/${c.code.toLowerCase()}/`;
const sUrl = (c, s) => `${cUrl(c)}${s.slug}/`;
const sid = (c, s) => `${c.code}/${s.slug}`;
const mb = b => b >= 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB';
const plural = (n, w, p = w + 's') => `${n} ${n === 1 ? w : p}`;
const write = (rel, html) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };
const streamOf = c => STREAMS[c.stream] || STREAMS.gen;
const byCode = new Map(courses.map(c => [c.code, c]));
const filesOf = (code, sec) => files.filter(f => f.code === code && f.sec === sec).sort((a, b) => a.o - b.o);
const papersOf = code => files.filter(f => f.code === code && f.kind === 'paper').sort((a, b) => a.o - b.o);
const isFile = f => f.kind !== 'paper';
const nFiles = c => files.filter(f => f.code === c.code && isFile(f)).length;
const semLabel = s => ({ '1': 'Semester 1', '2': 'Semester 2', '1-2': 'Semesters 1–2', '': 'First year' }[s] ?? `Semester ${s}`);

const I = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', close: '<path d="M6 6l12 12M18 6 6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', chev: '<path d="m9 6 6 6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/>', play: '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  map: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="9" cy="18" r="2.5"/><path d="M8.4 6.4 15.6 7.6M6.8 8.4 8.3 15.6M16.6 10 10.7 16.3"/>',
  atom: '<circle cx="12" cy="12" r="1.6" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>', download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  papers: '<path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z"/><path d="M16 5h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2M9 12h6M9 16h4"/>',
  table: '<rect x="3" y="4" width="4" height="4" rx="1"/><rect x="17" y="4" width="4" height="4" rx="1"/><rect x="3" y="10" width="4" height="4" rx="1"/><rect x="8.5" y="10" width="4" height="4" rx="1"/><rect x="17" y="10" width="4" height="4" rx="1"/><path d="M5 18h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', reset: '<path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5"/>', pause: '<path d="M9 6v12M15 6v12"/>',
  check: '<path d="m5 12 4.5 4.5L19 7"/>', pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>', video: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
};
const ic = (n, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${Object.entries(I).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')}</svg>`;
const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cbff2e"/><stop offset="1" stop-color="#863dff"/></linearGradient></defs><path d="M20 3.5 34.3 11.75v16.5L20 36.5 5.7 28.25v-16.5z" fill="rgba(134,61,255,.12)" stroke="url(#lg)" stroke-width="2.2" stroke-linejoin="round"/><circle cx="20" cy="20" r="7" fill="none" stroke="#dcdfff" stroke-opacity=".7" stroke-width="1.4" stroke-dasharray="2.5 2.5"/><circle cx="20" cy="20" r="2.6" fill="#cbff2e"/><g class="logo-orbit"><circle cx="20" cy="8.2" r="2.2" fill="#cbff2e"/></g></svg>`;

/* ---------- layout ---------- */
function layout({ title, desc, active = '', body, scripts = '', head = '', page = '' }) {
  const lv = [1000, 2000, 3000, 4000];
  const nav = [['map/', 'Chemistry Map', 'map'], ['papers/', 'Past Papers', 'papers'], ['library/', 'Library', 'library'], ['periodic-table/', 'Periodic Table', 'ptable'], ['resources/', 'Resources', 'resources'], ['about/', 'About', 'about']];
  return `<!doctype html>
<html lang="en" data-base="${BASE}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#070a26">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<link rel="icon" href="${u('assets/img/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap">
<link rel="stylesheet" href="${u('assets/css/site.css')}?v=${VER}">
${head}
</head>
<body data-page="${page}">
<a class="skip" href="#main">Skip to content</a>
${sprite}
<div class="bg" aria-hidden="true"><div class="aurora"><span></span><span></span><span></span></div><div class="bg-grid"></div><canvas id="bg-canvas"></canvas><div class="bg-noise"></div></div>
<header class="site-header">
  <div class="container">
    <a class="brand" href="${u('')}" aria-label="${SITE} home">${LOGO}<span>${SITE}<small>UoP · 1000–4000 Level</small></span></a>
    <button class="menu-btn" aria-label="Menu" aria-expanded="false">${ic('menu')}</button>
    <nav class="nav" aria-label="Main">
      <div class="dd"><button class="navbtn" aria-expanded="false" aria-haspopup="true">Levels ${ic('down').replace('<svg', '<svg style="width:14px;height:14px;display:inline;vertical-align:-2px"')}</button>
        <div class="dd-menu">${lv.map(l => `<a href="${u(`levels/${l}/`)}"${active === 'l' + l ? ' aria-current="page"' : ''}>${l} Level <small>${courses.filter(c => c.level === l).length} courses</small></a>`).join('')}</div></div>
      ${nav.map(([p, t, k]) => `<a href="${u(p)}"${active === k ? ' aria-current="page"' : ''}>${t}</a>`).join('')}
      <button class="search-btn" type="button" aria-label="Search">${ic('search')}<span>Search</span><kbd>Ctrl K</kbd></button>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="container">
    <div><a class="brand" href="${u('')}">${LOGO}<span>${SITE}<small>UoP · 1000–4000 Level</small></span></a>
      <p style="margin-top:14px;max-width:360px">An unofficial study hub for the B.Sc. chemistry courses of the University of Peradeniya: lecture notes, tutorials with answers, past papers, textbook chapters, videos and tools, organised by level and section.</p></div>
    <div><h4>Levels</h4><ul>${lv.map(l => `<li><a href="${u(`levels/${l}/`)}">${l} Level</a></li>`).join('')}</ul></div>
    <div><h4>Explore</h4><ul><li><a href="${u('map/')}">Chemistry Map</a></li><li><a href="${u('papers/')}">Past paper bank</a></li><li><a href="${u('library/')}">Library</a></li><li><a href="${u('periodic-table/')}">Periodic table</a></li><li><a href="${u('resources/')}">Resources</a></li></ul></div>
    <div><h4>Site</h4><ul><li><a href="${u('about/')}">About and sources</a></li><li><a href="${REPO}/issues" target="_blank" rel="noopener">Report a problem</a></li><li><a href="${REPO}" target="_blank" rel="noopener">Source on GitHub</a></li></ul></div>
  </div>
  <div class="foot-bottom"><div class="container"><span>Unofficial student project · Notes belong to their lecturers and are shared for study only</span><span>Built ${new Date().toISOString().slice(0, 10)}</span></div></div>
</footer>
<dialog class="viewer" id="viewer" aria-label="Document preview">
  <div class="viewer-bar"><b>Document</b><a class="btn btn-sm btn-ghost" data-v="dl" href="#" target="_blank" rel="noopener">${ic('download')}<span>Download</span></a><a class="btn btn-sm" data-v="open" href="#" target="_blank" rel="noopener">${ic('ext')}<span>Drive</span></a><button class="btn btn-sm btn-icon" data-close aria-label="Close">${ic('close')}</button></div>
  <div class="viewer-body"></div>
</dialog>
<dialog class="palette" id="palette" aria-label="Search">
  <div class="palette-input">${ic('search')}<input type="search" placeholder="Search courses, topics, notes, papers, elements…" aria-label="Search" autocomplete="off"><kbd>Esc</kbd></div>
  <div class="palette-results"></div>
  <div class="palette-foot"><span>↑↓ to move</span><span>Enter to open</span><span>Ctrl K to toggle</span></div>
</dialog>
<script src="${u('assets/js/app.js')}?v=${VER}" defer></script>
<script src="${u('assets/js/bg.js')}?v=${VER}" defer></script>
${scripts}
</body>
</html>`;
}
const crumbs = list => `<nav class="crumbs" aria-label="Breadcrumb">${list.map(([t, p], i) => i < list.length - 1 ? `<a href="${u(p)}">${esc(t)}</a>${ic('chev')}` : `<span>${esc(t)}</span>`).join('')}</nav>`;

/* ---------- shared components ---------- */
function courseCard(c, i = 0) {
  const st = streamOf(c), fs_ = files.filter(f => f.code === c.code);
  const n = { note: 0, tutorial: 0, answers: 0, paper: 0 }; fs_.forEach(f => n[f.kind]++);
  const tot = Math.max(1, fs_.length);
  const bar = [['note', 'var(--violet-text)'], ['tutorial', 'var(--cyan)'], ['answers', 'var(--mint)'], ['paper', 'var(--amber)']].map(([k, col]) => n[k] ? `<span style="width:${(n[k] / tot * 100).toFixed(1)}%;background:${col}"></span>` : '').join('');
  return `<a class="card hoverable" data-tilt style="--c:${st.color}" href="${u(cUrl(c))}">
    <span class="stream-line"></span>
    <div class="card-top"><span class="code">${c.code}</span><span class="badge">${c.credits ? c.credits + ' credits' : st.name}</span></div>
    <h3 style="view-transition-name:t-${c.code.toLowerCase()}">${esc(c.title)}</h3>
    <p>${esc(c.tagline)}</p>
    <div class="meta"><span><b>${c.sections.length}</b> ${c.sections.length === 1 ? 'section' : 'sections'}</span><span><b>${n.note + n.tutorial + n.answers}</b> files</span><span><b>${n.paper}</b> papers</span><span>${st.name}</span></div>
    ${fs_.length ? `<div class="bar">${bar}</div>` : '<div class="bar"><span style="width:100%;background:linear-gradient(90deg,var(--violet),transparent)"></span></div>'}
  </a>`;
}
const KIND = { note: ['Lecture notes', 'file'], tutorial: ['Tutorial', 'pencil'], answers: ['Answers', 'check'], paper: ['Past paper', 'papers'] };
function fileRow(f, c) {
  const t = `${c.code} · ${f.t}`;
  return `<div class="file kind-${f.kind}" id="f-${f.id}" data-item data-search="${esc((f.t + ' ' + (f.lect || '')).toLowerCase())}">
    <span class="ficon">${ic(KIND[f.kind][1])}</span>
    <div><button class="ft" data-pdf="${f.id}" data-title="${esc(t)}">${esc(f.t)}</button>
      <div class="fm"><span>${KIND[f.kind][0]}</span>${f.pg ? `<span>${plural(f.pg, 'page')}</span>` : ''}<span>${mb(f.sz)}</span>${f.lect ? `<span>${esc(f.lect)}</span>` : ''}</div></div>
    <div class="fa"><button class="btn btn-sm" data-pdf="${f.id}" data-title="${esc(t)}">${ic('eye')}Preview</button><a class="btn btn-sm btn-ghost" href="https://drive.google.com/file/d/${f.id}/view" target="_blank" rel="noopener">${ic('ext')}Drive</a></div>
  </div>`;
}
const refRow = r => `<${r.url ? `a href="${esc(r.url)}" target="_blank" rel="noopener"` : 'div'} class="ref"><span class="ficon">${ic('book')}</span><span><b>${esc(r.book)}${r.free ? ' <span class="badge badge-volt" style="margin-left:6px">free online</span>' : ''}</b><span>${esc(r.label)}</span></span>${r.url ? ic('ext', 'go') : ''}</${r.url ? 'a' : 'div'}>`;
const videoCard = v => `<div class="video"><button class="thumb" data-yt="${v.id}" data-title="${esc(v.t)}" style="background-image:url(https://i.ytimg.com/vi/${v.id}/hqdefault.jpg)" aria-label="Play: ${esc(v.t)}"><span class="play">${ic('play')}</span>${v.len ? `<span class="len">${esc(v.len)}</span>` : ''}</button><div class="vb"><b>${esc(v.t)}</b><span>${esc(v.ch)} · YouTube</span></div></div>`;
const host = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };
const xlink = ([name, url, d]) => `<a class="xlink" href="${esc(url)}" target="_blank" rel="noopener" data-item data-search="${esc((name + ' ' + d).toLowerCase())}"><span class="fav">${esc(name.replace(/^the /i, '').charAt(0))}</span><span><b>${esc(name)}</b><span>${esc(d)}</span><small>${esc(host(url))}</small></span></a>`;
const extItem = k => Array.isArray(k) ? k : EXT[k] ? EXT[k] : null;

/* ---------- graph links (shared by course, section and map pages) ---------- */
const secByKey = new Map();
for (const c of courses) for (const s of c.sections) secByKey.set(`${c.code}|${s.name}`, { c, s });
const LINKED = LINKS.map(([a, b, idea]) => {
  const A = secByKey.get(a), B = secByKey.get(b);
  if (!A || !B) throw new Error('Bad link ' + a + ' -> ' + b);
  return { a: A, b: B, idea };
});

const paperTitle = p => (p.yr && p.t.replace(/\s*[-–]\s*/g, '-') === p.yr.replace('–', '-')) ? 'Examination paper' : p.t;
const paperGrid = (c, papers) => `<div class="paper-grid">${papers.map(p => `<button class="paper" data-pdf="${p.id}" data-title="${esc(c.code + ' · ' + p.t)}"><span class="yr">${esc(p.yr || '—')}</span><span><b>${esc(paperTitle(p))}</b><small>${p.ans ? 'with answers · ' : ''}${mb(p.sz)}${p.pg ? ' · ' + plural(p.pg, 'page') : ''}</small></span></button>`).join('')}</div>`;
const ytSearch = q => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q + ' chemistry lecture');
const ytMore = (q, label = q) => `<a class="btn btn-ghost btn-sm yt-more" href="${esc(ytSearch(q))}" target="_blank" rel="noopener">${ic('search')}More on YouTube: ${esc(label)}${ic('ext', 'arrow')}</a>`;

/* ---------- Chemistry Map data: shared by the 3D atom (home and map pages) and the bubble map ---------- */
// one colour per energy level of the atom: its shell and its filter chip (electrons take their stream's colour)
const LEVEL_COLORS = { 1000: '#ff5c7a', 2000: '#ffb43d', 3000: '#4dffa6', 4000: '#3fd2ff' };
function mapData() {
  const yt = (c, s) => videos[`${c.code}|${s.name}`] || [];
  const newest = list => list.slice().sort((a, b) => (b.yr || '').localeCompare(a.yr || '') || a.o - b.o);
  return {
    levelColors: LEVEL_COLORS,
    streams: Object.entries(STREAMS).map(([id, s]) => ({ id, name: s.name, color: s.color, blurb: s.blurb, courses: courses.filter(c => c.stream === id).map(c => c.code) })),
    courses: courses.map(c => ({
      id: c.code, title: c.title, level: c.level, stream: c.stream, url: cUrl(c), tagline: c.tagline, about: c.about, sem: c.sem ? semLabel(c.sem).replace('Semester ', '').replace('Semesters ', '') : '', credits: c.credits,
      counts: { notes: nFiles(c), papers: c.papers }, sections: c.sections.map(s => sid(c, s)), pre: c.pre,
      paperList: newest(papersOf(c.code)).slice(0, 6).map(p => [p.id, paperTitle(p) === 'Examination paper' ? `${p.t} paper` : p.t, p.ans ? 1 : 0]),
      videos: c.sections.flatMap(s => yt(c, s).slice(0, 1)).slice(0, 4).map(v => [v.id, v.t, v.ch]),
    })),
    sections: courses.flatMap(c => c.sections.map(s => ({
      id: sid(c, s), code: c.code, name: s.name, url: sUrl(c, s), summary: s.summary, topics: s.topics, hours: s.hours, counts: s.counts,
      notes: filesOf(c.code, s.name).slice(0, 6).map(f => [f.id, f.t]), refs: s.refs.slice(0, 3).map(r => [r.book, r.label, r.url]),
      videos: yt(c, s).slice(0, 3).map(v => [v.id, v.t, v.ch]),
    }))),
    links: LINKED.map(l => [sid(l.a.c, l.a.s), sid(l.b.c, l.b.s), l.idea]),
  };
}
const exploreScripts = () => ['map-data', 'explore-core', 'atom'].map(f => `<script src="${u(`assets/js/${f}.js`)}?v=${VER}" defer></script>`).join('');

// The Chemistry Atom: a nucleus with four shells (the levels); every course is an electron. Driven by atom.js.
// Filters keep only the chosen streams and levels in the atom; shells take their level's colour, electrons their stream's.
function atomBlock({ head = true, hash = false } = {}) {
  const ctl = (k, icon, label, extra = '') => `<button class="atom-btn" type="button" data-atom-ctrl="${k}" aria-label="${label}" title="${label}"${extra}>${ic(icon)}</button>`;
  return `<div class="atom" data-atom${hash ? ' data-atom-hash' : ''}>
  ${head ? `<div class="section-head"><div><span class="eyebrow">The Chemistry Atom</span><h2>Four levels, one atom</h2></div><p>The nucleus is chemistry itself, each coloured shell is a level from 1000 to 4000, and every electron is a course. Drag to turn it any way, scroll or pinch to zoom into the inner shells, and pick an electron to open the course with its notes, past papers and videos.</p></div>` : ''}
  <div class="atom-filters">
    <div class="chips" role="group" aria-label="Show streams"><button class="chip" type="button" data-atom-stream="all" aria-pressed="true">All streams</button>${Object.entries(STREAMS).map(([k, s]) => `<button class="chip" type="button" style="--c:${s.color}" data-atom-stream="${k}" aria-pressed="false"><span class="dot"></span>${s.name}</button>`).join('')}</div>
    <div class="chips lv-chips" role="group" aria-label="Show levels"><button class="chip" type="button" data-atom-level="all" aria-pressed="true">All levels</button>${[1000, 2000, 3000, 4000].map((l, i) => `<button class="chip" type="button" style="--c:${LEVEL_COLORS[l]}" data-atom-level="${l}" aria-pressed="false"><span class="dot"></span><b>${l}</b><small>n=${i + 1}</small></button>`).join('')}</div>
  </div>
  <div class="atom-wrap">
    <div class="atom-stage" tabindex="0" role="group" aria-label="3D atom. Drag or use the arrow keys to turn it, scroll, pinch or press plus and minus to zoom, 0 to reset.">
      <canvas aria-hidden="true"></canvas>
      <div class="atom-electrons" role="group" aria-label="Courses, as electrons on their level's shell"></div>
      <div class="u-tip atom-tip" hidden></div>
      <p class="atom-note" aria-live="polite"></p>
      <div class="atom-ctrl" role="group" aria-label="View">${ctl('in', 'plus', 'Zoom in')}${ctl('out', 'minus', 'Zoom out')}${ctl('reset', 'reset', 'Reset view')}${ctl('pause', 'pause', 'Pause motion', ' aria-pressed="false"')}</div>
    </div>
    <aside class="f-panel atom-panel" hidden aria-live="polite" aria-label="Course details"><button class="btn btn-sm btn-icon close" type="button" aria-label="Close">${ic('close')}</button><div class="p-body"></div></aside>
  </div>
</div>`;
}

/* ---------- pages ---------- */
const totals = {
  courses: courses.length, sections: courses.reduce((n, c) => n + c.sections.length, 0),
  files: files.filter(isFile).length, papers: files.filter(f => f.kind === 'paper').length,
  books: books.length, videos: Object.values(videos).reduce((n, v) => n + v.length, 0),
};

function home() {
  const lv = [1000, 2000, 3000, 4000];
  const formulas = ['PV = nRT', 'ΔG = ΔH − TΔS', 'E = E° − (RT/nF) ln Q', 'Ĥψ = Eψ', 'k = A·e^(−Eₐ/RT)', 'λ = h / p', 'pH = −log[H₃O⁺]', 'A = εbc', 'nλ = 2d sin θ', 'ΔE = hν', 'μ = √(n(n+2)) μB', 'K = e^(−ΔG°/RT)', 'q = Σ gᵢ e^(−εᵢ/kT)', 'i = nFAk°C', '18 e⁻ rule', 'σ = Σ σᵢ', 'ln(k₂/k₁) = −Eₐ/R (1/T₂ − 1/T₁)'];
  const body = `
<section class="hero">
  <div class="container hero-grid">
    <div>
      <span class="eyebrow rise">University of Peradeniya · Department of Chemistry</span>
      <h1 class="rise" style="--i:1">Every chemistry note,<br><span class="gradient-text">1000 to 4000&nbsp;Level.</span></h1>
      <p class="lead rise" style="--i:2">${totals.files} lecture notes and tutorials and ${totals.papers} past papers, organised by course and syllabus section. Each section links the exact textbook chapters, hand-picked videos and the best free resources.</p>
      <div class="hero-cta rise" style="--i:3">
        <a class="btn btn-primary" href="${u('map/')}">${ic('atom')}Explore the Chemistry Map${ic('arrow', 'arrow')}</a>
        <a class="btn btn-ghost" href="${u('levels/2000/')}">${ic('grid')}Browse courses</a>
      </div>
      <div class="stats rise" style="--i:4">
        <div class="stat"><b data-count="${totals.courses}">${totals.courses}</b><span>courses</span></div>
        <div class="stat"><b data-count="${totals.files}">${totals.files}</b><span>notes</span></div>
        <div class="stat"><b data-count="${totals.papers}">${totals.papers}</b><span>past papers</span></div>
        <div class="stat"><b data-count="${totals.videos}">${totals.videos}</b><span>videos</span></div>
      </div>
    </div>
    <div class="hero-visual">
      <div class="pt3d-wrap"><div class="pt3d-floor"></div><div class="pt3d" role="img" aria-label="Animated 3D periodic table"></div><div class="pt-tip"></div></div>
      <p class="mono faint" style="text-align:center;font-size:.78rem;margin:4px 0 0" data-ticker aria-live="off">Hover an element · click to open it</p>
    </div>
  </div>
</section>
<div class="marquee" aria-hidden="true"><div class="marquee-track">${[...formulas, ...formulas].map(f => `<span class="formula">${esc(f)}</span>`).join('')}</div></div>

<section class="section atom-sec"><div class="container">${atomBlock()}</div></section>

<section class="section">
  <div class="container">
    <div class="section-head"><div><span class="eyebrow">Pick your level</span><h2>Four years, one map</h2></div><p>Each level page lists its courses by semester. Every course opens into its syllabus sections, with notes, tutorials, past papers and references.</p></div>
    <div class="grid grid-4" data-stagger>
      ${lv.map(l => { const cs = courses.filter(c => c.level === l); const nf = files.filter(f => byCode.get(f.code)?.level === l); return `<a class="card hoverable level-card" data-tilt href="${u(`levels/${l}/`)}">
        <svg class="hex" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4 90 27v46L50 96 10 73V27z" fill="none" stroke="#cbff2e" stroke-width="3"/></svg>
        <span class="num">${l / 1000}<small>000</small></span>
        <h3>${LEVELS[l].sub}</h3>
        <p>${esc(LEVELS[l].blurb.split('. ')[0].replace(/\.$/, ''))}.</p>
        <div class="meta"><span><b>${cs.length}</b> courses</span>${nf.length ? `<span><b>${nf.filter(isFile).length}</b> notes</span><span><b>${nf.filter(f => f.kind === 'paper').length}</b> papers</span>` : '<span><b>syllabus</b> + free textbooks</span>'}</div>
      </a>`; }).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head"><div><span class="eyebrow">Study tools</span><h2>Everything in one place</h2></div></div>
    <div class="grid grid-4" data-stagger>
      <a class="card hoverable" data-tilt href="${u('papers/')}" style="--c:var(--amber)"><span class="stream-line"></span>${ic('papers').replace('<svg', '<svg style="width:30px;height:30px;color:var(--amber);margin-bottom:16px"')}<h3>Past paper bank</h3><p>${totals.papers} papers from 2006 to 2024, searchable by course, level and year.</p></a>
      <a class="card hoverable" data-tilt href="${u('library/')}" style="--c:var(--volt)"><span class="stream-line"></span>${ic('book').replace('<svg', '<svg style="width:30px;height:30px;color:var(--volt);margin-bottom:16px"')}<h3>Library</h3><p>${totals.books} recommended textbooks with exact chapters per section. ${books.filter(b => b.free).length} are free to read online.</p></a>
      <a class="card hoverable" data-tilt href="${u('periodic-table/')}" style="--c:var(--cyan)"><span class="stream-line"></span>${ic('table').replace('<svg', '<svg style="width:30px;height:30px;color:var(--cyan);margin-bottom:16px"')}<h3>Periodic table</h3><p>All 118 elements with PubChem data and heat maps for electronegativity, radius and more.</p></a>
      <a class="card hoverable" data-tilt href="${u('resources/')}" style="--c:var(--pink)"><span class="stream-line"></span>${ic('globe').replace('<svg', '<svg style="width:30px;height:30px;color:var(--pink);margin-bottom:16px"')}<h3>Resources</h3><p>Open courses, journals, spectral databases and 3D tools, checked and grouped.</p></a>
    </div>
  </div>
</section>

<section class="section" style="padding-top:10px">
  <div class="container">
    <div class="section-head"><div><span class="eyebrow">How to use it</span><h2>From syllabus to exam in four steps</h2></div></div>
    <div class="steps" data-stagger>
      <div class="panel step"><h3>Find your section</h3><p class="muted">Open your level, then your course. Sections follow the official syllabus order.</p></div>
      <div class="panel step"><h3>Read the notes</h3><p class="muted">Preview any PDF in place, open it in Drive or download it for offline study.</p></div>
      <div class="panel step"><h3>Go deeper</h3><p class="muted">Each section names the exact textbook chapters, plus videos from MIT, NPTEL, Khan Academy and more.</p></div>
      <div class="panel step"><h3>Practise</h3><p class="muted">Work through tutorials with answers, then the past papers for that course.</p></div>
    </div>
  </div>
</section>`;
  return layout({
    title: `${SITE} · UoP Chemistry Hub, 1000–4000 Level`, desc: 'Unofficial study hub for University of Peradeniya chemistry: notes, tutorials, past papers, textbook chapters and videos for every course from 1000 to 4000 Level.',
    body, page: 'home',
    scripts: `<script type="application/json" id="elements-data">${JSON.stringify(elements.map(e => ({ z: e.z, s: e.s, n: e.n, m: e.m, g: e.g })))}</script>
<script src="${u('assets/js/pt-core.js')}?v=${VER}" defer></script><script src="${u('assets/js/hero.js')}?v=${VER}" defer></script><script src="${u('assets/js/spider.js')}?v=${VER}" defer></script>${exploreScripts()}`,
  });
}

function levelPage(l) {
  const cs = courses.filter(c => c.level === l);
  const sems = [...new Set(cs.map(c => c.sem))].sort((a, b) => (a || '0').localeCompare(b || '0'));
  const nf = files.filter(f => byCode.get(f.code)?.level === l);
  const body = `
<section class="page-head">
  <div class="container">
    ${crumbs([['Home', ''], [`${l} Level`]])}
    <span class="eyebrow">${LEVELS[l].sub}</span>
    <h1>${l} Level</h1>
    <p class="tagline">${esc(LEVELS[l].blurb)}</p>
    <div class="facts"><span class="badge badge-volt">${plural(cs.length, 'course')}</span><span class="badge">${nf.filter(isFile).length} notes and tutorials</span><span class="badge">${plural(nf.filter(f => f.kind === 'paper').length, 'past paper')}</span><span class="badge">${cs.reduce((n, c) => n + c.sections.length, 0)} syllabus sections</span></div>
  </div>
</section>
${l === 1000 ? `<div class="container"><div class="notice">${ic('info')}<span>The 1000 Level folder has no lecture notes yet, so these courses are built from the handbook syllabus with chapter-level references to free textbooks such as OpenStax Chemistry 2e and OpenStax Organic Chemistry.</span></div></div>` : ''}
${sems.map(s => `<section class="section-tight"><div class="container"><div class="section-head" style="margin-bottom:18px"><h2 style="font-size:1.4rem;margin:0">${semLabel(s)}</h2><span class="faint mono" style="font-size:.8rem">${plural(cs.filter(c => c.sem === s).length, 'course')}</span></div>
  <div class="grid grid-3" data-stagger>${cs.filter(c => c.sem === s).map(courseCard).join('')}</div></div></section>`).join('')}
<section class="section-tight"><div class="container" style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap">
  ${l > 1000 ? `<a class="btn btn-ghost" href="${u(`levels/${l - 1000}/`)}">← ${l - 1000} Level</a>` : '<span></span>'}
  ${l < 4000 ? `<a class="btn btn-ghost" href="${u(`levels/${l + 1000}/`)}">${l + 1000} Level →</a>` : `<a class="btn btn-ghost" href="${u('map/')}">${ic('map')}Chemistry Map</a>`}
</div></section>`;
  write(`levels/${l}/index.html`, layout({ title: `${l} Level · ${SITE}`, desc: LEVELS[l].blurb, active: 'l' + l, body, page: 'level' }));
}

function coursePage(c) {
  const st = streamOf(c), papers = papersOf(c.code);
  const leads = courses.filter(x => x.pre.includes(c.code));
  const allRefs = [], seen = new Set();
  for (const s of c.sections) for (const r of s.refs) { const k = r.book + '|' + r.label; if (!seen.has(k)) { seen.add(k); allRefs.push(r); } }
  const vids = c.sections.flatMap(s => (videos[`${c.code}|${s.name}`] || []).slice(0, 1)).slice(0, 6);
  const ext = (COURSE_EXT[c.code] || []).map(extItem).filter(Boolean);
  const nf = files.filter(f => f.code === c.code && isFile(f));
  const preLinks = c.pre.map(p => byCode.has(p) ? `<a href="${u(cUrl(byCode.get(p)))}">${p}</a>` : `<span>${p}</span>`).join(', ');
  const body = `
<section class="page-head" style="--c:${st.color}">
  <div class="container">
    ${crumbs([['Home', ''], [`${c.level} Level`, `levels/${c.level}/`], [c.code]])}
    <div class="course-code">${c.code}</div>
    <h1 style="view-transition-name:t-${c.code.toLowerCase()}">${esc(c.title)}</h1>
    <p class="tagline">${esc(c.tagline)}</p>
    <div class="facts">
      <span class="chip" style="--c:${st.color}"><span class="dot"></span>${st.name}</span>
      <span class="badge">${c.level} Level</span><span class="badge">${semLabel(c.sem)}</span>${c.credits ? `<span class="badge">${c.credits} credits</span>` : ''}<span class="badge">${esc(c.type)}</span>
      ${c.papers ? `<span class="badge badge-volt">${plural(c.papers, 'past paper')}${c.years ? ' · ' + esc(c.years) : ''}</span>` : ''}
    </div>
    <div class="hero-cta" style="margin:26px 0 0">
      <a class="btn btn-primary" href="#sections">${ic('layers')}Sections${ic('arrow', 'arrow')}</a>
      ${papers.length ? `<a class="btn btn-ghost" href="#papers">${ic('papers')}Past papers</a>` : ''}
      <a class="btn btn-ghost" href="${u('map/')}#${c.code}">${ic('map')}On the map</a>
    </div>
  </div>
</section>
<section class="section-tight"><div class="container about-box">
  <div class="panel reveal"><h3>${ic('info')}About this course</h3><p style="margin:0">${esc(c.about)}</p></div>
  <div class="panel reveal" style="--i:1"><dl class="kv">
    <dt>Code</dt><dd class="mono">${c.code}</dd>
    <dt>Credits</dt><dd>${c.credits ?? '—'}</dd>
    <dt>When</dt><dd>${semLabel(c.sem)}</dd>
    <dt>Needs</dt><dd>${preLinks || 'None'}</dd>
    ${leads.length ? `<dt>Leads to</dt><dd>${leads.map(l => `<a href="${u(cUrl(l))}">${l.code}</a>`).join(', ')}</dd>` : ''}
    <dt>Texts</dt><dd>${c.texts.map(esc).join('; ')}</dd>
  </dl></div>
</div></section>
<section class="section-tight" id="sections"><div class="container">
  <div class="section-head"><div><span class="eyebrow">Syllabus</span><h2>${plural(c.sections.length, 'section')}</h2></div><div class="counter-row" style="min-width:min(100%,380px)"><div class="counter"><b>${nf.length}</b><span>notes</span></div><div class="counter"><b>${papers.length}</b><span>papers</span></div><div class="counter"><b>${allRefs.length}</b><span>chapters</span></div></div></div>
  <div class="grid grid-2" data-stagger>${c.sections.map((s, i) => {
    const n = s.counts.notes + s.counts.tut + s.counts.ans;
    return `<a class="card hoverable sec-card" data-tilt style="--c:${st.color}" href="${u(sUrl(c, s))}"><span class="stream-line"></span>
      <div class="card-top"><span class="idx">SECTION ${String(i + 1).padStart(2, '0')}${s.hours ? ' · ' + esc(s.hours) : ''}</span><span class="badge${n ? ' badge-violet' : ''}">${n ? plural(n, 'file') : 'chapters only'}</span></div>
      <h3 style="view-transition-name:s-${c.code.toLowerCase()}-${s.slug}">${esc(s.name)}</h3><p>${esc(s.summary)}</p>
      <div class="topics">${s.topics.slice(0, 6).map(t => `<span>${esc(t)}</span>`).join('')}${s.topics.length > 6 ? `<span>+${s.topics.length - 6}</span>` : ''}</div></a>`;
  }).join('')}</div>
</div></section>
<section class="section-tight" id="papers"><div class="container">
  <div class="section-head"><div><span class="eyebrow">Exam practice</span><h2>Past papers</h2></div>${papers.length ? `<p>${plural(papers.length, 'paper')}${c.years ? ', ' + esc(c.years) : ''}. Click to preview.</p>` : ''}</div>
  ${papers.length ? paperGrid(c, papers) : `<div class="empty">${ic('papers')}No past papers in the collection for this course yet.</div>`}
</div></section>
${allRefs.length ? `<section class="section-tight"><div class="container"><div class="section-head"><div><span class="eyebrow">Read</span><h2>Textbook chapters</h2></div><p>The chapters that match this syllabus. Free books open directly; others link to the catalogue record.</p></div><div class="refs">${allRefs.map(refRow).join('')}</div></div></section>` : ''}
<section class="section-tight"><div class="container"><div class="section-head"><div><span class="eyebrow">Watch</span><h2>Video lectures</h2></div><p>One pick per section. Each section page has more, plus a YouTube search for that topic.</p></div>${vids.length ? `<div class="videos">${vids.map(videoCard).join('')}</div>` : ''}<div class="yt-row">${ytMore(c.title)}</div></div></section>
${ext.length ? `<section class="section-tight"><div class="container"><div class="section-head"><div><span class="eyebrow">Explore</span><h2>Websites and tools</h2></div></div><div class="links">${ext.map(xlink).join('')}</div></div></section>` : ''}`;
  write(`${cUrl(c)}index.html`, layout({ title: `${c.code} ${c.title} · ${SITE}`, desc: c.tagline, active: 'l' + c.level, body, page: 'course' }));
}

function sectionPage(c, s, idx) {
  const st = streamOf(c), fs_ = filesOf(c.code, s.name);
  const notes = fs_.filter(f => f.kind === 'note'), tuts = fs_.filter(f => f.kind === 'tutorial' || f.kind === 'answers');
  const vids = videos[`${c.code}|${s.name}`] || [], papers = papersOf(c.code);
  const ext = (COURSE_EXT[c.code] || []).map(extItem).filter(Boolean);
  const from = LINKED.filter(l => l.b.s === s && l.b.c === c), to = LINKED.filter(l => l.a.s === s && l.a.c === c);
  const prev = c.sections[idx - 1], next = c.sections[idx + 1];
  const tabs = [
    ['notes', 'Notes', 'file', notes.length], ['tutorials', 'Tutorials', 'pencil', tuts.length], ['papers', 'Past papers', 'papers', papers.length], ['chapters', 'Chapters', 'book', s.refs.length],
    ['videos', 'Videos', 'video', vids.length], ['websites', 'Websites', 'globe', ext.length],
  ].filter(t => !['tutorials', 'papers'].includes(t[0]) || t[3]);
  const first = (tabs.find(t => t[3] && t[0] !== 'papers') || tabs[0])[0];
  const relRow = (l, dir) => { const o = dir === 'from' ? l.a : l.b; const oc = streamOf(o.c); return `<a class="rel" style="--c:${oc.color}" href="${u(sUrl(o.c, o.s))}"><span class="dot"></span><span><span style="color:var(--white);font-weight:700">${esc(o.s.name)}</span><small>${o.c.code} · ${o.c.level} Level</small></span><em>${esc(l.idea)}</em></a>`; };
  const panelFiles = (list, emptyMsg) => list.length ? `<div class="files" data-filter-root>${list.length > 8 ? `<div class="toolbar" style="margin-bottom:6px"><label class="input">${ic('search')}<input type="search" data-q placeholder="Filter ${list.length} files…" aria-label="Filter files"></label></div>` : ''}${list.map(f => fileRow(f, c)).join('')}</div>` : `<div class="empty">${ic('file')}${emptyMsg}</div>`;
  const body = `
<section class="page-head" style="--c:${st.color}">
  <div class="container">
    ${crumbs([['Home', ''], [`${c.level} Level`, `levels/${c.level}/`], [c.code, cUrl(c)], [s.name]])}
    <div class="course-code">${c.code} · Section ${String(idx + 1).padStart(2, '0')}${s.hours ? ' · ' + esc(s.hours) : ''}</div>
    <h1 style="view-transition-name:s-${c.code.toLowerCase()}-${s.slug}">${esc(s.name)}</h1>
    <p class="tagline">${esc(s.summary)}</p>
    <div class="chips" style="margin-top:18px">${s.topics.map(t => `<span class="chip" style="--c:${st.color}"><span class="dot"></span>${esc(t)}</span>`).join('')}</div>
    <div class="hero-cta" style="margin:24px 0 0"><a class="btn btn-ghost btn-sm" href="${u('map/')}#${sid(c, s)}">${ic('map')}See it on the map</a><a class="btn btn-ghost btn-sm" href="${u(cUrl(c))}">${ic('layers')}${esc(c.code)} ${esc(c.title)}</a></div>
  </div>
</section>
<section class="section-tight"><div class="container">
  <div class="tabs" role="tablist" aria-label="Section resources">${tabs.map(([k, t, i, n]) => `<button class="tab" role="tab" id="tab-${k}" aria-controls="p-${k}" aria-selected="${k === first}">${ic(i)}${t}<span class="n">${n}</span></button>`).join('')}</div>
  <div class="tabpanel" role="tabpanel" id="p-notes" aria-labelledby="tab-notes"${first === 'notes' ? '' : ' hidden'}>${panelFiles(notes, 'No lecture notes in the folder for this section yet. The Chapters tab lists the matching textbook chapters.')}</div>
  ${tuts.length ? `<div class="tabpanel" role="tabpanel" id="p-tutorials" aria-labelledby="tab-tutorials"${first === 'tutorials' ? '' : ' hidden'}>${panelFiles(tuts, '')}</div>` : ''}
  ${papers.length ? `<div class="tabpanel" role="tabpanel" id="p-papers" aria-labelledby="tab-papers"${first === 'papers' ? '' : ' hidden'}><p class="muted" style="margin:0 0 14px">${plural(papers.length, 'past paper')} for ${c.code}${c.years ? ', ' + esc(c.years) : ''}. Papers cover the whole course, so look for the questions on ${esc(s.name.toLowerCase())}. Click to preview.</p>${paperGrid(c, papers)}</div>` : ''}
  <div class="tabpanel" role="tabpanel" id="p-chapters" aria-labelledby="tab-chapters"${first === 'chapters' ? '' : ' hidden'}>${s.refs.length ? `<div class="refs">${s.refs.map(refRow).join('')}</div>` : `<div class="empty">${ic('book')}No chapter mapped yet for this section.</div>`}</div>
  <div class="tabpanel" role="tabpanel" id="p-videos" aria-labelledby="tab-videos"${first === 'videos' ? '' : ' hidden'}>${vids.length ? `<div class="videos">${vids.map(videoCard).join('')}</div>` : `<div class="empty">${ic('video')}No videos picked for this section yet. The YouTube search below finds lectures on it.</div>`}<div class="yt-row">${ytMore(s.name)}</div></div>
  <div class="tabpanel" role="tabpanel" id="p-websites" aria-labelledby="tab-websites"${first === 'websites' ? '' : ' hidden'}>${ext.length ? `<div class="links">${ext.map(xlink).join('')}</div>` : `<div class="empty">${ic('globe')}No websites listed.</div>`}</div>
</div></section>
${from.length || to.length ? `<section class="section-tight"><div class="container"><div class="section-head"><div><span class="eyebrow">Connections</span><h2>How this topic connects</h2></div></div><div class="related">
  ${from.length ? `<div><h3 style="font-size:1rem" class="muted">Builds on</h3><div class="rel-list">${from.map(l => relRow(l, 'from')).join('')}</div></div>` : ''}
  ${to.length ? `<div><h3 style="font-size:1rem" class="muted">Leads to</h3><div class="rel-list">${to.map(l => relRow(l, 'to')).join('')}</div></div>` : ''}
</div></div></section>` : ''}
<section class="section-tight"><div class="container"><div class="pager">
  ${prev ? `<a href="${u(sUrl(c, prev))}"><small>← Previous section</small>${esc(prev.name)}</a>` : `<a href="${u(cUrl(c))}"><small>← Course</small>${esc(c.code)} overview</a>`}
  ${next ? `<a class="next" href="${u(sUrl(c, next))}"><small>Next section →</small>${esc(next.name)}</a>` : `<a class="next" href="${u(cUrl(c))}#papers"><small>Next →</small>${esc(c.code)} past papers</a>`}
</div></div></section>`;
  write(`${sUrl(c, s)}index.html`, layout({ title: `${s.name} · ${c.code} · ${SITE}`, desc: s.summary, active: 'l' + c.level, body, page: 'section' }));
}

function mapPage() {
  const body = `
<section class="map-head"><div class="container">
  <div class="mh-row">
    <div><span class="eyebrow">Chemistry Map</span><h1>How every course connects</h1>
      <p class="muted" data-for="atom">Each coloured shell is a level and every electron is a course. <span class="fine">Drag to turn the atom any way, scroll to zoom, hover an electron to see its links and click it to open it.</span><span class="touch">Drag to turn the atom, pinch to zoom and tap an electron to open it.</span></p>
      <p class="muted" data-for="bubbles" hidden><span class="fine">Each bubble is a course. Hover to see what it builds on and leads to. Click to zoom in and open its sections.</span><span class="touch">Tap a bubble to see its links. Tap it again to zoom in.</span></p></div>
    <div class="view-switch" role="group" aria-label="Map view"><button type="button" data-view="atom" aria-pressed="true">${ic('atom')}3D atom</button><button type="button" data-view="bubbles" aria-pressed="false">${ic('map')}Bubbles</button></div>
  </div>
  <div class="map-tools" data-for="bubbles" hidden>
    <label class="input map-find">${ic('search')}<input type="search" placeholder="Find a course or topic…" aria-label="Find a course or topic"></label>
    <div class="chips" aria-label="Highlight a stream">${Object.entries(STREAMS).map(([k, s]) => `<button class="chip" style="--c:${s.color}" data-stream-chip="${k}" aria-pressed="false"><span class="dot"></span>${s.name}</button>`).join('')}</div>
    <div class="map-key"><span><i style="--k:var(--violet-text)"></i>builds on</span><span><i style="--k:var(--volt)"></i>leads to</span></div>
  </div>
</div></section>
<div class="container atom-host" data-for="atom">${atomBlock({ head: false, hash: true })}</div>
<div class="universe" data-for="bubbles" hidden aria-label="Courses by level">
  <svg class="u-lines" aria-hidden="true"></svg>
  ${[1000, 2000, 3000, 4000].map(l => `<div class="u-col" data-level="${l}"><div class="u-head"><b>${l}</b><span>${LEVELS[l].sub}</span></div><div class="u-field"></div></div>`).join('')}
  <div class="u-tip" hidden></div>
</div>
<div class="u-focus" hidden role="dialog" aria-label="Course details">
  <div class="f-stage"><svg class="f-lines" aria-hidden="true"></svg><div class="f-bubbles"></div></div>
  <button class="btn btn-sm u-back" type="button">← Back to map</button>
  <aside class="f-panel" aria-live="polite"><div class="p-body"></div></aside>
</div>`;
  write('map/index.html', layout({ title: `Chemistry Map · ${SITE}`, desc: 'Interactive 3D atom of every UoP chemistry course: four shells for the four levels, with courses as electrons and their connections.', active: 'map', body, page: 'map', scripts: `${exploreScripts()}<script src="${u('assets/js/map.js')}?v=${VER}" defer></script>`, head: '<style>.site-footer{margin-top:24px}</style>' }));
}

function papersPage() {
  const withP = courses.filter(c => c.papers);
  const years = [...new Set(files.filter(f => f.kind === 'paper' && f.yr).map(f => f.yr.slice(0, 4)))].sort();
  const body = `
<section class="page-head"><div class="container">
  ${crumbs([['Home', ''], ['Past papers']])}
  <span class="eyebrow">Exam practice</span><h1>Past paper bank</h1>
  <p class="tagline">${totals.papers} papers across ${withP.length} courses. Filter by level, year or course, then preview any paper in place.</p>
</div></section>
<section class="section-tight" data-filter-root><div class="container">
  <div class="toolbar">
    <label class="input">${ic('search')}<input type="search" data-q placeholder="Search by course code, title or year…" aria-label="Search papers"></label>
    <label class="input" style="flex:0 1 180px">${ic('layers')}<select data-tagsel aria-label="Level"><option value="">All levels</option>${[2000, 3000, 4000].map(l => `<option value="lv${l}">${l} Level</option>`).join('')}</select></label>
    <label class="input" style="flex:0 1 180px">${ic('target')}<select data-tagsel aria-label="Year"><option value="">Any year</option>${years.map(y => `<option value="y${y}">${y}</option>`).join('')}</select></label>
  </div>
  <p class="count-note"><span data-count-out>${totals.papers}</span> papers shown</p>
  ${withP.map(c => { const st = streamOf(c); return `<div class="paper-course" data-group style="--c:${st.color}"><h3><span class="code">${c.code}</span><a href="${u(cUrl(c))}" style="color:var(--white)">${esc(c.title)}</a><span class="badge" style="margin-left:auto">${c.level} Level</span></h3>
    <div class="paper-grid">${papersOf(c.code).map(p => `<button class="paper" data-item data-pdf="${p.id}" data-title="${esc(c.code + ' · ' + p.t)}" data-search="${esc((c.code + ' ' + c.title + ' ' + p.t + ' ' + (p.yr || '')).toLowerCase())}" data-tags="lv${c.level}${p.yr ? ' y' + p.yr.slice(0, 4) + (p.yr.length > 4 ? ' y' + (+p.yr.slice(0, 4) + 1) : '') : ''}"><span class="yr">${esc(p.yr || '—')}</span><span><b>${esc(paperTitle(p))}</b><small>${p.ans ? 'with answers · ' : ''}${mb(p.sz)}</small></span></button>`).join('')}</div></div>`; }).join('')}
</div></section>`;
  write('papers/index.html', layout({ title: `Past papers · ${SITE}`, desc: `${totals.papers} past papers for UoP chemistry courses, searchable by course, level and year.`, active: 'papers', body, page: 'papers' }));
}

function libraryPage() {
  const usedIn = new Map();
  for (const c of courses) for (const s of c.sections) for (const r of s.refs) {
    const b = books.find(x => x.short === r.book); if (!b) continue;
    if (!usedIn.has(b.key)) usedIn.set(b.key, new Map());
    usedIn.get(b.key).set(sid(c, s), [c, s]);
  }
  const body = `
<section class="page-head"><div class="container">
  ${crumbs([['Home', ''], ['Library']])}
  <span class="eyebrow">Read</span><h1>Library</h1>
  <p class="tagline">The textbooks recommended in the handbook, with the sections that use them. The books are not hosted here: each links to its publisher, OpenStax or catalogue record.</p>
</div></section>
<section class="section-tight" data-filter-root><div class="container">
  <div class="toolbar"><label class="input">${ic('search')}<input type="search" data-q placeholder="Search authors, titles, topics…" aria-label="Search books"></label><button class="chip" data-toggle="free" aria-pressed="false" style="--c:var(--volt)"><span class="dot"></span>Free online only</button></div>
  <p class="count-note"><span data-count-out>${books.length}</span> books</p>
  <div class="grid grid-2">${books.map((b, i) => {
    const uses = [...(usedIn.get(b.key)?.values() || [])];
    const col = ['#cbff2e', '#863dff', '#5ee7ff', '#ff7ad9', '#ffb547', '#7dffb2'][i % 6];
    return `<div class="card book" data-item data-search="${esc((b.short + ' ' + b.cite + ' ' + uses.map(([c, s]) => c.code + ' ' + s.name).join(' ')).toLowerCase())}" data-tags="${b.free ? 'free' : ''}" style="--c:${col}">
      <div class="spine">${esc(b.short.split(/[ ,&(]/)[0].slice(0, 9))}</div>
      <div><p class="cite">${esc(b.cite)}</p>
        <div class="chips meta">${b.free ? '<span class="badge badge-volt">Free online</span>' : ''}${b.isbn ? `<span class="badge">ISBN ${esc(b.isbn)}</span>` : ''}<span class="badge">${plural(uses.length, 'section')}</span></div>
        ${uses.length ? `<div class="chips" style="margin-top:10px">${uses.slice(0, 8).map(([c, s]) => `<a class="chip" style="--c:${streamOf(c).color}" href="${u(sUrl(c, s))}">${c.code} · ${esc(s.name)}</a>`).join('')}${uses.length > 8 ? `<span class="chip">+${uses.length - 8} more</span>` : ''}</div>` : ''}
        <div class="chips" style="margin-top:14px">
          ${b.url ? `<a class="btn btn-sm btn-ghost" href="${esc(b.url)}" target="_blank" rel="noopener">${ic('ext')}${b.free ? 'Read online' : b.url.includes('worldcat') ? 'Find in a library' : 'View the book'}</a>` : ''}
          ${b.isbn && !b.free && !b.url.includes('worldcat') ? `<a class="btn btn-sm" href="https://search.worldcat.org/search?q=bn:${esc(b.isbn)}" target="_blank" rel="noopener">${ic('book')}Find in a library</a>` : ''}
        </div>
      </div></div>`;
  }).join('')}</div>
</div></section>`;
  write('library/index.html', layout({ title: `Library · ${SITE}`, desc: 'Recommended chemistry textbooks with the exact chapters for each UoP syllabus section.', active: 'library', body, page: 'library' }));
}

function resourcesPage() {
  const body = `
<section class="page-head"><div class="container">
  ${crumbs([['Home', ''], ['Resources']])}
  <span class="eyebrow">Explore</span><h1>Resources</h1>
  <p class="tagline">Open courses, interactive tools, databases, journals and Sri Lankan chemistry links. Every link was checked when the site was built.</p>
  <div class="chips" style="margin-top:18px">${GROUPS.map(g => `<a class="chip" href="#${g.id}">${esc(g.title)}</a>`).join('')}</div>
</div></section>
<div data-filter-root><section class="section-tight"><div class="container"><div class="toolbar"><label class="input">${ic('search')}<input type="search" data-q placeholder="Search resources…" aria-label="Search resources"></label></div></div></section>
${GROUPS.map(g => `<section class="section-tight" id="${g.id}" data-group><div class="container"><div class="section-head"><div><h2 style="font-size:1.5rem">${esc(g.title)}</h2></div><p>${esc(g.blurb)}</p></div><div class="links">${g.items.map(extItem).filter(Boolean).map(xlink).join('')}</div></div></section>`).join('')}</div>`;
  write('resources/index.html', layout({ title: `Resources · ${SITE}`, desc: 'Open courses, tools, databases and journals for chemistry students.', active: 'resources', body, page: 'resources' }));
}

function ptablePage() {
  const cats = { 'Alkali metal': '#cbff2e', 'Alkaline earth metal': '#7dffb2', 'Transition metal': '#ad7dff', 'Post-transition metal': '#5ee7ff', 'Metalloid': '#ffb547', 'Nonmetal': '#dcdfff', 'Halogen': '#ff7ad9', 'Noble gas': '#ff8f6b', 'Lanthanide': '#9aa3d9', 'Actinide': '#f6c453' };
  const body = `
<section class="page-head"><div class="container">
  ${crumbs([['Home', ''], ['Periodic table']])}
  <span class="eyebrow">118 elements</span><h1>Periodic table</h1>
  <p class="tagline">Click an element for its properties. Switch on a heat map to see trends in electronegativity, radius, ionisation energy and more.</p>
</div></section>
<section class="section-tight"><div class="container">
  <div class="toolbar"><label class="input" style="flex:0 1 320px">${ic('spark')}<select data-prop aria-label="Heat map"><option value="">Colour by category</option><option value="en">Electronegativity</option><option value="r">Atomic radius</option><option value="ie">Ionisation energy</option><option value="ea">Electron affinity</option><option value="d">Density</option><option value="mp">Melting point</option><option value="bp">Boiling point</option><option value="m">Atomic mass</option></select></label></div>
  <div class="legend-row">${Object.entries(cats).map(([k, c]) => `<button class="chip" data-cat="${k}" aria-pressed="true" style="--c:${c}"><span class="dot"></span>${k}</button>`).join('')}</div>
  <div class="pt-layout"><div class="panel pt-scroll"><div class="ptable"></div></div><aside class="panel el-card" aria-live="polite"></aside></div>
  <p class="faint mono" style="font-size:.74rem;margin-top:14px">Data: PubChem Periodic Table, National Center for Biotechnology Information (public domain).</p>
</div></section>`;
  write('periodic-table/index.html', layout({ title: `Periodic table · ${SITE}`, desc: 'Interactive periodic table with PubChem data and property heat maps.', active: 'ptable', body, page: 'ptable', scripts: `<script type="application/json" id="elements-data">${JSON.stringify(elements)}</script><script src="${u('assets/js/pt-core.js')}?v=${VER}" defer></script><script src="${u('assets/js/ptable.js')}?v=${VER}" defer></script>` }));
}

function aboutPage() {
  const body = `
<section class="page-head"><div class="container">
  ${crumbs([['Home', ''], ['About']])}
  <span class="eyebrow">About</span><h1>About this hub</h1>
  <p class="tagline">A student-made study site for the chemistry degree at the University of Peradeniya. It is not an official university or department website.</p>
</div></section>
<section class="section-tight"><div class="container prose">
  <h2>What is here</h2>
  <ul>
    <li><b>${totals.courses} courses</b> from 1000 to 4000 Level, each with a short description and a full summary written from the department's <i>Course Contents 2021–2022</i> handbook.</li>
    <li><b>${totals.sections} syllabus sections</b>, each with its topics, lecture notes, tutorials with answers, matching textbook chapters, videos and websites.</li>
    <li><b>${totals.files} notes and tutorials</b> and <b>${totals.papers} past papers</b>, stored in Google Drive and viewable in the browser.</li>
    <li>A <a href="${u('map/')}">Chemistry Map</a>: a 3D atom whose four shells are the four levels and whose electrons are the courses, plus a bubble view, showing how topics build on each other across the four years.</li>
  </ul>
  <h2>What is not here</h2>
  <p>Textbooks are never uploaded. Each section cites the real book and chapter, and links to a free edition (OpenStax, LibreTexts) where one exists, or to the catalogue record otherwise. Lecture recordings, seminar and research material, older duplicate versions, and any personal work (reports, assignments, files carrying student names or index numbers) were left out on purpose.</p>
  <h2>Sources</h2>
  <ul>
    <li>Course structure, credits, prerequisites and topics: Department of Chemistry, <i>Course Contents 2021–2022</i>, University of Peradeniya.</li>
    <li>Notes and papers: the course folders kept during the degree. The notes belong to their lecturers and the department, and are shared here only for study.</li>
    <li>Element data: <a href="https://pubchem.ncbi.nlm.nih.gov/periodic-table/" target="_blank" rel="noopener">PubChem Periodic Table</a> (NCBI, public domain).</li>
    <li>Videos are embedded from YouTube and remain on their creators' channels.</li>
  </ul>
  <h2>Problems or removals</h2>
  <p>If a link is broken, a file is in the wrong place, or you are a lecturer and want something taken down, please <a href="${REPO}/issues" target="_blank" rel="noopener">open an issue on GitHub</a>.</p>
  <h2>How it is built</h2>
  <p>A small static site generator (Node.js, no framework) turns the course data into pages, published on GitHub Pages. The interface uses the “Sleek and Futuristic” palette — Void <span class="mono">#070a26</span>, Volt <span class="mono">#cbff2e</span>, Ultraviolet <span class="mono">#863dff</span>, Haze <span class="mono">#dcdfff</span> — with motion that turns itself off when your system asks for reduced motion.</p>
</div></section>`;
  write('about/index.html', layout({ title: `About · ${SITE}`, desc: 'What this unofficial UoP chemistry study hub contains and where its content comes from.', active: 'about', body, page: 'about' }));
}

function notFound() {
  const body = `<section class="page-head" style="min-height:60vh;display:grid;place-items:center;text-align:center"><div class="container"><span class="eyebrow">404 · unstable isotope</span><h1>This page decayed.</h1><p class="tagline" style="margin:0 auto 26px">The address does not exist. Try the search, or start from the map.</p><div class="hero-cta" style="justify-content:center"><a class="btn btn-primary" href="${u('')}">Home</a><a class="btn btn-ghost" href="${u('map/')}">${ic('map')}Chemistry Map</a></div></div></section>`;
  write('404.html', layout({ title: `Not found · ${SITE}`, desc: 'Page not found', body, page: '404' }));
}

function searchIndex() {
  const idx = [
    ['Home', 'Start page', ''], ['Chemistry Map', '3D atom of all courses: four level shells, courses as electrons', 'map/'], ['Past paper bank', `${totals.papers} papers`, 'papers/'], ['Library', `${totals.books} textbooks`, 'library/'],
    ['Periodic table', '118 elements', 'periodic-table/'], ['Resources', 'Open courses, tools and journals', 'resources/'], ['About', 'Sources and credits', 'about/'],
    ...[1000, 2000, 3000, 4000].map(l => [`${l} Level`, LEVELS[l].sub, `levels/${l}/`]),
  ].map(([t, s, url]) => ({ t, s, u: url, k: 'page' }));
  for (const c of courses) {
    idx.push({ t: `${c.code} ${c.title}`, s: `${c.level} Level · ${streamOf(c).name} · ${c.tagline}`, x: c.about, u: cUrl(c), k: 'course' });
    for (const s of c.sections) {
      idx.push({ t: s.name, s: `${c.code} ${c.title} · ${s.topics.slice(0, 5).join(', ')}`, x: `${s.summary} ${s.topics.join(' ')}`, u: sUrl(c, s), k: 'section' });
      for (const f of filesOf(c.code, s.name)) idx.push({ t: f.t, s: `${c.code} · ${s.name}${f.kind !== 'note' ? ' · ' + KIND[f.kind][0] : ''}`, u: `${sUrl(c, s)}?open=${f.id}`, k: 'note' });
    }
    for (const p of papersOf(c.code)) idx.push({ t: `${c.code} ${p.t}`, s: `Past paper · ${c.title}`, u: `${cUrl(c)}?open=${p.id}`, k: 'paper' });
  }
  for (const e of elements) idx.push({ t: `${e.s} ${e.n}`, s: `Z ${e.z} · ${e.g}`, u: `periodic-table/#${e.s}`, k: 'element' });
  for (const b of books) if (b.url) idx.push({ t: b.short, s: b.cite, u: b.url, k: 'book' });
  const seen = new Set();
  for (const g of GROUPS) for (const it of g.items) { const x = extItem(it); if (x && !seen.has(x[1])) { seen.add(x[1]); idx.push({ t: x[0], s: x[2], u: x[1], k: 'link' }); } }
  write('search-index.json', JSON.stringify(idx));
  return idx.length;
}

/* ---------- run ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'src/assets'), path.join(OUT, 'assets'), { recursive: true });
write('assets/js/map-data.js', `window.MAP_DATA=${JSON.stringify(mapData()).replace(/</g, '\\u003c')};`);
write('.nojekyll', '');
write('index.html', home());
[1000, 2000, 3000, 4000].forEach(levelPage);
courses.forEach(c => { coursePage(c); c.sections.forEach((s, i) => sectionPage(c, s, i)); });
mapPage(); papersPage(); libraryPage(); resourcesPage(); ptablePage(); aboutPage(); notFound();
const n = searchIndex();
const pages = 1 + 4 + courses.length + totals.sections + 7;
console.log(`Built ${pages} pages, search index ${n} entries → ${path.relative(ROOT, OUT)} (base ${BASE})`);
