# Validation contract

Shared Zod schemas between client (react-hook-form + `@hookform/resolvers/zod`) and server (server actions re-validate before persist). `Decimal` coercion happens at the server boundary only.

## `lib/schemas/player.ts`

```ts
import { z } from 'zod';

/** Rating: 0.0–5.0, step 0.1. Rejects 3.14, 5.1, -0.1; accepts 3.5, 4.0, 0.0. */
export const ratingSchema = z
  .number({ invalid_type_error: 'Rating must be a number' })
  .min(0, 'Rating must be at least 0.0')
  .max(5, 'Rating must be at most 5.0')
  .multipleOf(0.1, 'Rating must be in steps of 0.1');

/** Shared base — fields common to register + update. */
const playerBase = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
  photoUrl: z.string().url().nullable().optional(),
  additionalDetails: z.string().trim().max(500, 'Additional details must be at most 500 characters').nullable().optional(),
  battingRating: ratingSchema,
  fieldingRating: ratingSchema,
  bowlingRating: ratingSchema,
});

export const registerPlayerSchema = playerBase;
export const updatePlayerSchema = playerBase; // same shape for v1 — edit replaces all fields

export type RegisterPlayerInput = z.infer<typeof registerPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
```

## `lib/schemas/leaderboard.ts`

For URL params on `/api/leaderboard`:

```ts
import { z } from 'zod';

const rangeString = z
  .string()
  .regex(/^\d(\.\d)?-\d(\.\d)?$/)
  .transform((s) => s.split('-').map(Number) as [number, number])
  .refine(([min, max]) => min >= 0 && max <= 5 && min <= max, 'Invalid range');

export const leaderboardQuerySchema = z.object({
  sort: z.enum(['name', 'battingRating', 'fieldingRating', 'bowlingRating', 'averageRating']).default('averageRating'),
  order: z.enum(['asc', 'desc']).default('desc'),
  batting: rangeString.optional(),
  fielding: rangeString.optional(),
  bowling: rangeString.optional(),
  search: z.string().trim().max(50).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().refine((n) => [10, 20, 50, 100].includes(n)).default(20),
});

export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
```

## Decimal coercion (server only)

Incoming `number` → Prisma `Decimal` at the server action boundary. Use the string form to avoid IEEE-754 intermediates:

```ts
// lib/decimal.ts
import { Prisma } from '@prisma/client';

export const toDecimal = (n: number): Prisma.Decimal =>
  new Prisma.Decimal(n.toFixed(1)); // clamp to one decimal, as a string
```

Usage inside `registerPlayer`:

```ts
'use server';
import { registerPlayerSchema } from '@/lib/schemas/player';
import { toDecimal } from '@/lib/decimal';
import { prisma } from '@/lib/db';

export async function registerPlayer(input: unknown) {
  const data = registerPlayerSchema.parse(input); // throws on invalid
  const player = await prisma.player.create({
    data: {
      name: data.name,
      photoUrl: data.photoUrl ?? null,
      additionalDetails: data.additionalDetails ?? null,
      battingRating: toDecimal(data.battingRating),
      fieldingRating: toDecimal(data.fieldingRating),
      bowlingRating: toDecimal(data.bowlingRating),
      // averageRating omitted — generated column
    },
  });
  // set cookie, redirect...
}
```

## Display helpers

```ts
// lib/format.ts — called only in Client Components, never in server queries
export const formatRating = (d: { toFixed(n: number): string }) => d.toFixed(1);
export const formatAverage = (d: { toFixed(n: number): string }) => d.toFixed(2);
```

Prisma's `Decimal` (from `@prisma/client/runtime/library`) has a `toFixed` method — no conversion needed. If serialising over the wire (e.g., in a Route Handler JSON response), convert to string with `.toString()` and parse back to `Decimal` on the client, or send a pre-formatted display string alongside. For v1, we send `.toString()` and format on the client.

## Client-side form validation

`react-hook-form` + `zodResolver(registerPlayerSchema)` gives inline field errors. Rating fields are bound to the shared `<RatingInput>` component (spec in [rating-input-component.md](./rating-input-component.md)).

## Why re-validate server-side

Client validation is a UX convenience — it's trivially bypassable. The server action re-runs `.parse()` and rejects with a structured error before any DB write. Same schema, same error messages — no drift.
