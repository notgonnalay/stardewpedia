# Stardewpedia: Supabase Edition of the Database

Companion to `stardewpedia-schema.supabase.sql`. It replaces the Neon plus Auth.js assumptions in `database-schema.md` and the architecture doc. Everything else in `database-schema.md` (conventions, table catalogue, design notes, sync model) still applies.

> **Status:** the SQL has not been run against a real Supabase project. Run it on a new, empty project first, then fix anything it rejects. Supabase changes its dashboard and API key rules from time to time, so check the current docs while setting up.

## 1. What Changed From the Generic Version

| Area | Generic Postgres file | Supabase file |
|---|---|---|
| Sign-in | Auth.js tables (`users`, `accounts`, `sessions`, `verification_tokens`, `refresh_tokens`) | **Supabase Auth** (`auth.users`). Those five tables are removed. |
| User row | `app.users` plus `app.user_profiles` | One table, **`app.profiles`**, whose `id` references `auth.users(id)`. A trigger creates it on sign-up. |
| Roles | `users.role` | `profiles.role`, read by `private.is_editor()`. Users cannot change their own role (column-level grants). |
| Security | Enforced in application code | **Row Level Security** on every table, with policies and explicit grants (section 19 of the SQL) |
| Extensions | Default schema | Created in the `extensions` schema (`extensions.citext`, `extensions.gin_trgm_ops`) |
| Helper functions | `app` schema | `private` schema, which must never be exposed |
| Views | Plain | `security_invoker = true`, so they respect the caller's RLS |
| Files | Vercel Blob | **Supabase Storage** buckets `game-assets` and `plan-thumbnails` with policies |
| Mobile login tokens | `refresh_tokens` table | Handled by Supabase Auth. Only push tokens stay in `app.devices`. |

New totals: 83 tables (59 in `game`, 24 in `app`), plus the same partitions as before.

## 2. How the Pieces Fit Together

```
 Browser / future mobile app
        |
        |  1. pages and static assets            2. data, sign-in, uploads
        v                                        v
 Vercel (Next.js, static pages, route handlers)   Supabase
        |                                         - Auth (Google, Discord, email link)
        |  3. server-only, secret key             - Data API (PostgREST) + RLS
        +---------------------------------------> - Postgres (schemas: game, app, private)
        |  4. direct Postgres connection          - Storage (images)
        +---------------------------------------> - Realtime (optional)
          (loader, Drizzle, heavy queries)
```

Two ways to reach the data. You can use either or both:

| Path | Use it for | Credentials | RLS applies? |
|---|---|---|---|
| **A. supabase-js (Data API)** from browser or server | Reading published content, signed-in user data (farms, progress, plans), uploads | **Publishable key** plus the user's session | Yes |
| **B. Direct Postgres** (Drizzle or postgres.js on the pooled connection string) from server code only | The content loader, migrations, reports, bulk jobs, newsletter and logging | Database password, or the **secret key** through supabase-js | No (bypasses RLS) |

Rule of thumb: the browser only ever sees the publishable key. The secret key and the database password stay in server environment variables on Vercel and are never prefixed with `NEXT_PUBLIC_`.

## 3. Setup Checklist

1. **Create a Supabase project** (pick the region closest to most players and to your Vercel region).
2. **Run the SQL.** Either paste `stardewpedia-schema.supabase.sql` into the SQL editor on an empty project, or save it as `supabase/migrations/<timestamp>_init.sql` and push it with the Supabase CLI.
3. **Expose the schemas** (only if you use path A). In the dashboard, go to the Data API settings and add `game` and `app` to the exposed schemas. Do **not** add `private`. The SQL already grants the needed roles access. New tables are not exposed automatically, so every new table in the future needs an explicit `GRANT` plus RLS.
4. **Set up Auth.** Enable the providers you want (Google, Discord, email magic link). Add your production domain, `http://localhost:3000` and your Vercel preview URL pattern to the allowed redirect URLs.
5. **Create API keys.** Use the **publishable key** (`sb_publishable_...`) in client code and the **secret key** (`sb_secret_...`) on the server. These replace the older `anon` and `service_role` keys, which Supabase is phasing out, so avoid the legacy ones in new code.
6. **Add environment variables in Vercel** (production, preview, development):

   | Variable | Where it is used |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Browser and server |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser and server |
   | `SUPABASE_SECRET_KEY` | Server only (loader, newsletter, logging routes) |
   | `DATABASE_URL` | Server only, the pooled connection string for Drizzle |

7. **Install clients:** `@supabase/supabase-js` and `@supabase/ssr` for cookie-based sessions in the Next.js App Router. Create one browser client and one server client helper.
8. **Generate TypeScript types** from the database with the Supabase CLI (`supabase gen types typescript`, passing the `game` and `app` schemas) and re-run it after every migration.
9. **Make the first admin.** Sign in once, then in the SQL editor run `UPDATE app.profiles SET role = 'admin' WHERE id = '<your auth user id>';`.
10. **Load the content** with the loader script, using the secret key or a direct connection.
11. **Test RLS** with a signed-out client, a normal user and an admin before launch (see section 6).

## 4. Row Level Security Summary

