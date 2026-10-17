# Stardewpedia: System Architecture

Target platform: Vercel, with Supabase for database, auth and file storage. Version 1.1, October 2026.

## 1. Goals, Assumptions and Scope

**Product:** Stardewpedia, a fast, searchable, SEO-friendly unofficial fan guide for Stardew Valley covering crops, fish, villagers and gifts, bundles, recipes, skills, the calendar, festivals, quests, achievements, Monster Eradication Goals, random events, mining and farm layouts, plus interactive tools.

**Assumptions (change these and the design adapts):**
- Solo developer or a small team, so operational simplicity matters more than raw flexibility.
- Content-heavy and read-mostly: roughly 95% of traffic is anonymous readers arriving from Google.
- Interactive tools (profit calculator, gift finder, bundle tracker) are the differentiator.
- Optional user accounts come later, only to sync progress across devices.
- Game version targeted: 1.6.x, with a version field on all data so future patches are manageable.

**Non-goals for v1:** forums, user-generated guides, native mobile apps, real-time features.

**Quality targets:**

| Area | Target |
|---|---|
| Largest Contentful Paint | under 2.0 s on mobile 4G |
| Core Web Vitals | all green in field data |
| Availability | 99.9% (inherited from Vercel's edge) |
| Search | results in under 100 ms, client-side |
| Accessibility | WCAG 2.2 AA |
| Monthly cost at launch | near zero (free or hobby tiers), under about 50 USD at 500k pageviews |

## 2. Architecture Principles

1. **Static first.** Game data barely changes, so pre-render everything possible and serve it from the CDN.
2. **Content as data.** Every crop, fish and villager is a typed, validated record, never hand-built HTML. Pages are generated from data.
3. **Dynamic only where needed.** Accounts, saved progress and analytics are the only runtime-dynamic parts.
4. **Client-side tools.** Calculators run in the browser from the same data bundle, so they cost no server time and work offline.
5. **Fail safe.** If the database goes down, the whole guide must still work. User features degrade gracefully.
6. **Boring technology.** Prefer well-supported tools that Vercel handles natively.

## 3. Technology Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router), TypeScript | First-class Vercel support, SSG and ISR, great SEO primitives |
| Styling | Tailwind CSS plus shadcn/ui (Radix primitives), light and dark themes | Fast to build, accessible by default |
| Fonts | Google Fonts through `next/font/google` (Pixelify Sans, Nunito, JetBrains Mono) | Self-hosted at build time, no layout shift |
| Content | MDX for prose guides, JSON or YAML for structured game data | Writers get Markdown, tools get typed data |
| Validation | Zod schemas | Build fails if any data record is malformed |
| Search | Orama or Pagefind (static index built at deploy) | No search server, instant results |
| Database | Supabase Postgres (schemas `game`, `app`, `private`), supabase-js for user data, Drizzle or postgres.js for server jobs | Row Level Security, Auth and Storage on one platform, standard Postgres underneath |
| Auth (phase 2) | Supabase Auth with Google, Discord and email magic link (`@supabase/ssr` for cookie sessions) | Gamers commonly use Discord, and the same sessions work in a future mobile app |
| Cache and rate limiting | Upstash Redis (Marketplace) | Edge-compatible, simple limits |
| Images and files | Vercel Image Optimization, source files in repo or Supabase Storage buckets | AVIF and WebP, responsive sizes, user uploads with per-user access rules |
| Feature flags | Vercel Edge Config | Millisecond reads, no redeploy |
| Analytics | Vercel Web Analytics plus Speed Insights | Privacy-friendly, no cookie banner needed in most cases |
| Errors | Sentry | Source maps, release tracking |
| CI | GitHub Actions plus Vercel Git integration | Lint, test and typecheck gate before preview deploys |
| Testing | Vitest (unit), Playwright (e2e), axe (accessibility) | Covers logic, flows and a11y |

## 4. High-Level System Diagram

```
                          Visitors (browser / mobile)
                                    |
                                    v
                     +-----------------------------+
                     |   Vercel Edge Network (CDN) |
                     |  - static HTML, JS, images  |
                     |  - Middleware (bot rules,   |
                     |    redirects, geo/flags)    |
                     +--------------+--------------+
                                    |
          +-------------------------+--------------------------+
          |                         |                          |
          v                         v                          v
  Static + ISR pages        Route Handlers /            Image Optimization
  (guides, entity pages,    Server Actions              (sprites, screenshots)
  tool shells)              (accounts, sync)
          |                         |
          |                         v
          |            +------------+-------------+
          |            | Supabase Auth/DB/Storage |
          |            | Upstash Redis (limits)   |
          |            | Edge Config (flags)      |
          |            +--------------------------+
          |
          v
  Build-time pipeline: data files + MDX -> Zod validation -> page generation
                       -> search index -> sitemap -> OG images

  Observability: Vercel Analytics, Speed Insights, Sentry, uptime monitor
```

## 5. Content and Data Architecture

This is the heart of the site. Get it right and everything else is easy.

### 5.1 Entity types

Each type is one folder of data files, one Zod schema, and one set of page templates:

- **Crops** (season, growth days, regrow days, seed price and source, sell prices by quality, XP, bundle usage)
- **Fish** (location, time window, season, weather, difficulty, behavior, price, bundle and quest usage)
- **Villagers** (birthday, address, loved, liked, neutral, disliked and hated gifts, heart events, marriage candidate flag)
- **Items** (a master registry that other entities reference by stable ID)
- **Recipes** (cooking and crafting, ingredients, buffs, source)
- **Bundles** (community center rooms, required items, rewards)
- **Locations** (mines floors, Skull Cavern, farm types, secret spots)
- **Skills and Professions**
- **Events and Festivals** (calendar entries)
- **Achievements** (in-game achievements, how to earn them, rewards)
- **Monsters and Monster Eradication Goals** (stats, locations, drops, kill targets and rewards)
- **Quests** (story, special orders and help-wanted, with steps and rewards)
- **Random Events** (night events and other surprises, with conditions and outcomes)
- **Guides** (long-form MDX articles that link to entities)

### 5.2 Rules for the data

- Every record has a **stable slug ID** (for example `parsnip`, `largemouth-bass`). Cross-references use IDs, never names.
- Every record has `gameVersion`, `lastVerified` and `sources`.
- A build step checks referential integrity: a gift list that points to a missing item fails the build.
- Localization-ready: user-facing strings live under a `name` and `description` map keyed by locale, with English only at launch.

### 5.3 Example schema (Crop)

```ts
const Crop = z.object({
  id: z.string(),
  name: z.string(),
  seasons: z.array(z.enum(["spring","summer","fall","winter"])),
  growthDays: z.number().int().positive(),
  regrowDays: z.number().int().positive().nullable(),
  seed: z.object({ itemId: z.string(), price: z.number(), vendors: z.array(z.string()) }),
  sellPrice: z.object({ base: z.number(), silver: z.number(), gold: z.number(), iridium: z.number() }),
  xp: z.number(),
  bundleIds: z.array(z.string()),
  gameVersion: z.string(),
  lastVerified: z.string(),
});
```

### 5.4 Where the data comes from, and a legal note

Stardew Valley's game assets, art and text belong to ConcernedApe. Practical guidance:
- Write all guide text yourself. Do not copy wiki pages. The community wiki is licensed under a Creative Commons license with attribution and non-commercial conditions, so verify the current terms before reusing anything, especially if you plan ads.
- Facts such as numbers and mechanics are generally fine to record, but build your dataset from your own play, community-documented values you cross-check, and your own extraction work.
- Sprites and icons are the riskiest part. Either redraw, use a clearly fan-art style, or limit use and check the developer's published fan content policy.
- Add a footer disclaimer: unofficial fan site, not affiliated with or endorsed by ConcernedApe.
- The site name starts with "Stardew", which is part of the game's trademark. Check the developer's fan content policy before registering a domain.

This is general information, not legal advice. Check the current fan content policy yourself.

### 5.5 Data update workflow

1. Game patch released, so open a GitHub issue from a template.
2. Update data files on a branch, so Vercel builds a preview.
3. The Zod and integrity checks run in CI. A diff report shows exactly which records changed.
4. Merge, then production redeploys. Changed entity pages show a "Updated for 1.6.x" badge.

## 6. Rendering Strategy by Route

| Route | Strategy | Notes |
|---|---|---|
| `/` | Static | Revalidated on deploy |
| `/crops`, `/fish`, `/villagers` (indexes) | Static with client filtering | Filter and sort run in the browser |
| `/crops/[slug]`, `/fish/[slug]`, `/villagers/[slug]` | SSG via `generateStaticParams` | Several hundred pages, built once |
| `/guides/[slug]` | SSG from MDX | Table of contents auto-generated |
| `/achievements`, `/festivals/[slug]`, `/quests/[slug]`, `/monsters`, `/monster-goals`, `/random-events` | SSG with client filtering on indexes | Built from the same data files as the other entities |
| `/calendar` and `/calendar/[season]` | Static plus client interactivity | Birthdays and festivals overlay |
| `/tools/*` | Static shell plus client-side logic | Data bundled per tool, code-split |
| `/search` | Client-side | Index loaded lazily |
| `/account`, `/api/*` | Dynamic (Node runtime) | Phase 2 only |
| `/sitemap.xml`, `/robots.txt`, `/og/[...]` | Generated at build or on demand | OG images via `next/og` |

Because the data is versioned in the repo, you rarely need ISR. If you later pull data from a CMS or database, switch entity pages to ISR with on-demand revalidation through a signed webhook.

## 7. Interactive Tools

Build each tool as a pure TypeScript core plus a thin UI:

- `packages/game-logic` holds pure functions such as `cropProfitPerDay(crop, options)`, with no React and no browser APIs. That makes them unit-testable and reusable.
- **Crop Profit Calculator:** season, days remaining, fertilizer, farming level, profession, Greenhouse or not.
- **Gift Finder:** pick a villager or an item and see loved and hated matches.
- **Bundle Tracker:** checklist with progress, stored in `localStorage` first and synced to the account later.
- **Fishing Planner:** what is catchable now, filtered by season, time, weather and location.
- **Farm Planner (stretch):** grid editor with sprinkler range overlays and export to image.
- **Perfection Tracker (stretch):** checklist of the full completion requirements.

State lives in the URL where it makes sense (for example `/tools/crop-calculator?season=summer&day=5`), so results are shareable and indexable.

## 8. Accounts and Progress Sync (Phase 2, on Supabase)

Only build this after the static site has traffic. Supabase provides the building blocks, so almost no custom backend code is needed.

### 8.1 Data model

The full relational model is in `stardewpedia-schema.supabase.sql` and is explained in `database-schema.md` and `database-supabase.md`. In short:

- `game` schema: reference data (items, crops, fish, villagers, quests, festivals, achievements, monsters, random events and more), loaded from `packages/data`.
- `app` schema: `profiles` (linked to Supabase Auth users), `farms` (one per tracked save), progress tables keyed by `farm_id`, farm plans, saved calculations, favorites, reminders, feedback and operations tables.
- `private` schema: security helper functions, never exposed through the API.

### 8.2 Access model

- **Supabase Auth** handles Google, Discord and email magic links, sessions and token refresh. Next.js uses `@supabase/ssr` for cookie sessions.
- **Row Level Security** is on for every table. Signed-out visitors read published content only. Signed-in users read and write only their own farms, progress and plans. Editors and admins manage content. Users cannot change their own role.
- **Two access paths:** supabase-js with the publishable key for user features (RLS applies), and server-only code using the secret key or a direct Postgres connection for the content loader, newsletter, logging and other jobs (RLS bypassed).
- **Route Handlers** are only needed for server-only work: newsletter sign-up, anonymous "report a mistake", search logging and account deletion, all rate limited with Upstash.
- Validate JSON payloads (farm plan layouts, calculator parameters) with Zod before saving.

### 8.3 Local-first sync

The tools always work offline against `localStorage` or IndexedDB. Signing in uploads and merges progress row by row, using each row's `updated_at` and the farm's `revision` counter, so a second device only fetches what changed. Un-ticking an item updates a flag instead of deleting the row, so removals sync too. Supabase Realtime can optionally push live updates between devices.

## 9. Search

- A build script flattens all entities and guides into search documents (title, aliases, type, short text, URL).
- Aliases matter: players search "qi gems", "ancient fruit wine", and common typos.
- Orama or Pagefind produces a compact index (tens of kilobytes) loaded on first focus of the search box.
- A command-palette UI (`Ctrl/Cmd+K`) gives instant navigation.

## 10. SEO and Discoverability

- One canonical, descriptive URL per entity, for example `/fish/sturgeon`. No query-string duplicates.
- Per-page `generateMetadata` for title, description, canonical and Open Graph.
- JSON-LD structured data: `BreadcrumbList` everywhere, `Article` on guides, `FAQPage` where a guide truly has Q&A.
- Auto-generated `sitemap.xml` split by entity type, plus `robots.txt`.
- Generated Open Graph images showing item name and key stats.
- Internal linking by design: every mention of an entity in MDX or data auto-links to its page through a remark plugin.
- Hub pages ("Best crops for Summer", "All loved gifts") built from data, which capture long-tail searches.
- Core Web Vitals discipline: no layout shift from images, fonts via `next/font`, minimal third-party scripts.

## 11. Performance Strategy

- Static HTML from the CDN, with long-lived immutable caching for hashed assets.
- `next/image` with explicit dimensions. Sprites are pixel art, so use `image-rendering: pixelated` and small PNG or WebP sprite sheets.
- Route-level code splitting. Heavy tools (the farm planner) load only on their own page.
- Data bundles per tool contain only the fields that tool needs, not the full dataset.
- Prefetch on hover for entity links. Keep JavaScript on content pages close to zero where possible using Server Components.
- Performance budget enforced in CI (for example Lighthouse CI: JS under 150 KB on content pages).

## 12. Security

- Security headers via `next.config`: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS (Vercel provides HTTPS).
- All secrets in Vercel environment variables, scoped per environment. Never committed.
- Zod validation and parameterized queries (Drizzle) on every server input.
- Supabase Auth with cookie sessions through `@supabase/ssr`, Row Level Security on every table, and no table exposed to the Data API without explicit grants. The secret key lives only in server environment variables and is never prefixed with `NEXT_PUBLIC_`.
- Rate limiting on auth and write endpoints. Bot rules through Vercel Firewall, including its WAF and rate limiting features.
- Dependency hygiene: Dependabot or Renovate, plus `npm audit` in CI.
- Privacy: collect the minimum, publish a short privacy policy, offer account deletion and data export once accounts exist.
- User-shared plans are sanitized and rendered as data, never as raw HTML.

## 13. Environments, CI/CD and Deployment

| Environment | Source | Database | Purpose |
|---|---|---|---|
| Local | your machine | Supabase local stack (`supabase start`) or a dev project | development |
| Preview | every pull request | Shared staging project (or Supabase branching, if your plan includes it) | review and QA |
| Production | `main` branch | Supabase production project | live site |

**Pipeline:**
1. Push or open a PR, so GitHub Actions run typecheck, lint, unit tests, data validation and referential integrity.
2. Vercel builds a preview and posts the URL on the PR.
3. Playwright e2e and axe accessibility checks run against the preview.
4. Lighthouse CI checks the performance budget.
5. Merge to `main`, then Vercel promotes to production.
6. Database migrations (Supabase CLI migration files in `supabase/migrations`) run as a gated step before promotion. They must be backward compatible so rollbacks are safe.
7. Rollback: instant rollback to the previous deployment from the Vercel dashboard.

**Domain and DNS:** custom domain on Vercel, with `www` redirecting to apex (or the reverse), HTTPS automatic.

## 14. Observability

- **Vercel Web Analytics:** page views and top content, which tells you which guides to write next.
- **Speed Insights:** real-user Core Web Vitals per route.
- **Sentry:** client and server errors, tied to release versions.
- **Uptime monitor** (Better Stack or similar) hitting the home page and one API route.
- **Search analytics:** log anonymous zero-result queries, which is a gold mine for missing content.
- Alert on error-rate spikes and failed deploys through Slack or Discord webhooks.
- **Supabase logs and advisors:** review the security and performance advisors regularly, especially after schema changes, and watch for tables exposed without Row Level Security.

## 15. Repository Structure

```
stardew-guide/
  apps/
    web/                    # Next.js app
      app/
        (marketing)/        # home, about
        crops/ fish/ villagers/ recipes/ bundles/ guides/
        tools/
        api/v1/
      components/
      lib/
  packages/
    data/                   # JSON/YAML game data + Zod schemas + integrity checks
    game-logic/             # pure calculation functions + tests
    content/                # MDX guides
    ui/                     # shared components
  scripts/                  # build-time: search index, sitemap, OG assets, content loader
  supabase/                 # migrations, config.toml, seed data
  e2e/                      # Playwright tests
  .github/workflows/
```

A simple npm or pnpm workspace is enough. Turborepo is optional and worth adding once builds slow down. Vercel supports monorepos directly (set the root directory to `apps/web`).

## 16. Cost and Scaling Outlook

| Stage | Traffic | Expected setup | Rough cost |
|---|---|---|---|
| Launch | up to 50k views/month | Vercel Hobby or Pro, no database | 0 to 20 USD |
| Growth | 100k to 500k views/month | Vercel Pro, Supabase Free or Pro tier, Upstash free | 20 to 50 USD |
| Large | millions of views/month | Pro with usage limits and spend caps, ISR only where needed | scales with bandwidth |

Note that Vercel's Hobby plan is restricted to non-commercial use. If you run ads or affiliate links, plan for Pro. Check current pricing and limits on Vercel's site before committing, as they change. Set a **spend cap and budget alerts** from day one. Because the site is static, scaling is mostly a bandwidth question, and the main cost levers are image sizes and avoiding unnecessary serverless calls.

## 17. Roadmap

**Phase 1: MVP (about 4 to 6 weeks)**
- Data schemas, 100+ core records (crops, fish, villagers, gifts), entity pages, indexes, client-side search, calendar, 5 to 10 written guides, SEO foundation, analytics.
- Design system from `designplan.md` (light and dark themes, Stardewpedia logo, mobile bottom tab bar).
- Two tools: Crop Profit Calculator and Gift Finder.

**Phase 2: Engagement**
- Bundle Tracker and Fishing Planner using `localStorage`.
- Recipes, bundles, mines and Skull Cavern pages.
- Achievements, festivals, quests, Monster Eradication Goals and random events pages.
- Content loader into Supabase (`game` schema) and the Supabase project with Row Level Security.
- Optional newsletter.

**Phase 3: Accounts and community features**
- Supabase Auth, progress sync, shareable plans, Farm Planner.
- Feature flags for gradual rollout.

**Phase 4: Expansion**
- Localization, save file analyzer (upload parsed entirely in the browser), mod-compatibility notes.

## 18. Key Decisions (ADR Summary)

| Decision | Choice | Alternative | Reason |
|---|---|---|---|
| Data storage | Files in Git | Headless CMS or DB | Versioned, reviewable, free, fast builds |
| Rendering | SSG | SSR for everything | Content rarely changes, best speed and cost |
| Search | Client-side index | Algolia or Meilisearch | No extra service, instant, free |
| Accounts | Deferred to phase 2 | Day one | Avoid complexity before there is traction |
| Tool state | URL plus local-first storage | Server-only state | Shareable, offline-capable, cheaper |
| Hosting | Vercel | Cloudflare or Netlify | Native Next.js features and previews |
| Database and auth | Supabase (Postgres, Auth, Storage) | Neon plus Auth.js | Row Level Security, auth and storage in one place, standard Postgres so migration stays possible |

## 19. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Game patch invalidates data | `gameVersion` and `lastVerified` fields, diff-based update workflow, visible update badges |
| Copyright or IP complaints | Original writing, careful asset policy, disclaimer, check the fan content policy |
| Data errors damage trust | Schema validation, tests on calculator math, a public "report a mistake" link per page |
| Misconfigured Row Level Security leaks data | RLS on every table, only the publishable key in the browser, policy tests for signed-out, normal and admin users, regular advisor checks |
| Vendor lock-in | Standard Next.js, Postgres and Markdown, and Supabase is plain Postgres underneath, so migration is mostly config |
| Cost spikes from bots | WAF and rate limits, spend cap, aggressive static caching |
| Solo-maintainer burnout | Keep scope small, automate checks, defer accounts |

## 20. Immediate Next Steps

1. Create the repo and scaffold the Next.js app with the folder layout above.
2. Define Zod schemas for Crop, Fish and Villager, and enter 10 records of each.
3. Build the entity page templates and the index pages with client-side filters.
4. Deploy to Vercel early, so you have preview URLs from day one, and create the Supabase project by running `stardewpedia-schema.supabase.sql` on it.
5. Implement the Crop Profit Calculator as pure logic with tests, then add the UI.
6. Add search, sitemap, metadata and analytics, then write your first five guides.

If you tell me your team size, whether you plan ads or monetization, and whether accounts matter at launch, I can tighten this into a more specific plan, such as detailed database tables, a full folder scaffold, or starter code.

## 21. Mobile Responsiveness and Future Mobile App

Most Stardew players look things up on a phone, often with the game running on another screen. Mobile is a primary target for the website, not an afterthought, and the design should also keep the door open for an app.

### 21.1 Mobile-first responsive design

- **Mobile-first CSS.** Write base styles for a 360 px wide screen and add Tailwind breakpoints upward (`sm` 640, `md` 768, `lg` 1024, `xl` 1280). Test at 360, 390, 768 and 1280 px.
- **Navigation.** A compact top bar with a search button and a menu drawer, plus an optional bottom tab bar on phones (Home, Search, Calendar, Tools, Menu). Search is the most-used feature, so it must be one tap away.
- **Touch targets.** At least 44 by 44 px for buttons, filter chips, checkboxes and list rows, with enough spacing to avoid mis-taps.
- **Dense data.** Wide tables become either horizontally scrollable containers with a sticky first column or stacked cards on small screens. Gift lists use collapsible groups (Loved, Liked, Neutral and so on).
- **Calendar.** A full month grid on tablet and desktop, and a day list with a season switcher on phones.
- **Farm Planner.** Pinch to zoom, drag to pan, a tap-to-place toolbar at the bottom of the screen, and an optional landscape mode. Pointer events cover both mouse and touch.
- **Typography and layout.** Fluid type with `clamp()`, a readable line length, and no horizontal page scroll at any width.
- **Images.** Responsive `sizes` and `srcset` through `next/image`, with small sprite sheets for pixel art.
- **Input modes.** Correct `inputmode` and `type` on form fields, and no hover-only interactions (every hover tooltip needs a tap equivalent).
- **Safe areas and viewport.** Use `viewport-fit=cover` and `env(safe-area-inset-*)` padding for notched phones, and `dvh` units so the mobile browser toolbar does not cut off layouts.
- **Preferences.** Support `prefers-color-scheme` (dark mode is popular for night play sessions) and `prefers-reduced-motion`.

### 21.2 Mobile testing

| What | How |
|---|---|
| Layout regressions | Playwright projects for mobile viewports (for example Pixel 7 and iPhone 14), with screenshot checks in CI |
| Performance | Lighthouse CI with mobile throttling, and a field check in Vercel Speed Insights split by device |
| Accessibility | axe checks at mobile widths, plus manual screen reader passes (VoiceOver and TalkBack) |
| Real devices | A short manual checklist on at least one iPhone and one mid-range Android before each release |

### 21.3 Step 1: Progressive Web App (recommended first)

The cheapest path to an app-like experience, and it needs almost no new code.

- Web app manifest with name, icons (including maskable), theme color and `display: standalone`.
- Service worker (Serwist or Workbox) with a precache of the app shell and tool bundles, runtime caching for entity pages, and a stale-while-revalidate strategy for game data JSON.
- An offline fallback page, and an "Update available" prompt when a new data version is deployed.
- Install prompt shown after the person has used a tool, not on first visit.
- Offline-capable tools: calculators and trackers already work from local data, so the PWA makes them work with no signal.

### 21.4 Step 2: App store options

| Path | Effort | Best when | Reuses |
|---|---|---|---|
| PWA only | Lowest | You want install and offline without app stores | Everything |
| Capacitor wrapper around the web app | Low | You want store listings, push notifications and native plugins with one codebase | Whole Next.js UI (static export or hosted URL) |
| React Native with Expo | Highest | You want a fully native feel and native navigation | `game-logic`, `data`, API, design tokens (not the web UI) |

Capacitor works best with a static export of the content pages and tools, with the account API still called over the network. React Native is only worth it if the Farm Planner or other tools need native gestures and performance that the web cannot give.

### 21.5 Changes to make now so the app is easy later

1. **Auth that works natively.** Supabase Auth issues access and refresh tokens that work in browsers and native apps (supabase-js supports React Native and Capacitor), so no custom token endpoint is needed. Store the session in secure storage on the device.
2. **Stable, versioned API.** Keep everything under `/api/v1` with an OpenAPI or typed client generated from the Zod schemas, and never break a version once an app is in stores.
3. **Versioned data endpoints.** Publish the game data as static JSON (for example `/data/v1/crops.json` with a manifest listing a content hash per file) so apps can download, cache and update it without a store release.
4. **Keep logic separate from UI.** `packages/game-logic` and `packages/data` must stay free of React, DOM and Next.js imports. Enforce this with an ESLint import rule.
5. **Shared design tokens.** Keep colors, spacing and type scale in a tokens file that both Tailwind and a future React Native theme can consume.
6. **CORS and rate limits.** Allow the app origins (such as `capacitor://localhost`) and keep rate limits per user or token, not only per IP.
7. **Sync design.** The local-first model with version counters from section 8 is already app-friendly. Add an `updated_at` cursor endpoint so apps can fetch only changes since their last sync.
8. **Analytics and flags.** Use a platform field on events and Edge Config flags, so you can roll out app features gradually.

### 21.6 Mobile roadmap placement

- **Phase 1 (MVP):** mobile-first layouts, touch targets, mobile test projects in CI, dark mode.
- **Phase 2:** PWA with offline support for tools and recently viewed pages.
- **Phase 3:** Supabase Auth in the app, versioned data endpoints and sync cursors, shipped together with accounts.
- **Phase 4:** Capacitor wrapper and store submission, with a decision point on React Native only if user demand and analytics justify it.

### 21.7 Store and policy notes

- Apple and Google both require a privacy policy and data safety disclosures, so the account and analytics design should stay minimal.
- Apple may reject apps that are only a thin website wrapper, so a Capacitor app should add real native value such as offline data, push reminders (for example "crop ready" or birthday alerts) and home screen widgets.
- Re-check the asset and fan content policy for store distribution, since the rules for commercial or store-listed fan apps can be stricter than for a website.
