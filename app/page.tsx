import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="pitch-stripes w-full max-w-2xl rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          DPL
        </p>
        <h1 className="mt-2 text-4xl font-bold text-primary">
          🏏 DPL Players
        </h1>
        <p className="mt-4 text-muted-foreground">
          Self-register, set your ratings, and climb the leaderboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/register">Join the league</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/leaderboard">View leaderboard</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Scaffold check — Phase 0. Register route comes online in Phase 3.
        </p>
      </div>
    </main>
  );
}
