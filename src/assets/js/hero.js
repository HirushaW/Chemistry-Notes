// Home hero: a 3D periodic table with a smooth idle wave, pointer parallax and a link from each element to its card.
// spider.js adds the spider that picks an element to spotlight.
(() => {
  const wrap = document.querySelector('.pt3d-wrap'); if (!wrap) return;
  const data = JSON.parse(document.getElementById('elements-data').textContent);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const base = document.documentElement.dataset.base || '/';
  const grid = wrap.querySelector('.pt3d'), tip = wrap.querySelector('.pt-tip'), ticker = document.querySelector('[data-ticker]');
  const frag = document.createDocumentFragment();
  const cells = [], items = [];
  for (const e of data) {
    const [row, col] = PT.pos(e.z), el = document.createElement('a');
    el.className = 'el'; el.href = `${base}periodic-table/#${e.s}`;
    el.style.gridRow = row; el.style.gridColumn = col;
    el.style.setProperty('--c', PT.color(e));
    el.innerHTML = `<i>${e.z}</i>${e.s}`;
    el.setAttribute('aria-label', `${e.n}, atomic number ${e.z}`);
    el.dataset.z = e.z;
    frag.appendChild(el); cells.push(el);
    items.push({ el, col, row: row > 8 ? row - 1.6 : row }); // keep the f-block in phase with the rows above it
  }
  for (const [row, txt] of [[6, '57–71'], [7, '89–103']]) { const g = document.createElement('span'); g.className = 'gap'; g.style.gridRow = row; g.textContent = txt; frag.appendChild(g); }
  grid.appendChild(frag);

  const byZ = z => data[z - 1];
  const show = (el, x, y) => {
    const e = byZ(+el.dataset.z);
    tip.style.setProperty('--c', PT.color(e));
    tip.innerHTML = `<b>${e.s}</b> <span class="n">${e.n}</span><small>Z = ${e.z} · ${Number(e.m).toPrecision(5)} u</small><small>${e.g}</small>`;
    const r = wrap.getBoundingClientRect();
    tip.style.left = Math.min(r.width - 190, Math.max(0, x - r.left + 14)) + 'px';
    tip.style.top = Math.max(0, y - r.top - 70) + 'px';
    tip.classList.add('show');
  };
  grid.addEventListener('pointerover', ev => { const el = ev.target.closest('.el'); if (el) show(el, ev.clientX, ev.clientY); });
  grid.addEventListener('pointermove', ev => { const el = ev.target.closest('.el'); if (el) show(el, ev.clientX, ev.clientY); });
  grid.addEventListener('pointerleave', () => tip.classList.remove('show'));

  if (RM) { grid.style.animation = 'none'; return; }
  const hero = wrap.closest('.hero') || wrap;
  const lite = document.documentElement.dataset.perf === 'lite';
  if (lite) grid.style.animation = 'none';            // lite effects: a still table, no sway, wave or tilt

  // the idle wave: tiles rise and zoom in a smooth diagonal swell (CSS animations driven by PT.wave)
  PT.wave(items, { root: hero, idleMs: 1400, active: .3, speed: .8, spread: 1 });

  // pointer parallax: written straight to the table's transform (no inherited variables, so the tiles are not restyled),
  // and the loop runs only while the tilt is still catching up with the pointer
  let tx = 0, ty = 0, cx = 0, cy = 0, praf = 0, run = false;
  const tilt = () => {
    praf = 0; cx += (tx - cx) * .08; cy += (ty - cy) * .08;
    grid.style.transform = `translate(-50%, -50%) rotateX(${(54 + cx).toFixed(2)}deg) rotateZ(${(-26 + cy).toFixed(2)}deg)`;
    if (run && Math.abs(tx - cx) + Math.abs(ty - cy) > .03) praf = requestAnimationFrame(tilt);
  };
  const follow = () => { if (!praf && run && !lite) praf = requestAnimationFrame(tilt); };
  hero.addEventListener('pointermove', ev => {
    const r = hero.getBoundingClientRect();
    tx = ((ev.clientY - r.top) / r.height - .5) * -10; ty = ((ev.clientX - r.left) / r.width - .5) * 12; follow();
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { tx = ty = 0; follow(); });
  new IntersectionObserver(([en]) => { run = en.isIntersecting; follow(); }).observe(wrap);

  // the spider (spider.js) picks the element to spotlight and names it on the ticker through this hook
  const setTicker = e => { if (ticker) ticker.innerHTML = `<b style="color:${PT.color(e)}">${e.s}</b> ${e.n} · Z ${e.z} · ${e.g}`; };
  window.PTHero = { wrap, hero, grid, cells, byZ, setTicker, onScreen: () => run };
})();
