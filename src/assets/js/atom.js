// The Chemistry Atom: a 3D atom whose four shells are the four levels and whose electrons are the courses.
// Drag to turn it any way, scroll or pinch to zoom, hover an electron to see its links, click it to read about the course.
// Every change (zoom, pan, turn, filter, highlight) eases toward a target each frame, so nothing jumps.
(() => {
  const X = window.Explore; if (!X) return;
  document.querySelectorAll('[data-atom]').forEach(init);

  function init(root) {
    const { D, esc, streams, courses, sections, conn, colorOf, coursePanel, sectionPanel, lvl } = X;
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const FINE = matchMedia('(pointer: fine)');
    const wrap = root.querySelector('.atom-wrap'), stage = root.querySelector('.atom-stage'), cv = stage.querySelector('canvas'), ctx = cv.getContext('2d');
    const layer = stage.querySelector('.atom-electrons'), tip = stage.querySelector('.atom-tip'), note = stage.querySelector('.atom-note');
    const panel = root.querySelector('.atom-panel'), pbody = panel.querySelector('.p-body');
    const useHash = root.hasAttribute('data-atom-hash'); // map page: the atom is the page, so the wheel always zooms

    /* ---------- the four energy levels ---------- */
    // f: radius as a fraction of R; inc/node: tilt of the orbital plane; speed: orbit speed in rad/s (inner shells faster)
    const LC = D.levelColors || {};
    const SHELLS = [
      { lv: 1000, n: 1, f: .28, inc: .5, node: .35, speed: .46 },
      { lv: 2000, n: 2, f: .52, inc: -.95, node: 1.3, speed: .34 },
      { lv: 3000, n: 3, f: .76, inc: .78, node: 2.4, speed: .25 },
      { lv: 4000, n: 4, f: 1, inc: -1.12, node: 3.15, speed: .19 },
    ];
    const ORDER = ['gen', 'inorg', 'org', 'phys', 'anal', 'bio', 'ind', 'comp', 'lab'];
    const { cos, sin, PI } = Math, TAU = PI * 2;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const rx = a => [[1, 0, 0], [0, cos(a), -sin(a)], [0, sin(a), cos(a)]];
    const ry = a => [[cos(a), 0, sin(a)], [0, 1, 0], [-sin(a), 0, cos(a)]];
    const mul = (A, B) => A.map(r => [0, 1, 2].map(j => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
    const ap = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2], M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2], M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]];
    const rgbOf = hex => { const n = parseInt(hex.slice(1), 16); return `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`; };
    const wrapA = a => a - TAU * Math.floor((a + PI) / TAU); // to (-π, π]

    // orientation is a quaternion [w, x, y, z], so the atom turns freely in every direction with no gimbal lock
    const qmul = (a, b) => [a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3], a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2], a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1], a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]];
    const qax = (x, y, z, t) => { const s = sin(t / 2); return [cos(t / 2), x * s, y * s, z * s]; };
    const qn = q => { const l = Math.hypot(...q) || 1; return q.map(c => c / l); };
    const qmat = ([w, x, y, z]) => [[1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)], [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)], [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)]];
    const slerp = (a, b, t) => {
      let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
      if (d < 0) { b = b.map(c => -c); d = -d; }
      if (d > .9995) return qn(a.map((c, i) => c + (b[i] - c) * t));
      const th = Math.acos(d), s = sin(th), ka = sin((1 - t) * th) / s, kb = sin(t * th) / s;
      return a.map((c, i) => c * ka + b[i] * kb);
    };
    // turn about a screen-space axis (view space): drag right turns the front right, drag down turns it down
    const turn = (q, ax, ay, ang) => { const l = Math.hypot(ax, ay); return l && ang ? qn(qmul(qax(ax / l, ay / l, 0, ang), q)) : q; };
    const Q0 = qmul(qax(1, 0, 0, .38), qax(0, 1, 0, .5));

    for (const sh of SHELLS) {
      sh.S = mul(ry(sh.node), rx(sh.inc)); sh.phase = 0;
      sh.color = LC[sh.lv] || '#dcdfff'; sh.rgb = rgbOf(sh.color);
      sh.vis = 1; sh.visT = 1; sh.hl = 1; sh.hlT = 1;
    }

    /* ---------- electrons = courses, coloured by their stream (the shells keep the level colours) ---------- */
    const E = [], byId = new Map();
    for (const sh of SHELLS) {
      const list = D.courses.filter(c => c.level === sh.lv).sort((a, b) => ORDER.indexOf(a.stream) - ORDER.indexOf(b.stream) || a.id.localeCompare(b.id));
      list.forEach((c, i) => {
        const el = document.createElement('button');
        el.type = 'button'; el.className = 'e'; el.dataset.id = c.id;
        el.style.setProperty('--c', colorOf(c));
        el.setAttribute('aria-label', `${c.id} ${c.title}, ${lvl(c.level)}`);
        el.innerHTML = `<span class="e-core">${c.id.replace(/^CHE\s*/, '')}</span>`;
        layer.appendChild(el);
        const a = sh.n * .7 + i / list.length * TAU;
        const e = { c, el, sh, rgb: rgbOf(colorOf(c)), a, aT: a, show: true, vis: 1, hl: 1, hlT: 1, pop: 1, x: 0, y: 0, z: 0, zn: 1 };
        E.push(e); byId.set(c.id, e);
      });
    }

    // nucleons on a Fibonacci sphere: protons in Volt, neutrons in Ultraviolet
    const NUC = Array.from({ length: 26 }, (_, i) => {
      const y = 1 - (i + .5) / 26 * 2, r = Math.sqrt(1 - y * y), t = i * 2.399963;
      return { v: [cos(t) * r, y, sin(t) * r], p: i % 2 === 0 };
    });

    /* ---------- state ---------- */
    const ZMIN = .6, ZMAX = 5;
    let W = 0, H = 0, R = 0, cx = 0, cy = 0, cxT = 0, ox = 0, oy = 0, es = 1;
    let q = Q0, wx = 0, wy = 0, reset = null;            // orientation, spin velocity (rad/s about the screen axes), reset animation
    let zoom = 1, zoomT = 1, panX = 0, panY = 0, panXT = 0, panYT = 0;
    let tiltX = 0, tiltY = 0, tX = 0, tY = 0, time = 0;
    let spin = RM ? 0 : .16, rate = 1, paused = RM;
    let hovered = null, selected = null;
    const streamSel = new Set(), levelSel = new Set();
    let visible = false, raf = 0, last = 0, engaged = useHash;
    const wide = () => innerWidth >= 1000;
    const targetCx = () => W / 2 - (selected && wide() ? Math.min(230, W * .17) : 0);
    const active = () => hovered || selected;

    function resize() {
      const r = stage.getBoundingClientRect(); if (!r.width) return;
      W = r.width; H = r.height; const DPR = Math.min(devicePixelRatio || 1, document.documentElement.dataset.perf === 'lite' ? 1 : 1.5);
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      R = Math.min(W * (W < 640 ? .44 : .41), H * .45); es = W < 640 ? .86 : 1;
      cy = H / 2; cxT = targetCx(); if (!cx || RM) cx = cxT;
      clampPan();
      render();
    }
    new ResizeObserver(resize).observe(stage);

    const project = v => { const d = R * 4.6, s = d / (d - v[2]); return [ox + v[0] * s * zoom, oy + v[1] * s * zoom, s]; };

    /* ---------- render loop (paused off-screen; frames on demand under reduced motion) ---------- */
    const ease = (dt, k) => RM ? 1 : 1 - Math.exp(-dt * k);
    function frame(now) {
      if (!R) return;
      const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now;
      const k = ease(dt, 9);
      // camera: zoom, pan and the panel offset glide to their targets
      zoom += (zoomT - zoom) * k; panX += (panXT - panX) * k; panY += (panYT - panY) * k;
      cx += (cxT - cx) * ease(dt, 6);
      if (!RM) {
        time += dt;
        const still = paused || dragging;
        spin += ((still ? 0 : hovered ? .012 : selected ? .04 : .16) / Math.sqrt(zoom) - spin) * ease(dt, 3);
        rate += ((paused ? 0 : hovered ? .06 : selected ? .45 : 1) / Math.sqrt(zoom) - rate) * ease(dt, 4);
        tiltX += (tX - tiltX) * ease(dt, 3); tiltY += (tY - tiltY) * ease(dt, 3);
      }
      if (reset) {
        reset.t = Math.min(1, reset.t + (RM ? 1 : dt / .9));
        const t = reset.t, s = t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
        q = slerp(reset.from, Q0, s); if (t >= 1) reset = null;
      } else if (!dragging) {
        q = turn(q, wx, wy, Math.hypot(wx, wy) * dt);   // inertia after a flick
        const f = Math.exp(-dt * 3.2); wx *= f; wy *= f;
        if (spin) q = qn(qmul(q, qax(0, 1, 0, spin * dt))); // the slow turn about the atom's own axis
      }
      const view = qmul(qmul(qax(1, 0, 0, tiltY + (RM ? 0 : sin(time * .21) * .06)), qax(0, 1, 0, tiltX)), q);
      const G = qmat(view);
      for (const sh of SHELLS) {
        if (!RM) sh.phase += sh.speed * dt * rate;
        sh.vis += (sh.visT - sh.vis) * ease(dt, 6); sh.hl += (sh.hlT - sh.hl) * ease(dt, 7);
        sh.M = mul(G, sh.S);
      }
      for (const e of E) {
        e.vis += ((e.show ? 1 : 0) - e.vis) * ease(dt, 7);
        e.hl += (e.hlT - e.hl) * ease(dt, 8);
        e.pop += ((e.c.id === hovered || e.c.id === selected ? 1.22 : 1) - e.pop) * ease(dt, 12);
        e.a += wrapA(e.aT - e.a) * ease(dt, 3.6);         // glide to the new slot when a filter changes
      }
      ox = cx + panX; oy = cy + panY;
      draw(G);
    }
    function loop(now) { raf = 0; frame(now); if (visible && !document.hidden && !RM) raf = requestAnimationFrame(loop); }
    function render() { if (RM || !raf) frame(performance.now()); }
    const start = () => { if (RM) return render(); if (!raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(loop); } };
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; start(); }, { rootMargin: '80px' }).observe(stage);
    document.addEventListener('visibilitychange', start);

    /* ---------- drawing ---------- */
    function ring(sh) {
      const pts = [], r = R * sh.f, N = clamp(Math.round(r * zoom * .45), 120, 420);
      for (let i = 0; i <= N; i++) { const t = i / N * TAU, v = ap(sh.M, [cos(t) * r, 0, sin(t) * r]), p = project(v); pts.push([p[0], p[1], v[2] / r]); }
      return pts;
    }
    // segments are grouped into depth buckets so each ring costs a handful of strokes
    function drawRing(pts, sh, front) {
      const k = sh.vis * sh.hl, NB = 6, paths = Array.from({ length: NB }, () => new Path2D()), lw = sh.hl > 1.1 ? 1.5 : 1;
      if (k < .01) return;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], z = (a[2] + b[2]) / 2;
        if ((z >= 0) !== front) continue;
        const p = paths[Math.min(NB - 1, Math.floor((z + 1) / 2 * NB))]; p.moveTo(a[0], a[1]); p.lineTo(b[0], b[1]);
      }
      paths.forEach((p, i) => {
        const zn = (i + .5) / NB, al = (front ? .3 + .5 * zn : .07 + .17 * zn) * k;
        if (front) { ctx.strokeStyle = `rgba(${sh.rgb},${Math.min(1, al * .22).toFixed(3)})`; ctx.lineWidth = 7 * lw; ctx.stroke(p); }
        ctx.strokeStyle = `rgba(${sh.rgb},${Math.min(1, al).toFixed(3)})`; ctx.lineWidth = (front ? 1.7 : 1.1) * lw; ctx.stroke(p);
      });
    }
    function drawNucleus(G) {
      const rn = R * .1, pulse = 1 + (RM ? 0 : sin(time * 1.7) * .04), rh = rn * zoom * 2.9 * pulse;
      const halo = ctx.createRadialGradient(ox, oy, 0, ox, oy, rh);
      halo.addColorStop(0, 'rgba(203,255,46,.3)'); halo.addColorStop(.35, 'rgba(134,61,255,.22)'); halo.addColorStop(1, 'rgba(134,61,255,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(ox, oy, rh, 0, TAU); ctx.fill();
      const Sp = mul(G, ry(time * .6)), rs = rn * .5 * zoom;
      const pts = NUC.map(n => ({ v: ap(Sp, n.v.map(c => c * rn * .62)), p: n.p })).sort((a, b) => a.v[2] - b.v[2]);
      for (const n of pts) {
        const [x, y, s] = project(n.v), r = rs * s, col = n.p ? ['#f4ffd0', '#cbff2e', '#4a5e00'] : ['#e6d6ff', '#863dff', '#2a0e63'];
        const g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
        g.addColorStop(0, col[0]); g.addColorStop(.5, col[1]); g.addColorStop(1, col[2]);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      }
    }
    // a short glowing tail behind each electron, along its orbit
    function drawTrails() {
      ctx.save(); ctx.lineCap = 'round';
      const zs = zoom ** .4;
      for (const e of E) {
        const al = e.vis * e.hl; if (al < .03) continue;
        const r = R * e.sh.f, t = e.a + e.sh.phase, path = new Path2D(), N = 10, span = Math.min(.6, 40 * zs / (r * zoom));
        let tail;
        for (let j = N; j >= 0; j--) { const a = t - span * j / N, p = project(ap(e.sh.M, [cos(a) * r, 0, sin(a) * r])); if (j === N) { tail = p; path.moveTo(p[0], p[1]); } else path.lineTo(p[0], p[1]); }
        const g = ctx.createLinearGradient(tail[0], tail[1], e.x, e.y);
        g.addColorStop(0, `rgba(${e.rgb},0)`); g.addColorStop(1, `rgba(${e.rgb},${((.15 + .55 * e.zn) * al).toFixed(3)})`);
        ctx.strokeStyle = g; ctx.lineWidth = 3 * (.6 + .5 * e.zn) * zs; ctx.stroke(path);
      }
      ctx.restore();
    }
    function drawLinks() {
      const id = active(); if (!id) return;
      const a = byId.get(id), { from, to } = conn.get(id);
      const pairs = [...[...from.keys()].map(k => [byId.get(k), a, '173,125,255']), ...[...to.keys()].map(k => [a, byId.get(k), '203,255,46'])];
      ctx.save(); ctx.lineCap = 'round';
      for (const [p, q2, rgb] of pairs) {
        if (!p || !q2) continue;
        const al = Math.min(p.vis, q2.vis); if (al < .05) continue;
        const mx = (p.x + q2.x) / 2 * .62 + ox * .38, my = (p.y + q2.y) / 2 * .62 + oy * .38;
        ctx.setLineDash([]); ctx.strokeStyle = `rgba(${rgb},${(.16 * al).toFixed(3)})`; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(mx, my, q2.x, q2.y); ctx.stroke();
        ctx.setLineDash([6, 7]); ctx.lineDashOffset = -time * 46; ctx.strokeStyle = `rgba(${rgb},${(.9 * al).toFixed(3)})`; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(mx, my, q2.x, q2.y); ctx.stroke();
      }
      ctx.restore();
    }
    function placeElectrons() {
      const zs = zoom ** .4, rN = R * .115 * zoom; // electrons grow slower than the atom, so zooming in pulls crowded ones apart
      for (const e of E) {
        const r = R * e.sh.f, t = e.a + e.sh.phase, v = ap(e.sh.M, [cos(t) * r, 0, sin(t) * r]), [x, y, s] = project(v);
        e.x = x; e.y = y; e.z = v[2]; e.zn = (v[2] / R + 1) / 2;
        if (e.vis < .01) { if (e.el.style.visibility !== 'hidden') e.el.style.visibility = 'hidden'; continue; }
        // an electron passing behind the nucleus is hidden by it
        const dN = Math.hypot(x - ox, y - oy), behind = v[2] < 0 ? clamp((dN - rN * .7) / (rN * .9), 0, 1) : 1;
        const focus = e.c.id === active() || e.c.id === selected;
        e.el.style.visibility = '';
        e.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${((.7 + .38 * e.zn) * s * zs * es * e.pop * (.55 + .45 * e.vis)).toFixed(3)}) translate(-50%,-50%)`;
        e.el.style.opacity = (e.vis * e.hl * (.5 + .5 * e.zn) * (.15 + .85 * behind) * (focus ? 1 / Math.max(.5, .5 + .5 * e.zn) : 1)).toFixed(3);
        e.el.style.zIndex = focus ? 900 : 100 + Math.round(e.zn * 500);
      }
    }
    function draw(G) {
      ctx.clearRect(0, 0, W, H);
      const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, R * 1.25 * zoom);
      glow.addColorStop(0, 'rgba(134,61,255,.16)'); glow.addColorStop(.55, 'rgba(134,61,255,.05)'); glow.addColorStop(1, 'rgba(134,61,255,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      const rings = SHELLS.map(sh => sh.vis * sh.hl > .01 ? ring(sh) : null);
      SHELLS.forEach((sh, k) => rings[k] && drawRing(rings[k], sh, false));
      drawNucleus(G);
      SHELLS.forEach((sh, k) => rings[k] && drawRing(rings[k], sh, true));
      placeElectrons();
      drawTrails();
      drawLinks();
      if (hovered) placeTip();
    }

    /* ---------- hover, tooltip, selection ---------- */
    function setLinked() {
      const id = active(), linked = id ? new Set([...conn.get(id).from.keys(), ...conn.get(id).to.keys()]) : new Set(), ash = id && byId.get(id).sh;
      for (const e of E) {
        const on = e.c.id === id || e.c.id === selected, lk = linked.has(e.c.id);
        e.el.classList.toggle('lnk', lk); e.el.classList.toggle('hov', e.c.id === hovered);
        e.hlT = !id || on || lk ? 1 : .22;
      }
      for (const sh of SHELLS) sh.hlT = !id ? 1 : sh === ash ? 1.5 : .55;
      render();
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
      tip.style.left = clamp(e.x, 150, W - 150) + 'px'; tip.style.top = (above ? e.y - 30 : e.y + 30) + 'px';
      tip.classList.toggle('below', !above);
    }
    const setHash = h => { if (useHash) history.replaceState(null, '', h ? '#' + h : location.pathname + location.search); };
    function showCourse() { pbody.innerHTML = coursePanel(courses.get(selected)); panel.scrollTop = 0; setHash(selected); }
    function showSection(sid) { pbody.innerHTML = sectionPanel(sections.get(sid)); panel.scrollTop = 0; setHash(sid); }
    let closing = null;
    function select(id, secId) {
      const e = byId.get(id); if (!e) return;
      if (!e.show) clearFilters(); // a link in the panel can point at a course the filters hide
      const was = selected;
      selected = id; hovered = null; tip.hidden = true;
      for (const x of E) x.el.classList.toggle('sel', x.c.id === id);
      setLinked();
      cxT = targetCx();
      closing?.cancel(); closing = null;
      panel.hidden = false;
      if (was && !RM) panel.animate([{ opacity: .4, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
      if (secId && sections.has(secId)) showSection(secId); else showCourse();
      if (!wide()) panel.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest' });
      render();
    }
    function deselect(refocus = true) {
      if (!selected) return;
      const id = selected;
      selected = null; cxT = targetCx();
      for (const e of E) e.el.classList.remove('sel');
      if (RM) panel.hidden = true;
      else {
        closing = panel.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: wide() ? 'translateX(24px)' : 'translateY(10px)' }], { duration: 240, easing: 'cubic-bezier(.4,0,1,1)' });
        closing.onfinish = () => { closing = null; if (!selected) panel.hidden = true; };
        setTimeout(() => closing?.finish(), 400); // a background tab may never run the animation
      }
      setLinked(); setHash(null); render();
      if (refocus) byId.get(id)?.el.focus({ preventScroll: true });
    }
    layer.addEventListener('pointerover', e => { if (e.pointerType === 'touch' || dragging) return; const b = e.target.closest('.e'); if (b) hover(b.dataset.id); });
    layer.addEventListener('pointerout', e => { if (e.pointerType === 'touch') return; const b = e.target.closest('.e'); if (b && !e.relatedTarget?.closest?.('.e')) hover(null); });
    layer.addEventListener('focusin', e => { const b = e.target.closest('.e'); if (b && b.matches(':focus-visible')) hover(b.dataset.id); });
    layer.addEventListener('focusout', () => hover(null));
    layer.addEventListener('click', e => { const b = e.target.closest('.e'); if (b && !suppressClick) { e.stopPropagation(); select(b.dataset.id); } });
    panel.addEventListener('click', e => {
      if (e.target.closest('.close')) return deselect();
      const g = e.target.closest('[data-course]'); if (g) { e.preventDefault(); const [cid, sid] = g.dataset.course.split('|'); return select(cid, sid || null); }
      const sb = e.target.closest('[data-sec]'); if (sb) { e.preventDefault(); return showSection(sb.dataset.sec); }
      if (e.target.closest('[data-back]')) { e.preventDefault(); showCourse(); }
    });
    addEventListener('keydown', e => { if (e.key === 'Escape' && selected && !document.querySelector('dialog[open]')) deselect(); });

    /* ---------- camera: zoom and pan ---------- */
    function clampPan() {
      const lim = R * Math.max(0, zoomT - 1) * 1.1;
      panXT = clamp(panXT, -lim, lim); panYT = clamp(panYT, -lim, lim);
    }
    // zoom by f about a point on the stage, keeping the spot under it fixed while the zoom eases in
    function zoomAt(f, px, py, now = false) {
      const z0 = zoomT, z1 = clamp(z0 * f, ZMIN, ZMAX); if (z1 === z0) return;
      const bx = cxT + panXT, by = cy + panYT;
      panXT = px - cxT - (px - bx) * z1 / z0; panYT = py - cy - (py - by) * z1 / z0;
      zoomT = z1; clampPan();
      if (now || RM) { zoom = zoomT; panX = panXT; panY = panYT; }
      render();
    }
    const zoomCenter = f => zoomAt(f, cxT, cy);
    function fit(f) { zoomT = clamp(.94 / f, 1, ZMAX); panXT = panYT = 0; if (RM) { zoom = zoomT; panX = panY = 0; } render(); }
    function resetView() {
      zoomT = 1; panXT = panYT = 0; wx = wy = 0; spin = 0;
      reset = { from: q, t: 0 };
      if (RM) { zoom = 1; panX = panY = 0; }
      render();
    }
    let noteT = 0;
    function say(text, ms = 1800) {
      clearTimeout(noteT);
      if (!text) { note.classList.remove('on'); return; }
      note.textContent = text; note.classList.add('on');
      if (ms) noteT = setTimeout(() => note.classList.remove('on'), ms);
    }

    /* ---------- pointer: one finger or button turns, two fingers pinch and pan, right or shift drag pans ---------- */
    const pts = new Map();
    let dragging = false, mode = null, moved = 0, last1 = null, pinch = null, suppressClick = false, onElectron = false, btn = 0;
    const local = e => { const r = stage.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const pinchOf = () => { const [a, b] = [...pts.values()]; return { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; };
    function grab() { if (dragging) return; dragging = true; stage.classList.add('grabbing'); hover(null); }
    stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.atom-ctrl') || e.button > 2) return;
      engaged = true;
      pts.set(e.pointerId, local(e));
      if (pts.size === 1) {
        btn = e.button; mode = btn === 1 || btn === 2 || e.shiftKey ? 'pan' : 'turn';
        moved = 0; wx = wy = 0; reset = null; suppressClick = false;
        onElectron = !!e.target.closest('.e');
        last1 = { p: local(e), s: local(e), t: performance.now() };
      } else if (pts.size === 2) {
        mode = 'pinch'; grab(); pinch = pinchOf();
        zoomT = zoom; panXT = panX; panYT = panY; wx = wy = 0;
        for (const id of pts.keys()) try { stage.setPointerCapture(id); } catch { /* pointer already gone */ }
      }
    });
    stage.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) {
        // gentle parallax under a hovering mouse, weaker when zoomed in so targets stay put
        if (e.pointerType !== 'touch' && !RM) { const [x, y] = local(e); tX = (x / W - .5) * .3 / zoom; tY = (y / H - .5) * .2 / zoom; }
        return;
      }
      const p = local(e); pts.set(e.pointerId, p);
      if (mode === 'pinch' && pts.size >= 2) {
        const nw = pinchOf();
        zoomAt(nw.d / pinch.d, nw.m[0], nw.m[1], true);
        panXT += nw.m[0] - pinch.m[0]; panYT += nw.m[1] - pinch.m[1]; clampPan(); panX = panXT; panY = panYT;
        pinch = nw; return render();
      }
      if (!last1) return;
      moved = Math.max(moved, Math.hypot(p[0] - last1.s[0], p[1] - last1.s[1]));
      if (moved > 5 && !dragging) { grab(); try { stage.setPointerCapture(e.pointerId); } catch { /* ignore */ } }
      if (!dragging) return;
      const dx = p[0] - last1.p[0], dy = p[1] - last1.p[1], now = performance.now(), dts = Math.max(8, now - last1.t) / 1000;
      if (mode === 'pan') { panXT += dx; panYT += dy; clampPan(); panX = panXT; panY = panYT; }
      else {
        const k = .0085 / Math.sqrt(zoom);
        q = turn(q, -dy, dx, Math.hypot(dx, dy) * k);
        // smoothed angular velocity for the flick
        wx += (-dy * k / dts - wx) * .5; wy += (dx * k / dts - wy) * .5;
      }
      last1 = { p, s: last1.s, t: now };
      render();
    });
    function lift(e) {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (mode === 'pinch') {
        if (pts.size === 1) { const p = [...pts.values()][0]; mode = 'turn'; last1 = { p, s: [-1e4, -1e4], t: performance.now() }; moved = 1e4; } // keep turning with the finger left
        else if (!pts.size) end(false);
        return;
      }
      if (!pts.size) end(e.type === 'pointerup');
    }
    function end(up) {
      const wasDrag = dragging;
      dragging = false; stage.classList.remove('grabbing'); mode = null; pinch = null;
      if (wasDrag) {
        suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
        if (RM || !last1 || performance.now() - last1.t > 90) wx = wy = 0;
        const w = Math.hypot(wx, wy); if (w > 5) { wx *= 5 / w; wy *= 5 / w; }
      } else if (up && btn === 0 && moved < 5 && !onElectron) deselect(false);
      last1 = null;
    }
    stage.addEventListener('pointerup', lift);
    stage.addEventListener('pointercancel', lift);
    stage.addEventListener('lostpointercapture', e => { if (pts.has(e.pointerId) && mode !== 'pinch') lift(e); });
    stage.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') { tX = tY = 0; } });
    stage.addEventListener('contextmenu', e => e.preventDefault());
    wrap.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch' && !pts.size) engaged = useHash; });
    stage.addEventListener('dblclick', e => {
      if (e.target.closest('.e, .atom-ctrl')) return;
      const [x, y] = local(e);
      if (zoomT > ZMAX * .9) resetView(); else zoomAt(2, x, y);
    });
    // the wheel zooms; on the home page only once the atom has been clicked, so scrolling past it still scrolls the page
    stage.addEventListener('wheel', e => {
      if (!engaged && !e.ctrlKey && !e.metaKey) { say(FINE.matches ? 'Click the atom, then scroll to zoom' : 'Pinch to zoom'); return; }
      e.preventDefault();
      const px = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? H : 1);
      const [x, y] = local(e);
      zoomAt(clamp(Math.exp(-px * (e.ctrlKey ? .01 : .0017)), .5, 2), x, y);
    }, { passive: false });

    /* ---------- view controls and keys ---------- */
    const pauseBtn = root.querySelector('[data-atom-ctrl="pause"]');
    root.querySelector('.atom-ctrl')?.addEventListener('click', e => {
      const b = e.target.closest('[data-atom-ctrl]'); if (!b) return;
      const k = b.dataset.atomCtrl;
      if (k === 'in') zoomCenter(1.5); else if (k === 'out') zoomCenter(1 / 1.5); else if (k === 'reset') resetView();
      else if (k === 'pause') { paused = !paused; b.setAttribute('aria-pressed', String(paused)); b.setAttribute('aria-label', paused ? 'Resume motion' : 'Pause motion'); }
    });
    if (RM && pauseBtn) pauseBtn.hidden = true;
    wrap.addEventListener('keydown', e => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest('.atom-panel')) return;
      const k = e.key, arrows = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [1, 0], ArrowDown: [-1, 0] };
      if (k === '+' || k === '=') zoomCenter(1.25);
      else if (k === '-' || k === '_') zoomCenter(.8);
      else if (k === '0') resetView();
      else if (arrows[k]) {
        const [ax, ay] = arrows[k]; reset = null;
        if (RM) q = turn(q, ax, ay, .26); else { wx += ax * 2.2; wy += ay * 2.2; } // a nudge that eases out
      } else return;
      e.preventDefault(); render();
    });

    /* ---------- filters: only the chosen streams and levels stay in the atom ---------- */
    const chipsS = root.querySelectorAll('[data-atom-stream]'), chipsL = root.querySelectorAll('[data-atom-level]');
    const nS = chipsS.length - 1, nL = chipsL.length - 1;
    let fitKey = '';
    function applyFilter() {
      for (const e of E) {
        e.show = (!streamSel.size || streamSel.has(e.c.stream)) && (!levelSel.size || levelSel.has(e.c.level));
        e.el.inert = !e.show;
      }
      // the electrons left on a shell spread out evenly around it
      for (const sh of SHELLS) {
        const on = E.filter(e => e.sh === sh && e.show);
        on.forEach((e, j) => { e.aT = sh.n * .7 + j / on.length * TAU; });
        sh.visT = levelSel.size && !levelSel.has(sh.lv) ? 0 : on.length ? 1 : .35;
      }
      if (hovered && !byId.get(hovered).show) hover(null);
      if (selected && !byId.get(selected).show) deselect(false);
      // choosing levels zooms to fit the outermost one left, so the inner shells come up close
      const key = [...levelSel].sort().join();
      if (key !== fitKey) { fitKey = key; fit(Math.max(...SHELLS.filter(sh => !levelSel.size || levelSel.has(sh.lv)).map(sh => sh.f))); }
      chipsS.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.atomStream === 'all' ? !streamSel.size : streamSel.has(x.dataset.atomStream))));
      chipsL.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.atomLevel === 'all' ? !levelSel.size : levelSel.has(+x.dataset.atomLevel))));
      const n = E.filter(e => e.show).length;
      if (!n) say('No course matches these filters', 0); else if (note.textContent.startsWith('No course')) say('');
      setLinked();
    }
    function clearFilters() { streamSel.clear(); levelSel.clear(); applyFilter(); }
    const toggle = (set, v, all) => { if (v === 'all') set.clear(); else { set.has(v) ? set.delete(v) : set.add(v); if (set.size === all) set.clear(); } applyFilter(); };
    chipsS.forEach(ch => ch.addEventListener('click', () => toggle(streamSel, ch.dataset.atomStream, nS)));
    chipsL.forEach(ch => ch.addEventListener('click', () => toggle(levelSel, ch.dataset.atomLevel === 'all' ? 'all' : +ch.dataset.atomLevel, nL)));

    // used by the map page for deep links (#CHE2112 or #CHE2112/section-slug) and #stream:org
    root.selectCourse = select;
    root.filterStream = k => { if (!streams.has(k)) return; streamSel.clear(); streamSel.add(k); applyFilter(); };
  }
})();
