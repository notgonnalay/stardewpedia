# Stardewpedia: Design Plan

Version 1.1, October 2026. Site name: **Stardewpedia**. This document records the design decisions in the website mockups (home, crop page and mobile home, each in light and dark mode). Values here are exactly what the mockups use, unless marked **proposed**.

Related documents: `stardew-valley-guide-architecture.md` (system design) and `stardew-guide-frontend/SKILL.md` (build rules for shadcn/ui and Google Fonts).

> **Note:** the palette in `SKILL.md` (warm parchment, oklch values) predates these mockups and is now out of date. Use the tokens in this file, then update `SKILL.md` to match.

## 1. Design Principles

1. **Readable first.** A guide is read in short bursts, often on a phone next to the game. Body text is Nunito at 16 px with generous line height.
2. **Pixel accent, not pixel everything.** Pixelify Sans is only for headings, stats and the logo. Everything else is Nunito.
3. **Calm surfaces.** Soft sky-blue background in light mode, white cards, one teal accent colour. Season colours only appear on season chips and season-themed pages.
4. **Never colour alone.** Season chips carry a text label. Active states use a shape (top bar) as well as colour.
5. **Mobile first.** Designed at 360 to 390 px, then enhanced for tablet and desktop.
6. **Touch friendly.** Every button, chip and tab is at least 44 px tall.

### 1.1 Brand name and logo

**Name:** Stardewpedia. Unofficial fan guide.

**Mark:** a pixel-art sprout on a rounded teal tile, drawn on a 12 by 12 grid so it stays crisp at any whole-number scale. It is an original drawing and does not copy any game art.

| Part | Colour | Grid position |
|---|---|---|
| Tile | `#1F6F78` | full 12 by 12, corner radius 2 |
| Stem | `#8FD16B` | x 5, y 4, width 2, height 5 |
| Leaves | `#B8E58F` | left: (2,3) 2 wide, (3,4) 2 wide, (4,5); right: (8,3) 2 wide, (7,4) 2 wide, (7,5) |
| Soil | `#C58B4A` | x 3, y 9, width 6, height 1 |

```svg
<svg width="36" height="36" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">
  <rect width="12" height="12" rx="2" fill="#1F6F78"/>
  <rect x="5" y="4" width="2" height="5" fill="#8FD16B"/>
  <rect x="2" y="3" width="2" height="1" fill="#B8E58F"/>
  <rect x="3" y="4" width="2" height="1" fill="#B8E58F"/>
  <rect x="4" y="5" width="1" height="1" fill="#B8E58F"/>
  <rect x="8" y="3" width="2" height="1" fill="#B8E58F"/>
  <rect x="7" y="4" width="2" height="1" fill="#B8E58F"/>
  <rect x="7" y="5" width="1" height="1" fill="#B8E58F"/>
  <rect x="3" y="9" width="6" height="1" fill="#C58B4A"/>
</svg>
```

**Wordmark:** "Stardewpedia" in Pixelify Sans 700, colour `--lk`, followed by the mark on its left.

| Use | Mark size | Wordmark size | Gap |
|---|---|---|---|
| Desktop header | 36 px | 26 px | 10 px |
| Mobile header | 30 px | 22 px | 8 px |
| Favicon and app icon | 16, 32, 180 (touch icon), 512 (PWA) px | none | none |

Rules:
- The mark and wordmark sit on one line, vertically centred, and link to the home page (`aria-label="Stardewpedia home"`).
- Keep clear space around the lockup of at least one quarter of the mark's height.
- The tile colour stays the same in light and dark mode, so the mark looks identical in both.
- Do not stretch, rotate, recolour or smooth the mark. Export PNGs only at whole-number multiples of 12 px, or use the SVG.
- Minimum mark size is 16 px.
- Do not use official Stardew Valley logos, characters or fonts in the brand.

**Name check:** "Stardew Valley" is ConcernedApe's trademark. Before buying a domain or publishing, read the developer's fan content policy and check whether starting a site name with "Stardew" is allowed. Keep the "unofficial fan site" notice in the footer and on the About page.

## 2. Colour Tokens

Tokens are CSS variables. Light is the default (soft sky-blue background), dark is applied by a `.dark` class (or `prefers-color-scheme`).

### 2.1 Core palette

