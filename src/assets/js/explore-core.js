// Shared data and panel templates for the Chemistry Map views (3D atom and bubbles).
window.Explore = (() => {
  const src = document.getElementById('map-data');
  const D = window.MAP_DATA || (src && JSON.parse(src.textContent)); if (!D) return null;
  const BASE = document.documentElement.dataset.base || '/';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${document.getElementById('i-' + n)?.innerHTML || ''}</svg>`;
  const streams = new Map(D.streams.map(s => [s.id, s]));
  const courses = new Map(D.courses.map(c => [c.id, c]));
  const sections = new Map(D.sections.map(s => [s.id, s]));
  const colorOf = c => streams.get(c.stream).color;
  const lvl = n => `${n} Level`;

  // course-level connections: prerequisites plus topic links between sections of different courses
  const conn = new Map(D.courses.map(c => [c.id, { from: new Map(), to: new Map() }]));
  const link = (a, b, idea) => {
    if (a === b || !conn.has(a) || !conn.has(b)) return;
    const t = conn.get(a).to, f = conn.get(b).from;
    (t.get(b) || t.set(b, new Set()).get(b)).add(idea); (f.get(a) || f.set(a, new Set()).get(a)).add(idea);
  };
  for (const c of D.courses) for (const p of c.pre) link(p, c.id, 'prerequisite');
  for (const [s, t, idea] of D.links) link(s.split('/')[0], t.split('/')[0], idea);

  // short labels for small spaces; panels keep full titles
  const short = t => {
    let s = t.replace(/^General Aspects and Recent Developments in Chemistry$/, 'Recent Developments').replace(/^Applications of Nanoscience in Chemistry$/, 'Nanoscience Applications')
      .replace(/^Techniques in Organic Chemistry/, 'Organic Techniques').replace(/ in Chemistry$/, '').replace(/Chemistry Laboratory/, 'Chem Lab').replace(/Laboratory/, 'Lab').replace(/^Principles of Chemistry/, 'Principles of Chem');
    if (s.length > 22) s = s.replace(/^Advanced /, 'Adv. ').replace(/ Chemistry\b/, ' Chem');
    return s;
  };

  const courseBtn = (cid, sub, sid) => {
    const c = courses.get(cid); if (!c) return '';
    return `<button data-course="${cid}${sid ? '|' + sid : ''}" style="--c:${colorOf(c)}"><span class="dot"></span><span>${sid ? esc(sections.get(sid).name) : `${cid} · ${esc(c.title)}`}</span>${sub ? `<small>${esc(sub)}</small>` : ''}</button>`;
  };

  function coursePanel(c) {
    const s = streams.get(c.stream), { from, to } = conn.get(c.id), papers = c.paperList || [], vids = c.videos || [];
    return `<span class="eyebrow" style="color:${s.color}">${lvl(c.level)} · ${esc(s.name)}</span><h2>${esc(c.title)}</h2>
      <div class="chips" style="margin-bottom:14px"><span class="badge badge-volt">${c.id}</span>${c.credits ? `<span class="badge">${c.credits} credits</span>` : ''}${c.sem ? `<span class="badge">Semester ${esc(c.sem)}</span>` : ''}</div>
      <p style="color:var(--white);font-weight:600">${esc(c.tagline)}</p><p class="muted">${esc(c.about)}</p>
      <div class="counter-row"><div class="counter"><b>${c.counts.notes}</b><span>files</span></div><div class="counter"><b>${c.counts.papers}</b><span>papers</span></div><div class="counter"><b>${c.sections.length}</b><span>sections</span></div></div>
      <div class="p-sec"><h4>Sections</h4><div class="mini">${c.sections.map(sid => { const x = sections.get(sid), n = x.counts.notes + x.counts.tut + x.counts.ans; return `<button data-sec="${sid}" style="--c:${s.color}"><span class="dot"></span><span>${esc(x.name)}</span><small>${n ? n + ' files' : 'chapters'}</small></button>`; }).join('')}</div></div>
      ${papers.length ? `<div class="p-sec"><h4>Past papers · ${c.counts.papers}</h4><div class="mini">${papers.slice(0, 6).map(([fid, label, ans]) => `<button data-pdf="${fid}" data-title="${esc(c.id + ' · ' + label)}" style="--c:var(--amber)">${icon('papers')}<span>${esc(label)}</span><small>${ans ? 'with answers' : 'preview'}</small></button>`).join('')}${c.counts.papers > 6 ? `<a href="${BASE}${c.url}#papers" style="--c:var(--amber)">${icon('arrow')}<span>All ${c.counts.papers} papers</span></a>` : ''}</div></div>` : ''}
      <div class="p-sec"><h4>Watch</h4><div class="mini">${vids.map(([vid, t, ch]) => `<a href="https://www.youtube.com/watch?v=${vid}" target="_blank" rel="noopener" style="--c:var(--pink)">${icon('video')}<span>${esc(t)}</span><small>${esc(ch)}</small></a>`).join('')}<a href="https://www.youtube.com/results?search_query=${encodeURIComponent(c.title + ' chemistry lecture')}" target="_blank" rel="noopener" style="--c:var(--pink)">${icon('search')}<span>More on YouTube: ${esc(c.title)}</span></a></div></div>
      ${from.size ? `<div class="p-sec"><h4>Builds on</h4><div class="mini">${[...from].map(([k, ideas]) => courseBtn(k, [...ideas].join(', '))).join('')}</div></div>` : ''}
      ${to.size ? `<div class="p-sec"><h4>Leads to</h4><div class="mini">${[...to].map(([k, ideas]) => courseBtn(k, [...ideas].join(', '))).join('')}</div></div>` : ''}
      <div class="p-sec" style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary btn-sm" href="${BASE}${c.url}">Open course ${icon('arrow')}</a>${c.counts.papers ? `<a class="btn btn-ghost btn-sm" href="${BASE}${c.url}#papers">${icon('papers')} Past papers</a>` : ''}</div>`;
  }

  function sectionPanel(sec, backLabel = true) {
    const c = courses.get(sec.code), s = streams.get(c.stream);
    const from = D.links.filter(l => l[1] === sec.id), to = D.links.filter(l => l[0] === sec.id);
    const files = sec.counts.notes + sec.counts.tut + sec.counts.ans;
    const yt = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(sec.name + ' chemistry lecture');
    return `${backLabel ? `<button class="chip" data-back style="margin-bottom:14px">← ${c.id} overview</button>` : ''}
      <span class="eyebrow" style="color:${s.color};display:flex">${c.id}${sec.hours ? ' · ' + esc(sec.hours) : ''}</span><h2>${esc(sec.name)}</h2>
      <p style="color:var(--white);font-weight:600">${esc(sec.summary)}</p>
      <div class="chips">${sec.topics.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
      ${from.length ? `<div class="p-sec"><h4>Builds on</h4><div class="mini">${from.map(l => courseBtn(l[0].split('/')[0], l[2], l[0])).join('')}</div></div>` : ''}
      ${to.length ? `<div class="p-sec"><h4>Leads to</h4><div class="mini">${to.map(l => courseBtn(l[1].split('/')[0], l[2], l[1])).join('')}</div></div>` : ''}
      <div class="p-sec"><h4>Notes${files ? ` · ${files} files` : ''}</h4>${sec.notes.length ? `<div class="mini">${sec.notes.map(([fid, t]) => `<button data-pdf="${fid}" data-title="${esc(c.id + ' · ' + t)}" style="--c:${s.color}">${icon('file')}<span>${esc(t)}</span><small>preview</small></button>`).join('')}</div>` : '<p class="faint" style="font-size:.85rem">No notes in the folder for this section yet. The textbook chapters below cover it.</p>'}</div>
      ${sec.refs.length ? `<div class="p-sec"><h4>Textbook chapters</h4><div class="mini">${sec.refs.map(r => `<a href="${esc(r[2] || '#')}" target="_blank" rel="noopener" style="--c:var(--volt)">${icon('book')}<span><b style="color:var(--white)">${esc(r[0])}</b> — ${esc(r[1])}</span></a>`).join('')}</div></div>` : ''}
      <div class="p-sec"><h4>Videos</h4><div class="mini">${(sec.videos || []).map(([vid, t, ch]) => `<a href="https://www.youtube.com/watch?v=${vid}" target="_blank" rel="noopener" style="--c:var(--pink)">${icon('video')}<span>${esc(t)}</span><small>${esc(ch)}</small></a>`).join('')}<a href="${yt}" target="_blank" rel="noopener" style="--c:var(--pink)">${icon('search')}<span>More on YouTube: ${esc(sec.name)}</span></a></div></div>
      <div class="p-sec" style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary btn-sm" href="${BASE}${sec.url}">Open section ${icon('arrow')}</a>${c.counts.papers ? `<a class="btn btn-ghost btn-sm" href="${BASE}${c.url}#papers">${icon('papers')} ${c.id} papers</a>` : ''}</div>`;
  }

  return { D, BASE, esc, icon, streams, courses, sections, conn, colorOf, short, lvl, coursePanel, sectionPanel };
})();
