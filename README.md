# Chemistry Notes — UoP Chemistry Hub

An unofficial study site for the B.Sc. chemistry courses of the University of Peradeniya, from 1000 to 4000 Level: every course, its syllabus sections, lecture notes, past papers, textbook chapters and videos in one place.

**Live site:** [chemistry-notes-sigma.vercel.app](https://chemistry-notes-sigma.vercel.app) · mirror on [GitHub Pages](https://hirushaw.github.io/Chemistry-Notes/)

**Current version:** 1.0.0 (see [CHANGELOG.md](CHANGELOG.md))

## Features

- **Courses and sections.** 38 courses and 88 syllabus sections, each with a description and a full summary written from the department's *Course Contents 2021–2022* handbook.
- **Notes and past papers.** 509 lecture notes and tutorials and 219 past papers, stored in Google Drive and previewed in the page. Past papers appear on every course page, in a tab on every section page and in the atom's course panel.
- **Reading and watching.** Textbook chapters for every section (free OpenStax and LibreTexts editions where they exist), 261 YouTube lectures, a YouTube search link for every course and section, and a checked list of websites, tools and journals.
- **The Chemistry Atom.** A 3D atom on the home page and the Chemistry Map: the nucleus is chemistry, the four coloured shells are the four levels and every electron is a course, coloured by its stream. Turn it any way, scroll or pinch to zoom into the inner shells, filter by stream and level, and open any course with its notes, papers and videos.
- **Bubble map.** The same courses as floating bubbles, showing what each course builds on and leads to.
- **Periodic tables.** A 3D periodic table on the home page that rolls with a gentle wave while a small glowing spider webs up one element at a time, and a full interactive table with PubChem data and property heat maps.
- **Fast on any device.** An *Effects: Full / Lite* switch in the footer. Lite is chosen automatically on weak devices, or after a quick frame-rate check, and drops the expensive effects while keeping the look.
- **Search** across courses, sections, topics, notes, papers and elements (Ctrl K).

Textbooks are never uploaded: each section cites the book and chapter and links to a free edition or a catalogue record.

## Build and run locally

Requires Node.js 20 or newer. There are no dependencies to install.

```bash
npm run build       # writes the site to dist/
npm run serve       # preview at http://localhost:4321/Chemistry-Notes/
npm run dev         # both
npm run check-links # checks every external URL
```

Set `BASE=/` to build for a root domain instead of the GitHub Pages path.

## Deployment

Every push to `main` is deployed twice:

- **Vercel** builds it with `vercel.json` (`BASE=/`, output `dist/`) and serves it at the live address.
- **GitHub Pages** builds it with `.github/workflows/deploy.yml` and serves the mirror.

## Project structure

| Path | Contents |
| --- | --- |
| `build.mjs` | Static site generator: every page, the search index and the map data |
| `serve.mjs` | Local preview server |
| `src/data/content.mjs` | Course and section descriptions, topics, hours, recommended texts, streams and levels |
| `src/data/courses.json` | Course structure, credits, prerequisites and textbook chapter references |
| `src/data/files.json` | Google Drive file IDs for notes, tutorials, answers and past papers |
| `src/data/videos.json` | YouTube picks per section (each checked with YouTube oEmbed) |
| `src/data/books.json` | Recommended textbooks |
| `src/data/resources.mjs` | External websites, open courses, tools and journals |
| `src/data/links.mjs` | Topic links drawn on the Chemistry Map |
| `src/data/elements.json` | PubChem periodic table data (public domain) |
| `src/assets/css/site.css` | All styles |
| `src/assets/js/` | `app.js` (navigation, search, PDF viewer, effects switch), `atom.js` (3D atom), `map.js` (bubble map), `explore-core.js` (shared map data), `hero.js` and `spider.js` (home periodic table), `ptable.js` and `pt-core.js` (periodic tables), `bg.js` (background) |
| `tools/check-links.mjs` | Checks every external URL |

## Versions and branches

- `main` is the stable version that is live. Each release is tagged (`v1.0.0`, `v1.1.0`, …) and listed in [CHANGELOG.md](CHANGELOG.md).
- `develop` is where new work starts. Changes are made on a short branch from `develop` (for example `feature/new-quiz` or `fix/menu`), merged into `develop` by pull request, and released to `main` with a new version tag.
- Version numbers follow [Semantic Versioning](https://semver.org): new features raise the middle number (1.1.0), fixes raise the last (1.0.1).

## Sources and credits

- Course structure and topics: Department of Chemistry, University of Peradeniya, *Course Contents 2021–2022*.
- Notes and papers belong to their lecturers and the department and are shared only for study. To report a problem or request a removal, [open an issue](https://github.com/HirushaW/Chemistry-Notes/issues).
- Element data: PubChem Periodic Table, NCBI (public domain).
- Videos are embedded from YouTube and remain on their creators' channels.
