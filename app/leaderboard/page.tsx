import Link from "next/link";
import { redirect } from "next/navigation";
import { parseLeaderboardQuery } from "@/lib/schemas/leaderboard";
import { queryPlayers } from "@/lib/queries/players";
import { getPlayerId } from "@/lib/cookies";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { GenderFilterToggle } from "./gender-filter";
import { Podium } from "./podium";
import { LeaderboardTable } from "./leaderboard-table";

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

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden rise rise-delay-3 p-2 sm:p-4">
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
            <div className="text-6xl">🏏</div>
            <p className="text-xl font-bold">
              {q.search ? `No players named "${q.search}"` : "No players yet"}
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
          <LeaderboardTable players={players} youId={you.id} />
        )}
      </div>
    </main>
  );
}
