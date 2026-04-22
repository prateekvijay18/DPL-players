# ADR-001: Stack & architectural decisions

**Status**: Accepted
**Date**: 2026-04-22
**Deciders**: product + eng lead

## Context

A public, cookie-gated Next.js 15 app where users self-register with three skill ratings (0.0–5.0, step 0.1) and browse a filterable leaderboard. Must work well on phones, stay inside Supabase free tier, and feel like a cricket league. Everything below is chosen with those four constraints in mind.

---

## 1. Identity model: cookie-only, no email

**Decision.** A `playerId` httpOnly cookie (1-year, `SameSite=Lax`) is the sole identity. No email, no password, no magic link. Cookie = identity.

**Why.**
- Original spec wanted email-as-soft-identity. User has explicitly asked for email to be removed. Eliminates an entire class of complexity (duplicate handling, verification, leak risk).
- Zero auth UX friction on mobile — the primary device.
- RLS stays simple (public SELECT only; all writes go through a server-action + secret-key path).

**Trade-offs accepted.**
- Cookies cleared → identity lost forever. No recovery path. Must be loudly documented in README.
- Cross-device continuity impossible.
- Schema designed so adding a nullable `email` or `userId` later is non-breaking — a strict one-way door this is not.

**Alternatives considered.**
- *Email as soft identity with cookie re-hydration* — rejected by user.
- *Magic-link auth* — overkill for v1; revisit if we hit pain.

---

## 2. Data fetching: Server Component + nuqs URL state (simplified from original plan)

**Decision.** `/leaderboard` is rendered by a Server Component that reads `searchParams` and calls `queryPlayers(params)`. The toolbar (filters/sort/search/page) is a Client Component that mutates URL params via `nuqs` — URL changes trigger an RSC re-render with new data. No TanStack Query in v1.

**Why.**
- Simpler state story: URL is the single source of truth; no client cache to invalidate.
- Next 16 + Turbopack makes RSC re-renders quick enough on localhost and Vercel.
- Keeps the shared `queryPlayers` function — if RSC latency becomes painful, we can add a Route Handler (`GET /api/leaderboard`) + TanStack Query client layer without touching the DB code.

**Trade-offs accepted.**
- Every filter change is a full RSC round-trip. Debounced search + step-based sliders keep this bounded.
- Shareable URLs still work (main benefit of nuqs preserved).

**Alternatives considered.**
- *Server Component + TanStack Query hybrid* — the original plan. More code (provider setup, route handler, query keys, invalidation) for marginal perceived-latency gain on a v1 scale. Deferred until it matters.
- *All client-side fetching* — slower first paint, worse LCP on 3G. Rejected.

---

## 3. URL state via `nuqs`

**Decision.** `nuqs` manages `?sort`, `?order`, `?batting`, `?fielding`, `?bowling`, `?search`, `?page`, `?pageSize`. Range filters encode as `batting=3.0-5.0` (string parsed to `[min, max]`).

**Why.** Type-safe, minimal boilerplate, plays well with App Router. Avoids the `searchParams`-prop-drilling tax.

**Alternatives considered.** Hand-rolled `useSearchParams` + setters (more boilerplate, more bugs); Zustand URL sync (overkill).

---

## 4. Decimals end-to-end — never `FLOAT`

**Decision.** Three ratings are Postgres `DECIMAL(3,2)`. The computed average is a `DECIMAL(4,2)` **generated column** (`GENERATED ALWAYS AS ((batting_rating + fielding_rating + bowling_rating) / 3.0) STORED`). Prisma type: `Decimal`. Zod validates `multipleOf(0.1)` + `min(0) / max(5)`. Server actions coerce incoming `number` → `new Decimal(value)` before persist. Display uses `value.toFixed(1)` for individual ratings and `.toFixed(2)` for average.

**Why.**
- `0.1 + 0.2 === 0.3` is false in IEEE-754. Filter comparisons, equality, and computed averages all silently drift with `Float`. `DECIMAL(3,2)` stores `3.5` exactly.
- Generated column guarantees the displayed average matches the filter-sortable column — no client-side computation drift.

**Implementation note.** Prisma's `@default(dbgenerated("..."))` emits a plain `DEFAULT`, not a `GENERATED ALWAYS AS ... STORED`. Our initial `prisma migrate dev` creates the column with a default; a hand-written follow-up SQL migration drops and recreates it as a true generated column. See `docs/database-schema.md`.

**Trade-offs accepted.** Decimal arithmetic across the wire needs care — `@prisma/client/runtime/library`'s `Decimal` is a class, not a number; we convert to `number` at display time only after `toFixed`.

---

## 5. Edit-ownership: cookie-verified server action, not request payload

**Decision.** `updatePlayer` server action calls `cookies()` internally, reads `playerId`, and updates `WHERE id = cookiePlayerId`. The request body does **not** include a player id; the id from the cookie is the only id the server trusts. Same rule for any future `deletePlayer`.

**Why.** Defence-in-depth. Middleware already redirects uncookied users, but a crafted request with someone else's id would otherwise pass middleware trivially. Anchoring identity in a single server-side source closes that hole.

**Supabase RLS role.** RLS is set to allow public SELECT only. INSERT/UPDATE/DELETE are not allowed via the publishable key — all writes go through server actions that use the **secret key** (Supabase's new scoped API key format; equivalent to the legacy `service_role` JWT). The publishable key in the browser bundle can therefore only *read* data; the Supabase auto-REST endpoint can't be used to inject or mutate rows.

---

## 6. Photo pipeline: compress client-side, upload to Supabase Storage, store URL

**Decision.**
1. On form submit, `browser-image-compression` reduces photo to max ~1 MB, 1600 px longest edge, WebP.
2. Upload to `player-photos` public bucket (path: `players/{id}.webp`, or a random UUID before the player id is minted).
3. Public URL stored on `Player.photoUrl`.
4. On edit with a replacement, the old object is deleted **before** insert of the new row — no orphans.

**Why.** Free-tier storage is 1 GB. At ~150 KB/photo post-compression, that's ~6,500 players before tightening. Deleting orphans keeps the bucket clean.

**Failure mode.** If upload fails, the registration fails before any DB insert. No partial state.

---

## 7. UI kit: shadcn/ui + cricket-league theme

**Decision.** shadcn/ui as base (owned components, no runtime cost). Custom Tailwind theme:
- Pitch-green primary `#0f4c2a`
- Gold accent `#c9a14a` (top-3 rank medals, "Average" column highlight)
- Off-white field `#f5f3ee` background
- Slab-serif display font (e.g., Bitter / Roboto Slab via `next/font`) for page headings
- Subtle pitch-stripe SVG pattern on `/leaderboard` header

**Why.** shadcn/ui ships accessible primitives without lock-in. Cricket-league feel is achieved with tokens + typography, not a heavy theme library.

---

## 8. Deferred

- Rate limiting on `/register` — skipped for v1 (user's call). If spam appears, add an IP-bucket check in the server action.
- Self-delete — skipped for v1.
- Age field — dropped from the schema and form (user decision after initial build).
- Email/details search — name only (pg_trgm GIN index).
