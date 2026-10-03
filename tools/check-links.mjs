// Checks every external URL used by the site. `node tools/check-links.mjs`
import fs from 'node:fs';
import { EXT, GROUPS } from '../src/data/resources.mjs';

const root = new URL('../src/data/', import.meta.url);
const courses = JSON.parse(fs.readFileSync(new URL('courses.json', root), 'utf8'));
const books = JSON.parse(fs.readFileSync(new URL('books.json', root), 'utf8'));
const urls = new Map();
const add = (u, where) => { if (u && /^https?:/.test(u)) (urls.get(u) || urls.set(u, []).get(u)).push(where); };
for (const [k, [, u]] of Object.entries(EXT)) add(u, 'EXT ' + k);
for (const g of GROUPS) for (const it of g.items) if (Array.isArray(it)) add(it[1], 'GROUP ' + g.id);
for (const b of books) add(b.url, 'BOOK ' + b.short);
for (const c of courses) for (const s of c.sections) for (const r of s.refs) add(r.url, `REF ${c.code} ${s.name}`);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
async function check(u) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(u, { method, redirect: 'follow', headers: { 'User-Agent': UA, Accept: 'text/html,*/*' }, signal: AbortSignal.timeout(20000) });
      if (r.ok) return [r.status, 'ok'];
      if (method === 'GET') return [r.status, r.status === 403 || r.status === 429 ? 'blocked-bot' : 'BROKEN'];
    } catch (e) { if (method === 'GET') return [0, 'ERROR ' + (e.cause?.code || e.name)]; }
  }
}
const list = [...urls.keys()], out = [];
let i = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (i < list.length) { const u = list[i++]; const [st, verdict] = await check(u); out.push({ u, st, verdict, where: urls.get(u) }); }
}));
const bad = out.filter(x => x.verdict !== 'ok');
console.log(`checked ${out.length} urls: ${out.length - bad.length} ok, ${bad.length} need a look`);
for (const b of bad.sort((a, b) => a.verdict.localeCompare(b.verdict))) console.log(`${b.verdict} ${b.st} ${b.u}  <- ${b.where.slice(0, 2).join('; ')}${b.where.length > 2 ? ` (+${b.where.length - 2})` : ''}`);
