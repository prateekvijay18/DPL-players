import Link from "next/link";
import { redirect } from "next/navigation";
import { getPlayerId } from "@/lib/cookies";
import { prisma } from "@/lib/db";
import type { RegisterPlayerInput } from "@/lib/schemas/player";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { EditForm } from "./edit-form";

export const dynamic = "force-dynamic";

export default async function EditPage() {
  const id = await getPlayerId();
  if (!id) redirect("/register");

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) redirect("/register");

  const defaults: RegisterPlayerInput = {
    name: player.name,
    gender: player.gender,
    role: player.role,
    photoUrl: player.photoUrl,
    battingRating: Number(player.battingRating.toFixed(1)),
    fieldingRating: Number(player.fieldingRating.toFixed(1)),
    bowlingRating: Number(player.bowlingRating.toFixed(1)),
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10 space-y-6">
      <section className="scoreboard-hero relative overflow-hidden rounded-[2rem] shadow-2xl">
        <div className="absolute right-4 top-4 z-20">
          <ThemeToggle />
        </div>
        <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-12 text-center">
          <div className="rise flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-gold-bright">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold-bright shadow-[0_0_12px_var(--gold-bright)]" />
            Edit Profile
          </div>
          <h1 className="scoreboard-num scoreboard-glow rise rise-delay-1 mt-3 text-5xl sm:text-6xl text-white">
            UPDATE YOUR <span className="text-gold-bright">STATS</span>
          </h1>
          <p className="rise rise-delay-2 mt-3 text-sm sm:text-base text-white/75">
            Hi <span className="font-semibold text-white">{player.name}</span> — re-rate your game or swap your photo.
          </p>
        </div>
      </section>

      <div className="glass rise rise-delay-3 rounded-3xl p-6 sm:p-8">
        <EditForm defaults={defaults} initialPhotoUrl={player.photoUrl} />
      </div>

      <div className="text-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/leaderboard">← Back to leaderboard</Link>
        </Button>
      </div>
    </main>
  );
}
