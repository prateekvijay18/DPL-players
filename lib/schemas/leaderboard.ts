import { z } from "zod";

export const SORT_KEYS = [
  "name",
  "battingRating",
  "fieldingRating",
  "bowlingRating",
  "averageRating",
] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const GENDER_FILTER_VALUES = ["ALL", "MALE", "FEMALE"] as const;
export type GenderFilter = (typeof GENDER_FILTER_VALUES)[number];

export const leaderboardQuerySchema = z.object({
  sort: z.enum(SORT_KEYS).default("averageRating"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().trim().max(50).optional(),
  gender: z.enum(GENDER_FILTER_VALUES).default("ALL"),
});

export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;

/** Parse a plain object of URL search params into LeaderboardQuery (with defaults). */
export function parseLeaderboardQuery(
  params: Record<string, string | string[] | undefined>,
): LeaderboardQuery {
  const single: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(params)) {
    single[k] = Array.isArray(v) ? v[0] : v;
  }
  const parsed = leaderboardQuerySchema.safeParse(single);
  if (!parsed.success) {
    return leaderboardQuerySchema.parse({});
  }
  return parsed.data;
}
