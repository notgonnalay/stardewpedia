---
name: stardewpedia-frontend
description: Build and style UI for Stardewpedia, the unofficial Stardew Valley fan guide website (Next.js App Router, TypeScript, Tailwind, shadcn/ui, Google Fonts via next/font, Supabase for data and auth, deployed on Vercel). Use this skill whenever the user asks for any page, component, layout, theme, dark mode, font, colour, logo, navigation, bottom tab bar, search UI, sign-in UI, entity page (crop, fish, villager, recipe, bundle, achievement, festival, quest, monster goal, random event), calculator or tracker UI, or mobile/responsive work for the site, even if they do not mention shadcn, fonts, design or Supabase explicitly. Also use it when adding shadcn components, changing typography, wiring Supabase clients into the UI, setting up seasonal themes, or making the UI PWA/mobile-app ready.
---

# Stardewpedia Frontend

Project-specific rules for building the UI of Stardewpedia, the unofficial Stardew Valley fan guide. The goal is a cosy, readable, fast, mobile-first guide that feels like Stardew without copying its copyrighted art.

Source documents: `stardewpedia-architecture.md` (system design), `designplan.md` (colour tokens, type scale, spacing, components, logo) and `database-supabase.md` with `stardewpedia-schema.supabase.sql` (data model and access rules). This skill covers the UI layer: shadcn/ui, Google Fonts, theming, responsive behaviour, component patterns and how the UI talks to Supabase. When a value here conflicts with `designplan.md`, `designplan.md` wins.

## Stack constraints (do not deviate without asking)

- Next.js App Router, TypeScript, Tailwind CSS, deployed on Vercel.
- **shadcn/ui** for all base components. **lucide-react** for icons.
- **Google Fonts through `next/font/google` only.** Never use a `<link>` tag or CSS `@import` to fonts.googleapis.com.
- Pages are **Server Components by default**. Add `"use client"` only to small interactive islands (filters, calculators, search, trackers).
- Game data comes from typed files in `packages/data`; UI never hardcodes game facts.
- Pure calculation logic lives in `packages/game-logic`. UI components call it and never reimplement formulas.
- **Supabase** provides data, auth and file storage. Public content pages are static and read from `packages/data` at build time, not from Supabase at request time. Signed-in features (progress, plans, favorites) use Supabase with Row Level Security.
- The **secret key** and database password never appear in client components or in any `NEXT_PUBLIC_` variable. The browser uses only the publishable key.
- Light and dark themes are both required for every component.

## Workflow when asked to build UI

1. Check what already exists in `components/ui/` and `components/` before creating anything.
2. Pick shadcn components from the mapping table below. If one is missing, add it with the CLI instead of hand-writing it.
3. Build the mobile layout first (360 px wide), then add `sm`/`md`/`lg` enhancements.
4. Use theme tokens (`bg-background`, `text-foreground`, `bg-primary`, `border`), never raw hex colours or arbitrary values where a token exists.
5. Run typecheck and lint. Confirm the page works at 360, 768 and 1280 px, in light and dark mode, and in at least two seasons.

## shadcn/ui setup and rules

Initialise once, then add components as needed. Verify current commands against https://ui.shadcn.com/docs since the CLI evolves.

```bash
npx shadcn@latest init
npx shadcn@latest add button card badge tabs table accordion command dialog sheet drawer \
  tooltip popover select checkbox progress slider toggle-group skeleton sonner scroll-area \
  breadcrumb separator input label
```

Rules:

- Components are copied into `components/ui/`. **Do not edit them for one-off needs.** Wrap them in a feature component (for example `components/crop/CropCard.tsx`) or pass `className`.
- Edit `components/ui/*` only for project-wide changes, such as adding the `touch` button size below.
- Use the `cn()` helper from `lib/utils` to merge classes, and `class-variance-authority` for variants.
- Import with the `@/` alias, for example `import { Button } from "@/components/ui/button"`.
- Check whether the project uses Tailwind v4 (tokens in `globals.css` with `@theme inline`) or v3 (`tailwind.config`), and follow the one in use. Do not mix them.

### Component mapping