| Token | Role | Light | Dark |
|---|---|---|---|
| `--bg` | Page background | `#EEF4FA` | `#0F1E22` |
| `--card` | Cards, header, inputs, bottom nav | `#FFFFFF` | `#172A2F` |
| `--line` | Borders, dividers | `#B7D3CC` | `#2B474D` |
| `--tx` | Primary text | `#17323A` | `#E6F1EF` |
| `--mu` | Secondary (muted) text | `#4B6870` | `#9DB8B6` |
| `--pr` | Primary fill (buttons) | `#1F6F78` | `#1F6F78` |
| `--po` | Primary on surface (outline buttons, active indicators, focus ring) | `#1F6F78` | `#6CCAD2` |
| `--lk` | Links, logo text | `#17565D` | `#7FD3DA` |
| `--ib` | Input borders, sprite placeholder border | `#7FA6A0` | `#4B6F75` |
| `--sp2` | Sprite placeholder fill | `#CFE5E0` | `#223A40` |
| (text on `--pr`) | Text on filled primary | `#FFFFFF` | `#FFFFFF` |

### 2.2 Season colours (same in light and dark)

| Season | Fill | Text on fill |
|---|---|---|
| Spring | `#3F7A32` | `#FFFFFF` |
| Summer | `#F2C94C` | `#17323A` |
| Fall | `#B5541C` | `#FFFFFF` |
| Winter | `#4A5FA8` | `#FFFFFF` |

Season chips always include the season name. Season pages may set `--pr` to the season fill (see section 9).

### 2.3 Contrast check (WCAG 2.2)

Computed ratios for the palette above. Targets: 4.5:1 for normal text, 3:1 for large text and UI boundaries.

| Pair | Ratio | Result |
|---|---|---|
| Light text on background | 12.20 | Pass |
| Light text on card | 13.52 | Pass |
| Light muted text on background | 5.40 | Pass |
| Light muted text on card | 5.98 | Pass |
| Light link on background | 7.51 | Pass |
| Light outline button text (`--po`) on background | 5.26 | Pass |
| White on primary fill | 5.83 | Pass |
| White on spring | 5.20 | Pass |
| Dark text on summer | 8.52 | Pass |
| White on fall | 4.94 | Pass |
| White on winter | 6.01 | Pass |
| Dark text on background | 14.80 | Pass |
| Dark text on card | 12.92 | Pass |
| Dark muted on background | 8.11 | Pass |
| Dark muted on card | 7.07 | Pass |
| Dark link on background | 9.95 | Pass |
| Dark `--po` on background | 8.96 | Pass |
| **Light input border on white** | **2.67** | **Fails 3:1 (UI boundary)** |
| **Dark input border on card** | **2.72** | **Fails 3:1 (UI boundary)** |
| Light `--line` on background | 1.44 | Decorative only |
| Dark `--line` on background | 1.72 | Decorative only |

**Fix before build (proposed):** darken `--ib` to `#5E8F89` in light mode (3.64 on white) and lighten it to `#6A9399` in dark mode (4.43 on the card). `--line` is only used for decorative card borders and dividers, so it can stay light, but any border that is the only indicator of a control (inputs, checkboxes) must use `--ib`.

### 2.4 Mapping to shadcn/ui tokens

| shadcn variable | Uses | Notes |
|---|---|---|
| `--background` | `--bg` | |
| `--foreground` | `--tx` | |
| `--card`, `--popover` | `--card` | |
| `--card-foreground`, `--popover-foreground` | `--tx` | |
| `--primary` | `--pr` | |
| `--primary-foreground` | `#FFFFFF` | |
| `--secondary`, `--muted`, `--accent` | `--sp2` | Subtle fill |
| `--secondary-foreground`, `--accent-foreground` | `--tx` | |
| `--muted-foreground` | `--mu` | |
| `--border` | `--line` | |
| `--input` | `--ib` | Use the fixed value from 2.3 |
| `--ring` | `--po` | Focus ring |
| `--destructive` | **proposed** `#B42318` light, `#F28B82` dark | Not yet designed or contrast-checked |

Convert hex to oklch if the project's Tailwind setup expects it; the visual result must stay identical.

## 3. Typography

### 3.1 Fonts (Google Fonts via `next/font/google`)

