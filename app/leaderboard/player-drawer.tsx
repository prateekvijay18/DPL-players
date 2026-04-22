import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/player-avatar";
import { RankMedal } from "@/components/rank-medal";
import { CaptainBadge } from "@/components/captain-badge";
import type { PlayerRow } from "@/lib/queries/players";

type Props = {
  player: PlayerRow;
  rank: number;
  isYou: boolean;
  onClose: () => void;
};

const RATINGS = [
  { label: "BAT", key: "battingRating", emoji: "🏏" },
  { label: "FLD", key: "fieldingRating", emoji: "🧤" },
  { label: "BWL", key: "bowlingRating", emoji: "🎳" },
] as const;

export function PlayerDrawerContent({ player, rank, isYou, onClose }: Props) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Player Profile
        </span>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <XIcon className="size-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto space-y-6 px-6 py-8">
        {/* Avatar + identity */}
        <div className="flex flex-col items-center gap-4 text-center">
          <PlayerAvatar
            id={player.id}
            name={player.name}
            photoUrl={player.photoUrl}
            size="lg"
            className="size-24 text-3xl ring-4 ring-primary/20"
          />
          <div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <h2 className="text-xl font-bold">{player.name}</h2>
              <CaptainBadge role={player.role} />
              {isYou && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary-foreground">
                  You
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <RankMedal rank={rank} />
              <span>·</span>
              <span>{player.gender === "MALE" ? "♂ Male" : "♀ Female"}</span>
            </div>
          </div>
        </div>

        {/* Average rating */}
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Average Rating
          </div>
          <div className="scoreboard-num scoreboard-glow mt-2 text-6xl text-primary">
            {player.averageRating}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">out of 5.00</div>
        </div>

        {/* Individual skill ratings */}
        <div className="grid grid-cols-3 gap-3">
          {RATINGS.map(({ label, key, emoji }) => (
            <div key={label} className="glass rounded-xl p-4 text-center">
              <div className="text-2xl">{emoji}</div>
              <div className="scoreboard-num mt-2 text-2xl font-bold">
                {player[key]}
              </div>
              <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
