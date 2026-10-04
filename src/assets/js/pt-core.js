// Shared periodic-table helpers: grid positions, category colours and the idle wave.
window.PT = (() => {
  const CAT = {
    'Alkali metal': '#cbff2e', 'Alkaline earth metal': '#7dffb2', 'Transition metal': '#ad7dff', 'Post-transition metal': '#5ee7ff',
    'Metalloid': '#ffb547', 'Nonmetal': '#dcdfff', 'Halogen': '#ff7ad9', 'Noble gas': '#ff8f6b', 'Lanthanide': '#9aa3d9', 'Actinide': '#f6c453',
  };
  // row 1-7 main table, row 9 lanthanides, row 10 actinides (row 8 is a spacer)
  function pos(z) {
    if (z === 1) return [1, 1]; if (z === 2) return [1, 18];
    if (z <= 10) return [2, z <= 4 ? z - 2 : z + 8];
    if (z <= 18) return [3, z <= 12 ? z - 10 : z];
    if (z <= 36) return [4, z - 18];
    if (z <= 54) return [5, z - 36];
    if (z <= 56) return [6, z - 54];
    if (z <= 71) return [9, z - 54];
    if (z <= 86) return [6, z - 68];
    if (z <= 88) return [7, z - 86];
    if (z <= 103) return [10, z - 86];
    return [7, z - 100];
  }
  const color = e => CAT[e.g] || '#dcdfff';

  // A smooth sine wave that travels diagonally across the table, writing --w (0..1) on every tile.
  // It runs at full strength when the visitor is idle and calms down while they interact.
  function wave(items, { root, idleMs = 1600, active = .12, speed = 1, spread = 1 } = {}) {
    const lite = () => document.documentElement.dataset.perf === 'lite';   // lite effects tier: a still table
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || lite() || !items.length) return { stop() {} };
    let amp = 0, target = 1, lastMove = -1e9, visible = true, raf = 0;
    const host = root || items[0].el.parentElement;
    host.addEventListener('pointermove', () => { lastMove = performance.now(); }, { passive: true });
    host.addEventListener('pointerleave', () => { lastMove = performance.now() - idleMs * .6; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }).observe(host);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(frame); });
    function frame(t) {
      raf = 0;
      if (!visible || document.hidden || lite()) return;
      target = t - lastMove > idleMs ? 1 : active;
      amp += (target - amp) * .035;                     // ease the strength in and out
      const p = t / 1000 * 2.1 * speed;
      for (const it of items) {
        const s = Math.sin(p - (it.col * .38 + it.row * .62) * spread);
        const w = (s + 1) / 2, e = w * w * (3 - 2 * w); // smoothstep for a soft crest
        const v = (e * amp).toFixed(3);
        if (it.v !== v) { it.v = v; it.el.style.setProperty('--w', v); }
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return { stop() { cancelAnimationFrame(raf); raf = 0; visible = false; } };
  }
  return { CAT, pos, color, wave };
})();
