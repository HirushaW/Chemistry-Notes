// Chemistry Map: every course floats as a bubble in its level column.
// Hover a bubble to draw its connections; click it to zoom in and see its sections orbit around it.
(() => {
  const uni = document.querySelector('.universe'); if (!uni) return;
  const D = JSON.parse(document.getElementById('map-data').textContent);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BASE = document.documentElement.dataset.base || '/';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${document.getElementById('i-' + n)?.innerHTML || ''}</svg>`;
  const streams = new Map(D.streams.map(s => [s.id, s]));
  const courses = new Map(D.courses.map(c => [c.id, c]));
  const sections = new Map(D.sections.map(s => [s.id, s]));
  const ORDER = ['gen', 'inorg', 'org', 'phys', 'anal', 'bio', 'ind', 'comp', 'lab'];
  const LEVELS = [1000, 2000, 3000, 4000];
  const colorOf = c => streams.get(c.stream).color;
  const svgLines = uni.querySelector('.u-lines'), tip = uni.querySelector('.u-tip');
  const focus = document.querySelector('.u-focus'), stage = focus.querySelector('.f-stage'), fBubbles = focus.querySelector('.f-bubbles'), fLines = focus.querySelector('.f-lines'), pbody = focus.querySelector('.p-body');

  /* ---------- course-level connections (prerequisites + topic links) ---------- */
  const conn = new Map(D.courses.map(c => [c.id, { from: new Map(), to: new Map() }]));
  const link = (a, b, idea) => {
    if (a === b || !conn.has(a) || !conn.has(b)) return;
    const t = conn.get(a).to, f = conn.get(b).from;
    (t.get(b) || t.set(b, new Set()).get(b)).add(idea); (f.get(a) || f.set(a, new Set()).get(a)).add(idea);
  };
  for (const c of D.courses) for (const p of c.pre) link(p, c.id, 'prerequisite');
  for (const [s, t, idea] of D.links) link(s.split('/')[0], t.split('/')[0], idea);

  /* ---------- bubbles ---------- */
  // Bubble labels: shorten long titles so they fit; tooltips and panels keep the full title.
  const short = t => {
    let s = t.replace(/^General Aspects and Recent Developments in Chemistry$/, 'Recent Developments').replace(/^Applications of Nanoscience in Chemistry$/, 'Nanoscience Applications')
      .replace(/^Techniques in Organic Chemistry/, 'Organic Techniques').replace(/ in Chemistry$/, '').replace(/Chemistry Laboratory/, 'Chem Lab').replace(/Laboratory/, 'Lab').replace(/^Principles of Chemistry/, 'Principles of Chem');
    if (s.length > 22) s = s.replace(/^Advanced /, 'Adv. ').replace(/ Chemistry\b/, ' Chem');
    return s;
  };
  const hash = (str, k) => { let h = 2166136261 ^ k; for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return ((h >>> 0) % 1000) / 1000; };
  const B = new Map();
  let order = 0;
  for (const lv of LEVELS) {
    const field = uni.querySelector(`.u-col[data-level="${lv}"] .u-field`);
    const list = D.courses.filter(c => c.level === lv).sort((a, b) => ORDER.indexOf(a.stream) - ORDER.indexOf(b.stream) || a.id.localeCompare(b.id));
    for (const c of list) {
      const el = document.createElement('button');
      el.type = 'button'; el.className = 'bub'; el.dataset.id = c.id; el.dataset.stream = c.stream;
      el.setAttribute('aria-label', `${c.id} ${c.title}. Click to open.`);
      el.style.cssText = `--c:${colorOf(c)};--i:${order++};--fd:${(6.5 + hash(c.id, 1) * 5).toFixed(2)}s;--fdl:${(-hash(c.id, 2) * 9).toFixed(2)}s;--fx:${((hash(c.id, 3) - .5) * 14).toFixed(1)};--fy:${(-5 - hash(c.id, 4) * 8).toFixed(1)}`;
      el.innerHTML = `<span class="bub-pop"><span class="bub-in"><span class="bub-code">${c.id}</span><span class="bub-t">${esc(short(c.title))}</span></span></span>`;
      field.appendChild(el);
      B.set(c.id, { c, el, inner: el.querySelector('.bub-in'), lv, base: 86 + Math.sqrt(c.counts.notes + c.counts.papers) * 4.2 });
    }
  }

  /* ---------- organic packing inside each level column ---------- */
  function pack(nodes, W, H) {
    const gap = 10, cx = W / 2, free = !H, cy = free ? 0 : H / 2;
    const avg = nodes.reduce((s, n) => s + n.r, 0) / nodes.length;
    nodes.forEach((n, i) => { const a = i * 2.399963 + .6, rr = Math.sqrt(i + .4) * avg * 1.08; n.x = cx + Math.cos(a) * rr; n.y = cy + Math.sin(a) * rr; });
    for (let it = 0; it < 240; it++) {
      const k = it < 170 ? .02 : .006;
      for (const n of nodes) { n.x += (cx - n.x) * k * (free ? .5 : 1); n.y += (cy - n.y) * k * (free ? 1.3 : 1); }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .01, min = a.r + b.r + gap;
        if (d < min) { const f = (min - d) / d / 2; a.x -= dx * f; a.y -= dy * f; b.x += dx * f; b.y += dy * f; }
      }
      for (const n of nodes) { n.x = Math.max(n.r + 6, Math.min(W - n.r - 6, n.x)); if (!free) n.y = Math.max(n.r + 6, Math.min(H - n.r - 6, n.y)); }
    }
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < nodes[i].r + nodes[j].r + 3) return false;
    return true;
  }
  const isMobile = () => innerWidth < 760;
  function layout() {
    const mobile = isMobile();
    for (const lv of LEVELS) {
      const field = uni.querySelector(`.u-col[data-level="${lv}"] .u-field`), nodes = [...B.values()].filter(b => b.lv === lv);
      field.style.height = '';
      const W = field.clientWidth, H = mobile ? 0 : field.clientHeight;
      let s = mobile ? Math.min(.84, W / 430) : 1, ok = false, guard = 0;
      while (!ok && guard++ < 10) { nodes.forEach(n => { n.r = n.base * s / 2; }); ok = pack(nodes, W, H); s *= .93; }
      if (mobile) {
        const minY = Math.min(...nodes.map(n => n.y - n.r)), maxY = Math.max(...nodes.map(n => n.y + n.r));
        nodes.forEach(n => { n.y += 12 - minY; }); field.style.height = (maxY - minY + 24) + 'px';
      }
      for (const n of nodes) { n.el.style.setProperty('--d', (n.r * 2).toFixed(1) + 'px'); n.el.style.left = (n.x - n.r).toFixed(1) + 'px'; n.el.style.top = (n.y - n.r).toFixed(1) + 'px'; }
    }
  }
  layout();
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); if (!focus.hidden && current) openFocus(current, currentSec, false); }, 180); });
  document.fonts?.ready.then(layout);

  /* ---------- hover: draw connections ---------- */
  let hot = null, raf = 0, clearT = 0;
  const centerOf = b => { const r = b.inner.getBoundingClientRect(), u = uni.getBoundingClientRect(); return [r.left - u.left + r.width / 2, r.top - u.top + r.height / 2, r.width / 2]; };
  function setHot(id) {
    clearTimeout(clearT);
    if (hot === id) return;
    clearHot(true);
    hot = id;
    const { from, to } = conn.get(id), linked = new Set([...from.keys(), ...to.keys()]);
    uni.classList.add('hot');
    for (const [k, b] of B) { b.el.classList.toggle('on', k === id); b.el.classList.toggle('link', linked.has(k)); }
    svgLines.innerHTML = [...[...from.keys()].map(k => [k, id, 'from']), ...[...to.keys()].map(k => [id, k, 'to'])]
      .map(([a, b, kind], i) => `<g class="ln ${kind}" data-a="${a}" data-b="${b}" style="--i:${i}"><path pathLength="1"/><circle r="3.2"/><circle r="2.4"/></g>`).join('');
    showTip(id);
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function clearHot(now) {
    const run = () => {
      hot = null; uni.classList.remove('hot'); svgLines.innerHTML = ''; tip.hidden = true;
      for (const b of B.values()) b.el.classList.remove('on', 'link');
    };
    clearTimeout(clearT);
    now ? run() : (clearT = setTimeout(run, 140));
  }
  function tick(t) {
    raf = 0; if (!hot) return;
    const cache = new Map(), C = id => cache.get(id) || cache.set(id, centerOf(B.get(id))).get(id);
    for (const g of svgLines.children) {
      const [ax, ay, ar] = C(g.dataset.a), [bx, by, br] = C(g.dataset.b);
      const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      const x1 = ax + ux * ar, y1 = ay + uy * ar, x2 = bx - ux * br, y2 = by - uy * br;
      const bend = Math.min(70, d * .16), mx = (x1 + x2) / 2 - uy * bend, my = (y1 + y2) / 2 + ux * bend;
      g.firstChild.setAttribute('d', `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
      const dots = g.querySelectorAll('circle');
      dots.forEach((dot, i) => {
        const p = ((t / 1500) + i * .5 + (+g.style.getPropertyValue('--i') || 0) * .13) % 1, q = 1 - p;
        dot.setAttribute('cx', (q * q * x1 + 2 * q * p * mx + p * p * x2).toFixed(1));
        dot.setAttribute('cy', (q * q * y1 + 2 * q * p * my + p * p * y2).toFixed(1));
        dot.setAttribute('opacity', Math.sin(p * Math.PI).toFixed(2));
      });
    }
    raf = requestAnimationFrame(tick);
  }
  function showTip(id) {
    const b = B.get(id), c = b.c, { from, to } = conn.get(id), s = streams.get(c.stream);
    tip.innerHTML = `<b style="color:${s.color}">${c.id} · ${c.level} Level · ${esc(s.name)}</b><strong>${esc(c.title)}</strong><span>${esc(c.tagline)}</span>
      <small>${c.counts.notes} files · ${c.counts.papers} papers · builds on ${from.size} · leads to ${to.size}</small><em>${matchMedia('(pointer: fine)').matches ? 'Click' : 'Tap again'} to zoom in →</em>`;
    const [x, y, r] = centerOf(b), W = uni.clientWidth;
    tip.hidden = false;
    const below = y - r < 190;
    tip.classList.toggle('below', below);
    tip.style.left = Math.max(140, Math.min(W - 140, x)) + 'px';
    tip.style.top = (below ? y + r * 1.22 : y - r * 1.22) + 'px';
  }

  let armed = null; // touch: first tap previews, second tap opens
  uni.addEventListener('pointerover', e => { if (e.pointerType === 'touch') return; const el = e.target.closest('.bub'); if (el) setHot(el.dataset.id); });
  uni.addEventListener('pointerout', e => { if (e.pointerType === 'touch') return; const el = e.target.closest('.bub'); if (el && !e.relatedTarget?.closest?.('.bub')) clearHot(); });
  uni.addEventListener('focusin', e => { const el = e.target.closest('.bub'); if (el) setHot(el.dataset.id); });
  uni.addEventListener('focusout', () => clearHot());
  uni.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch') return; const el = e.target.closest('.bub'); if (!el) { armed = null; clearHot(true); } });
  uni.addEventListener('click', e => {
    const el = e.target.closest('.bub'); if (!el) return;
    const id = el.dataset.id;
    if (!matchMedia('(pointer: fine)').matches && armed !== id) { armed = id; setHot(id); return; }
    armed = null; openFocus(id);
  });

  /* ---------- search + stream legend ---------- */
  const find = document.querySelector('.map-find input');
  const hay = new Map([...B].map(([k, b]) => [k, (b.c.id + ' ' + b.c.title + ' ' + b.c.tagline + ' ' + b.c.sections.map(s => sections.get(s).name + ' ' + sections.get(s).topics.join(' ')).join(' ')).toLowerCase()]));
  find?.addEventListener('input', () => {
    const q = find.value.trim().toLowerCase();
    uni.classList.toggle('searching', !!q);
    for (const [k, b] of B) b.el.classList.toggle('match', !!q && hay.get(k).includes(q));
  });
  find?.addEventListener('keydown', e => {
    if (e.key === 'Escape') { find.value = ''; find.dispatchEvent(new Event('input')); }
    if (e.key !== 'Enter') return;
    const q = find.value.trim().toLowerCase(), m = [...B.values()].find(b => b.el.classList.contains('match'));
    if (!m) return;
    const sec = m.c.sections.find(s => (sections.get(s).name + ' ' + sections.get(s).topics.join(' ')).toLowerCase().includes(q));
    openFocus(m.c.id, sec);
  });
  document.querySelectorAll('[data-stream-chip]').forEach(chip => chip.addEventListener('click', () => {
    const on = chip.getAttribute('aria-pressed') !== 'true', id = chip.dataset.streamChip;
    document.querySelectorAll('[data-stream-chip]').forEach(x => x.setAttribute('aria-pressed', 'false'));
    chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    for (const b of B.values()) b.el.classList.toggle('faded', on && b.c.stream !== id);
  }));

  /* ---------- focus view: zoom into a course ---------- */
  let current = null, currentSec = null;
  function openFocus(id, secId, animate = true) {
    const b = B.get(id); if (!b) return;
    const c = b.c, s = streams.get(c.stream);
    clearHot(true);
    const wasOpen = !focus.hidden;
    current = id; currentSec = null;
    focus.hidden = false; document.body.classList.add('focus-open');
    focus.style.setProperty('--c', s.color);
    const W = stage.clientWidth, H = stage.clientHeight, mobile = isMobile();
    const cx = W / 2, cy = H / 2, n = c.sections.length;
    const Dc = Math.min(mobile ? 128 : 210, H * (mobile ? .4 : .34)), Ds = Math.max(mobile ? 76 : 92, Math.min(mobile ? 92 : 124, H * .2));
    const R = Math.min(Dc / 2 + Ds / 2 + (mobile ? 18 : 48), Math.min(W, H) / 2 - Ds / 2 - 8);
    const pos = c.sections.map((sid, i) => { const a = -Math.PI / 2 + (n === 1 ? Math.PI / 2 : i * 2 * Math.PI / n); return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; });
    fBubbles.innerHTML = `<div class="f-center" style="--d:${Dc}px;left:${cx - Dc / 2}px;top:${cy - Dc / 2}px"><span class="f-orbit"></span><span class="bub-code">${c.id}</span><b>${esc(c.title)}</b><small>${c.level} Level · ${esc(s.name)}</small></div>` +
      c.sections.map((sid, i) => {
        const sec = sections.get(sid), [x, y] = pos[i], files = sec.counts.notes + sec.counts.tut + sec.counts.ans;
        return `<button class="f-sec" type="button" data-sid="${sid}" style="--d:${Ds}px;left:${(x - Ds / 2).toFixed(1)}px;top:${(y - Ds / 2).toFixed(1)}px;--i:${i};--ox:${(cx - x).toFixed(1)}px;--oy:${(cy - y).toFixed(1)}px"><span class="f-sec-in"><b>${esc(sec.name)}</b><small>${files ? files + (files === 1 ? ' file' : ' files') : 'chapters'}</small></span></button>`;
      }).join('');
    fLines.setAttribute('viewBox', `0 0 ${W} ${H}`);
    fLines.innerHTML = pos.map(([x, y], i) => {
      const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      return `<path pathLength="1" style="--i:${i}" d="M${(cx + ux * Dc / 2).toFixed(1)} ${(cy + uy * Dc / 2).toFixed(1)} L${(x - ux * Ds / 2).toFixed(1)} ${(y - uy * Ds / 2).toFixed(1)}"/>`;
    }).join('');
    if (animate && !RM && !wasOpen) {
      const from = b.inner.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      const fx = from.left + from.width / 2 - (sr.left + cx), fy = from.top + from.height / 2 - (sr.top + cy);
      fBubbles.querySelector('.f-center').animate([{ transform: `translate(${fx}px, ${fy}px) scale(${from.width / Dc})`, opacity: .7 }, { transform: 'none', opacity: 1 }], { duration: 700, easing: 'cubic-bezier(.34,1.32,.64,1)' });
    }
    if (animate && !RM && wasOpen) focus.querySelector('.f-panel').animate([{ opacity: .4, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
    coursePanel(c);
    if (secId && sections.has(secId)) selectSection(secId);
    else history.replaceState(null, '', '#' + id);
    focus.querySelector('.u-back').focus({ preventScroll: true });
  }
  function closeFocus() {
    if (focus.hidden) return;
    focus.hidden = true; document.body.classList.remove('focus-open');
    const id = current; current = currentSec = null;
    history.replaceState(null, '', location.pathname + location.search);
    if (id) B.get(id)?.el.focus({ preventScroll: true });
  }
  function selectSection(sid) {
    currentSec = sid;
    fBubbles.querySelectorAll('.f-sec').forEach(x => x.classList.toggle('sel', x.dataset.sid === sid));
    sectionPanel(sections.get(sid));
    history.replaceState(null, '', '#' + sid);
  }
  focus.querySelector('.u-back').addEventListener('click', closeFocus);
  stage.addEventListener('click', e => { const sec = e.target.closest('.f-sec'); if (sec) return selectSection(sec.dataset.sid); if (e.target.closest('.f-center')) return coursePanel(courses.get(current)); if (e.target === stage || e.target === fBubbles) closeFocus(); });
  focus.addEventListener('click', e => {
    const g = e.target.closest('[data-course]'); if (g) { e.preventDefault(); const [cid, sid] = g.dataset.course.split('|'); return openFocus(cid, sid || null); }
    const sb = e.target.closest('[data-sec]'); if (sb) { e.preventDefault(); return selectSection(sb.dataset.sec); }
    if (e.target.closest('[data-back]')) { e.preventDefault(); currentSec = null; fBubbles.querySelectorAll('.f-sec').forEach(x => x.classList.remove('sel')); coursePanel(courses.get(current)); history.replaceState(null, '', '#' + current); }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !focus.hidden && !document.querySelector('dialog[open]')) closeFocus(); });

  /* ---------- panel content ---------- */
  const lvl = n => `${n} Level`;
  const courseBtn = (cid, sub, sid) => { const c = courses.get(cid); if (!c) return ''; return `<button data-course="${cid}${sid ? '|' + sid : ''}" style="--c:${colorOf(c)}"><span class="dot"></span><span>${sid ? esc(sections.get(sid).name) : `${cid} · ${esc(c.title)}`}</span>${sub ? `<small>${esc(sub)}</small>` : ''}</button>`; };
  function coursePanel(c) {
    const s = streams.get(c.stream), { from, to } = conn.get(c.id);
    pbody.innerHTML = `<span class="eyebrow" style="color:${s.color}">${lvl(c.level)} · ${esc(s.name)}</span><h2>${esc(c.title)}</h2>
      <div class="chips" style="margin-bottom:14px"><span class="badge badge-volt">${c.id}</span>${c.credits ? `<span class="badge">${c.credits} credits</span>` : ''}${c.sem ? `<span class="badge">Semester ${esc(c.sem)}</span>` : ''}</div>
      <p style="color:var(--white);font-weight:600">${esc(c.tagline)}</p><p class="muted">${esc(c.about)}</p>
      <div class="counter-row"><div class="counter"><b>${c.counts.notes}</b><span>files</span></div><div class="counter"><b>${c.counts.papers}</b><span>papers</span></div><div class="counter"><b>${c.sections.length}</b><span>sections</span></div></div>
      <div class="p-sec"><h4>Sections</h4><div class="mini">${c.sections.map(sid => { const x = sections.get(sid), n = x.counts.notes + x.counts.tut + x.counts.ans; return `<button data-sec="${sid}" style="--c:${s.color}"><span class="dot"></span><span>${esc(x.name)}</span><small>${n ? n + ' files' : 'chapters'}</small></button>`; }).join('')}</div></div>
      ${from.size ? `<div class="p-sec"><h4>Builds on</h4><div class="mini">${[...from].map(([k, ideas]) => courseBtn(k, [...ideas].join(', '))).join('')}</div></div>` : ''}
      ${to.size ? `<div class="p-sec"><h4>Leads to</h4><div class="mini">${[...to].map(([k, ideas]) => courseBtn(k, [...ideas].join(', '))).join('')}</div></div>` : ''}
      <div class="p-sec" style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary btn-sm" href="${BASE}${c.url}">Open course ${icon('arrow')}</a>${c.counts.papers ? `<a class="btn btn-ghost btn-sm" href="${BASE}${c.url}#papers">${icon('papers')} Past papers</a>` : ''}</div>`;
    pbody.scrollTop = 0;
  }
  function sectionPanel(sec) {
    const c = courses.get(sec.code), s = streams.get(c.stream);
    const from = D.links.filter(l => l[1] === sec.id), to = D.links.filter(l => l[0] === sec.id);
    const files = sec.counts.notes + sec.counts.tut + sec.counts.ans;
    pbody.innerHTML = `<button class="chip" data-back style="margin-bottom:14px">← ${c.id} overview</button>
      <span class="eyebrow" style="color:${s.color};display:flex">${c.id}${sec.hours ? ' · ' + esc(sec.hours) : ''}</span><h2>${esc(sec.name)}</h2>
      <p style="color:var(--white);font-weight:600">${esc(sec.summary)}</p>
      <div class="chips">${sec.topics.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
      ${from.length ? `<div class="p-sec"><h4>Builds on</h4><div class="mini">${from.map(l => courseBtn(l[0].split('/')[0], l[2], l[0])).join('')}</div></div>` : ''}
      ${to.length ? `<div class="p-sec"><h4>Leads to</h4><div class="mini">${to.map(l => courseBtn(l[1].split('/')[0], l[2], l[1])).join('')}</div></div>` : ''}
      <div class="p-sec"><h4>Notes${files ? ` · ${files} files` : ''}</h4>${sec.notes.length ? `<div class="mini">${sec.notes.map(([fid, t]) => `<button data-pdf="${fid}" data-title="${esc(c.id + ' · ' + t)}" style="--c:${s.color}">${icon('file')}<span>${esc(t)}</span><small>preview</small></button>`).join('')}</div>` : '<p class="faint" style="font-size:.85rem">No notes in the folder for this section yet. The textbook chapters below cover it.</p>'}</div>
      ${sec.refs.length ? `<div class="p-sec"><h4>Textbook chapters</h4><div class="mini">${sec.refs.map(r => `<a href="${esc(r[2] || '#')}" target="_blank" rel="noopener" style="--c:var(--volt)">${icon('book')}<span><b style="color:var(--white)">${esc(r[0])}</b> — ${esc(r[1])}</span></a>`).join('')}</div></div>` : ''}
      <div class="p-sec" style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary btn-sm" href="${BASE}${sec.url}">Open section ${icon('arrow')}</a></div>`;
    pbody.scrollTop = 0;
  }

  /* ---------- deep links: #CHE2112 or #CHE2112/section-slug ---------- */
  const start = decodeURIComponent(location.hash.slice(1));
  if (start.startsWith('stream:')) document.querySelector(`[data-stream-chip="${CSS.escape(start.slice(7))}"]`)?.click();
  else if (start) {
    const [cid] = start.split('/');
    if (B.has(cid)) setTimeout(() => openFocus(cid, sections.has(start) ? start : null), RM ? 0 : 500);
  }
})();
