# Chemistry Notes — UoP Chemistry Hub

An unofficial study site for the B.Sc. chemistry courses of the University of Peradeniya, 1000 to 4000 Level.

**Live site:** https://chemistry-notes-sigma.vercel.app (Vercel) · https://hirushaw.github.io/Chemistry-Notes/ (GitHub Pages)

## What it contains

- **38 courses** and **88 syllabus sections**, each with a short description and a full summary written from the department's *Course Contents 2021–2022* handbook.
- **509 lecture notes and tutorials** and **219 past papers**, stored in Google Drive and previewed in the page.
- Textbook chapters for every section (free OpenStax and LibreTexts editions where they exist), **261 YouTube lectures** and a checked list of websites, tools and journals.
- An interactive **Chemistry Map**: a 3D atom whose four coloured shells are the four levels and whose electrons are the courses (also on the home page), plus a bubble view, showing how topics build on each other across the four years. Turn the atom any way, scroll or pinch to zoom into the inner shells, and filter it by stream and level.
- Past papers on every course page, in a **Past papers** tab on every section page, and in the atom's course panel; a YouTube search link for every course and section.
- An interactive **periodic table** with PubChem data and property heat maps.

Textbooks are never uploaded: each section cites the book and chapter and links to a free edition or catalogue record.

## Build and preview

Requires Node.js 20 or newer. There are no dependencies.

```bash
node build.mjs      # writes the site to dist/
node serve.mjs      # preview at http://localhost:4321/Chemistry-Notes/
```

Set `BASE=/` to build for a root domain instead of the GitHub Pages project path.

Every push to `main` builds and deploys the site through GitHub Actions (`.github/workflows/deploy.yml`).

The same push also deploys to Vercel at https://chemistry-notes-sigma.vercel.app: `vercel.json` builds with `BASE=/` into `dist/`, so the Vercel project needs no extra settings.

## Layout

| Path | Contents |
| --- | --- |
| `build.mjs` | Static site generator: home, levels, courses, sections, map, papers, library, resources, periodic table, about, search index |
| `src/data/content.mjs` | Course and section descriptions, topics, hours, recommended texts |
| `src/data/courses.json` | Course structure, credits, prerequisites and textbook chapter references |
| `src/data/files.json` | Google Drive file IDs for notes, tutorials, answers and past papers |
| `src/data/videos.json` | YouTube picks per section (each checked with YouTube oEmbed) |
| `src/data/resources.mjs` | External websites, open courses, tools and journals |
| `src/data/links.mjs` | Topic links drawn on the Chemistry Map |
| `src/data/elements.json` | PubChem periodic table data (public domain) |
| `src/assets/` | CSS, JavaScript (3D atom, bubble map, 3D periodic table hero, background, search) and images |
| `dist/assets/js/map-data.js` | Generated: course, section, paper and video data shared by the atom and the bubble map |
| `tools/check-links.mjs` | Checks every external URL |

## Sources and credits

- Course structure and topics: Department of Chemistry, University of Peradeniya, *Course Contents 2021–2022*.
- Notes and papers belong to their lecturers and the department and are shared only for study. To report a problem or request a removal, open an issue.
- Element data: PubChem Periodic Table, NCBI (public domain).
- Videos are embedded from YouTube and remain on their creators' channels.
