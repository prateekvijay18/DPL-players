import { cn } from "@/lib/utils";

type Props = {
  rank: number;
  className?: string;
};

const MEDALS: Record<number, { emoji: string; ring: string }> = {
  1: { emoji: "🥇", ring: "ring-amber-400/70" },
  2: { emoji: "🥈", ring: "ring-slate-400/70" },
  3: { emoji: "🥉", ring: "ring-orange-700/60" },
};

export function RankMedal({ rank, className }: Props) {
  const medal = MEDALS[rank];
  if (!medal) {
    return (
      <span
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground tabular-nums",
          className,
        )}
      >
        {rank}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full bg-card ring-2 text-base",
        medal.ring,
        className,
      )}
      aria-label={`Rank ${rank}`}
      title={`Rank ${rank}`}
    >
      {medal.emoji}
    </span>
  );
}