| Need | shadcn component(s) |
|---|---|
| Entity summary tile (crop, fish, villager) | `Card`, `Badge`, `ItemSprite` (custom) |
| Entity detail sections | `Tabs` (desktop), `Accordion` (mobile) |
| Stats and price tables | `Table` inside `ScrollArea` on desktop, stacked `Card` list on mobile |
| Site search (`Ctrl/Cmd+K`) | `Command` inside `Dialog` |
| Mobile navigation | `Sheet` (side), optional bottom tab bar (custom) |
| Mobile filters | `Drawer` (bottom sheet); on desktop use a sidebar |
| Filters and options | `ToggleGroup` (season), `Select`, `Checkbox`, `Slider` |
| Progress trackers (bundles, perfection) | `Checkbox`, `Progress` |
| Help text on hover | `Tooltip` **plus** a tap alternative (`Popover`) |
| Loading states | `Skeleton` |
| Feedback toasts | `sonner` |
| Breadcrumbs (also emit JSON-LD) | `Breadcrumb` |

## Google Fonts

Use `next/font/google`. It self-hosts the font files at build time, so there are no runtime requests to Google, no layout shift and no privacy banner needed for fonts.

### Font roles

| Role | Font | Use for |
|---|---|---|
| Display | **Pixelify Sans** | Page titles, section headings (H1 to H3), logo text. Keep at 20 px and above. |
| Body / UI | **Nunito** | Paragraphs, buttons, forms, tables, navigation. Rounded and friendly, very legible on phones. |
| Mono | **JetBrains Mono** | Numbers in stat blocks, prices, formulas, code snippets. |

Rules:

- Maximum **three families**. Do not add more without asking.
- Never set body copy, table cells or small labels in the pixel display font. It hurts readability. Press Start 2P is too hard to read for anything beyond a tiny decorative accent, so avoid it.
- Always `subsets: ["latin"]` and `display: "swap"`. Add other subsets only when localisation needs them.
- Load only the weights actually used. Pixelify Sans and Nunito are variable fonts, so no `weight` is needed. For non-variable fonts, list explicit weights.
- Name the CSS variables differently from the Tailwind tokens (see below) to avoid self-referencing variables.

### `app/layout.tsx`

```tsx
import type { Metadata, Viewport } from "next";
import { Pixelify_Sans, Nunito, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const pixelify = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixelify", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: { default: "Stardewpedia", template: "%s | Stardewpedia" },
  description: "Unofficial fan guide to Stardew Valley: crops, fish, villagers, gifts, bundles, quests, festivals and tools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${pixelify.variable} ${nunito.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Wiring fonts into Tailwind v4 (`app/globals.css`)

```css
@theme inline {
  --font-sans: var(--font-nunito), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-pixelify), ui-monospace, monospace;
  --font-mono: var(--font-jetbrains), ui-monospace, monospace;
}

@layer base {
  h1, h2, h3 { @apply font-display tracking-tight; }
}
```

For Tailwind v3, add the same three families under `theme.extend.fontFamily` in `tailwind.config.ts`, using `var(--font-nunito)` and so on.

## Theme and colour tokens

Values come from `designplan.md` (section 2). Use shadcn's CSS-variable theming. Hex values are fine; convert to oklch only if the project's Tailwind setup requires it, keeping the colours identical. Light is the default (soft sky-blue background), dark is applied with the `.dark` class through `next-themes`.

```css
:root {
  --radius: 0.5rem;
  --background: #EEF4FA;
  --foreground: #17323A;
  --card: #FFFFFF;
  --card-foreground: #17323A;
  --popover: #FFFFFF;
  --popover-foreground: #17323A;
  --primary: #1F6F78;
  --primary-foreground: #FFFFFF;
  --secondary: #CFE5E0;
  --secondary-foreground: #17323A;
  --muted: #CFE5E0;
  --muted-foreground: #4B6870;
  --accent: #CFE5E0;
  --accent-foreground: #17323A;
  --destructive: #B42318;          /* proposed, not yet contrast-checked */
  --border: #B7D3CC;               /* decorative borders only */
  --input: #5E8F89;                /* control borders, at least 3:1 on white */
  --ring: #1F6F78;
  --brand: #1F6F78;                /* outline buttons, active indicators, focus */
  --link: #17565D;
}

.dark {
  --background: #0F1E22;
  --foreground: #E6F1EF;
  --card: #172A2F;
  --card-foreground: #E6F1EF;
  --popover: #172A2F;
  --popover-foreground: #E6F1EF;
  --primary: #1F6F78;              /* filled buttons keep this, with white text */
  --primary-foreground: #FFFFFF;
  --secondary: #223A40;
  --secondary-foreground: #E6F1EF;
  --muted: #223A40;
  --muted-foreground: #9DB8B6;
  --accent: #223A40;
  --accent-foreground: #E6F1EF;
  --destructive: #F28B82;          /* proposed, not yet contrast-checked */
  --border: #2B474D;
  --input: #6A9399;
  --ring: #6CCAD2;
  --brand: #6CCAD2;
  --link: #7FD3DA;
}

