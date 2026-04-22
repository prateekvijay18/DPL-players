import { z } from "zod";

export const GenderEnum = z.enum(["MALE", "FEMALE"]);
export type Gender = z.infer<typeof GenderEnum>;

export const GENDER_OPTIONS: ReadonlyArray<{ value: Gender; label: string }> = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

export const RoleEnum = z.enum(["PLAYER", "CAPTAIN"]);
export type Role = z.infer<typeof RoleEnum>;

export const ROLE_OPTIONS: ReadonlyArray<{ value: Role; label: string; emoji: string }> = [
  { value: "PLAYER", label: "Player", emoji: "🏏" },
  { value: "CAPTAIN", label: "Captain", emoji: "🧢" },
];

/** Rating: 0.0–5.0, step 0.1. Rejects 3.14, 5.1, -0.1; accepts 3.5, 4.0, 0.0. */
export const ratingSchema = z
  .number()
  .min(0, "Must be at least 0.0")
  .max(5, "Must be at most 5.0")
  .refine((n) => Math.round(n * 10) / 10 === n, {
    message: "Must be in steps of 0.1",
  });

const playerBase = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  gender: GenderEnum,
  role: RoleEnum,
  photoUrl: z.string().url().nullable().optional(),
  battingRating: ratingSchema,
  fieldingRating: ratingSchema,
  bowlingRating: ratingSchema,
});

export const registerPlayerSchema = playerBase;
export const updatePlayerSchema = playerBase;

export type RegisterPlayerInput = z.infer<typeof registerPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
