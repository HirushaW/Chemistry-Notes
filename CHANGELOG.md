# Changelog

All notable changes to this project are recorded here. Versions follow [Semantic Versioning](https://semver.org).

## [1.1.0] — 2026-11-13

Motion: richer animations and transitions across the site, plus two fixes found while testing them.

### Added
- Page changes animate: the old page lifts away and the new one rises in, while the header stays put.
- A reading-progress line under the header fills as the page scrolls (browsers with scroll-driven animations).
- Scroll reveals rise and settle with a soft spring; section headings now reveal too, and each eyebrow line draws in.
- Entrances: the hero's periodic-table tiles drop into place along the diagonal, the periodic-table page's cells cascade in, and the Chemistry Atom assembles itself the first time it is seen (the nucleus pops in, the shells draw outwards, the electrons appear one after another).
- The search palette and the PDF viewer fade out when they close, and their backdrop fades both ways.
- A band of light sweeps across primary buttons on hover; desktop nav links get a sliding underline; the phone menu's links follow the panel in one after another; a soft glow follows the mouse across the hero.

### Fixed
- The header's glass blur works again. Since the phone-menu fix it sat on a child layer, where the header's view-transition name hid the page from it, so content showed through unblurred. The blur is back on the header itself, and the phone menu is positioned against the header so it still opens full height.
- Page-change animations no longer get skipped while the stylesheet is being re-fetched: the view-transition opt-in is now inline in every page's head.
- Cards no longer inherit the reveal's stagger delay on their hover tilt.

### Performance and accessibility
- Every new effect is transform or opacity only. Lite mode keeps reveals and page changes as plain fades and drops the entrance cascades, the button sweep and the hero glow. Reduced motion shows everything at once, as before.

## [1.0.0] — 2026-10-10

The first stable release: the site as it is live today.

### Content
- 38 courses and 88 syllabus sections from 1000 to 4000 Level, each with a description and a full summary from the department's *Course Contents 2021–2022* handbook.
- 509 lecture notes and tutorials and 219 past papers, previewed in the page; past papers on every course page, in a tab on every section page and in the atom's course panel.
- Textbook chapters for every section with free editions where they exist, 261 YouTube lectures, YouTube search links, and a checked list of websites, tools and journals.

### Chemistry Map
- 3D Chemistry Atom (home page and map page): four level shells, courses as electrons coloured by stream, free rotation, zoom by scroll or pinch, stream and level filters, course panel with notes, papers and videos, deep links.
- Bubble map view with links between courses and a zoomed view of each course's sections.

### Periodic tables
- Home page 3D periodic table with an idle wave, pointer tilt and a glowing spider that webs up one course element at a time and names it below the table.
- Full interactive periodic table with PubChem data, property heat maps and an idle wave.

### Site
- Search across courses, sections, topics, notes, papers and elements; PDF viewer; working phone menu.
- Effects tiers: Full, or Lite (chosen automatically on weak devices or after a frame-rate check, or from the footer switch) for smooth use on low-end phones and laptops.
- Deployed to Vercel (live site) and GitHub Pages (mirror) on every push to `main`.

### License
- Open source under the MIT License, with a security policy (`SECURITY.md`).

[1.1.0]: https://github.com/HirushaW/Chemistry-Notes/releases/tag/v1.1.0
[1.0.0]: https://github.com/HirushaW/Chemistry-Notes/releases/tag/v1.0.0