/* Season accents: set data-season on a page wrapper. Always pair with the season name or icon. */
[data-season="spring"] { --primary: #3F7A32; --primary-foreground: #FFFFFF; }
[data-season="summer"] { --primary: #F2C94C; --primary-foreground: #17323A; }
[data-season="fall"]   { --primary: #B5541C; --primary-foreground: #FFFFFF; }
[data-season="winter"] { --primary: #4A5FA8; --primary-foreground: #FFFFFF; }
```

Expose `--brand` and `--link` to Tailwind (`--color-brand`, `--color-link`) in the `@theme inline` block. Change the shadcn `outline` button variant to use `border-brand text-brand`, and use `text-link` for inline links.

Rules:

- Season pages (`/calendar/[season]`, season filters) set `data-season` so primary buttons and badges follow the season. Keep `--brand` and `--ring` unchanged so outline controls and focus rings stay legible.
- Never rely on colour alone. Pair season colours with an icon and a text label.
- Test every new component in both themes. Dark mode uses `next-themes` (`ThemeProvider` with `attribute="class"`), starting from the system preference and then remembering the person's choice.
- `--border` is decorative. Any border that is the only indicator of a control (inputs, checkboxes, selects) uses `--input`.

## Mobile-first rules

- Default styles target 360 px. Enhance upward with `sm`, `md`, `lg`.
- **Touch targets are at least 44 by 44 px.** shadcn's default `Button` is 36 px tall (`h-9`) and the `icon` size is `size-9`. Add a `touch` size variant in `components/ui/button.tsx` and use it on mobile-primary actions, filter chips and list rows:

```tsx
// inside buttonVariants -> variants.size
touch: "h-11 min-w-11 px-5 has-[>svg]:px-4",
```

- Tables never overflow the page. Wrap in `ScrollArea` with a sticky first column, or render stacked cards below `md`.
- No hover-only information. Every `Tooltip` needs a tap equivalent.
- Use `min-h-dvh`, not `100vh`. Add `pb-[env(safe-area-inset-bottom)]` on bottom bars and fixed footers.
- Support `prefers-reduced-motion` (use `motion-safe:` and `motion-reduce:` utilities).
- Avoid layout shift: give images explicit width and height, and reserve space with `Skeleton`.

## Project components to build once and reuse

### `Logo`

The Stardewpedia lockup: pixel-sprout mark (SVG, 12 by 12 grid, `shape-rendering="crispEdges"`) plus the wordmark in Pixelify Sans 700, colour `text-link`. Mark 36 px with a 10 px gap and 26 px text in the desktop header, 30 px with an 8 px gap and 22 px text on mobile. It links to `/` with `aria-label="Stardewpedia home"`. The SVG source is in `designplan.md` section 1.1. Reuse the same mark for the favicon and app icons.

### `ThemeToggle`

Icon-only outline button (Lucide `Moon` in light mode, `Sun` in dark mode), 44 px, `aria-label` "Switch to dark mode" or "Switch to light mode". On mobile it lives in the menu drawer.

### `BottomTabBar` (below `md` only)

Five equal tabs: Home (`House`), Search (`Search`), Calendar (`CalendarDays`), Tools (`Calculator`), Menu (`Menu`). Each is a 24 px line icon above a 12 px label, 56 px tall, on `bg-card` with a top border. The active tab uses `text-link`, bold text, a 3 px `bg-brand` bar on its top edge and `aria-current="page"`. Add `pb-[env(safe-area-inset-bottom)]` to the bar and reserve matching bottom padding on the page so content is never hidden. Hide it from `md` upward, where the header nav takes over.

### `ItemSprite` (pixel art)

```tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ItemSprite({ src, alt, size = 32, className }: {
  src: string; alt: string; size?: number; className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className={cn("[image-rendering:pixelated]", className)}
    />
  );
}
```

Use integer scale factors (32, 48, 64) so pixels stay crisp. Use `alt=""` only when the sprite sits next to a visible text label. Do not use ConcernedApe's copyrighted sprites unless the asset policy in the architecture doc has been checked. Placeholder or original art is the safe default.

### `SeasonBadge`, `QualityBadge`

Wrap shadcn `Badge` with `cva` variants (seasons: spring, summer, fall, winter; quality: normal, silver, gold, iridium). Each includes an icon and a text label, never colour only. Do not edit `components/ui/badge.tsx` for this.

### `EntityCard`

A single `Card`-based tile used by crop, fish and villager indexes: sprite, name, two or three key stats, season badges. It must be fully clickable (one link covering the card, with a visible focus ring).

### `EntityPageLayout`

Shared layout for `/crops/[slug]`, `/fish/[slug]` and similar: breadcrumb, title (display font), summary stats, sections (`Tabs` on `md` and up, `Accordion` below), related items, "Last verified for game version X" note, and a "Report a mistake" link.

### `SearchCommand`

`Command` inside `Dialog`, opened with `Ctrl/Cmd+K` and a visible search button in the header (important on mobile). The index loads lazily on first open. Group results by type (Crops, Fish, Villagers, Guides).

## Page patterns

- **Index pages** (`/crops`, `/fish`, `/villagers`): server-rendered grid of `EntityCard`, with a small client-side filter island (`ToggleGroup` for season, `Select` for sort). Filters on mobile open in a `Drawer`.
- **Tool pages** (`/tools/*`): static shell, one client island, state reflected in the URL query string, `localStorage` as a local-first fallback. Show results in a `Card`. Inputs use `Label` plus `Input`, `Select` or `Slider`.
- **Guide pages** (MDX): map MDX elements to styled components (`h2`, `table`, `blockquote`, links to entity pages), keeping a readable line length of about 65 characters (`max-w-prose`).
- **Browse sections** (Achievements, Festivals, Monster Eradication Goals, Quests, Random Events): each has an index page (card grid with filters in a small client island, filters in a `Drawer` on mobile) and detail pages built on `EntityPageLayout`. Festivals also appear on the calendar. Achievements, quests and monster goals can show a tick-off checkbox for signed-in or local-only progress.

## Supabase in the UI

- Create three helpers: `lib/supabase/client.ts` (browser client, publishable key), `lib/supabase/server.ts` (cookie-based server client using `@supabase/ssr`) and `lib/supabase/admin.ts` (secret key, starts with `import "server-only"`).
- Tables live in the `game` and `app` schemas, so call `.schema("app")` or `.schema("game")` explicitly. Use the generated TypeScript types and regenerate them after every migration.
- Static content pages read from `packages/data`. Do not fetch game content from Supabase on every request.
- Sign-in UI: a shadcn `Dialog` with Google, Discord and email-link buttons. No custom password forms. Add an `/auth/callback` route that exchanges the code for a session.
- Signed-out state: tools and trackers still work with `localStorage`. After sign-in, offer to sync (`Sonner` toast with the result). Never block a tool behind sign-in.
- Handle `loading`, `empty` and `error` states for every query with `Skeleton`, an empty-state `Card` and a toast.
- File uploads (plan thumbnails) go to the `plan-thumbnails` bucket under `<user id>/`.
- Assume Row Level Security is the only protection: never trust a hidden button or a client-side role check. Hide admin UI for non-editors for convenience, but the database enforces the rule.

## Accessibility checklist

- Every interactive element is keyboard reachable, with a visible focus ring (shadcn's `ring` token).
- Headings follow a logical order, with one `h1` per page.
- Sprites have meaningful `alt` text, or `alt=""` when decorative.
- Form controls always have a `Label`.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Target WCAG 2.2 AA. Run axe against the page when possible.

## Do not

- Do not add more than three font families or load fonts through `<link>` or `@import`.
- Do not hardcode hex colours or inline `style` for theming. Use tokens.
- Do not edit `components/ui/*` for one-off tweaks.
- Do not make a page a Client Component just to use one interactive element. Extract a small client island instead.
- Do not use `localStorage` during server rendering or in the first render path without a guard.
- Do not copy wiki text or official game art into components or content.
- Do not import the Supabase admin (secret key) client into a file that can reach the browser. Put it in a file that imports `server-only`.

## Definition of done for UI work

- Typecheck and lint pass.
- Verified at 360, 768 and 1280 px, in light and dark mode, in at least two seasons.
- Touch targets are at least 44 px on mobile and tables do not overflow.
- No new layout shift, fonts load through `next/font`, and JS added to content pages is minimal.
- Component reuses shadcn primitives and project tokens, with no duplicated variants.
