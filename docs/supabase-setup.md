# Supabase setup

Step-by-step for a fresh Supabase project on the free tier. Do these in order.

## 1. Create the project

1. Go to <https://supabase.com/dashboard> → New Project.
2. Pick a region close to you (e.g., `ap-south-1` Mumbai for India).
3. Set a DB password and save it — you'll need it for `DIRECT_URL`.
4. Wait ~1 min for provisioning.

## 2. Environment variables

From **Project Settings → API Keys** and **Project Settings → Database**, collect:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `Publishable key` (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `Secret key` (`sb_secret_...`) → `SUPABASE_SECRET_KEY` **(server-only, never expose)**
- Connection string (Session mode, port 5432) → `DIRECT_URL`
- Connection string (Transaction mode, pgbouncer port 6543) → `DATABASE_URL`

> Using Supabase's current API key system (publishable + secret). Legacy `anon`/`service_role` JWT keys still work but the new scoped keys are preferred for new projects.

Add to `.env.local`:

```bash
# Prisma
DATABASE_URL="postgresql://postgres.<project>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.<project>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"

# Supabase JS client
NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_SECRET_KEY="sb_secret_..."    # server-only — used by registerPlayer / updatePlayer
```

Commit a `.env.local.example` with the same keys but empty values.

## 3. Run the migrations

```bash
pnpm prisma migrate dev --name init               # creates players table
pnpm prisma migrate dev --name generated_avg_and_pg_trgm  # raw SQL follow-up
```

The second migration file is hand-written — see [database-schema.md](./database-schema.md) for the exact SQL.

## 4. Apply RLS policies

Run in Supabase SQL Editor (Dashboard → SQL → New query):

```sql
ALTER TABLE "players" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players_select_public"
  ON "players" FOR SELECT
  USING (true);

-- No INSERT/UPDATE/DELETE policies for anon — server actions use service role.
```

Verify in **Authentication → Policies** that `players` shows one SELECT policy.

## 5. Create the `player-photos` storage bucket

1. **Storage → New bucket**.
2. Name: `player-photos`.
3. **Public bucket**: ON.
4. File size limit: `2 MB`.
5. Allowed MIME types: `image/jpeg, image/png, image/webp`.

Apply storage policies in SQL Editor:

```sql
-- Public read (bucket is public, but being explicit)
CREATE POLICY "player_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'player-photos');

-- Writes go through server actions using service role — no anon policy needed.
-- If we later want client-direct upload, add:
-- CREATE POLICY "player_photos_anon_insert"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'player-photos');
```

## 6. Verify the extension is enabled

The migration in step 3 runs `CREATE EXTENSION IF NOT EXISTS pg_trgm;`. Confirm via:

```sql
SELECT * FROM pg_extension WHERE extname = 'pg_trgm';
```

Should return one row.

## 7. Smoke test

```bash
pnpm seed     # inserts 10 seed players
pnpm dev
```

Open <http://localhost:3000> → should redirect to `/register`. After registering, `/leaderboard` shows the 10 seeds + your row.

## Free-tier limits (as of 2026)

| Resource | Limit | Notes |
|---|---|---|
| Database | 500 MB | ~10 KB per player row → 50k players before hitting cap |
| Storage | 1 GB | ~150 KB/photo compressed → ~6.5k photos |
| Bandwidth | 2 GB/month | Leaderboard is cache-friendly; should fit easily |
| Auth users | N/A | Not using Supabase Auth |
| Edge functions | N/A | Not used |

If any of these get tight, the first mitigation is aggressive photo compression; the second is a Vercel CDN in front of `/api/leaderboard`.

## Teardown (local dev)

```bash
pnpm reset    # truncates players, empties player-photos bucket
```

Refuses to run when `NODE_ENV === 'production'`.
