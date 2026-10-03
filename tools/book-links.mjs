// Points book links at Google Books ISBN pages (Open Library is often unreachable).
import fs from 'node:fs';
for (const f of ['src/data/courses.json', 'src/data/books.json']) {
  const p = new URL('../' + f, import.meta.url);
  let s = fs.readFileSync(p, 'utf8');
  const n = (s.match(/https:\/\/openlibrary\.org\/isbn\/\w+/g) || []).length;
  s = s.replace(/https:\/\/openlibrary\.org\/isbn\/(\w+)/g, 'https://books.google.com/books?vid=ISBN$1');
  fs.writeFileSync(p, s);
  console.log(f, 'replaced', n);
}
