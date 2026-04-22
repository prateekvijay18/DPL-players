import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { LeaderboardQuery } from "@/lib/schemas/leaderboard";

export type PlayerRow = {
  id: string;
  name: string;
  role: "PLAYER" | "CAPTAIN";
  photoUrl: string | null;
  battingRating: string;
  fieldingRating: string;
  bowlingRating: string;
  averageRating: string;
};

export type LeaderboardResult = {
  players: PlayerRow[];
  total: number;
};

function buildWhere(q: LeaderboardQuery): Prisma.PlayerWhereInput {
  const where: Prisma.PlayerWhereInput = {};
  if (q.search) {
    where.name = { contains: q.search, mode: "insensitive" };
  }
  if (q.gender !== "ALL") {
    where.gender = q.gender;
  }
  return where;
}

function buildOrderBy(
  q: LeaderboardQuery,
): Prisma.PlayerOrderByWithRelationInput[] {
  // Primary: the user-chosen sort. Always append full tiebreaker
  // (averageRating desc → batting desc → bowling desc → name asc → id asc)
  // to guarantee stable ordering across requests.
  const primary: Prisma.PlayerOrderByWithRelationInput = {
    [q.sort]: q.order,
  } as Prisma.PlayerOrderByWithRelationInput;

  const fallback: Prisma.PlayerOrderByWithRelationInput[] = [
    { averageRating: "desc" },
    { battingRating: "desc" },
    { bowlingRating: "desc" },
    { name: "asc" },
    { id: "asc" },
  ];

  const pruned = fallback.filter(
    (clause) => !Object.prototype.hasOwnProperty.call(clause, q.sort),
  );
  return [primary, ...pruned];
}

export async function queryPlayers(q: LeaderboardQuery): Promise<LeaderboardResult> {
  const where = buildWhere(q);
  const orderBy = buildOrderBy(q);

  const rows = await prisma.player.findMany({ where, orderBy });

  const players: PlayerRow[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    role: r.role,
    photoUrl: r.photoUrl,
    battingRating: r.battingRating.toFixed(1),
    fieldingRating: r.fieldingRating.toFixed(1),
    bowlingRating: r.bowlingRating.toFixed(1),
    averageRating: r.averageRating.toFixed(2),
  }));

  return { players, total: players.length };
}
