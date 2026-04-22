# DPL Players 🏏

Self-rating and leaderboard platform for a casual cricket league. Anyone who has the link can register themselves, submit their three skill ratings (batting / fielding / bowling, 0.0–5.0 by 0.1), and browse a filterable, sortable, searchable leaderboard.

**No passwords, no email.** Identity = browser cookie. (Read the warning below before shipping this to users.)

> Design docs and decisions live under [docs/](./docs). Start with [`adr-001-stack-decisions.md`](./docs/adr-001-stack-decisions.md) and [`database-schema.md`](./docs/database-schema.md).

---

## ⚠️ Cookie-only identity — read this first

There is **no authentication**. The moment a user completes `/register`, a `playerId` httpOnly cookie is set on their browser. That cookie is the only way the server knows who they are. Consequences:

- **Clearing cookies = losing your profile forever.** Your DB row still exists but no browser will ever recognise it again.
- **No cross-device continuity.** Registering on a phone doesn't log you in on a laptop.
- **No recovery.** There is no email to send a magic link to.

The schema is designed so adding a nullable `email` or `userId` later is a non-breaking migration. If the app gains traction, adding a minimal auth layer (magic link or passkey) should be the first follow-up.

---

## Tech stack

- **Framework**: Next.js 16 (App Router, Turbopack) · React 19
- **DB**: Postgres on Supabase (free tier) via Prisma 7 + `@prisma/adapter-pg`
- **Storage**: Supabase Storage (public `player-photos` bucket) for player photos
- **Styling**: Tailwind CSS v4 + shadcn/ui + custom cricket-league theme with dark/light modes
- **Forms**: react-hook-form + Zod (shared schemas between client + server actions)
- **URL state**: nuqs (sort/filter/search/page all live in `?search params`)
- **Server actions** for all writes (never from the client with anon/publishable keys)

---

## Prerequisites

- Node.js ≥ 20 (project uses 24 in dev)
- pnpm ≥ 9
- A Supabase project (free tier is fine)

---

## 1. Configure environment

Copy the template and fill in real values:

```bash
cp .env.local.example .env.local
```

Five variables, all from the Supabase dashboard:

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | **Connect** button → Prisma tab (or Transaction pooler, port **6543**) with `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | **Connect** button → Session / Direct connection on port **5432** |
| `NEXT_PUBLIC_SUPABASE_URL` | **Project Settings → API Keys** — Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Project Settings → API Keys** — `sb_publishable_...` |
| `SUPABASE_SECRET_KEY` | **Project Settings → API Keys** — `sb_secret_...` (server-only, never expose) |

Details and encoding gotchas are in [docs/supabase-setup.md](./docs/supabase-setup.md).

## 2. Install dependencies

```bash
pnpm install
```

## 3. Create the database schema

The initial migration creates the `players` table, the `averageRating` **generated column**, enables the `pg_trgm` extension, and builds a GIN trigram index on `name`:

```bash
pnpm prisma migrate deploy
```

Use `pnpm prisma migrate dev` during development for schema changes.

> The initial migration SQL is hand-edited (not auto-emitted by Prisma) because Postgres rejects column references in a plain `DEFAULT` expression. See [docs/database-schema.md](./docs/database-schema.md) for the full story.

## 4. Create the storage bucket + RLS policies

In the Supabase dashboard:

1. **Storage → New bucket** → name `player-photos`, Public **ON**, 2 MB file size limit, allowed MIME `image/jpeg, image/png, image/webp`.
2. **SQL Editor → New query** — paste and run:

```sql
ALTER TABLE "players" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players_select_public"
  ON "players" FOR SELECT USING (true);

