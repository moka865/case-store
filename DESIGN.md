# DESIGN.md: غلاف Storefront (`case-store`)

Canonical design specification reflecting the live logo-driven **غلاف** storefront (`src/index.css`, `index.html`, `src/components/`, `src/pages/`).

## Brand Identity & Visual System

- **Official Logo (`BrandLogo`):** Exact `Logos/3.png` horizontal lockup (`src/assets/brand/logo.webp` + `logo.png`), rendered directly on `#010000` (`--brand-black`) in headers, footers, mobile drawer headers, and dark callouts — never stretched, recolored, or altered. Favicons (`/favicon.png`, `/apple-touch-icon.png`) and `/og-image.png` derive from the same brand mark.
- **Official Palette (`src/index.css`):**
  - `--brand-black: #010000` — Primary header bar, mobile thumb dock, footer ground, number/badge tiles
  - `--paper: #F7F6F2` — Global storefront canvas
  - `--card-bg: #ECEAE4` — **Single fixed `.product-stage` background** shared identically across every catalog card, detail stage, cart thumbnail, checkout preview, and hero stage regardless of artwork
  - `--surface: #FFFFFF` — Cards, inputs, modals, bottom sheets, cart/menu drawers
  - `--surface-muted: #E6E3DC` — Secondary chip hover & subtle separators
  - `--ink: #111317` & `--ink-muted: #4E535C` — Primary and muted text (WCAG AA/AAA compliant on `--paper` & `--surface`)
  - `--brand: #D40C14` (`--brand-hover: #B30910`, `--brand-tint: #FCEBEC`) — Primary Crimson CTA, cart count badge, errors, light-surface focus rings
  - `--brand-yellow: #FECE05` (`--brand-yellow-hover: #F2C200`, `--brand-yellow-tint: #FEF7D6`) — Official Logo Gold paired strictly with `#111317` / `#010000` ink for phone selector CTA, badges, and dark-surface active states/focus rings
  - `--jade: #0E6F4F` (`--jade-tint: #E3F4EE`) — COD confirmation & positive policy highlights
  - **Signature Brand Rule:** `4px` split top accent (`w-2/3 bg-[var(--brand)]` + `w-1/3 bg-[var(--brand-yellow)]`)
- **Backwards-Compatible CSS Aliases:** `--plaster` -> `--paper`, `--gallery-white` -> `--surface`, `--charcoal` -> `--ink`, `--graphite` -> `--ink-muted`, `--klein` -> `--brand`.

## Language, RTL & Copy Rules

- Strict `<html lang="ar" dir="rtl">` and logical CSS/Tailwind properties only (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`).
- Product names are English; phone models, order IDs, mobile numbers, and signed fees (`+50`) must be wrapped in `<bdi dir="ltr">` inside Arabic prose so signs and characters never flip in BiDi.
- Western digits (`0-9`) with currency after numbers (`295 ج.م`).
- Friendly Egyptian colloquial Arabic (`عامية مصرية بسيطة`), imperative CTAs (`شوف الجرابات`, `صمم جرابك`, `ضيف للسلة`, `اختار موبايلك`), **strictly zero tashkeel (no Arabic diacritics `[\u064B-\u065F\u0670]`)** across the entire storefront.

## Typography (`public/fonts/*.woff2`)

All fonts are self-hosted in `public/fonts/` with zero external CDN requests:
- **Headlines (`--font-display`):** `Cairo` (`700`/`800`, crisp, high-legibility modern Arabic) + `Bricolage Grotesque` fallback
- **Body & UI (`--font-sans`):** `IBM Plex Sans Arabic` (`400`/`500`/`600`/`700`) + `Bricolage Grotesque`
- **Latin & Tabular Numbers (`--font-latin` / `.latin-title`):** `Bricolage Grotesque` (`letter-spacing: -0.015em`, `tabular-nums`)
- **Studio Name-Printing Fonts:** `Cairo`, `Readex Pro`, `Reem Kufi`, `Lalezar`, `Aref Ruqaa`, `Syne`, `Caveat`, `Unbounded` (never apply `letter-spacing` to Arabic faces).

## Shape, Depth & Motion

- Consistent radii: `--radius-ui: 8px` (buttons, inputs, controls), `--radius-stage: 12px` (`.product-stage`, panels, sheets), `--radius-pill: 999px` (category pills, model selector chip).
- Silhouetted `drop-shadow` (`--case-shadow-sm` / `--case-shadow-md` / `--case-shadow-lg`) and smooth hover wall-lift (`260ms cubic-bezier(0.22, 1, 0.36, 1)`) apply to case artwork previews only; zero `backdrop-filter: blur` for fast mid-range Android performance.
- Respect `prefers-reduced-motion: reduce` everywhere (`<MotionConfig reducedMotion="user">`).

## Key Architecture & User Flows

- **Desktop & Mobile Navigation:** Desktop (`>= 1024px`) keeps the full single-row `#010000` header + COD strip (`<title>غلاف</title>` on home). Mobile (`< 1024px`) uses a thumb-first two-zone hybrid: slim `56px` (`48px` landscape) top bar + `MobileBottomNav` (`الرئيسية`, `الأقسام`, `صمم جرابك`, `موبايلك`, `السلة`) + RTL slide-in `MobileMenuDrawer` + root-portaled `ModelSelector` sheet + keyboard-aware docking (`useMobileViewportState`).
- **Per-Item Phone Selection & `+50` EGP Name Printing:** `PhoneModelFields` lets every product/custom item specify or override its own brand/model (or `"موبايلي مش في القايمة"` pending state) without altering the global header filter; `NamePrintControl` shares bilingual auto-script name printing (`STORE_CONFIG.namePrintFee = 50` EGP) across catalog pages, `/customize`, and `CartDrawer`.
- **Footer & Legal Policy (`/terms`):** Brand-black `Footer` with `SocialLinks` (`Instagram`, `Facebook`, `TikTok` via `STORE_CONFIG.social`), store links, policy highlights, and direct routing to the dedicated Terms & Conditions page (`src/pages/TermsPage.jsx`, `src/data/terms.js`).
- **Checkout & Admin Handoff:** COD-only across 17 governorates (`STORE_CONFIG`, `src/contracts/handoffSchema.js` Version 1, `idb://` image offloading + hydrated JSON export for `case-store-admin`).