| Tables | Signed out (`anon`) | Signed in (`authenticated`) | Server (secret key) |
|---|---|---|---|
| `game.*` content | Read rows where `status = 'published'` (child tables without a status column are readable) | Same, plus editors and admins can read and write everything | Everything |
| `app.profiles` | No access | Read and update own row, only display name, theme, locale, marketing opt-in and preferences | Everything |
| `app.farms`, `devices`, `saved_calculations`, `favorites`, `reminders`, `save_imports`, `farm_plan_likes` | No access | Full access to own rows only | Everything |
| `app.farm_*` progress tables | No access | Full access when the farm belongs to them | Everything |
| `app.farm_plans` | Read public, non-deleted plans | Own plans, plus public plans | Everything |
| `app.content_feedback` | No access | Insert own, read own. Editors manage all. | Everything |
| `app.newsletter_subscribers`, `search_logs`, `audit_log` | No access | No access | Everything |
| Partitions (`farm_collections_p0` and so on, `search_logs_*`) | No grants | No grants | Everything |
| Storage `game-assets` | Public read | Editors write | Everything |
| Storage `plan-thumbnails` | Public read | Write only under their own `<user id>/` folder | Everything |

Performance notes already built in: policies call `(SELECT auth.uid())` so the value is computed once per query, and the columns policies filter on (`user_id`, `farm_id`) have full indexes.

## 5. Design Notes for Supabase

- **Draft content:** a child table such as `recipe_ingredients` has no `status`, so rows belonging to a draft parent are readable. Keep drafts out of the production database, or only publish finished content, or add a join-based policy later.
- **Views:** `game.v_calendar` and `app.v_farm_bundle_progress` use `security_invoker`, so they obey the caller's RLS. Without it a view would run with its owner's rights and bypass RLS.
- **`private` schema:** holds the signup trigger function, `is_editor()` and `set_updated_at()`. Keeping it out of the exposed schemas stops anyone from calling these functions through the API.
- **Anonymous writes:** none. Newsletter sign-up, anonymous "report a mistake" and search logging go through Next.js route handlers that use the secret key, with rate limiting (Upstash) and a bot check.
- **Soft delete:** deleting an auth user cascades to `app.profiles` and every table that references it. Use Supabase's admin API from a server route for account deletion, and honour data export requests.
- **Realtime (optional):** you can turn on Realtime for the progress tables so a second device updates live. The `(farm_id, updated_at)` sync model still works without it.
- **Mobile:** supabase-js works in React Native and in a Capacitor app, with Supabase Auth handling sessions and token refresh. This replaces the custom bearer-token plan in the architecture doc.
- **Content mode:** the "Git-first" loading approach from `database-schema.md` still applies. Pages can be built from the files, and the database serves user features and, later, search and an admin editor.

## 6. How to Test RLS

Run these in the SQL editor or from a test script:

1. **Signed out:** with the publishable key and no session, `select` from `game.items` returns published rows, and `select` from `app.farms` returns nothing or an error.
2. **User A and user B:** sign in as two users, create a farm for each, and confirm neither can read or change the other's farm, progress or plans.
3. **Role escalation:** as a normal user, try `update app.profiles set role = 'admin'`. It must fail.
4. **Editor:** as an admin, insert and update a `game.items` row. As a normal user the same write must fail.
5. **Storage:** as a normal user, upload to your own folder in `plan-thumbnails` (allowed) and to another user's folder (blocked), and to `game-assets` (blocked).
6. **Secret key:** confirm the secret key only appears in server code and never in the browser bundle.

## 7. Changes to Make in the Other Documents

| Document | Change |
|---|---|
| `stardew-valley-guide-architecture.md` (and the Stardewpedia name) | Replace Neon with Supabase Postgres, Auth.js with Supabase Auth, Vercel Blob with Supabase Storage. Keep Upstash for rate limiting, Edge Config for flags and Vercel for hosting. Section 8 (accounts) and the token advice in section 21 simplify considerably. |
| `database-schema.md` | Keep as the conceptual reference. Sections 5.2 (identity tables), 11 and 13 are replaced by this document. |
| `stardew-guide-frontend/SKILL.md` | Add a short section on the Supabase client helpers and a rule that the secret key never appears in client components. |
| `designplan.md` | No change needed. |

## 8. Cost and Limits to Check

Supabase plans, usage limits and what happens to inactive projects on the free tier change over time, so check the current pricing page before launch. Things to look at: database size, storage and bandwidth limits, number of monthly active users for Auth, backups and point-in-time recovery, and whether a paid plan is required once you run ads or have meaningful traffic. Vercel's own plan rules from the architecture doc (Hobby is non-commercial) still apply.

## 9. Known Gaps

1. The SQL is untested against a live project.
2. Storage policies use the standard helper `storage.foldername`. Confirm it exists in your project.
3. Hash partition count (16) and the monthly `search_logs` partitions need maintenance as the site grows, as described in `database-schema.md`.
4. Add a scheduled job (Supabase cron or Vercel cron) for partition creation, expired reminders and the account-deletion retention purge.
5. Decide whether the browser may read `game` tables directly or whether content should always be served from static pages or a cached API route, for lower database load.
