// The Chemistry Atom: a 3D atom whose four shells are the four levels and whose electrons are the courses.
// Drag to spin it, hover an electron to see its links (time slows down so it is easy to click), click to read about it.
(() => {
  const X = window.Explore; if (!X) return;
  document.querySelectorAll('[data-atom]').forEach(init);

  function init(root) {
    const { D, esc, streams, courses, sections, conn, colorOf, coursePanel, sectionPanel, lvl } = X;
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const FINE = matchMedia('(pointer: fine)');
    const stage = root.querySelector('.atom-stage'), cv = stage.querySelector('canvas'), ctx = cv.getContext('2d');
    const layer = stage.querySelector('.atom-electrons'), tip = stage.querySelector('.atom-tip');
    const panel = root.querySelector('.atom-panel'), pbody = panel.querySelector('.p-body');
    const useHash = root.hasAttribute('data-atom-hash');

    /* ---------- the four energy levels ---------- */
    // f: radius as a fraction of R; inc/node: tilt of the orbital plane; speed: orbit speed in rad/s (inner shells faster)
    const SHELLS = [
      { lv: 1000, n: 1, f: .3, inc: .5, node: .35, speed: .46 },
      { lv: 2000, n: 2, f: .53, inc: -.95, node: 1.3, speed: .34 },
      { lv: 3000, n: 3, f: .77, inc: .78, node: 2.4, speed: .25 },
      { lv: 4000, n: 4, f: 1, inc: -1.12, node: 3.15, speed: .19 },
    ];
    const ORDER = ['gen', 'inorg', 'org', 'phys', 'anal', 'bio', 'ind', 'comp', 'lab'];
    const { cos, sin, PI } = Math;
    const rx = a => [[1, 0, 0], [0, cos(a), -sin(a)], [0, sin(a), cos(a)]];
    const ry = a => [[cos(a), 0, sin(a)], [0, 1, 0], [-sin(a), 0, cos(a)]];
    const mul = (A, B) => A.map(r => [0, 1, 2].map(j => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
    const ap = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2], M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2], M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]];
    const rgbOf = hex => { const n = parseInt(hex.slice(1), 16); return `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`; };
    for (const sh of SHELLS) { sh.S = mul(ry(sh.node), rx(sh.inc)); sh.phase = 0; }

    /* ---------- electrons = courses ---------- */
    const E = [], byId = new Map();
    for (const sh of SHELLS) {
      const list = D.courses.filter(c => c.level === sh.lv).sort((a, b) => ORDER.indexOf(a.stream) - ORDER.indexOf(b.stream) || a.id.localeCompare(b.id));
      list.forEach((c, i) => {
        const el = document.createElement('button');
        el.type = 'button'; el.className = 'e'; el.dataset.id = c.id;
        el.style.setProperty('--c', colorOf(c));
        el.setAttribute('aria-label', `${c.id} ${c.title}, ${lvl(c.level)}`);
        el.innerHTML = `<span class="e-core"></span><span class="e-label">${c.id.replace(/^CHE/, 'CHE ')}</span>`;
        layer.appendChild(el);
        const e = { c, el, sh, rgb: rgbOf(colorOf(c)), a0: i / list.length * PI * 2 + sh.n * .7, x: 0, y: 0, z: 0, zn: 1 };
        E.push(e); byId.set(c.id, e);
      });
    }

    // nucleons on a Fibonacci sphere: protons in Volt, neutrons in Ultraviolet
    const NUC = Array.from({ length: 26 }, (_, i) => {
      const y = 1 - (i + .5) / 26 * 2, r = Math.sqrt(1 - y * y), t = i * 2.399963;
      return { v: [cos(t) * r, y, sin(t) * r], p: i % 2 === 0 };
    });

    /* ---------- state ---------- */
    let W = 0, H = 0, R = 0, cx = 0, cy = 0, cxT = 0, es = 1;
    let yaw = .5, pitch = .38, yawVel = 0, pitchVel = 0, tiltX = 0, tiltY = 0, tX = 0, tY = 0, time = 0;
    let spin = RM ? 0 : .17, rate = 1;
    let hovered = null, selected = null, streamF = null, levelF = null;
    let visible = false, raf = 0, last = 0, dragging = false, drag = null, moved = 0;
    const wide = () => innerWidth >= 1000;
    const targetCx = () => W / 2 - (selected && wide() ? Math.min(230, W * .17) : 0);
    const active = () => hovered || selected;

    function resize() {
      const r = stage.getBoundingClientRect(); if (!r.width) return;
      W = r.width; H = r.height; const DPR = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      R = Math.min(W * (W < 640 ? .43 : .36), H * .41); es = W < 640 ? .84 : 1;
      cy = H / 2; cxT = targetCx(); if (!cx || RM) cx = cxT;
      render();
    }
    new ResizeObserver(resize).observe(stage);

    const project = v => { const d = R * 4.6, s = d / (d - v[2]); return [cx + v[0] * s, cy + v[1] * s, s]; };

    /* ---------- render loop (paused off-screen; a single still frame under reduced motion) ---------- */
    function frame(now) {
      if (!R) return;
      const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now;
      if (!RM) {
        time += dt;
        spin += ((hovered ? .012 : selected ? .04 : .17) - spin) * .05;
        rate += ((hovered ? .06 : selected ? .45 : 1) - rate) * .08;
        if (!dragging) { yaw += (spin + yawVel) * dt; pitch = Math.max(-1.2, Math.min(1.2, pitch + pitchVel * dt)); yawVel *= .94; pitchVel *= .9; }
        tiltX += (tX - tiltX) * .05; tiltY += (tY - tiltY) * .05;
        cx += (cxT - cx) * .08;
      } else cx = cxT;
      const G = mul(rx(pitch + tiltY + (RM ? 0 : sin(time * .21) * .07)), ry(yaw + tiltX));
      for (const sh of SHELLS) { if (!RM) sh.phase += sh.speed * dt * rate; sh.M = mul(G, sh.S); }
      draw(G);
    }
    function loop(now) { raf = 0; frame(now); if (visible && !document.hidden && !RM) raf = requestAnimationFrame(loop); }
    function render() { if (RM || !raf) frame(performance.now()); }
    const start = () => { if (RM) return render(); if (!raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(loop); } };
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; start(); }, { rootMargin: '80px' }).observe(stage);
    document.addEventListener('visibilitychange', start);

    /* ---------- drawing ---------- */
    function ring(sh) {
      const pts = [], r = R * sh.f, N = 160;
      for (let i = 0; i <= N; i++) { const t = i / N * PI * 2, v = ap(sh.M, [cos(t) * r, 0, sin(t) * r]), p = project(v); pts.push([p[0], p[1], v[2] / r]); }
      return pts;
    }
    function shellTone(sh) {
      const a = active(), on = levelF === sh.lv || (a && byId.get(a).sh === sh);
      if (on) return ['203,255,46', 1.4];
      if (levelF) return ['220,223,255', .35];
      return ['190,180,255', 1];
    }
    // segments are grouped into depth buckets so each ring costs a handful of strokes
    function drawRing(pts, sh, front) {
      const [rgb, k] = shellTone(sh), NB = 6, paths = Array.from({ length: NB }, () => new Path2D());
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], z = (a[2] + b[2]) / 2;
        if ((z >= 0) !== front) continue;
        const p = paths[Math.min(NB - 1, Math.floor((z + 1) / 2 * NB))]; p.moveTo(a[0], a[1]); p.lineTo(b[0], b[1]);
      }
      paths.forEach((p, i) => {
        const zn = (i + .5) / NB, al = (front ? .2 + .55 * zn : .05 + .16 * zn) * k;
        if (front) { ctx.strokeStyle = `rgba(${rgb},${(al * .25).toFixed(3)})`; ctx.lineWidth = 6; ctx.stroke(p); }
        ctx.strokeStyle = `rgba(${rgb},${Math.min(1, al).toFixed(3)})`; ctx.lineWidth = front ? 1.6 : 1; ctx.stroke(p);
      });
    }
    function drawNucleus(G) {
      const rn = R * .12, pulse = 1 + (RM ? 0 : sin(time * 1.7) * .04);
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, rn * 3.2 * pulse);
      halo.addColorStop(0, 'rgba(203,255,46,.3)'); halo.addColorStop(.35, 'rgba(134,61,255,.22)'); halo.addColorStop(1, 'rgba(134,61,255,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, rn * 3.2 * pulse, 0, PI * 2); ctx.fill();
      const Sp = mul(G, ry(time * .6)), rs = rn * .5;
      const pts = NUC.map(n => ({ v: ap(Sp, n.v.map(c => c * rn * .62)), p: n.p })).sort((a, b) => a.v[2] - b.v[2]);
      for (const n of pts) {
        const [x, y, s] = project(n.v), r = rs * s, col = n.p ? ['#f4ffd0', '#cbff2e', '#4a5e00'] : ['#e6d6ff', '#863dff', '#2a0e63'];
        const g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
        g.addColorStop(0, col[0]); g.addColorStop(.5, col[1]); g.addColorStop(1, col[2]);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill();
      }
    }
    // a short glowing tail behind each electron, along its orbit
    function drawTrails() {
      ctx.save(); ctx.lineCap = 'round';
      for (const e of E) {
        if (e.el.classList.contains('faded')) continue;
        const r = R * e.sh.f, t = e.a0 + e.sh.phase, path = new Path2D(), N = 9, span = Math.min(.55, 34 / r);
        let tail;
        for (let j = N; j >= 0; j--) { const a = t - span * j / N, p = project(ap(e.sh.M, [cos(a) * r, 0, sin(a) * r])); if (j === N) { tail = p; path.moveTo(p[0], p[1]); } else path.lineTo(p[0], p[1]); }
        const g = ctx.createLinearGradient(tail[0], tail[1], e.x, e.y);
        g.addColorStop(0, `rgba(${e.rgb},0)`); g.addColorStop(1, `rgba(${e.rgb},${(.15 + .55 * e.zn).toFixed(2)})`);
        ctx.strokeStyle = g; ctx.lineWidth = 2.6 * (.6 + .5 * e.zn); ctx.stroke(path);
      }
      ctx.restore();
    }
    function drawLinks() {
      const id = active(); if (!id) return;
      const a = byId.get(id), { from, to } = conn.get(id);
      const pairs = [...[...from.keys()].map(k => [byId.get(k), a, '173,125,255']), ...[...to.keys()].map(k => [a, byId.get(k), '203,255,46'])];
      ctx.save(); ctx.lineCap = 'round';
      for (const [p, q, rgb] of pairs) {
        if (!p || !q || p.el.classList.contains('faded') || q.el.classList.contains('faded')) continue;
        const mx = (p.x + q.x) / 2 * .62 + cx * .38, my = (p.y + q.y) / 2 * .62 + cy * .38;
        ctx.setLineDash([]); ctx.strokeStyle = `rgba(${rgb},.16)`; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(mx, my, q.x, q.y); ctx.stroke();
        ctx.setLineDash([6, 7]); ctx.lineDashOffset = -time * 46; ctx.strokeStyle = `rgba(${rgb},.9)`; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(mx, my, q.x, q.y); ctx.stroke();
      }
      ctx.restore();
    }
    // Shell labels sit where a ring reaches furthest in some screen direction. Each shell has its own preferred
    // directions; a label keeps its spot while it stays clear, and moves to the next free one when two would collide.
    const DIRS = [[.36, -.93], [.8, -.6], [1, -.06], [.9, .44], [.5, .87], [-.5, .87], [-.9, .44], [-1, -.06], [-.8, -.6], [-.36, -.93]];
    const PREF = [[3, 2, 4, 1, 5, 6], [2, 1, 3, 7, 0, 6], [1, 0, 2, 8, 9, 3], [0, 1, 9, 8, 2, 7]];
    const lastDir = [-1, -1, -1, -1];
    let fontKey = '', fBig = 12, fSmall = 9, widths = [];
    document.fonts?.ready.then(() => { fontKey = ''; render(); }); // re-measure once the web fonts are in
    function drawLabels(rings) {
      const key = R.toFixed(0);
      if (key !== fontKey) {
        fontKey = key; fBig = Math.round(Math.max(12, R * .055)); fSmall = Math.round(Math.max(9, R * .032));
        widths = SHELLS.map(sh => { ctx.font = `800 ${fBig}px Sora, sans-serif`; const a = ctx.measureText(String(sh.lv)).width; ctx.font = `600 ${fSmall}px "JetBrains Mono", monospace`; return [a, ctx.measureText(`n=${sh.n}`).width]; });
      }
      ctx.save(); ctx.textBaseline = 'middle';
      const placed = [];
      for (let k = SHELLS.length - 1; k >= 0; k--) {
        const sh = SHELLS[k], [w1, w2] = widths[k], bw = w1 + 6 + w2, bh = fBig;
        const spot = d => {
          const [dx, dy] = DIRS[d]; let best = rings[k][0], score = -1e9;
          for (const pt of rings[k]) { const sc = (pt[0] - cx) * dx + (pt[1] - cy) * dy + pt[2] * R * .08; if (sc > score) { score = sc; best = pt; } }
          let x = best[0] + dx * 12 - (dx < -.3 ? bw : dx > .3 ? 0 : bw / 2), y = best[1] + dy * 15;
          x = Math.max(6, Math.min(W - bw - 6, x)); y = Math.max(bh, Math.min(H - bh, y));
          return { x, y, box: [x - 5, y - bh / 2 - 4, x + bw + 5, y + bh / 2 + 4] };
        };
        const free = s => !placed.some(b => s.box[0] < b[2] && s.box[2] > b[0] && s.box[1] < b[3] && s.box[3] > b[1]);
        let at = lastDir[k] >= 0 ? spot(lastDir[k]) : null;
        if (!at || !free(at)) { at = null; for (const d of PREF[k]) { const s = spot(d); if (free(s)) { at = s; lastDir[k] = d; break; } } }
        if (!at) { lastDir[k] = PREF[k][0]; at = spot(lastDir[k]); }
        placed.push(at.box);
        const [rgb, kk] = shellTone(sh), a = Math.min(1, kk);
        ctx.font = `800 ${fBig}px Sora, sans-serif`;
        ctx.fillStyle = `rgba(${kk > 1 ? rgb : '255,255,255'},${(.85 * a).toFixed(2)})`; ctx.fillText(String(sh.lv), at.x, at.y);
        ctx.font = `600 ${fSmall}px "JetBrains Mono", monospace`;
        ctx.fillStyle = `rgba(220,223,255,${(.5 * a).toFixed(2)})`; ctx.fillText(`n=${sh.n}`, at.x + w1 + 6, at.y + 1);
      }
      ctx.restore();
    }
    function placeElectrons() {
      const a = active();
      for (const e of E) {
        const r = R * e.sh.f, t = e.a0 + e.sh.phase, v = ap(e.sh.M, [cos(t) * r, 0, sin(t) * r]), [x, y, s] = project(v);
        e.x = x; e.y = y; e.z = v[2]; e.zn = (v[2] / R + 1) / 2;
        const focus = e.c.id === a || e.c.id === selected;
        e.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${((.66 + .4 * e.zn) * s * es * (focus ? 1.4 : 1)).toFixed(3)}) translate(-50%,-50%)`;
        e.el.style.zIndex = focus ? 900 : 100 + Math.round(e.zn * 500);
        e.el.style.setProperty('--zn', e.zn.toFixed(2));
      }
    }
    function draw(G) {
      ctx.clearRect(0, 0, W, H);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.3);
      glow.addColorStop(0, 'rgba(134,61,255,.16)'); glow.addColorStop(.55, 'rgba(134,61,255,.05)'); glow.addColorStop(1, 'rgba(134,61,255,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      const rings = SHELLS.map(ring);
      SHELLS.forEach((sh, k) => drawRing(rings[k], sh, false));
      drawNucleus(G);
      SHELLS.forEach((sh, k) => drawRing(rings[k], sh, true));
      placeElectrons();
      drawTrails();
      drawLinks();
      drawLabels(rings);
      if (hovered) placeTip();
    }

    /* ---------- hover, tooltip, selection ---------- */
    function setLinked() {
      const id = active(), linked = id ? new Set([...conn.get(id).from.keys(), ...conn.get(id).to.keys()]) : new Set();
      root.classList.toggle('lit', !!id);
      for (const e of E) { e.el.classList.toggle('lnk', linked.has(e.c.id)); e.el.classList.toggle('hov', e.c.id === hovered); }
    }
    function hover(id) {
      if (hovered === id) return;
      hovered = id; setLinked();
      if (!id) { tip.hidden = true; return render(); }
      const c = courses.get(id), s = streams.get(c.stream), { from, to } = conn.get(id);
      tip.innerHTML = `<b style="color:${s.color}">${c.id} · ${lvl(c.level)} · ${esc(s.name)}</b><strong>${esc(c.title)}</strong><small>${c.counts.notes} files · ${c.counts.papers} papers · builds on ${from.size} · leads to ${to.size}</small><em>${FINE.matches ? 'Click' : 'Tap'} to explore →</em>`;
      tip.hidden = false; render();
    }
    function placeTip() {
      const e = byId.get(hovered); if (!e) return;
      const above = e.y > 190;
      tip.style.left = Math.max(150, Math.min(W - 150, e.x)) + 'px'; tip.style.top = (above ? e.y - 24 : e.y + 24) + 'px';
      tip.classList.toggle('below', !above);
    }
    const setHash = h => { if (useHash) history.replaceState(null, '', h ? '#' + h : location.pathname + location.search); };
    function showCourse() { pbody.innerHTML = coursePanel(courses.get(selected)); panel.scrollTop = 0; setHash(selected); }
    function showSection(sid) { pbody.innerHTML = sectionPanel(sections.get(sid)); panel.scrollTop = 0; setHash(sid); }
    function select(id, secId) {
      if (!byId.has(id)) return;
      const was = selected;
      selected = id; hovered = null; tip.hidden = true;
      for (const e of E) e.el.classList.toggle('sel', e.c.id === id);
      setLinked();
      root.classList.add('has-sel'); cxT = targetCx();
      panel.hidden = false;
      if (was && !RM) panel.animate([{ opacity: .4, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
      if (secId && sections.has(secId)) showSection(secId); else showCourse();
      if (!wide()) panel.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest' });
      render();
    }
    function deselect() {
      if (!selected) return;
      const id = selected;
      selected = null; root.classList.remove('has-sel'); panel.hidden = true; cxT = targetCx();
      for (const e of E) e.el.classList.remove('sel');
      setLinked(); setHash(null); render();
      byId.get(id)?.el.focus({ preventScroll: true });
    }
    layer.addEventListener('pointerover', e => { if (e.pointerType === 'touch') return; const b = e.target.closest('.e'); if (b) hover(b.dataset.id); });
    layer.addEventListener('pointerout', e => { if (e.pointerType === 'touch') return; const b = e.target.closest('.e'); if (b && !e.relatedTarget?.closest?.('.e')) hover(null); });
    layer.addEventListener('focusin', e => { const b = e.target.closest('.e'); if (b && b.matches(':focus-visible')) hover(b.dataset.id); });
    layer.addEventListener('focusout', () => hover(null));
    layer.addEventListener('click', e => { const b = e.target.closest('.e'); if (b) { e.stopPropagation(); select(b.dataset.id); } });
    panel.addEventListener('click', e => {
      if (e.target.closest('.close')) return deselect();
      const g = e.target.closest('[data-course]'); if (g) { e.preventDefault(); const [cid, sid] = g.dataset.course.split('|'); return select(cid, sid || null); }
      const sb = e.target.closest('[data-sec]'); if (sb) { e.preventDefault(); return showSection(sb.dataset.sec); }
      if (e.target.closest('[data-back]')) { e.preventDefault(); showCourse(); }
    });
    addEventListener('keydown', e => { if (e.key === 'Escape' && selected && !document.querySelector('dialog[open]')) deselect(); });

    /* ---------- drag to spin (with inertia), pointer parallax ---------- */
    stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.e') || e.button > 0) return;
      dragging = true; moved = 0; yawVel = pitchVel = 0;
      drag = { x: e.clientX, y: e.clientY, yaw, pitch, lx: e.clientX, ly: e.clientY, lt: performance.now() };
    });
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      if (!dragging) { if (e.pointerType !== 'touch' && !RM) { tX = ((e.clientX - r.left) / r.width - .5) * .45; tY = ((e.clientY - r.top) / r.height - .5) * .28; } return; }
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.hypot(dx, dy));
      if (moved > 4 && !stage.hasPointerCapture(e.pointerId)) { stage.setPointerCapture(e.pointerId); stage.classList.add('grabbing'); }
      yaw = drag.yaw + dx * .008; pitch = Math.max(-1.2, Math.min(1.2, drag.pitch + dy * .006));
      const now = performance.now(), dts = Math.max(16, now - drag.lt) / 1000;
      yawVel = (e.clientX - drag.lx) * .008 / dts * .35; pitchVel = (e.clientY - drag.ly) * .006 / dts * .25;
      drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = now;
      render();
    });
    const end = e => {
      if (!dragging) return; dragging = false; stage.classList.remove('grabbing');
      if (performance.now() - drag.lt > 90) yawVel = pitchVel = 0;
      yawVel = Math.max(-2.5, Math.min(2.5, yawVel)); pitchVel = Math.max(-1.5, Math.min(1.5, pitchVel));
      if (moved < 5 && !e.target.closest?.('.e')) deselect();
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', () => { dragging = false; stage.classList.remove('grabbing'); });
    stage.addEventListener('pointerleave', () => { tX = tY = 0; });

    /* ---------- filters: streams and levels ---------- */
    const applyFilter = () => {
      for (const e of E) e.el.classList.toggle('faded', (!!streamF && e.c.stream !== streamF) || (!!levelF && e.c.level !== levelF));
      render();
    };
    const chipsS = root.querySelectorAll('[data-atom-stream]'), chipsL = root.querySelectorAll('[data-atom-level]');
    chipsS.forEach(ch => ch.addEventListener('click', () => {
      const v = ch.dataset.atomStream; streamF = (v === 'all' || streamF === v) ? null : v;
      chipsS.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.atomStream === (streamF || 'all'))));
      applyFilter();
    }));
    chipsL.forEach(ch => ch.addEventListener('click', () => {
      const v = +ch.dataset.atomLevel; levelF = levelF === v ? null : v;
      chipsL.forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.atomLevel === levelF)));
      applyFilter();
    }));

    // used by the map page for deep links (#CHE2112 or #CHE2112/section-slug) and #stream:org
    root.selectCourse = select;
    root.filterStream = k => root.querySelector(`[data-atom-stream="${CSS.escape(k)}"]`)?.click();
  }
})();
