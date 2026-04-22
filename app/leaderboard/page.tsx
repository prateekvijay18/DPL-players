import Link from "next/link";
import { redirect } from "next/navigation";
import { parseLeaderboardQuery } from "@/lib/schemas/leaderboard";
import { queryPlayers } from "@/lib/queries/players";
import { getPlayerId } from "@/lib/cookies";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import { PlayerAvatar } from "@/components/player-avatar";
import { RankMedal } from "@/components/rank-medal";
import { CaptainBadge } from "@/components/captain-badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortHeader } from "./sort-header";
import { HeaderSearch } from "./header-search";
import { GenderFilterToggle } from "./gender-filter";
import { Podium } from "./podium";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeaderboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = parseLeaderboardQuery(params);

  const youId = await getPlayerId();
  if (!youId) redirect("/register");

  const you = await prisma.player.findUnique({
    where: { id: youId },
    select: { id: true, name: true },
  });
  if (!you) redirect("/register");

  const { players } = await queryPlayers(q);

  // Podium uses the top 3 of the unfiltered default-sorted ranking, only shown on
  // the default view (no search, no gender filter, default sort) so ranking is unambiguous.
  const isDefaultView =
    !q.search &&
    q.gender === "ALL" &&
    q.sort === "averageRating" &&
    q.order === "desc";
  const podiumTop = isDefaultView ? players.slice(0, 3) : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10 space-y-8">
      {/* ─── Scoreboard hero ─────────────────────────────────── */}
      <section className="scoreboard-hero relative overflow-hidden rounded-[2rem] shadow-2xl">
        <div className="relative z-10 flex flex-col gap-5 px-6 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-14">
          <div className="rise">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gold-bright">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold-bright shadow-[0_0_12px_var(--gold-bright)]" />
              Live · Devx Premier League
            </div>
            <h1
              className="scoreboard-num scoreboard-glow mt-2 text-5xl sm:text-7xl leading-[0.85] text-white"
            >
              LEADER<span className="text-gold-bright">BOARD</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 rise rise-delay-1">
            <ThemeToggle />
            <Button asChild size="lg" className="btn-gold rounded-full px-6">
              <Link href="/leaderboard/edit">
                <span className="mr-1.5">✏️</span> Edit my info
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Podium (top 3) ─────────────────────────────────── */}
      {podiumTop.length > 0 ? (
        <div className="pt-4">
          <Podium top={podiumTop} youId={you.id} />
        </div>
      ) : null}

      {/* ─── Gender filter ─────────────────────────────────── */}
      <div className="flex justify-center rise rise-delay-2">
        <GenderFilterToggle />
      </div>

      {/* ─── Table ──────────────────────────────────────────── */}
      <div className="glass rounded-2xl overflow-hidden rise rise-delay-3 p-2 sm:p-4">
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
            <div className="text-6xl">🏏</div>
            <p className="text-xl font-bold">
              {q.search ? `No players named “${q.search}”` : "No players yet"}
            </p>
            {q.search ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/leaderboard">Clear search</Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground max-w-xs">
                Share the link with friends to fill the league.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-primary/30 hover:bg-transparent bg-primary/5">
                  <TableHead className="sticky-col left-0 w-14 text-center text-[10px] font-black uppercase tracking-widest">
                    #
                  </TableHead>
                  <TableHead className="sticky-col sticky-col-divider left-14 min-w-64">
                    <div className="flex items-center gap-3 py-1">
                      <SortHeader label="Player" sortKey="name" />
                      <HeaderSearch className="ml-auto w-40 sm:w-52" />
                    </div>
                  </TableHead>
                  <TableHead className="w-20 text-right">
                    <SortHeader label="Bat" sortKey="battingRating" align="right" />
                  </TableHead>
                  <TableHead className="w-20 text-right">
                    <SortHeader label="Field" sortKey="fieldingRating" align="right" />
                  </TableHead>
                  <TableHead className="w-20 text-right">
                    <SortHeader label="Bowl" sortKey="bowlingRating" align="right" />
                  </TableHead>
                  <TableHead className="w-24 text-right">
                    <SortHeader label="Avg" sortKey="averageRating" align="right" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((p, i) => {
                  const rank = i + 1;
                  const isYou = p.id === you.id;
                  return (
                    <TableRow
                      key={p.id}
                      className={cn("lb-row border-b border-border/50", isYou && "lb-row-you")}
                    >
                      <TableCell className="sticky-col left-0 text-center">
                        <RankMedal rank={rank} />
                      </TableCell>
                      <TableCell className="sticky-col sticky-col-divider left-14">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar id={p.id} name={p.name} photoUrl={p.photoUrl} size="sm" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold truncate">{p.name}</span>
                              <CaptainBadge role={p.role} />
                              {isYou ? (
                                <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                                  You
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{p.battingRating}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{p.fieldingRating}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{p.bowlingRating}</TableCell>
                      <TableCell className="text-right">
                        <span className="avg-pill scoreboard-num text-lg">
                          {p.averageRating}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </main>
  );
}
