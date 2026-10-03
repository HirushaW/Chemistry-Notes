// Interactive periodic table: categories, property heat maps and a detail card (PubChem data).
(() => {
  const host = document.querySelector('.ptable'); if (!host) return;
  const data = JSON.parse(document.getElementById('elements-data').textContent);
  const card = document.querySelector('.el-card'), sel = document.querySelector('[data-prop]');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cells = new Map(), waveItems = [];
  const frag = document.createDocumentFragment();
  for (const e of data) {
    const [row, col] = PT.pos(e.z), b = document.createElement('button');
    waveItems.push({ el: b, col, row: row > 8 ? row - 1.6 : row });
    b.className = 'cell'; b.type = 'button'; b.style.gridRow = row; b.style.gridColumn = col;
    b.style.setProperty('--c', PT.color(e));
    b.innerHTML = `<span class="z">${e.z}</span><span class="sym">${e.s}</span><span class="nm">${e.n}</span>`;
    b.setAttribute('aria-label', `${e.n}, ${e.z}`); b.dataset.z = e.z;
    frag.appendChild(b); cells.set(e.z, b);
  }
  const sp = document.createElement('div'); sp.className = 'spacer'; sp.style.gridRow = 8; frag.appendChild(sp);
  for (const [row, t] of [[6, '57–71'], [7, '89–103']]) { const m = document.createElement('div'); m.className = 'fmark'; m.style.gridRow = row; m.style.gridColumn = 3; m.textContent = t; frag.appendChild(m); }
  host.appendChild(frag);
  // a gentle wave rolls across the table whenever the visitor pauses
  PT.wave(waveItems, { root: host.closest('.pt-layout') || host, idleMs: 2600, active: 0, speed: .85 });

  const fmt = (v, unit) => v === '' || v == null ? '—' : `${v}${unit ? ' ' + unit : ''}`;
  const show = z => {
    const e = data[z - 1], c = PT.color(e);
    cells.forEach(x => x.classList.remove('sel')); cells.get(z).classList.add('sel');
    card.style.setProperty('--c', c);
    const k = (K) => K;
    card.innerHTML = `<div class="big"><div class="sq"><i>${e.z}</i>${e.s}</div><div><h2>${esc(e.n)}</h2><span class="badge" style="color:${c};border-color:${c}55">${esc(e.g)}</span></div></div>
      <dl class="kv">
        <dt>Atomic mass</dt><dd>${fmt(e.m, 'u')}</dd>
        <dt>Configuration</dt><dd class="mono">${esc(e.cfg).replace(/([spdf])(\d+)/g, '$1<sup>$2</sup>')}</dd>
        <dt>Electronegativity</dt><dd>${fmt(e.en)} (Pauling)</dd>
        <dt>Atomic radius</dt><dd>${fmt(e.r, 'pm')}</dd>
        <dt>Ionisation energy</dt><dd>${fmt(e.ie, 'eV')}</dd>
        <dt>Electron affinity</dt><dd>${fmt(e.ea, 'eV')}</dd>
        <dt>Oxidation states</dt><dd>${fmt(e.ox)}</dd>
        <dt>Standard state</dt><dd>${fmt(e.st)}</dd>
        <dt>Melting point</dt><dd>${fmt(e.mp, 'K')}</dd>
        <dt>Boiling point</dt><dd>${fmt(e.bp, 'K')}</dd>
        <dt>Density</dt><dd>${fmt(e.d, 'g/cm³')}</dd>
        <dt>Discovered</dt><dd>${fmt(e.y)}</dd>
      </dl>
      <div class="chips" style="margin-top:16px"><a class="chip" href="https://pubchem.ncbi.nlm.nih.gov/element/${e.z}" target="_blank" rel="noopener">PubChem ↗</a><a class="chip" href="https://www.rsc.org/periodic-table/element/${e.z}/${e.n.toLowerCase()}" target="_blank" rel="noopener">RSC ↗</a></div>`;
    history.replaceState(null, '', '#' + e.s);
  };
  host.addEventListener('click', ev => { const b = ev.target.closest('.cell'); if (b) show(+b.dataset.z); });

  // category filter
  const offCat = new Set();
  document.querySelectorAll('[data-cat]').forEach(chip => chip.addEventListener('click', () => {
    const c = chip.dataset.cat, on = chip.getAttribute('aria-pressed') === 'true';
    chip.setAttribute('aria-pressed', on ? 'false' : 'true'); on ? offCat.add(c) : offCat.delete(c);
    for (const e of data) cells.get(e.z).classList.toggle('dim', offCat.has(e.g));
  }));

  // property heat map
  const lerp = (a, b, t) => a + (b - a) * t;
  const ramp = t => { // violet -> cyan -> volt
    const stops = [[134, 61, 255], [94, 231, 255], [203, 255, 46]], i = t < .5 ? 0 : 1, u = t < .5 ? t * 2 : (t - .5) * 2;
    return `rgb(${stops[i].map((v, k) => Math.round(lerp(v, stops[i + 1][k], u))).join(',')})`;
  };
  sel?.addEventListener('change', () => {
    const p = sel.value;
    if (!p) { for (const e of data) { const b = cells.get(e.z); b.style.setProperty('--c', PT.color(e)); b.style.removeProperty('--fill'); } return; }
    const vals = data.map(e => parseFloat(e[p])).filter(v => !isNaN(v)), lo = Math.min(...vals), hi = Math.max(...vals);
    const log = p === 'd' || p === 'mp' || p === 'bp';
    const T = v => log ? (Math.log(v - lo + 1) / Math.log(hi - lo + 1)) : (v - lo) / (hi - lo || 1);
    for (const e of data) {
      const b = cells.get(e.z), v = parseFloat(e[p]);
      if (isNaN(v)) { b.style.setProperty('--c', '#3a4080'); b.style.setProperty('--fill', '6%'); continue; }
      const t = T(v); b.style.setProperty('--c', ramp(t)); b.style.setProperty('--fill', Math.round(14 + t * 46) + '%');
    }
  });

  const start = location.hash.slice(1), hit = data.find(e => e.s === start);
  show(hit ? hit.z : 6);
})();
