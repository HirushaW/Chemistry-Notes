// Home hero: a glowing spider hangs on a silk thread from the top of the hero, a clear gap above the periodic table.
// Every few seconds it swings over an element, shoots a strand of web at it, reels the element up to show it,
// then lowers it back into its place. It waits while the visitor is using the table and pauses off-screen.
// There is no spider under reduced motion (hero.js stops before publishing PTHero).
(() => {
  const H = window.PTHero;
  if (!H || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const { wrap, hero, grid, cells, byZ, setTicker } = H;
  const base = document.documentElement.dataset.base || '/';
  const NS = 'http://www.w3.org/2000/svg';
  const { sin, cos, atan2, sqrt, exp, min, max, PI } = Math;
  const clamp = (v, a, b) => max(a, min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - (1 - t) ** 3, easeIn = t => t * t * t;
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  const f1 = v => v.toFixed(1);

  // elements that matter in the courses, drawn at random; each has a turn before any comes round again
  const POOL = [6, 1, 8, 7, 26, 29, 78, 79, 46, 92, 15, 16, 11, 17, 22, 45, 44, 30, 64, 57, 14, 5];
  let bag = [], lastZ = 0;
  function draw() {
    if (!bag.length) {
      bag = POOL.slice();
      for (let i = bag.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [bag[i], bag[j]] = [bag[j], bag[i]]; }
      if (bag[bag.length - 1] === lastZ) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    return (lastZ = bag.pop());
  }

  /* ---------- the spider, its thread and its web (one SVG over the table) ---------- */
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'spider'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<defs>
    <radialGradient id="sp-abd" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#f6ffd8"/><stop offset=".42" stop-color="#cbff2e"/><stop offset="1" stop-color="#3d6600"/></radialGradient>
    <radialGradient id="sp-head" cx="40%" cy="36%" r="70%"><stop offset="0" stop-color="#eaffb3"/><stop offset=".5" stop-color="#a8e81c"/><stop offset="1" stop-color="#2d4f00"/></radialGradient>
    <filter id="sp-glow" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="sp-silk" filterUnits="userSpaceOnUse" x="-4000" y="-4000" width="8000" height="8000"><feGaussianBlur stdDeviation="1.1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <line class="sp-thread" filter="url(#sp-silk)"/>
  <path class="sp-strand" filter="url(#sp-silk)"/>
  <g class="sp-splat">${Array.from({ length: 8 }, (_, i) => { const a = i * PI / 4 + .2; return `<line x1="${f1(cos(a) * 3)}" y1="${f1(sin(a) * 3)}" x2="${f1(cos(a) * 11)}" y2="${f1(sin(a) * 11)}"/>`; }).join('')}<circle r="6.5"/></g>
  <g class="sp-bug" filter="url(#sp-glow)">
    <g class="sp-legs">${'<path/>'.repeat(8)}</g>
    <ellipse cx="0" cy="-9.2" rx="7.2" ry="9.4" fill="url(#sp-abd)"/>
    <path class="sp-mark" d="M-2.6-14.4H2.6L.8-9.8 2.6-5.2H-2.6L-.8-9.8z"/>
    <ellipse cx="0" cy="4.2" rx="5.2" ry="5" fill="url(#sp-head)"/>
    <circle class="sp-eye" cx="-1.9" cy="7.5" r="1.15"/><circle class="sp-eye" cx="1.9" cy="7.5" r="1.15"/>
    <circle class="sp-eye sm" cx="-3.3" cy="6" r=".7"/><circle class="sp-eye sm" cx="3.3" cy="6" r=".7"/>
  </g>`;
  const thread = svg.querySelector('.sp-thread'), strand = svg.querySelector('.sp-strand'), splat = svg.querySelector('.sp-splat');
  const bug = svg.querySelector('.sp-bug'), legs = [...svg.querySelectorAll('.sp-legs path')];

  // the element it lifts, shown as a card hanging under the spider (a link to that element's page)
  const card = document.createElement('a');
  card.className = 'sp-card'; card.tabIndex = -1; card.hidden = true; card.setAttribute('aria-hidden', 'true');
  wrap.append(svg, card);

  /* ---------- state ---------- */
  // ax: where the thread is fixed along the top; sx, sy: the spider; L: thread length.
  // k scales everything to the width of the table; the spider is drawn BIG times larger than its local units.
  const CW = 78, CH = 92, SHOOT = .4, REEL = 1.05, DROP = .62, HOLD = 3, BIG = 1.3;
  let W = 0, k = 1, top = 0, rest = 0, ready = false;
  let ax = 0, axT = 0, sx = 0, vx = 0, sy = 0, L = 2, LT = 0, vL = 0, phi = 0, aimW = 0;
  let mode = 'enter', tm = 0, t = 0, busyUntil = 0;
  let el = null, elem = null, tile = null;                 // the target tile, its element data, its centre this frame
  let cx = 0, cy = 0, cs = 1, crot = 0, from = null, snapFrom = null, splatAt = null, splatT = 9;

  const local = r => { const w = wrap.getBoundingClientRect(); return { x: r.left - w.left + r.width / 2, y: r.top - w.top + r.height / 2, w: r.width }; };
  function measure() {
    const w = wrap.getBoundingClientRect(), h = hero.getBoundingClientRect(), g = grid.getBoundingClientRect();
    W = w.width; k = clamp(W / 560, .62, 1);
    top = h.top - w.top + 2;                                // the thread hangs from the top of the hero
    rest = max(top + 52 * k, g.top - w.top - 70 * k);       // and the spider waits a clear gap above the table
    LT = rest - top - (mode === 'reel' ? 9 * k : 0);         // it hitches up a little while it reels
    if (el) tile = local(el.getBoundingClientRect());
  }
  // the head (where the web leaves) and the end of the abdomen (where the thread holds), in wrap pixels
  const at = (lx, ly) => { const m = k * BIG; return [sx + m * (lx * cos(phi) - ly * sin(phi)), sy + m * (lx * sin(phi) + ly * cos(phi))]; };
  const head = () => at(0, 9.6);
  const hang = () => { const [hx, hy] = head(); return [hx, hy + 12 * k + CH * k / 2]; };

  function go(m) {
    mode = m; tm = 0;
    if (m === 'swing') {
      el = cells[draw() - 1]; elem = byZ(+el.dataset.z); tile = local(el.getBoundingClientRect());
      axT = clamp(lerp(sx, tile.x, .8), 46 * k, W - 46 * k);   // swing over the element, not always straight above it
    } else if (m === 'grab') {
      el.classList.add('hot'); splatAt = [tile.x, tile.y]; splatT = 0;
    } else if (m === 'reel') {
      el.classList.remove('hot'); el.classList.add('taken');
      from = { ...tile, s: tile.w / (CW * k) }; cx = tile.x; cy = tile.y; cs = from.s; crot = 0;
      card.href = `${base}periodic-table/#${elem.s}`;
      card.style.setProperty('--c', PT.color(elem));
      card.innerHTML = `<i>${elem.z}</i><b>${elem.s}</b><span>${elem.n}</span>`;
      card.hidden = false;
    } else if (m === 'hold') {
      setTicker(elem); card.classList.add('up');
    } else if (m === 'drop') {
      from = { x: cx, y: cy, s: cs, r: crot }; card.classList.remove('up');
    } else if (m === 'snap') {
      snapFrom = [cx, cy - CH * k * cs / 2];
      card.hidden = true; el.classList.remove('taken'); el.classList.add('hot');
      const done = el; setTimeout(() => done.classList.remove('hot'), 650);
    } else if (m === 'idle') { el = null; tile = null; }
  }

  function step(dt) {
    t += dt; tm += dt; splatT += dt;
    // the fixing point glides along the top, the spider swings under it on a damped spring,
    // and the thread pays out on a stiffer spring, so the spider bobs a little as it lands
    ax += (axT - ax) * (1 - exp(-dt * 2.4));
    vx += ((ax - sx) * 15 - vx * 3.2) * dt; sx += vx * dt;
    vL += ((LT - L) * 32 - vL * 6) * dt; L = max(2, L + vL * dt);
    const dx = clamp(sx - ax, -L * .85, L * .85); sx = ax + dx;
    sy = top + sqrt(L * L - dx * dx);
    // hanging, the body lines up with the thread; aiming, the head turns towards the element
    const aiming = mode === 'aim' || mode === 'shoot' || mode === 'grab' || mode === 'reel';
    aimW += ((aiming ? 1 : 0) - aimW) * (1 - exp(-dt * 7));
    const along = atan2(-(sx - ax), sy - top);
    const goal = tile && aiming ? clamp(atan2(-(tile.x - sx), tile.y - sy), -.95, .95) : along;
    phi = lerp(along, goal, aimW);

    switch (mode) {
      case 'enter': if (tm > 1.6) go('idle'); break;
      case 'idle': if (tm > 1 && t > busyUntil) go('swing'); break;
      case 'swing': if (tm > 1.55) go('aim'); break;
      case 'aim': if (tm > .45) go('shoot'); break;
      case 'shoot': if (tm >= SHOOT) go('grab'); break;
      case 'grab': if (tm > .3) go('reel'); break;
      case 'reel': {
        const q = easeInOut(min(1, tm / REEL)), [hx, hy] = hang();
        cx = lerp(from.x, hx, q); cy = lerp(from.y, hy, q); cs = lerp(from.s, 1, q);
        if (tm >= REEL) go('hold');
        break;
      }
      case 'hold': {
        // the card swings under the spider; it stays while the pointer is on it
        const [hx, hy] = hang(), e = 1 - exp(-dt * 6);
        cx += (hx - cx) * e; cy += (hy - cy) * e;
        crot = clamp((cx - hx) * .9, -14, 14);
        if (tm > HOLD && !card.matches(':hover')) go('drop');
        break;
      }
      case 'drop': {
        const d = easeIn(min(1, tm / DROP));
        cx = lerp(from.x, tile.x, d); cy = lerp(from.y, tile.y, d); cs = lerp(from.s, tile.w / (CW * k), d); crot = lerp(from.r, 0, d);
        if (tm >= DROP) go('snap');
        break;
      }
      case 'snap': if (tm > .32) go('idle'); break;
    }
  }

  // four legs a side, hips along the head: [hip y, sweep in degrees] from the front pair (reaching down) to the back pair
  const LEG = [[6.8, 58], [5, 22], [3.2, -16], [1.5, -52]];
  function render() {
    bug.setAttribute('transform', `translate(${f1(sx)} ${f1(sy)}) rotate(${(phi * 180 / PI).toFixed(2)}) scale(${(k * BIG).toFixed(3)})`);
    const [tx, ty] = at(0, -18.6);
    thread.setAttribute('x1', f1(ax)); thread.setAttribute('y1', f1(top)); thread.setAttribute('x2', f1(tx)); thread.setAttribute('y2', f1(ty));

    // legs twitch at rest, reach while it aims and work quickly while it reels
    const busy = mode === 'reel' ? 1 : mode === 'aim' || mode === 'shoot' ? .7 : 0, amp = 5 + 9 * busy, w = 5 + 7 * busy;
    legs.forEach((p, n) => {
      const s = n < 4 ? 1 : -1, i = n % 4, [hy, sweep] = LEG[i];
      const a = (sweep + sin(t * w + i * 1.7 + (s > 0 ? 0 : 2.1)) * amp - (i < 2 ? 14 * busy : 0)) * PI / 180;
      const a1 = a * .55, a2 = a * 1.22 + (i < 2 ? .18 : -.18);
      const hx = 4.3 * s, kx = hx + 8.2 * cos(a1) * s, ky = hy + 8.2 * sin(a1), fx = kx + 10.5 * cos(a2) * s, fy = ky + 10.5 * sin(a2);
      p.setAttribute('d', `M${f1(hx)} ${hy}L${f1(kx)} ${f1(ky)}L${f1(fx)} ${f1(fy)}`);
    });

    // the strand: shot out with a sag that pulls taut, held tight while reeling, then let go and drawn back in
    const [hx, hy] = head();
    let end = null, sag = 0, op = 1;
    if (mode === 'shoot') { const p = easeOut(min(1, tm / SHOOT)); end = [lerp(hx, tile.x, p), lerp(hy, tile.y, p)]; sag = 18 * k * (1 - p); }
    else if (mode === 'grab') end = [tile.x, tile.y + sin(tm * 60) * .8];
    else if (mode === 'reel' || mode === 'hold' || mode === 'drop') end = [cx, cy - CH * k * cs / 2];
    else if (mode === 'snap') { const p = easeOut(min(1, tm / .32)); end = [lerp(snapFrom[0], hx, p), lerp(snapFrom[1], hy, p)]; op = 1 - p; }
    if (end) {
      const mx = (hx + end[0]) / 2, my = (hy + end[1]) / 2 + sag;
      strand.setAttribute('d', `M${f1(hx)} ${f1(hy)}Q${f1(mx)} ${f1(my)} ${f1(end[0])} ${f1(end[1])}`);
      strand.style.opacity = op.toFixed(2);
    } else strand.removeAttribute('d');

    // a burst of silk where the strand sticks
    if (splatT < .55 && splatAt) {
      const p = splatT / .55;
      splat.setAttribute('transform', `translate(${f1(splatAt[0])} ${f1(splatAt[1])}) scale(${(k * (.5 + .7 * easeOut(p))).toFixed(3)})`);
      splat.style.opacity = (1 - p).toFixed(2);
    } else splat.style.opacity = 0;

    if (!card.hidden) {
      card.style.setProperty('--k', k.toFixed(3));
      card.style.transform = `translate(${f1(cx - CW * k / 2)}px,${f1(cy - CH * k / 2)}px) scale(${cs.toFixed(3)}) rotate(${crot.toFixed(2)}deg)`;
    }
  }

  /* ---------- loop: runs only while the table is on screen and the tab is visible ---------- */
  let raf = 0, last = 0, onScreen = false;
  function frame(now) {
    raf = 0;
    const dt = last ? min(.05, (now - last) / 1000) : 0; last = now;
    measure();
    if (!ready) { ready = true; ax = axT = sx = W * .62; L = 2; svg.classList.add('on'); } // drop in from the top on first sight
    step(dt); render();
    if (onScreen && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const wake = () => { if (!raf && onScreen && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; wake(); }, { rootMargin: '60px' }).observe(wrap);
  document.addEventListener('visibilitychange', wake);
  // while the visitor uses the table the spider just hangs there and waits
  const wait = s => () => { busyUntil = max(busyUntil, t + s); };
  wrap.addEventListener('pointermove', wait(2.2), { passive: true });
  wrap.addEventListener('pointerdown', wait(3), { passive: true });
})();