| Role | Family | Weights | CSS variable |
|---|---|---|---|
| Display | Pixelify Sans | 500, 700 (variable) | `--font-display` |
| Body and UI | Nunito | 400, 600, 800 | `--font-sans` |
| Mono (numbers, code) | JetBrains Mono | 400, 600 | `--font-mono` (planned, not yet in mockups) |

Fallbacks: Nunito then `system-ui, sans-serif`; Pixelify Sans then `monospace`.

### 3.2 Type scale

| Style | Font | Size | Line height | Weight | Letter spacing | Used for |
|---|---|---|---|---|---|---|
| Hero title (desktop) | Display | 52 px | 1.1 | 700 | -0.01em | Home hero |
| Page title | Display | 44 px | 1.1 | 700 | -0.01em | Crop and entity page title |
| Hero title (mobile) | Display | 34 px | 1.1 | 700 | -0.01em | Mobile home |
| Section heading | Display | 30 px | 1.2 | 700 | -0.01em | Home sections |
| Sub-section heading | Display | 24 px | 1.2 | 700 | -0.01em | "Sell price by quality" |
| Card title | Display | 22 px | 1.2 | 700 | -0.01em | Tool and browse cards, mobile section headings |
| Entity name in tile | Display | 20 px | 1.2 | 700 | -0.01em | Popular grid |
| Stat value | Display | 26 px | 1.2 | 700 | -0.01em | Growth, seed price, sell price |
| Logo (desktop) | Display | 26 px | 1.2 | 700 | -0.01em | Header |
| Logo (mobile) | Display | 22 px | 1.2 | 700 | -0.01em | Header |
| Lead paragraph | Body | 18 px | 1.5 | 400 | 0 | Hero subtitle |
| Body | Body | 16 px | 1.5 | 400 | 0 | Default text, inputs, buttons (800) |
| Nav links / labels | Body | 16 px | 1.5 | 800 | 0 | Header nav, form labels |
| Mobile chip | Body | 14 px | 1.5 | 800 | 0 | Browse chips on mobile |
| Mobile tab label | Body | 12 px | 1.2 | 400 (800 active) | 0 | Bottom bar |
| Sprite placeholder label | Body | 11 px | 1.2 | 400 | 0 | Placeholder only, not shipped |

Rules:
- Display font is never used below 20 px and never for paragraphs, table cells or form labels.
- Maximum line length for prose: about 65 characters (`max-w-prose`).
- Use fluid scaling in code (`clamp()`) between the mobile and desktop sizes, for example the hero title `clamp(34px, 5vw, 52px)`.

## 4. Spacing and Sizing Scale

Base unit: **4 px**. The mockups use these values:

| Token | px | Tailwind | Typical use |
|---|---|---|---|
| space-1 | 4 | `1` | Tiny gaps |
| space-2 | 8 | `2` | Gap between tabs, chips on mobile, table cell padding, label to input |
| space-3 | 12 | `3` | Gap between stacked controls, mobile header gap |
| space-4 | 16 | `4` | Grid gaps, header gaps and vertical padding, mobile side padding |
| space-5 | 20 | `5` | Card padding, hero title block gaps, mobile top and bottom padding |
| space-6 | 24 | `6` | Section vertical padding, crop page column gap |
| space-8 | 32 | `8` | Page side padding, header side padding |
| space-12 | 48 | `12` | Bottom padding of last section |
| space-14 | 56 | `14` | Hero top padding, mobile bottom nav height |

### Control sizes

| Control | Size |
|---|---|
| Button, chip, tab (minimum height) | 44 px |
| Hero search input | 48 px high |
| Form input | 44 px high |
| Mobile bottom nav item | 56 px high, about 78 px wide (390 px / 5) |
| Icon in button or header | 18 px (desktop), 20 px (mobile header) |
| Icon in bottom nav | 24 px, stroke 2.2 |
| Sprite placeholder | 64 px (cards), 96 px (entity page) |

### Radii and borders

| Element | Radius | Border |
|---|---|---|
| Card | 10 px | 2 px `--line` |
| Button, input | 8 px | 2 px (`--pr` or `--po`, inputs `--ib`) |
| Season chip | 22 px (pill) | none |
| Sprite placeholder | 6 px | 2 px dashed `--ib` |

## 5. Layout

### 5.1 Page container

