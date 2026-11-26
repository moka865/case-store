# DESIGN.md: Phone Case Store

Read this file before writing any UI. Follow it strictly. If a choice isn't covered here, decide in the spirit of the concept below, never by falling back on generic defaults.

## Concept

A quiet gallery wall. Printed phone cases hang like framed works and the interface stays out of their way. The case prints supply all the color on the page; the UI is neutral plus one accent. The site feels young through confident type and a playful layout rhythm, not through loud UI color or effects.

## Language and direction

- The whole site is Arabic and right-to-left: `<html lang="ar" dir="rtl">`. Only product names are English.
- Wrap every English product name in `<bdi dir="ltr">` so it renders correctly inside Arabic text.
- Use logical CSS only: `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `text-align: start`. In Tailwind use `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`. Never use physical left/right, except where this file says so.
- Mirror directional icons (chevrons, arrows, back/next). Do not mirror logos, phone mockups or media icons.
- Horizontal scrollers start at the right edge. Slide-in motion comes from the end side of the screen.
- Digits are Western (0-9) for prices, counts and phone numbers. The currency goes after the number: `250 ج.م`.

## Color tokens

```css
:root {
  --plaster: #E6E8E4;        /* page background */
  --gallery-white: #F6F6F3;  /* surfaces: panels, sheets, dropdowns */
  --charcoal: #26282B;       /* text, headlines */
  --graphite: #5A5E63;       /* secondary text, captions */
  --klein: #1236C9;          /* the only accent */
}
```

- Klein is for the primary CTA, selected states and focus rings only. Keep it under ~5% of any screen.
- Text on klein is gallery-white.
- No gradients, no glassmorphism, no extra hues. The case prints are the only colorful things.

## Typography

- One stack, two faces: `font-family: "Bricolage Grotesque", "Readex Pro", system-ui, sans-serif`. Bricolage Grotesque supplies the Latin glyphs (product names, digits). Readex Pro (Google Fonts, variable) supplies all Arabic. If the two look mismatched in size on one line, correct it with `size-adjust` on the fallback face.
- Arabic rules: never apply letter-spacing (positive or negative) to Arabic text, it breaks letter joining. No italics, no text-transform. Arabic gets more line-height than Latin.
- Scale (Arabic text):
  - Display: clamp(38px, 5vw, 72px) / 1.18, weight 700 (capped at 72px on desktop)
  - H1: clamp(32px, 4vw, 44px) / 1.25, weight 700
  - H2: clamp(24px, 2.8vw, 30px) / 1.3, weight 700
  - H3: 22 / 1.4, weight 600
  - Body: 17 / 1.75, weight 400
  - Caption: 14 / 1.5, weight 500, graphite
- Latin-only text (product names, the brand mark) may use weight 600-800 and tight tracking (-0.02em) at display sizes.
- Max line length 60 characters applies to paragraph text (`<p>`) only — never to layout containers or headline blocks.
- No small eyebrow label above headings.
- Headlines are a design element, not just content. In the hero the display type sits side by side with the case showcase and fills the container width cleanly.

## Layout

- 12-column grid (plus responsive multi-column salon-hang), max width 1520px (`--max-page-width: 1520px`, within 1440-1520px), page margins `clamp(16px, 3vw, 40px)` (`--page-margin`). On wider screens, content scales into the container (more columns, larger previews) instead of floating in the middle with wide dead bands.
- **Header height:** 64-72px on desktop (`--header-height: 68px`).
- **Hero:** height `min(72vh, 680px)`, never full viewport. Text, case showcase, and gallery placard sit side by side and fill the container width. At 1440x900 both the hero and the heading of the next section must be visible above the fold without scrolling.
- **Section rhythm (vertical gap between consecutive sections):** desktop `clamp(48px, 5vw, 72px)` (`--section-gap`, strictly <= 80px), mobile `40px`. Sections apply half on top and half on bottom (`--section-pad-y: calc(var(--section-gap) / 2)`) so consecutive sections never double-pad. Remove `min-h-screen` / `h-screen` from sections (only allowed on checkout or empty states if needed).
- **Inside sections:** heading to content `24-32px` (`--heading-to-content`); grid column gap `20-24px` desktop (`--grid-col-gap`), row gap `28-32px` (`--grid-row-gap`); image to caption `10-12px` (`--image-to-caption`).
- Text aligns to the start (right). Do not stack identical centered sections; vary section structure. Keep no empty horizontal band wider than ~120px inside the container.
- **No cards.** Products have no border, shadow or background box. The case mockup sits directly on the plaster with a caption below: the English product name (body, weight 500, charcoal) with the price at the end side, and a text button "ضيف للسلة" on the row below.
- **Product grid ("salon hang"):** responsive column density by viewport width — 2 (mobile), 3 (>=768px), 4 (>=1024px), 5 (>=1440px), 6 (>=1920px) using CSS Grid with `grid-auto-flow: dense` and render-time derived effective spans (stored `salonSpan` data stays untouched). Every row must fill the full container width with zero unfilled trailing columns, cases scale cleanly into their cells, and deliberate vertical stagger offsets are capped at `24px` max (`--salon-offset-max`).
- Keep the gallery calm: tighter does not mean cluttered. Cases still get breathing room around them, with zero dead zones.

## Shape and borders

- UI radius: 4px (buttons, inputs, sheets, dropdowns). Pills only for the phone-model chip.
- Case mockups keep real device corner radii.
- 1px border `rgba(38, 40, 43, 0.18)` only on inputs where needed. No decorative dividers or hairlines.
- No drop shadows on UI elements (buttons, panels, sheets, dropdowns, inputs).

## Case shadow

- Case mockups are product imagery, not UI chrome, and get a soft, quiet gallery wall shadow so every case feels grounded just off the `--plaster` wall, lit straight from above.
- Always two charcoal-only layers (`rgba(38, 40, 43, a)`), no other hue, no spread, straight-down light direction everywhere in the app, implemented with `filter: drop-shadow(...)` so the shadow follows the real case silhouette (rounded corners, tactile side buttons, and transparent camera cutout) — never a rectangular `box-shadow`.
- Defined once as CSS tokens in `src/index.css` and scaled automatically to the rendered case size via `@container` size queries inside `PhoneCaseMockup` (plus explicit size classes where needed):
  - **Thumbnail (`--case-shadow-sm`, `< 100px` wide — cart drawer, checkout summary):** `drop-shadow(0 1px 1.5px rgba(38, 40, 43, 0.22)) drop-shadow(0 4px 7px rgba(38, 40, 43, 0.13))`; lifted hover/focus (`--case-shadow-sm-hover`): `drop-shadow(0 2px 3px rgba(38, 40, 43, 0.24)) drop-shadow(0 7px 12px rgba(38, 40, 43, 0.18))`
  - **Gallery (`--case-shadow-md`, `100–329px` wide — product grid, customizer teaser, mobile previews):** `drop-shadow(0 1px 2px rgba(38, 40, 43, 0.26)) drop-shadow(0 12px 20px rgba(38, 40, 43, 0.16))`; lifted hover/focus (`--case-shadow-md-hover`): `drop-shadow(0 3px 5px rgba(38, 40, 43, 0.26)) drop-shadow(0 20px 30px rgba(38, 40, 43, 0.22))`
  - **Showcase (`--case-shadow-lg`, `>= 330px` wide & desktop Hero / Customizer):** `drop-shadow(0 2px 3px rgba(38, 40, 43, 0.28)) drop-shadow(0 15px 24px rgba(38, 40, 43, 0.18))`; lifted hover/focus (`--case-shadow-lg-hover`): `drop-shadow(0 4px 6px rgba(38, 40, 43, 0.28)) drop-shadow(0 24px 36px rgba(38, 40, 43, 0.24))`
- **Product hover/focus lift:** Everywhere a product case appears in a grid or list, hovering on real-hover devices (`@media (hover: hover)`) or focusing via keyboard (`:focus-visible`) lifts the case softly off the wall (`translateY(-5px) scale(1.016)` on standard cases, `-2px / 1.025` on thumbnails; `270ms cubic-bezier(0.22, 1, 0.36, 1)`) while deepening its wall shadow — animating only `transform` and `filter` with zero layout shift, disabled under `prefers-reduced-motion`.
- In the Hero, apply the shadow filter on a non-rotating wrapper around the tilting case so the overhead light direction stays fixed while the case tilts.
- The shadow must never shift layout or get clipped by `overflow: hidden` / `overflow-y: auto` ancestors (give scrollable lists enough padding).

## Components

- **Header:** sticky, plaster background. The logo sits at the start (right). The phone-model selector sits at the top-left of the screen (physical left, as requested), followed toward the center by search and the cart with a count badge. The selector shows the current model (e.g. `iPhone 15 Pro`, LTR) with a chevron; with no model chosen it reads "اختار موبايلك" in klein.
- **Model selector panel:** gallery-white panel with brand tabs (iPhone, Samsung, Xiaomi, Oppo, Realme, Infinix, Tecno), a search input and a model list. On mobile it is a bottom sheet. At the bottom of the list there is always a text option "موبايلي مش في القايمة".
- **"My phone isn't in the list" flow:** opens a small form in the same panel: phone name (free text) and mobile number (Egyptian format: 11 digits starting with 01), plus a "ابعت" button. After sending, show "خدمة العملاء هتتواصل معاك لتأكيد الموديل". The site then enters a "pending model" state: all designs are shown unfiltered, with a chip "موديلك بيتأكد من خدمة العملاء". The request is saved in the mock data layer only.
- **Model chip:** under the header on listings, "بتشوف جرابات {model}" with a "غيّر" text button.
- **Buttons:** primary = klein background, gallery-white text, 48px high, 4px radius. Secondary = text button with underline. No arrows appended to labels. Labels are imperative Arabic verbs that name the action.
- **Selected state:** 2px klein outline with 2px offset. Never a color fill.
- **Cart drawer:** opens from the side where the cart icon is. Each item shows a thumbnail of the final print, the English name, the phone model, the printed name if any, and the price. Below: subtotal, a note "الدفع عند الاستلام", and a "كمل الطلب" button (checkout is not built yet, link it to a placeholder).
- **Customizer** (reusable component):
  - Desktop: two panes. Start side = live case preview for the chosen model. End side = controls.
  - Controls: image upload with a drop zone, position and scale, an "اطبع اسمك" toggle, a name input, font choices, and placement (top, center, bottom).
  - The name can be Arabic or English. Detect the script of the typed text and offer 4 distinct font styles for that script (a clean sans, a bold display, a handwritten/script style, a geometric or Kufi-style). Show each choice as a live sample of the typed text. Arabic letters must stay properly joined in the preview, with no letter-spacing.
  - Mobile: preview sticks to the top, controls scroll below.
  - The preview updates instantly as the user types or uploads.
  - On "ضيف للسلة" the Customizer outputs a print spec object (phone model, design source, image position/scale/rotation, name text/script/font/placement) that is stored on the cart item.

## Motion

- Easing `cubic-bezier(0.22, 1, 0.36, 1)`. Durations: fast 150ms, base 250ms, slow 600ms.
- **One signature moment, the hero:** the case enters with a slight tilt settling to rest (700ms), then the print on it cross-fades through 3-4 designs about every 4s (600ms). Cursor-follow tilt max ±6°. On touch devices, a slow float. Pause when the tab is hidden.
- Everything else moves only in response to a user action:
  - product cases in grids and lists lift gently off the wall (`270ms`) with a deeper silhouette shadow on real hover (`@media (hover: hover)`) and keyboard focus
  - selector opens and closes (200-250ms)
  - changing the phone model reflows the product grid with a layout animation (400ms)
  - add to cart: the label swaps to "اتضاف" with a check (300ms) and the cart count ticks
  - customizer preview updates in place (150ms or less)
- Do not use scroll-triggered reveals, heavy card/box hover transitions, looping decoration, or parallax outside the hero.
- Respect `prefers-reduced-motion`: replace movement with a plain fade or nothing (and disable product hover lift).

## Imagery and mockups

- Cases are flat front-view mockups on the plaster, one consistent camera angle, with the real aspect ratio and camera cutout shape per phone model where possible.
- Cases have no color variants. Never show color swatches.
- Placeholder prints are generated with SVG/CSS (abstract patterns, typographic prints, simple illustration). No stock photos.

## Voice and copy

- Arabic, in light, friendly Egyptian colloquial (عامية مصرية بسيطة). Not formal MSA, and not heavy slang. Short, direct, imperative verbs.
- Examples: "اختار موبايلك", "ارفع صورتك", "اكتب اسمك", "ضيف للسلة", "موبايلي مش في القايمة".
- Empty states say what to do: "مفيش تصميمات للموديل ده لسه. جرّب موبايل تاني أو ارفع تصميمك."
- Errors say what went wrong and how to fix it. They don't apologize.
- No lorem ipsum. No generic marketing filler like "اكتشف مجموعتنا".
- Category names are Arabic and come from data. Product names are English.

## Avoid (these read as AI-generated)

- Cream background + serif + terracotta accent, or near-black background + neon accent
- Purple or blue gradients, gradient washes, glassmorphism
- Content chopped into identical rounded cards with the same radius and soft shadow
- Eyebrow labels, "01 / 02 / 03" numbering on non-sequential content, middle-dot strings, arrows on every button
- One highlighted word in every headline
- Emoji or stock icon sets as decoration
- Fade-and-slide-up on every section, heavy box/card hover transitions (only the subtle product case wall-lift is permitted)
- An English layout that was merely translated: left-aligned text, left-pointing back arrows, physical margins and unmirrored icons in an RTL page

## Quality floor

- Responsive from 360px wide, checked in RTL. No horizontal overflow, no clipped Arabic text (give lines enough height for Arabic ascenders and marks).
- WCAG AA contrast, visible focus (klein outline), touch targets at least 44px. Focus order follows the RTL reading order.
- Semantic HTML. The model selector, the "phone not in list" form and the customizer must be fully keyboard-operable.