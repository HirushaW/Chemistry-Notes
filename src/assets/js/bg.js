// Background: drifting atoms joined by bonds, with a few slowly turning benzene rings.
// Drawn at about 30 fps (a timer, so idle display frames are not requested); in the lite effects tier it is one still frame.
(() => {
  const cv = document.getElementById('bg-canvas'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLORS = ['203,255,46', '134,61,255', '94,231,255', '173,125,255'];
  let W = 0, H = 0, DPR = 1, atoms = [], rings = [], mouse = { x: -9999, y: -9999 }, raf = 0, tmr = 0, last = 0;
  const lite = () => document.documentElement.dataset.perf === 'lite', still = () => RM || lite();
  const rnd = (a, b) => a + Math.random() * (b - a);
  function resize() {
    DPR = Math.min(devicePixelRatio || 1, lite() ? 1 : 1.5);   // a soft backdrop does not need full retina resolution
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = Math.round(Math.min(70, Math.max(24, W * H / 22000)) * (lite() ? .6 : 1));
    atoms = Array.from({ length: n }, () => ({ x: rnd(0, W), y: rnd(0, H), vx: rnd(-.18, .18), vy: rnd(-.14, .14), r: rnd(1.2, 2.8), c: COLORS[(Math.random() * COLORS.length) | 0] }));
    const nr = W < 700 ? 2 : 4;
    rings = Array.from({ length: nr }, () => ({ x: rnd(0, W), y: rnd(0, H), s: rnd(18, 34), a: rnd(0, Math.PI), va: rnd(-.0016, .0016), vx: rnd(-.08, .08), vy: rnd(-.06, .06), c: COLORS[(Math.random() * 2) | 0] }));
  }
  function hex(r) {
    ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.a);
    ctx.strokeStyle = `rgba(${r.c},.22)`; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = 0; i <= 6; i++) { const t = i * Math.PI / 3, x = Math.cos(t) * r.s, y = Math.sin(t) * r.s; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r.s * .58, 0, Math.PI * 2); ctx.strokeStyle = `rgba(${r.c},.14)`; ctx.stroke();
    for (let i = 0; i < 6; i++) { const t = i * Math.PI / 3; ctx.beginPath(); ctx.arc(Math.cos(t) * r.s, Math.sin(t) * r.s, 2, 0, Math.PI * 2); ctx.fillStyle = `rgba(${r.c},.35)`; ctx.fill(); }
    ctx.restore();
  }
  const next = () => { tmr = setTimeout(() => { tmr = 0; raf = requestAnimationFrame(frame); }, 30); }; // ~30 fps is plenty for a backdrop
  function frame(t) {
    raf = 0;
    const dt = last ? Math.min(3, (t - last) / 16.7) : 1; last = t;
    if (!still() && !document.hidden) next();
    ctx.clearRect(0, 0, W, H);
    for (const r of rings) { r.x += r.vx * dt; r.y += r.vy * dt; r.a += r.va * dt; if (r.x < -60) r.x = W + 60; if (r.x > W + 60) r.x = -60; if (r.y < -60) r.y = H + 60; if (r.y > H + 60) r.y = -60; hex(r); }
    for (const a of atoms) {
      a.x += a.vx * dt; a.y += a.vy * dt;
      if (a.x < -10) a.x = W + 10; if (a.x > W + 10) a.x = -10; if (a.y < -10) a.y = H + 10; if (a.y > H + 10) a.y = -10;
      const dx = a.x - mouse.x, dy = a.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 14000) { const f = (1 - d2 / 14000) * .6; a.x += dx / 60 * f; a.y += dy / 60 * f; }
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < atoms.length; i++) {
      const a = atoms[i];
      for (let j = i + 1; j < atoms.length; j++) {
        const b = atoms[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < 15000) { ctx.strokeStyle = `rgba(173,125,255,${(1 - d2 / 15000) * .22})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      const mx = a.x - mouse.x, my = a.y - mouse.y, m2 = mx * mx + my * my;
      if (m2 < 26000) { ctx.strokeStyle = `rgba(203,255,46,${(1 - m2 / 26000) * .35})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
    for (const a of atoms) {
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r * 3.2, 0, Math.PI * 2); ctx.fillStyle = `rgba(${a.c},.07)`; ctx.fill();
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(${a.c},.75)`; ctx.fill();
    }
  }
  const stop = () => { cancelAnimationFrame(raf); clearTimeout(tmr); raf = tmr = 0; };
  const go = () => { stop(); last = 0; raf = requestAnimationFrame(frame); };   // one frame when still, a loop otherwise
  resize(); go();
  // phones fire resize as the address bar slides in and out while scrolling: rebuild only for a real size change
  let rw = innerWidth, rh = innerHeight, rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (innerWidth === rw && Math.abs(innerHeight - rh) < 160) return; rw = innerWidth; rh = innerHeight; resize(); go(); }, 150);
  });
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (!still()) go(); });
  document.addEventListener('perfchange', () => { if (lite()) { resize(); go(); } });   // switched to lite: redraw once, still
})();