- Maximum content width: **1100 px**, centred (`mx-auto`).
- Side padding: **32 px** on desktop and tablet, **16 px** on mobile.
- Header spans the full width, with 16 px vertical and 32 px horizontal padding.
- Footer: 24 px vertical and 32 px horizontal padding, top border 2 px `--line`.

### 5.2 Section rhythm (desktop)

| Section | Padding (top, sides, bottom) |
|---|---|
| Hero | 56, 32, 24 |
| Content sections (Tools, Browse) | 24, 32, 24 |
| Last section before footer | 24, 32, 48 |
| Heading to content | 16 px below heading |

### 5.3 Grids

| Grid | Definition | Gap |
|---|---|---|
| Tool cards | `repeat(auto-fit, minmax(260px, 1fr))` | 16 px |
| Browse cards | `repeat(auto-fit, minmax(300px, 1fr))` | 16 px |
| Popular entity tiles | `repeat(auto-fit, minmax(240px, 1fr))` | 16 px |
| Stat row | `repeat(auto-fit, minmax(140px, 1fr))` | 12 px |
| Crop page columns | `repeat(auto-fit, minmax(240px, 1fr))`, main column spans 2 | 24 px |

### 5.4 Breakpoints

| Name | Min width | Behaviour |
|---|---|---|
| Base (mobile) | 0 | One column, bottom tab bar, drawer menu, 16 px side padding |
| `sm` | 640 px | Two-column card grids start to appear |
| `md` | 768 px | Tabs replace accordions, header nav visible, bottom bar hidden |
| `lg` | 1024 px | Crop page shows main column plus aside, 32 px side padding |
| `xl` | 1280 px | Container capped at 1100 px |

Wide tables scroll inside their own container (minimum width 360 px) and never cause page-level horizontal scroll.

## 6. Components

### 6.1 Header (desktop)

White (`--card`) bar, 2 px bottom border, items 16 px apart. Logo (display 26 px) on the left, nav links (Crops, Fish, Villagers, Calendar, Festivals, Quests, Achievements, Tools) at 20 px spacing in the middle or wrapped, then a Search button and a theme toggle (icon-only, 44 px, outline style).

### 6.2 Header (mobile)

390 px wide, 12 px vertical and 16 px horizontal padding. Logo (display 22 px) at left, then search and menu icon buttons (44 px, 12 px horizontal padding). A theme toggle goes inside the menu drawer.

### 6.3 Bottom tab bar (mobile)

Five equal columns: Home, Search, Calendar, Tools, Menu. White surface, 2 px top border, 8 px bottom padding plus the device safe area. Each tab: 24 px line icon above a 12 px label, 2 px gap, 56 px tall. Active tab (Home): `--lk` text, weight 800, a 3 px `--po` indicator on the top edge, and `aria-current="page"`.

### 6.4 Buttons

| Variant | Background | Border | Text |
|---|---|---|---|
| Primary | `--pr` | 2 px `--pr` | `#FFFFFF` |
| Outline | transparent | 2 px `--po` | `--po` |

Height 44 px minimum, padding 0 18 px, icon gap 8 px, radius 8 px, Nunito 16 px weight 800. Icon-only variant: padding 0 12 px. Focus ring: 2 px `--po` with 2 px offset.

### 6.5 Season chips

Pill, 44 px minimum height on filter bars (32 px compact inside page titles), padding 0 16 px (0 12 px compact), icon-and-text gap 6 px, weight 800, colours from section 2.2. Chips in a row are 10 px apart (8 px on mobile).

### 6.6 Cards

Fill `--card`, border 2 px `--line`, radius 10 px, padding 20 px (14 px for compact mobile cards). Title (display 22 px) with 6 px below, description in `--mu`. Fully clickable cards use a single link with a visible focus ring.

### 6.7 Entity tile

Horizontal card: 64 px sprite, 14 px gap, name (display 20 px) above a muted one-line description.

### 6.8 Inputs and labels

44 px high (48 px in the hero search), padding 0 12 px to 16 px, border 2 px `--ib`, radius 8 px, fill `--card`, text `--tx`, Nunito 16 px weight 600. Labels sit 6 px above the input, weight 800. Every input has a visible or screen-reader label.

### 6.9 Tables