CREATE POLICY "player_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'player-photos');
```

No INSERT/UPDATE/DELETE policies for anon — **all writes go through server actions using `SUPABASE_SECRET_KEY`** which bypasses RLS. This prevents anyone with the publishable key (visible in the browser bundle) from hitting the Supabase auto-REST endpoint to insert or mutate rows directly.

## 5. Seed sample data

```bash
pnpm seed
```

Inserts 10 players covering the full 0.0–5.0 rating range, including one intentional tie on average to verify the sort tiebreaker (batting → bowling → name → id).

## 6. Start the dev server

```bash
pnpm dev
```

Opens on **http://localhost:3008** (port 3009 is used by `pnpm start` for prod-preview).

Register yourself, then land on `/leaderboard` and look for the "You" badge on your row.

---

## Scripts reference

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server on port **3008** |
| `pnpm build` | Production build |
| `pnpm start` | Production server on port **3009** |
| `pnpm seed` | Seed 10 sample players |
| `pnpm reset` | **Wipe all players and empty the `player-photos` bucket.** Refuses to run when `NODE_ENV=production` |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:push` | `prisma db push` (schema sync without migration files — dev only) |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm lint` | ESLint |

---

## Deployment (Vercel)

1. Push to GitHub, import the repo into Vercel.
2. Add the same five environment variables from `.env.local` to Vercel's project settings.
3. Build command: `pnpm build`. Install command: `pnpm install`. Output: default.
4. **Important**: For the Prisma CLI's `migrate deploy` to run during build, either add it to `build` (`prisma migrate deploy && next build`) or run migrations manually. The current `package.json` runs `next build` only.
5. After first deploy, run migrations once against the production DB:
   ```bash
   DATABASE_URL=... DIRECT_URL=... pnpm prisma migrate deploy
   ```

---

## Free-tier capacity (as of early 2026)

| Resource | Limit | Practical cap |
|---|---|---|
| Supabase DB | 500 MB | ~50,000 player rows |
| Supabase Storage | 1 GB | ~6,500 photos at ~150 KB each after client-side compression |
| Supabase Bandwidth | 2 GB / month | Plenty for a casual league; a CDN in front of `/leaderboard` would extend indefinitely |
| Vercel Hobby | 100 GB bandwidth | Plenty |

---

## Directory layout

```
app/
  layout.tsx               Root layout (theme provider, nuqs adapter, stadium backdrop)
  page.tsx                 Home page — proxy usually redirects before it renders
  globals.css              Tailwind v4 @theme tokens + cricket utilities (glass, scoreboard, podium)
  register/
    page.tsx               Server Component, redirects to /leaderboard if cookie resolves to a row
    register-form.tsx      Client form (wraps shared PlayerForm)
    actions.ts             registerPlayer server action
    photo-upload.ts        Client-side image compression helper
  leaderboard/
    page.tsx               Scoreboard hero + podium + table (Server Component)
    loading.tsx            Skeleton shown during navigation
    leaderboard-toolbar.tsx  Client filters/search/pageSize (nuqs)
    sort-header.tsx        Sortable column header links
    pagination.tsx         Prev/Next page nav
    podium.tsx             Top-3 champion/runner-up/third-place tiles
    edit/
      page.tsx             Edit own profile (cookie → player lookup)
      edit-form.tsx        Wraps shared PlayerForm
      actions.ts           updatePlayer action (cookie-enforced ownership)

components/
  player-form.tsx          Shared register/edit form
  rating-input.tsx         Reusable 0–5 slider + numeric input
  rank-medal.tsx           🥇🥈🥉 for top 3
  player-avatar.tsx        Avatar with deterministic initials fallback
  theme-provider.tsx       next-themes wrapper
  theme-toggle.tsx         Sun/moon toggle
  filters/range-filter.tsx Dual-thumb slider for rating filters
  ui/                      shadcn/ui primitives

lib/
  db.ts                    Prisma client singleton (PrismaPg adapter)
  cookies.ts               Typed getPlayerId / setPlayerId / clearPlayerId
  decimal.ts               Safe number → Prisma.Decimal coercion
  supabase/                Server (secret key) + browser (publishable key) clients
  schemas/                 Zod schemas (shared client + server)
  queries/players.ts       queryPlayers(q) — shared DB read for leaderboard

prisma/
  schema.prisma            Player model with enum Gender
  migrations/              Initial migration (hand-edited for GENERATED column + pg_trgm)
  seed.ts                  Seed script

scripts/
  reset.ts                 Truncate players + empty bucket (dev only)

prisma.config.ts           Prisma 7 config (replaces datasource.url in schema)
proxy.ts                   Cookie-based route gating (Next 16 replaces middleware.ts)
```

---

## Known gaps / future work

- No authentication. Cookie-only identity is a v1 constraint — a follow-up should add minimal auth (magic link or passkey).
- No self-delete endpoint (spec deferred).
- No rate limiting on `/register` (spec deferred).
- Search is name-only (pg_trgm GIN index). Expanding to additional details / email would need a separate index.
- No admin panel.

---

## License

Private — for internal use.
