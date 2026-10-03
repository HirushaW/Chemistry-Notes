// Chemistry Map: streams are sectors, levels are rings, courses and sections are nodes.
// Click a node to read what it covers and open its notes, papers and references.
(() => {
  const svg = document.querySelector('svg.map'); if (!svg) return;
  const D = JSON.parse(document.getElementById('map-data').textContent);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BASE = document.documentElement.dataset.base || '/';
  const panel = document.querySelector('.map-panel'), pbody = panel.querySelector('.p-body'), shell = svg.closest('.map-shell');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${document.getElementById('i-' + n)?.innerHTML || ''}</svg>`;

  /* ---------- layout ---------- */
  const ORDER = ['org', 'ind', 'bio', 'anal', 'phys', 'comp', 'inorg', 'lab', 'gen'];
  const WEIGHT = { gen: 6, lab: 9, inorg: 8, org: 7.5, phys: 8, anal: 4, bio: 4, ind: 3.2, comp: 4 };
  const RL = { 1000: 300, 2000: 480, 3000: 660, 4000: 840 };
  const courses = new Map(D.courses.map(c => [c.id, c]));
  const sections = new Map(D.sections.map(s => [s.id, s]));
  const streams = ORDER.map(id => D.streams.find(s => s.id === id)).filter(Boolean);
  const total = streams.reduce((n, s) => n + WEIGHT[s.id], 0);
  const polar = (r, a) => [Math.cos(a) * r, Math.sin(a) * r];
  const N = new Map(); // id -> node
  let a0 = -Math.PI / 2 - (WEIGHT[streams[0].id] / total) * Math.PI;
  for (const s of streams) {
    const w = WEIGHT[s.id] / total * Math.PI * 2;
    s.a0 = a0; s.a1 = a0 + w; s.am = a0 + w / 2; a0 += w;
    const byLv = {};
    for (const code of s.courses) { const c = courses.get(code); (byLv[c.level] ||= []).push(c); }
    for (const [lv, list] of Object.entries(byLv)) {
      const tight = (w / (list.length + 1)) * RL[lv] < 130;
      list.forEach((c, i) => {
        const ang = s.a0 + w * (i + 1) / (list.length + 1);
        const R = RL[lv] + (tight && list.length > 1 ? (i % 2 ? 38 : -38) : 0);
        const [x, y] = polar(R, ang);
        N.set(c.id, { id: c.id, type: 'course', x, y, ang, c: s.color, stream: s.id, level: +lv, data: c });
      });
    }
  }
  for (const c of D.courses) {
    const p = N.get(c.id), n = c.sections.length;
    const spread = Math.min(Math.PI * .95, n * .48), rad = 70 + (n > 3 ? 12 : 0);
    c.sections.forEach((sid, i) => {
      const ang = p.ang + (n === 1 ? 0 : -spread / 2 + spread * i / (n - 1));
      const [dx, dy] = polar(rad, ang);
      N.set(sid, { id: sid, type: 'section', x: p.x + dx, y: p.y + dy, ix: p.x + dx, iy: p.y + dy, ang, c: p.c, stream: p.stream, level: p.level, parent: c.id, data: sections.get(sid) });
    });
  }
  // relax section nodes so labels and dots do not collide
  const secs = [...N.values()].filter(n => n.type === 'section'), all = [...N.values()];
  for (let it = 0; it < 90; it++) {
    for (const s of secs) { s.x += (s.ix - s.x) * .05; s.y += (s.iy - s.y) * .05; }
    for (const s of secs) for (const o of all) {
      if (o === s) continue;
      const dx = s.x - o.x, dy = s.y - o.y, d = Math.hypot(dx, dy) || .01, min = o.type === 'course' ? 40 : 30;
      if (d < min) { const f = (min - d) / d * (o.type === 'course' ? .9 : .5); s.x += dx * f; s.y += dy * f; }
    }
  }

  /* ---------- edges ---------- */
  const E = [];
  for (const c of D.courses) {
    for (const sid of c.sections) E.push({ s: c.id, t: sid, type: 'has' });
    for (const p of c.pre) if (N.has(p)) E.push({ s: p, t: c.id, type: 'pre' });
  }
  for (const [s, t, idea] of D.links) if (N.has(s) && N.has(t)) E.push({ s, t, type: 'link', idea });
  const adj = new Map([...N.keys()].map(k => [k, []]));
  E.forEach((e, i) => { adj.get(e.s).push(i); adj.get(e.t).push(i); });

  const curve = (a, b, bend) => {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const cx = mx * (1 - bend), cy = my * (1 - bend);
    return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  };

  /* ---------- draw ---------- */
  let h = '<defs><radialGradient id="core-g"><stop offset="0" stop-color="#cbff2e" stop-opacity=".9"/><stop offset=".45" stop-color="#863dff" stop-opacity=".35"/><stop offset="1" stop-color="#863dff" stop-opacity="0"/></radialGradient></defs><g class="vp">';
  for (const s of streams) {
    const r0 = 190, r1 = 930, [x0, y0] = polar(r0, s.a0), [x1, y1] = polar(r1, s.a0), [x2, y2] = polar(r1, s.a1), [x3, y3] = polar(r0, s.a1);
    h += `<path class="sector" data-stream="${s.id}" style="--c:${s.color}" d="M${x0} ${y0} L${x1} ${y1} A${r1} ${r1} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${r0} ${r0} 0 0 0 ${x0} ${y0}Z" fill="${s.color}" fill-opacity=".035"/>`;
    const [sx, sy] = polar(r0, s.a0), [ex, ey] = polar(r1 + 40, s.a0);
    h += `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="rgba(220,223,255,.06)"/>`;
  }
  for (const [lv, r] of Object.entries(RL)) {
    h += `<circle class="ring" r="${r}"/>`;
    const [lx, ly] = polar(r, -Math.PI / 2 - .03);
    h += `<text class="ring-label" x="${lx}" y="${ly - 8}" text-anchor="end">${lv}</text>`;
  }
  h += '<g class="edges">';
  E.forEach((e, i) => {
    const a = N.get(e.s), b = N.get(e.t);
    const d = e.type === 'has' ? `M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}` : curve(a, b, e.type === 'pre' ? .18 : (a.parent && a.parent === b.parent ? -.25 : .32));
    h += `<path class="edge ${e.type}" data-e="${i}" d="${d}"/>`;
  });
  h += '</g>';
  // center atom
  h += `<g class="core"><circle r="120" fill="url(#core-g)" opacity=".5"/><g fill="none" stroke="rgba(203,255,46,.55)" stroke-width="1.4"><ellipse rx="70" ry="24"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="24s" repeatCount="indefinite"/></ellipse><ellipse rx="70" ry="24" transform="rotate(60)"><animateTransform attributeName="transform" type="rotate" from="60" to="420" dur="30s" repeatCount="indefinite"/></ellipse><ellipse rx="70" ry="24" transform="rotate(120)"><animateTransform attributeName="transform" type="rotate" from="120" to="480" dur="36s" repeatCount="indefinite"/></ellipse></g><circle r="9" fill="#cbff2e"/><text y="104" text-anchor="middle" fill="#fff" style="font:800 20px var(--f-display);letter-spacing:.2em">CHEMISTRY</text><text y="126" text-anchor="middle" fill="rgba(220,223,255,.5)" style="font:600 12px var(--f-mono);letter-spacing:.12em">1000 → 4000 LEVEL</text></g>`;
  for (const s of streams) {
    const [x, y] = polar(990, s.am), anchor = Math.abs(Math.cos(s.am)) < .3 ? 'middle' : Math.cos(s.am) > 0 ? 'start' : 'end';
    h += `<g class="node stream" data-id="stream:${s.id}" style="--c:${s.color}" tabindex="0" role="button" aria-label="${esc(s.name)} stream"><circle class="halo" cx="${x}" cy="${y}" r="20"/><text class="stream-label" x="${x}" y="${y}" dy=".35em" text-anchor="${anchor}" fill="${s.color}">${esc(s.name)}</text></g>`;
  }
  for (const n of N.values()) {
    if (n.type === 'course') {
      h += `<g class="node course" data-id="${n.id}" style="--c:${n.c}" tabindex="0" role="button" aria-label="${esc(n.id + ' ' + n.data.title)}"><circle class="halo" cx="${n.x}" cy="${n.y}" r="30"/><circle class="pulse" cx="${n.x}" cy="${n.y}" r="12"/><circle class="core" cx="${n.x}" cy="${n.y}" r="15" fill="${n.c}"/><circle cx="${n.x}" cy="${n.y}" r="6" fill="#070a26"/><text x="${n.x}" y="${n.y + 15}" dy="1.35em" text-anchor="middle">${n.id}</text></g>`;
    } else {
      const out = Math.cos(n.ang) >= 0, lx = n.x + (out ? 8 : -8), label = n.data.name.length > 30 ? n.data.name.slice(0, 28) + '…' : n.data.name;
      h += `<g class="node section" data-id="${n.id}" style="--c:${n.c}"><circle class="halo" cx="${n.x}" cy="${n.y}" r="13"/><circle class="pulse" cx="${n.x}" cy="${n.y}" r="7"/><circle class="core" cx="${n.x}" cy="${n.y}" r="6.5" fill="${n.c}" fill-opacity=".85" stroke="#070a26" stroke-width="1.5"/><text x="${lx}" y="${n.y}" dx="${out ? '.45em' : '-.45em'}" dy=".35em" text-anchor="${out ? 'start' : 'end'}">${esc(label)}</text></g>`;
    }
  }
  h += '</g>';
  svg.innerHTML = h;
  const el = new Map([...svg.querySelectorAll('.node')].map(g => [g.dataset.id, g]));
  const edgeEls = [...svg.querySelectorAll('.edge')];

  /* ---------- viewport ---------- */
  let vb = { x: -1080, y: -1080, w: 2160, h: 2160 };
  const apply = () => {
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    svg.style.setProperty('--z', (vb.w / (svg.clientWidth || 1)).toFixed(3)); // user units per screen pixel, keeps labels a constant size
    svg.classList.toggle('zoomed', vb.w < 1150);
  };
  const scale = () => Math.max(vb.w / svg.clientWidth, vb.h / svg.clientHeight);
  const toSvg = (cx, cy) => { const r = svg.getBoundingClientRect(), s = scale(); return { x: vb.x + (cx - r.left - (r.width - vb.w / s) / 2) * s, y: vb.y + (cy - r.top - (r.height - vb.h / s) / 2) * s }; };
  const zoomAt = (p, f) => { const nw = Math.min(2600, Math.max(240, vb.w * f)); f = nw / vb.w; vb.x = p.x - (p.x - vb.x) * f; vb.y = p.y - (p.y - vb.y) * f; vb.w *= f; vb.h *= f; apply(); };
  let anim = 0;
  const flyTo = (x, y, w) => {
    cancelAnimationFrame(anim);
    const from = { ...vb }, to = { w, h: w * (vb.h / vb.w) }; to.x = x - to.w / 2; to.y = y - to.h / 2;
    if (RM) { vb = to; return apply(); }
    const t0 = performance.now(), dur = 700, ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = t => { const p = Math.min(1, (t - t0) / dur), e = ease(p); for (const k of ['x', 'y', 'w', 'h']) vb[k] = from[k] + (to[k] - from[k]) * e; apply(); if (p < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  };
  const fit = () => { const ar = (svg.clientHeight / svg.clientWidth) || 1; if (ar < 1) { vb.h = 2160; vb.w = 2160 / ar; } else { vb.w = 2160; vb.h = 2160 * ar; } vb.x = -vb.w / 2; vb.y = -vb.h / 2; apply(); };
  fit(); addEventListener('resize', () => { const c = { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 }, ar = svg.clientHeight / svg.clientWidth; vb.h = vb.w * ar; vb.x = c.x - vb.w / 2; vb.y = c.y - vb.h / 2; apply(); });
  svg.addEventListener('wheel', e => { e.preventDefault(); cancelAnimationFrame(anim); zoomAt(toSvg(e.clientX, e.clientY), Math.exp(e.deltaY * .0016)); }, { passive: false });
  const ptrs = new Map(); let drag = null, moved = 0, pinch = null;
  svg.addEventListener('pointerdown', e => {
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); cancelAnimationFrame(anim);
    if (ptrs.size === 1) { drag = { sx: e.clientX, sy: e.clientY, vb: { ...vb } }; moved = 0; }
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), w: vb.w }; drag = null; }
  });
  svg.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y); zoomAt(toSvg((a.x + b.x) / 2, (a.y + b.y) / 2), (pinch.w * pinch.d / d) / vb.w); moved = 99; return; }
    if (!drag) return;
    const s = scale(), dx = e.clientX - drag.sx, dy = e.clientY - drag.sy; moved = Math.max(moved, Math.hypot(dx, dy));
    if (moved > 4) {
      if (!svg.hasPointerCapture(e.pointerId)) svg.setPointerCapture(e.pointerId); // capture only once a real drag starts, so clicks still hit nodes
      svg.classList.add('dragging'); vb.x = drag.vb.x - dx * s; vb.y = drag.vb.y - dy * s; apply();
    }
  });
  const up = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; if (!ptrs.size) { drag = null; svg.classList.remove('dragging'); } };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  document.querySelector('[data-zoom="in"]')?.addEventListener('click', () => zoomAt({ x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 }, .7));
  document.querySelector('[data-zoom="out"]')?.addEventListener('click', () => zoomAt({ x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 }, 1.4));
  document.querySelector('[data-zoom="fit"]')?.addEventListener('click', () => { clear(); fit(); });

  /* ---------- selection ---------- */
  let selected = null;
  const clear = () => {
    svg.classList.remove('focus'); svg.querySelectorAll('.sel,.lit').forEach(x => x.classList.remove('sel', 'lit'));
    panel.classList.remove('open'); shell.classList.remove('panel-open'); selected = null; history.replaceState(null, '', location.pathname + location.search);
  };
  const neighbours = id => {
    const lit = new Set([id]), edges = new Set();
    const touch = nid => adj.get(nid)?.forEach(i => { const e = E[i]; if (e.type === 'has' && nid !== id && N.get(id)?.type !== 'course') return; edges.add(i); lit.add(e.s); lit.add(e.t); });
    if (id.startsWith('stream:')) { const s = id.slice(7); for (const n of N.values()) if (n.stream === s) lit.add(n.id); E.forEach((e, i) => { if (lit.has(e.s) && lit.has(e.t)) edges.add(i); }); return { lit, edges }; }
    touch(id);
    const n = N.get(id);
    if (n.type === 'course') n.data.sections.forEach(touch);
    return { lit, edges };
  };
  const select = (id, fly = true) => {
    if (!el.has(id)) return;
    svg.querySelectorAll('.sel,.lit').forEach(x => x.classList.remove('sel', 'lit'));
    const { lit, edges } = neighbours(id);
    lit.forEach(k => el.get(k)?.classList.add('lit')); edges.forEach(i => edgeEls[i].classList.add('lit'));
    el.get(id).classList.add('sel'); svg.classList.add('focus'); selected = id;
    renderPanel(id); panel.classList.add('open'); shell.classList.add('panel-open'); panel.scrollTop = 0;
    history.replaceState(null, '', '#' + id);
    if (fly) {
      const n = N.get(id), mobile = innerWidth < 760;
      if (id.startsWith('stream:')) { const s = streams.find(x => 'stream:' + x.id === id); const [x, y] = polar(560, s.am); return flyTo(x + (mobile ? 0 : 160), y + (mobile ? 140 : 0), 1500); }
      const w = n.type === 'course' ? 820 : 620, off = mobile ? 0 : (430 / 2) * (w / svg.clientWidth);
      flyTo(n.x + off, n.y + (mobile ? w * .22 : 0), w);
    }
  };
  svg.addEventListener('click', e => {
    if (moved > 4) return;
    const g = e.target.closest('.node');
    g ? select(g.dataset.id) : clear();
  });
  svg.addEventListener('keydown', e => { const g = e.target.closest('.node'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(g.dataset.id); } });
  svg.addEventListener('pointerover', e => {
    const g = e.target.closest('.node'); if (!g || selected) return;
    const { lit, edges } = neighbours(g.dataset.id);
    lit.forEach(k => el.get(k)?.classList.add('lit')); edges.forEach(i => edgeEls[i].classList.add('lit')); svg.classList.add('focus');
  });
  svg.addEventListener('pointerout', e => { const g = e.target.closest('.node'); if (!g || selected) return; svg.classList.remove('focus'); svg.querySelectorAll('.lit').forEach(x => x.classList.remove('lit')); });
  panel.querySelector('.close').addEventListener('click', clear);
  panel.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { e.preventDefault(); select(b.dataset.go); } });
  addEventListener('keydown', e => { if (e.key === 'Escape' && selected && !document.querySelector('dialog[open]')) clear(); });

  const lvl = n => `${n} Level`;
  const mini = (id, sub) => { const n = N.get(id); if (!n) return ''; const lab = n.type === 'course' ? `${n.id} · ${n.data.title}` : n.data.name; return `<button data-go="${id}" style="--c:${n.c}"><span class="dot"></span><span>${esc(lab)}</span>${sub ? `<small>${esc(sub)}</small>` : ''}</button>`; };
  function renderPanel(id) {
    let html = '';
    if (id.startsWith('stream:')) {
      const s = streams.find(x => 'stream:' + x.id === id);
      const list = s.courses.map(c => courses.get(c)).sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));
      html = `<span class="eyebrow" style="color:${s.color}">Stream</span><h2>${esc(s.name)} chemistry</h2><p class="muted">${esc(s.blurb)}</p>
        <div class="p-sec"><h4>${list.length} courses</h4><div class="mini">${list.map(c => mini(c.id, lvl(c.level))).join('')}</div></div>`;
    } else if (N.get(id).type === 'course') {
      const c = courses.get(id), n = N.get(id), s = streams.find(x => x.id === n.stream);
      const leads = D.courses.filter(x => x.pre.includes(id));
      html = `<span class="eyebrow" style="color:${n.c}">${lvl(c.level)} · ${esc(s.name)}</span><h2>${esc(c.title)}</h2>
        <div class="chips" style="margin-bottom:14px"><span class="badge badge-volt">${c.id}</span>${c.credits ? `<span class="badge">${c.credits} credits</span>` : ''}${c.sem ? `<span class="badge">Semester ${esc(c.sem)}</span>` : ''}</div>
        <p style="color:var(--white);font-weight:600">${esc(c.tagline)}</p><p class="muted">${esc(c.about)}</p>
        <div class="counter-row"><div class="counter"><b>${c.counts.notes}</b><span>files</span></div><div class="counter"><b>${c.counts.papers}</b><span>papers</span></div><div class="counter"><b>${c.sections.length}</b><span>sections</span></div></div>
        <div class="p-sec"><h4>Sections</h4><div class="mini">${c.sections.map(sid => mini(sid, (sections.get(sid).counts.notes + sections.get(sid).counts.tut + sections.get(sid).counts.ans) + ' files')).join('')}</div></div>
        ${c.pre.length ? `<div class="p-sec"><h4>Builds on</h4><div class="mini">${c.pre.map(p => courses.has(p) ? mini(p, 'prerequisite') : `<span class="badge">${esc(p)}</span>`).join('')}</div></div>` : ''}
        ${leads.length ? `<div class="p-sec"><h4>Leads to</h4><div class="mini">${leads.map(l => mini(l.id, lvl(l.level))).join('')}</div></div>` : ''}
        <div class="p-sec" style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary btn-sm" href="${BASE}${c.url}">Open course ${icon('arrow')}</a>${c.counts.papers ? `<a class="btn btn-ghost btn-sm" href="${BASE}${c.url}#papers">${icon('papers')} Past papers</a>` : ''}</div>`;
    } else {
      const s = sections.get(id), n = N.get(id), c = courses.get(n.parent);
      const from = D.links.filter(l => l[1] === id), to = D.links.filter(l => l[0] === id);
      html = `<span class="eyebrow" style="color:${n.c}">${c.id} · ${lvl(c.level)}${s.hours ? ' · ' + esc(s.hours) : ''}</span><h2>${esc(s.name)}</h2>
        <p style="color:var(--white);font-weight:600">${esc(s.summary)}</p>
        <div class="chips">${s.topics.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
        ${from.length ? `<div class="p-sec"><h4>Builds on</h4><div class="mini">${from.map(l => mini(l[0], l[2])).join('')}</div></div>` : ''}
        ${to.length ? `<div class="p-sec"><h4>Leads to</h4><div class="mini">${to.map(l => mini(l[1], l[2])).join('')}</div></div>` : ''}
        <div class="p-sec"><h4>Notes in this section${s.notes.length ? ` · ${s.counts.notes + s.counts.tut + s.counts.ans} files` : ''}</h4>${s.notes.length ? `<div class="mini">${s.notes.map(([fid, t]) => `<button data-pdf="${fid}" data-title="${esc(c.id + ' · ' + t)}" style="--c:${n.c}">${icon('file')}<span>${esc(t)}</span><small>preview</small></button>`).join('')}</div>` : '<p class="faint" style="font-size:.85rem">No notes in the folder for this section yet — use the textbook chapters below.</p>'}</div>
        ${s.refs.length ? `<div class="p-sec"><h4>Textbook chapters</h4><div class="mini">${s.refs.map(r => `<a href="${esc(r[2] || '#')}" target="_blank" rel="noopener" style="--c:var(--volt)">${icon('book')}<span><b style="color:var(--white)">${esc(r[0])}</b> — ${esc(r[1])}</span></a>`).join('')}</div></div>` : ''}
        <div class="p-sec" style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary btn-sm" href="${BASE}${s.url}">Open section ${icon('arrow')}</a><button class="btn btn-ghost btn-sm" data-go="${c.id}">${icon('layers')} ${c.id}</button></div>`;
    }
    pbody.innerHTML = html;
  }

  /* ---------- search + filters ---------- */
  const input = document.querySelector('.map-search input'), res = document.querySelector('.map-results');
  const index = [...N.values()].map(n => ({ id: n.id, t: n.type === 'course' ? `${n.id} ${n.data.title}` : n.data.name, sub: n.type === 'course' ? lvl(n.level) : n.parent, c: n.c }));
  input?.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { res.hidden = true; return; }
    const hits = index.filter(x => x.t.toLowerCase().includes(q) || x.sub.toLowerCase().includes(q)).slice(0, 8);
    res.innerHTML = hits.length ? hits.map(x => `<button data-go="${x.id}" style="--c:${x.c}"><span class="dot"></span><span>${esc(x.t)}</span><small>${esc(x.sub)}</small></button>`).join('') : '<p class="faint" style="padding:10px;margin:0">No match</p>';
    res.hidden = false;
  });
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') { const b = res.querySelector('[data-go]'); if (b) { select(b.dataset.go); res.hidden = true; input.blur(); } } if (e.key === 'Escape') { input.value = ''; res.hidden = true; } });
  res?.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { select(b.dataset.go); res.hidden = true; } });
  const off = { stream: new Set(), level: new Set() };
  document.querySelectorAll('[data-f]').forEach(chip => chip.addEventListener('click', () => {
    const [k, v] = chip.dataset.f.split(':'), on = chip.getAttribute('aria-pressed') !== 'false';
    chip.setAttribute('aria-pressed', on ? 'false' : 'true');
    on ? off[k].add(v) : off[k].delete(v);
    for (const n of N.values()) el.get(n.id)?.classList.toggle('off', off.stream.has(n.stream) || off.level.has(String(n.level)));
    E.forEach((e, i) => edgeEls[i].classList.toggle('off', el.get(e.s).classList.contains('off') || el.get(e.t).classList.contains('off')));
  }));

  const start = decodeURIComponent(location.hash.slice(1));
  if (start && el.has(start)) setTimeout(() => select(start), 250);
})();
