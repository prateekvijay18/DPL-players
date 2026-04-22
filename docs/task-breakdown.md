# Task breakdown

Phased build. Each phase ends with a visible, testable outcome. Don't start phase N+1 until phase N passes its verification.

## Phase 0 — Scaffold (~30 min)

- [ ] `pnpm create next-app@latest .` → TS, Tailwind, App Router, no `src/` dir, import alias `@/*`. **Scaffolds Next.js 16 + Tailwind v4 + React 19.**
- [ ] Install runtime deps:
  ```
  pnpm add prisma @prisma/client @supabase/supabase-js zod react-hook-form @hookform/resolvers \
    zustand @tanstack/react-query nuqs browser-image-compression clsx tailwind-merge
  ```
- [ ] Install dev deps: `pnpm add -D tsx`
- [ ] `pnpm dlx shadcn@latest init` → CSS variables, slate base, path `@/components/ui`. shadcn's Tailwind-v4 path uses `@theme` in `globals.css`, not a config file.
- [ ] `pnpm dlx shadcn@latest add button input label slider select textarea form table badge avatar card skeleton toast dialog`
- [ ] Cricket theme tokens defined via `@theme` directive in `globals.css` (Tailwind v4 pattern — no `tailwind.config.ts`). Display font via `next/font` (Roboto Slab).
- [ ] `.env.local.example` committed.
- [ ] `package.json` scripts: `dev`, `build`, `start`, `seed`, `reset`, `db:push`, `db:migrate`, `db:studio`.

**Verify.** `pnpm dev` boots on `localhost:3000` and shows the default Next.js page with the cricket theme applied (pitch-green accent visible on the default Button if you drop one on the page).

## Phase 1 — DB + Supabase + seed (~1 hr)

- [ ] `prisma/schema.prisma` as in [database-schema.md](./database-schema.md).
- [ ] `pnpm prisma migrate dev --name init` against a real Supabase project.
- [ ] Hand-write `prisma/migrations/<ts>_generated_avg_and_pg_trgm/migration.sql` (content from [database-schema.md](./database-schema.md)).
- [ ] `pnpm prisma migrate deploy`.
- [ ] Apply RLS + storage policies via Supabase SQL Editor (see [supabase-setup.md](./supabase-setup.md)).
- [ ] Create `player-photos` public bucket.
- [ ] `prisma/seed.ts` → 10 players with varied decimals incl. one tie.
- [ ] `scripts/reset.ts` → truncate + bucket-empty (production-guarded).
- [ ] `lib/db.ts` Prisma singleton.
- [ ] `lib/supabase/server.ts` service-role client; `lib/supabase/client.ts` anon client.

**Verify.**
1. `pnpm seed` inserts 10 rows.
2. Supabase dashboard → Table editor → `players` → `averageRating` populated correctly per row.
3. `SELECT * FROM players ORDER BY "averageRating" DESC, "battingRating" DESC;` shows Karan (batting 3.0) before Sana (batting 3.0) only if names tiebreak — adjust seed if needed so the batting tiebreak actually differentiates the 3.50 pair.
4. `pnpm reset` empties everything; `pnpm seed` re-runs cleanly.

## Phase 2 — `<RatingInput>` (~1 hr)

- [ ] `components/rating-input.tsx` per [rating-input-component.md](./rating-input-component.md).
- [ ] Gradient track CSS in `globals.css`.
- [ ] Dev harness at `app/dev/rating-input/page.tsx` (not linked from anywhere; delete before ship). Note: a leading underscore would make Next.js treat it as a private folder (unroutable), so the harness lives under `dev/`, not `_dev/`.
- [ ] Run manual test checklist from rating-input doc.

**Verify.** All 9 checklist items pass. Mobile DevTools iPhone SE viewport — touch-drag works, decimal keypad shows.

## Phase 3 — `/register` end-to-end (~2 hrs)

- [ ] `lib/schemas/player.ts` Zod schemas.
- [ ] `lib/decimal.ts` `toDecimal` helper.
- [ ] `lib/cookies.ts` `getPlayerId` / `setPlayerId` / `clearPlayerId` typed helpers.
- [ ] `app/register/page.tsx` (Server Component; redirects to `/leaderboard` if cookie present).
- [ ] `app/register/register-form.tsx` (Client Component; react-hook-form + zodResolver; uses `<RatingInput>` via `Controller`).
- [ ] `app/register/photo-upload.ts` client-side compression + Supabase Storage upload.
- [ ] `app/register/actions.ts` `registerPlayer` server action.
- [ ] `components/player-avatar.tsx` (initials fallback).
- [ ] Success toast + redirect on submit.

