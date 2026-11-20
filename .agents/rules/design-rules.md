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
- Motion follows `DESIGN.md`: one signature moment in the hero, everything else responds to user actions. No scroll-reveals, no hover-lift on product images. Respect `prefers-reduced-motion`.
- Categories, products and phone models come from a mock data layer, never hardcoded in components, so an admin dashboard and an API can replace it later.

## Before you finish
- Open the page in the browser at 390px and 1440px wide and take screenshots.
- Critique the result against `DESIGN.md`, find the most generic-looking element, and fix it.
- Report what you changed in two or three lines.