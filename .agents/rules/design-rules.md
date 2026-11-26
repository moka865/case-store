# Design rules

## Source of truth
- Before writing or changing any UI (components, pages, styles, animations), read `DESIGN.md` in the project root and follow it strictly.
- Its tokens (colors, type, spacing, radius, motion) are the single source of truth. Define them once as CSS variables / Tailwind theme values. Never invent new colors, fonts or radii.

## Arabic and RTL
- The site is Arabic and right-to-left (`lang="ar"`, `dir="rtl"`). Only product names are English, wrapped in `<bdi dir="ltr">`.
- Use logical CSS properties and Tailwind logical utilities only (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`). Mirror directional icons.
- Never apply letter-spacing to Arabic text.
- Write all Arabic copy yourself, following the "Voice and copy" section of `DESIGN.md`, and double-check spelling.

## Plan before building
- Before building a new page or major section, write a short design plan: a layout concept with an ASCII wireframe (in RTL), and how it follows `DESIGN.md`.
- Check the plan against the "Avoid" list in `DESIGN.md`. If any part is what you would produce for any generic e-commerce store, revise it and say what you changed.
- Spend boldness in one place per page. Everything else stays calm.

## Build rules
- Stack: React + Tailwind + Motion. Don't add other UI or animation libraries unless asked.
- Spacing and layout come from the shared CSS tokens in `src/index.css` (`--max-page-width`, `--page-margin`, `--header-height`, `--section-gap`, `--section-pad-y`, `--page-top-pad`, `--heading-to-content`, `--grid-col-gap`, `--grid-row-gap`, `--image-to-caption`) rather than scattered hardcoded paddings. Never add `min-h-screen` / `h-screen` to normal content sections, and apply `60ch` max-width to `<p>` text only (never layout containers or headline blocks).
- UI chrome never has drop shadows, while every case mockup (product imagery) gets the shared charcoal-only silhouette wall shadow from `src/index.css` (`--case-shadow-sm` / `--case-shadow-md` / `--case-shadow-lg`) via `filter: drop-shadow(...)`, scaled to rendered case size and unclipped by overflow containers.
- Motion follows `DESIGN.md`: one signature moment in the hero; product cases in grids and lists lift gently off the wall with a deeper shadow on real hover (`@media (hover: hover)`) and keyboard focus (`270ms`, transform/filter only); everything else responds to user actions. No scroll-reveals. Respect `prefers-reduced-motion`.
- Categories, products and phone models come from a mock data layer, never hardcoded in components, so an admin dashboard and an API can replace it later.

## Before you finish
- Open the page in the browser at 390px, 1280px, 1440px, and 1920px wide and take screenshots.
- Verify no vertical gap between consecutive sections exceeds 80px on desktop, no grid row has unfilled columns, no empty horizontal band exceeds ~120px inside the container, and at 1440x900 both the hero and the next section's heading are visible above the fold.
- Critique the result against `DESIGN.md`, find the most generic-looking element, and fix it.
- Report what you changed in two or three lines.