**Verify.**
1. Fresh browser → `/` redirects to `/register`.
2. Fill form, upload photo → row created, cookie set, redirected to `/leaderboard`.
3. Return to `/register` → redirected to `/leaderboard` (cookie present).
4. Ratings stored correctly — DB shows `3.5` exactly, not `3.4999...`.
5. Oversized photo (>2 MB after compression, unlikely) → clean error, no orphan row.

## Phase 4 — Proxy + `/leaderboard` (~3 hrs)

- [ ] `proxy.ts` (Next 16 replacement for `middleware.ts` — exports function `proxy`) → gate `/leaderboard*`; bounce `/register` if cookie set; `/` → `/leaderboard` if cookie set, `/register` otherwise.
- [ ] `lib/queries/players.ts` shared `queryPlayers(params)` used by both the Server Component and the Route Handler.
- [ ] `app/leaderboard/page.tsx` (Server Component; initial fetch with default params).
- [ ] `app/leaderboard/leaderboard-client.tsx` (Client Component; TanStack Query + `nuqs`).
- [ ] `app/api/leaderboard/route.ts` GET handler.
- [ ] `components/filters/range-filter.tsx` dual-thumb slider.
- [ ] `components/rank-medal.tsx` for 🥇🥈🥉 in the rank column.
- [ ] "You" badge on current-user row (identified by cookie `playerId`, passed as a prop from the RSC).
- [ ] Debounced search (300 ms).
- [ ] Sort headers with arrow indicators.
- [ ] Pagination (page + pageSize selector).
- [ ] Empty states (zero-results, lone-registrant).

**Verify.**
1. Default view: seeds + you, sorted by average desc, tiebreaker correct.
2. Apply filter `batting 3.0–5.0` → URL updates → refresh preserves state.
3. Search `"pri"` → only names containing "pri" (case-insensitive) shown.
4. Sort by bowling asc → column header arrow updates → order is correct.
5. Change pageSize to 10 → pagination updates; navigating pages preserves filters.
6. Back button restores previous filter/sort state.
7. Clear cookies → `/leaderboard` redirects to `/register`.

## Phase 5 — `/leaderboard/edit` (~1 hr)

- [ ] `app/leaderboard/edit/page.tsx` Server Component — fetches own record by cookie id (`const cookieStore = await cookies(); const id = cookieStore.get('playerId')?.value;`), redirects to `/register` if the cookie's id doesn't resolve to a row (stale cookie).
- [ ] `app/leaderboard/edit/edit-form.tsx` reuses the register form skeleton, pre-filled.
- [ ] `app/leaderboard/edit/actions.ts` `updatePlayer` server action. Reads cookie inside; **ignores any id in the payload.**
- [ ] Photo replace: delete old object from bucket before/after insert of new one (transactional: delete happens only after new URL is successfully written to the row).

**Verify.**
1. Edit own name + one rating → leaderboard reflects the change.
2. Replace photo → bucket now has only one photo for you (old one gone).
3. With devtools, POST directly to the server action endpoint spoofing someone else's id in the body → server action ignores it; your row is updated instead (or rejected if cookie absent). Document this as expected behaviour.
4. Stale cookie (point at a deleted id) → `/leaderboard/edit` redirects to `/register`.

## Phase 6 — Polish + README (~1–2 hrs)

- [ ] Table row loading skeletons.
- [ ] Mobile: sticky left columns (rank + name) with edge shadow; filter drawer; responsive toolbar.
- [ ] Pitch-stripe SVG header on `/leaderboard`.
- [ ] Ball-seam divider above rating section on `/register`.
- [ ] Toast styling consistent (shadcn Sonner or default toaster).
- [ ] Remove `app/dev/` harness.
- [ ] `README.md` with:
  - **Cookie-only identity warning** (clearing cookies = new identity, no recovery).
  - Supabase free-tier limits.
  - Local setup (`.env.local`, `pnpm install`, migrations, seed).
  - Scripts reference (`pnpm seed`, `pnpm reset`, etc.).
  - Deploy notes (Vercel env vars).
- [ ] Delete the original prompt file if any got committed.
- [ ] Final smoke test: deploy to Vercel, register from a phone, verify mobile UX.

## Out of scope for v1 (explicitly deferred)

- Authentication (magic link, passkey, etc.)
- Self-delete
- Rate limiting `/register`
- Email or additional-details search
- Age-bucket display
- Admin panel
- Notifications
- Team formation / auctions
