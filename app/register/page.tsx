import { redirect } from "next/navigation";
import { RegisterForm } from "./register-form";
import { getPlayerId } from "@/lib/cookies";
import { prisma } from "@/lib/db";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const id = await getPlayerId();
  if (id) {
    const exists = await prisma.player.findUnique({
      where: { id },
      select: { id: true },
    });
    if (exists) redirect("/leaderboard");
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10 space-y-6">
      {/* Scoreboard hero */}
      <section className="scoreboard-hero relative overflow-hidden rounded-[2rem] shadow-2xl">
        <div className="absolute right-4 top-4 z-20 rise rise-delay-2">
          <ThemeToggle />
        </div>
        <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-12 text-center">
          <div className="rise flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-gold-bright">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold-bright shadow-[0_0_12px_var(--gold-bright)]" />
            Devx Premier League
          </div>
          <h1 className="scoreboard-num scoreboard-glow rise rise-delay-1 mt-3 text-6xl sm:text-7xl text-white">
            JOIN THE <span className="text-gold-bright">LEAGUE</span>
          </h1>
          <p className="rise rise-delay-2 mt-3 text-sm sm:text-base text-white/75">
            🏏 Self-register, rate your game, climb the scoreboard.
          </p>
        </div>
      </section>

      {/* Form card */}
      <div className="glass rise rise-delay-3 rounded-3xl p-6 sm:p-8">
        <RegisterForm />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        🍪 Your registration lives in a browser cookie. Clearing cookies = new profile (no recovery).
      </p>
    </main>
  );
}