Header row with 2 px `--line` bottom border, cell padding 8 px, minimum table width 360 px inside an `overflow-x: auto` wrapper. On mobile below 480 px, convert to stacked rows when a table has more than three columns.

### 6.10 Tabs (crop page)

Row of buttons, 8 px gap, 16 px below. Selected tab uses the primary style, others use outline. On mobile they become an accordion.

### 6.11 Sprite placeholder

`--sp2` fill, 2 px dashed `--ib` border, radius 6 px, centred label. Replace with the real pixelated image (`image-rendering: pixelated`, integer scales 32, 48, 64, 96) once art rights are settled.

## 7. Mobile Specifications

| Item | Value |
|---|---|
| Design frame | 390 by 844 px |
| Side padding | 16 px |
| Top and bottom content padding | 20 px |
| Hero title | Display 34 px, line height 1.1 |
| Tool card padding and gap | 14 px padding, 10 px gap |
| Section heading | Display 22 px, 16 px above and 10 px below |
| Browse chips | Outline buttons, 44 px high, 14 px text, 8 px gap, wrap to new rows |
| Bottom bar | 56 px plus safe area |
| Safe areas | `viewport-fit=cover`, padding with `env(safe-area-inset-*)` |
| Viewport height | `dvh` units, never `100vh` |

## 8. Dark Mode

- Same layout and spacing, only the variables change (section 2.1).
- Elevation is shown with a lighter card fill (`#172A2F` on `#0F1E22`) plus the border, not with shadows.
- The filled primary button keeps its light-mode colour (`#1F6F78`) with white text; outline buttons, links and indicators switch to brighter teal for contrast.
- Respect `prefers-color-scheme` on first visit, then store the person's choice. Use `next-themes` with `attribute="class"`.
- Test every new component in both modes.

## 9. Seasonal Theming

Season pages (`/calendar/[season]`, season filters) set `data-season` on the page wrapper. The season fill from section 2.2 replaces `--pr` there, and `--po` keeps its default so outline controls stay legible. Always pair the season colour with its name or icon. Check contrast again for any new season-coloured text.

## 10. Iconography

- Style: 24 px grid, stroke 2 to 2.5 px, round caps and joins, `currentColor`.
- Library: lucide-react. Mockup icons map to `House`, `Search`, `CalendarDays`, `Calculator`, `Menu`, `Moon` and `Sun`.
- Icon-only buttons need an `aria-label`. Decorative icons use `aria-hidden="true"`.

## 11. Motion

- Keep motion minimal: 150 to 200 ms colour and opacity transitions on hover and focus, 200 ms for drawers and sheets.
- Wrap non-essential animation in `motion-safe:` and honour `prefers-reduced-motion`.
- Pixel art must never be smoothed or scaled by fractional amounts.

## 12. Accessibility Summary

- WCAG 2.2 AA target for text contrast (see section 2.3 for the two items to fix).
- 44 px minimum touch targets, with at least 8 px between neighbouring targets.
- Visible focus ring on every interactive element.
- Semantic landmarks: `header`, `nav` (labelled), `main`, `footer`. One `h1` per page.
- Real `button`, `a`, `input` and `label` elements. No clickable divs.
- Tabs follow the ARIA tab pattern, or use an accordion on mobile.
- No information that appears only on hover.

## 13. Page Inventory (designed so far)

| Page | Artboards | Notes |
|---|---|---|
| Home | desktop light and dark, mobile light and dark | Logo lockup, hero search, season chips, Tools, Browse the guide, Popular this season |
| Crop page (example: Parsnip) | desktop light and dark | Breadcrumb, stats, price table, calculator panel |
| Browse sections linked from home | not yet designed | Achievements, Festivals, Monster Eradication Goals, Quests, Random Events |

## 14. Open Items

1. Export favicon and app icon files from the logo, and finalise the name check in section 1.1.
2. Fix input border contrast (`--ib`) as proposed in section 2.3.
3. Update `SKILL.md` with the colour tokens from this file.
4. Design the five browse sections: Achievements, Festivals, Monster Eradication Goals, Quests and Random Events.
5. Design the search overlay, the calculator pages, a calendar view and a mobile menu drawer.
6. Decide on final sprite art (original, redrawn or licensed) before replacing placeholders.
7. Add JetBrains Mono to the stat blocks if the mono role is kept.
8. Define the destructive and warning colours when forms and trackers need them.
