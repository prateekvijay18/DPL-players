# Database schema

Single-table design. Postgres via Supabase. Prisma 6.x as the ORM/migrator. Decimal precision is load-bearing — see [adr-001 §4](./adr-001-stack-decisions.md).

## Prisma schema

`prisma/schema.prisma`:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"] // Vercel
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")       // pooled (pgbouncer, :6543)
  directUrl = env("DIRECT_URL")         // unpooled (:5432) for migrations
}

model Player {
  id                String   @id @default(cuid())
  name              String   @db.VarChar(50)
  photoUrl          String?
  additionalDetails String?  @db.VarChar(500)

  battingRating     Decimal  @db.Decimal(3, 2)
  fieldingRating    Decimal  @db.Decimal(3, 2)
  bowlingRating     Decimal  @db.Decimal(3, 2)

  /// Generated column. Do NOT write to this field.
  /// Prisma emits a DEFAULT — the follow-up migration replaces it with GENERATED ALWAYS AS ... STORED.
  averageRating     Decimal  @db.Decimal(4, 2) @default(dbgenerated("((\"battingRating\" + \"fieldingRating\" + \"bowlingRating\") / 3.0)"))

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([averageRating(sort: Desc)])
  @@index([name])
  @@map("players")
}
```

Notes:
- `@@map("players")` → snake-ish table name. Column names stay camelCase for Prisma ergonomics; raw SQL must quote them (`"battingRating"`).
- No `email` field. No `age` or `gender` field — both dropped post-v0 by user request (see `prisma/migrations/*_remove_age` and `*_remove_gender`). No unique constraints beyond `id`.

## Initial migration — hand-edited

Postgres rejects column references in `DEFAULT` expressions, so the SQL that `prisma migrate dev --name init` generates from `@default(dbgenerated("..."))` fails with `0A000`. We hand-edit the generated `migration.sql` once, before it ever applies:

- Replace `"averageRating" DECIMAL(4,2) NOT NULL DEFAULT ((...)/3.0)` inside `CREATE TABLE` with `"averageRating" DECIMAL(4,2) GENERATED ALWAYS AS ((...)/3.0) STORED`.
- Prepend `CREATE EXTENSION IF NOT EXISTS pg_trgm;`.
- Replace the plain B-tree `CREATE INDEX ... ON "players"("name")` with a GIN trigram index: `CREATE INDEX "players_name_idx" ON "players" USING GIN ("name" gin_trgm_ops);`.

Final migration: [prisma/migrations/20260422102448_init/migration.sql](../prisma/migrations/20260422102448_init/migration.sql). The Prisma schema keeps `@default(dbgenerated("..."))` — Prisma's drift check treats that as "DB provides a default" and is happy with `GENERATED` on the DB side.

> **Operational note.** `prisma db pull` may try to reshape the schema around the introspected DB state. Don't run it casually. The source of truth for future changes is `prisma migrate dev`; for generated-column changes, hand-edit the emitted SQL before applying.

## Read/write contract in code

- **Reads**: `averageRating` is always selected and displayed to 2 decimals.
- **Writes**: never. Prisma's generated types will still accept it in `create`/`update` — engineering discipline (and a lint rule if you want) keeps it out. Seed script omits it; server actions omit it; edit form does not bind it.

## Default ordering (tiebreaker)

Anywhere the leaderboard is queried without an explicit sort from the URL, use:

```ts
orderBy: [
  { averageRating: 'desc' },
  { battingRating: 'desc' },
  { bowlingRating: 'desc' },
  { name: 'asc' },
]
```

## Supabase RLS policies

Apply after `prisma migrate deploy` against the Supabase DB.

```sql
ALTER TABLE "players" ENABLE ROW LEVEL SECURITY;

-- Anyone (publishable key) can read.
CREATE POLICY "players_select_public"
  ON "players" FOR SELECT
  USING (true);

-- No INSERT, UPDATE, or DELETE policies for the anon role.
-- All writes go through server actions using SUPABASE_SECRET_KEY,
-- which bypasses RLS. This prevents direct abuse of the Supabase auto-REST
-- endpoint (POST https://<project>.supabase.co/rest/v1/players) with the
-- public publishable key — the server action is the only write path.
-- The server action performs the cookie-based ownership check on updates.
```

Storage policies for `player-photos` bucket are in [supabase-setup.md](./supabase-setup.md).

## Seed data

`prisma/seed.ts` creates 10 players spanning the full 0.0–5.0 range, including one deliberate tie on `averageRating` to exercise the tiebreaker:

| name   | bat | field | bowl | avg |
|--------|-----|-------|------|-----|
| Rohan  | 4.8 | 4.2   | 3.5  | 4.17 |
| Aisha  | 4.5 | 4.8   | 4.0  | 4.43 |
| Vikram | 3.2 | 3.5   | 4.5  | 3.73 |
| Priya  | 4.2 | 3.8   | 3.0  | 3.67 |
| Arjun  | 4.8 | 3.0   | 2.5  | 3.43 |
| Sana   | 3.0 | 3.5   | 4.0  | 3.50 |
| Karan  | 4.0 | 3.5   | 3.0  | 3.50 |   ← ties with Sana on avg, differs on batting
| Meera  | 2.0 | 2.5   | 2.0  | 2.17 |
| Dev    | 5.0 | 4.5   | 4.8  | 4.77 |
| Tara   | 0.5 | 1.0   | 1.5  | 1.00 |

Seed script uses `new Decimal("4.8")` (string, not number) for every rating to avoid any IEEE-754 intermediate.

## Reset script

`scripts/reset.ts` truncates `players` and empties the `player-photos` bucket. Intended for local dev only; refuses to run when `NODE_ENV === "production"`.
