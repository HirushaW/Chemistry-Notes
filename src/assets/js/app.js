// Chemistry Notes — global interactions: nav, ripples, tilt, reveal, tabs, PDF viewer, video embeds, search, filters.
(() => {
  const doc = document, root = doc.documentElement;
  const BASE = root.dataset.base || '/';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = doc) => el.querySelector(s);
  const $$ = (s, el = doc) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* nav */
  const menuBtn = $('.menu-btn');
  menuBtn?.addEventListener('click', () => { const open = doc.body.classList.toggle('nav-open'); menuBtn.setAttribute('aria-expanded', open); });
  $$('.nav a').forEach(a => a.addEventListener('click', () => doc.body.classList.remove('nav-open')));
  $$('.dd > .navbtn').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const dd = b.parentElement; const open = dd.classList.toggle('open'); b.setAttribute('aria-expanded', open); }));
  doc.addEventListener('click', e => { if (!e.target.closest('.dd')) $$('.dd.open').forEach(d => d.classList.remove('open')); });

  /* ripple */
  doc.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn'); if (!b || RM) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 1.2, sp = doc.createElement('span');
    sp.className = 'ripple'; sp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.appendChild(sp); setTimeout(() => sp.remove(), 650);
  });

  /* spotlight + tilt */
  const fine = matchMedia('(pointer: fine)').matches;
  doc.addEventListener('pointermove', e => {
    const c = e.target.closest?.('.card'); if (!c) return;
    const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
    if (fine && !RM && c.hasAttribute('data-tilt')) {
      const rx = ((y / r.height) - .5) * -7, ry = ((x / r.width) - .5) * 7;
      c.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    }
  }, { passive: true });
  doc.addEventListener('pointerout', e => { const c = e.target.closest?.('.card[data-tilt]'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });

  /* reveal on scroll */
  $$('[data-stagger]').forEach(p => [...p.children].forEach((ch, i) => { ch.classList.add('reveal'); ch.style.setProperty('--i', Math.min(i, 12)); }));
  if ('IntersectionObserver' in window && !RM) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.reveal').forEach(el => io.observe(el));
  } else $$('.reveal').forEach(el => el.classList.add('in'));

  /* counters */
  const counters = $$('[data-count]');
  if (counters.length) {
    const run = el => {
      const to = +el.dataset.count, t0 = performance.now(), d = RM ? 1 : 1400;
      const step = t => { const p = Math.min(1, (t - t0) / d), v = Math.round(to * (1 - Math.pow(1 - p, 3))); el.textContent = v.toLocaleString(); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } }));
    counters.forEach(c => io.observe(c));
  }

  /* tabs with sliding ink */
  $$('[role="tablist"]').forEach(list => {
    const tabs = $$('[role="tab"]', list), ink = doc.createElement('span');
    ink.className = 'tab-ink'; list.prepend(ink);
    const place = t => { ink.style.width = t.offsetWidth + 'px'; ink.style.transform = `translateX(${t.offsetLeft}px)`; };
    const select = (t, focus) => {
      tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; const p = doc.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on; });
      place(t); if (focus) t.focus();
      t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { select(t); history.replaceState(null, '', '#' + t.id.replace(/^tab-/, '')); });
      t.addEventListener('keydown', e => { const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); } });
    });
    const fromHash = tabs.find(t => '#' + t.id.replace(/^tab-/, '') === location.hash);
    select(fromHash || tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0]);
    addEventListener('resize', () => place(tabs.find(t => t.getAttribute('aria-selected') === 'true')));
    doc.fonts?.ready.then(() => place(tabs.find(t => t.getAttribute('aria-selected') === 'true')));
  });

  /* PDF viewer (Google Drive preview) */
  const viewer = $('#viewer');
  const openPdf = (id, title) => {
    if (!viewer) return window.open(`https://drive.google.com/file/d/${id}/view`, '_blank', 'noopener');
    $('.viewer-bar b', viewer).textContent = title || 'Document';
    $('[data-v="open"]', viewer).href = `https://drive.google.com/file/d/${id}/view`;
    $('[data-v="dl"]', viewer).href = `https://drive.google.com/uc?export=download&id=${id}`;
    const body = $('.viewer-body', viewer);
    body.innerHTML = '<div class="loader"><span class="ring"></span><span>Loading from Google Drive…</span></div>';
    const fr = doc.createElement('iframe');
    fr.src = `https://drive.google.com/file/d/${id}/preview`; fr.allow = 'autoplay'; fr.title = title || 'PDF preview';
    fr.addEventListener('load', () => $('.loader', body)?.remove());
    body.appendChild(fr);
    viewer.showModal();
  };
  window.openPdf = openPdf;
  doc.addEventListener('click', e => {
    const b = e.target.closest('[data-pdf]'); if (!b) return;
    e.preventDefault(); openPdf(b.dataset.pdf, b.dataset.title || b.textContent.trim());
  });
  viewer?.addEventListener('close', () => { $('.viewer-body', viewer).innerHTML = ''; });
  viewer?.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
  $$('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
  const openParam = new URLSearchParams(location.search).get('open');
  if (openParam) { const t = $(`[data-pdf="${CSS.escape(openParam)}"]`); setTimeout(() => { t?.scrollIntoView({ block: 'center' }); openPdf(openParam, t?.dataset.title); }, 350); }

  /* lightweight YouTube embeds */
  doc.addEventListener('click', e => {
    const t = e.target.closest('.thumb[data-yt]'); if (!t) return;
    const fr = doc.createElement('iframe');
    fr.src = `https://www.youtube-nocookie.com/embed/${t.dataset.yt}?autoplay=1&rel=0`;
    fr.title = t.dataset.title || 'Video'; fr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'; fr.allowFullscreen = true;
    t.replaceWith(fr);
  });

  /* generic filtering: [data-filter-root] with [data-q], [data-tagsel] selects, and [data-item] children */
  $$('[data-filter-root]').forEach(rootEl => {
    const items = $$('[data-item]', rootEl), groups = $$('[data-group]', rootEl);
    const q = $('[data-q]', rootEl), sels = $$('[data-tagsel]', rootEl), toggles = $$('[data-toggle]', rootEl), out = $('[data-count-out]', rootEl);
    const apply = () => {
      const terms = (q?.value || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').split(/\s+/).filter(Boolean);
      const need = sels.map(s => s.value).filter(Boolean).concat(toggles.filter(t => t.getAttribute('aria-pressed') === 'true').map(t => t.dataset.toggle));
      let n = 0;
      items.forEach(it => {
        const hay = it.dataset.search || '', tags = (it.dataset.tags || '').split(' ');
        const ok = terms.every(t => hay.includes(t)) && need.every(t => tags.includes(t));
        it.hidden = !ok; if (ok) n++;
      });
      groups.forEach(g => { g.hidden = !$$('[data-item]', g).some(i => !i.hidden); });
      if (out) out.textContent = n.toLocaleString();
    };
    q?.addEventListener('input', apply); sels.forEach(s => s.addEventListener('change', apply));
    toggles.forEach(t => t.addEventListener('click', () => { t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') !== 'true'); apply(); }));
    const init = new URLSearchParams(location.search).get('q'); if (init && q) q.value = init;
    apply();
  });

  /* search palette */
  const pal = $('#palette');
  let index = null, results = [], active = 0;
  const KIND = { course: ['Courses', 'layers'], section: ['Sections', 'target'], note: ['Notes and tutorials', 'file'], paper: ['Past papers', 'papers'], element: ['Elements', 'atom'], book: ['Library', 'book'], link: ['Websites', 'ext'], page: ['Pages', 'spark'] };
  const icon = n => (doc.getElementById('i-' + n)?.innerHTML || '');
  const norm = s => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
  const load = async () => { if (index) return index; const r = await fetch(BASE + 'search-index.json'); index = (await r.json()).map(x => ({ ...x, _t: norm(x.t), _s: norm(x.s || '') })); return index; };
  const W = { page: 5, course: 4, section: 3.5, element: 3, book: 2, link: 2, note: 1.5, paper: 1.2 };
  const render = qv => {
    const box = $('.palette-results', pal), terms = norm(qv).split(/\s+/).filter(Boolean);
    if (!terms.length) { results = index.filter(x => x.k === 'page'); }
    else {
      results = index.map(x => {
        let s = 0;
        for (const t of terms) { if (x._t.startsWith(t)) s += 4; else if (x._t.includes(' ' + t)) s += 3; else if (x._t.includes(t)) s += 2; else if (x._s.includes(t)) s += 1; else return null; }
        return [s + (W[x.k] || 1) * .5, x];
      }).filter(Boolean).sort((a, b) => b[0] - a[0]).slice(0, 40).map(a => a[1]);
    }
    active = 0;
    if (!results.length) { box.innerHTML = `<div class="palette-empty">No matches for “${esc(qv)}”. Try a course code like <b>CHE3112</b> or a topic like <b>voltammetry</b>.</div>`; return; }
    const order = ['page', 'course', 'section', 'element', 'note', 'paper', 'book', 'link'];
    const grouped = order.map(k => [k, results.filter(r => r.k === k)]).filter(g => g[1].length);
    results = grouped.flatMap(g => g[1]);
    const hl = s => { let h = esc(s); for (const t of terms) h = h.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); return h; };
    let i = 0;
    box.innerHTML = grouped.map(([k, list]) => `<div class="palette-group">${KIND[k][0]}</div>` + list.map(r => `<a class="palette-item${i === 0 ? ' active' : ''}" data-i="${i++}" href="${esc(r.u.startsWith('http') ? r.u : BASE + r.u)}"${r.u.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}><span class="pi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon(KIND[k][1])}</svg></span><span><b>${hl(r.t)}</b>${r.s ? `<small>${hl(r.s)}</small>` : ''}</span></a>`).join('')).join('');
  };
  const setActive = n => { const items = $$('.palette-item', pal); if (!items.length) return; active = (n + items.length) % items.length; items.forEach((it, j) => it.classList.toggle('active', j === active)); items[active].scrollIntoView({ block: 'nearest' }); };
  const openPal = async () => {
    if (!pal) return; pal.showModal(); const inp = $('input', pal); inp.value = ''; inp.focus();
    $('.palette-results', pal).innerHTML = '<div class="palette-empty">Loading index…</div>';
    await load(); render('');
  };
  $$('.search-btn').forEach(b => b.addEventListener('click', () => { doc.body.classList.remove('nav-open'); openPal(); }));
  doc.addEventListener('keydown', e => {
    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !/input|textarea|select/i.test(doc.activeElement.tagName))) { e.preventDefault(); pal?.open ? pal.close() : openPal(); }
  });
  pal?.addEventListener('click', e => { if (e.target === pal) pal.close(); });
  $('input', pal || doc.createElement('div'))?.addEventListener('input', e => index && render(e.target.value));
  pal?.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter') { const a = $$('.palette-item', pal)[active]; if (a) { e.preventDefault(); a.click(); pal.close(); } }
  });
})();
