import { PlayerAvatar } from "@/components/player-avatar";
import { CaptainBadge } from "@/components/captain-badge";
import { cn } from "@/lib/utils";
import type { PlayerRow } from "@/lib/queries/players";

type Props = {
  top: PlayerRow[]; // up to 3
  youId?: string;
  className?: string;
};

const PLACE_META = [
  {
    place: 1,
    label: "Champion",
    emoji: "🏆",
    order: "sm:order-2",
    height: "sm:pt-8 sm:pb-10",
    badgeBg: "bg-gold-bright text-gold-foreground",
    wrapperExtra: "sm:scale-105 sm:-translate-y-4 z-10",
    cardExtra: "podium-champion",
  },
  {
    place: 2,
    label: "Runner-up",
    emoji: "🥈",
    order: "sm:order-1",
    height: "sm:pt-6 sm:pb-8",
    badgeBg: "bg-white/90 text-slate-700",
    wrapperExtra: "",
    cardExtra: "",
  },
  {
    place: 3,
    label: "3rd",
    emoji: "🥉",
    order: "sm:order-3",
    height: "sm:pt-6 sm:pb-8",
    badgeBg: "bg-orange-800/80 text-orange-50",
    wrapperExtra: "",
    cardExtra: "",
  },
] as const;

export function Podium({ top, youId, className }: Props) {
  if (top.length === 0) return null;

  return (
    <section
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end",
        className,
      )}
    >
      {PLACE_META.map((meta, idx) => {
        const p = top[idx];
        if (!p) return null;
        const isYou = p.id === youId;
        return (
          // Outer wrapper — no overflow clipping, so the floating ribbon renders above the card edge.
          <div
            key={p.id}
            className={cn(
              "relative rise pt-3",
              meta.order,
              meta.wrapperExtra,
              idx === 0 && "rise-delay-2",
              idx === 1 && "rise-delay-1",
              idx === 2 && "rise-delay-3",
            )}
          >
            {/* Floating ribbon — lives on the wrapper, not the card */}
            <div
              className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] shadow-md",
                meta.badgeBg,
              )}
            >
              <span className="text-sm leading-none">{meta.emoji}</span>
              <span>{meta.label}</span>
            </div>

            {/* Card — has overflow:hidden for the gradient border + glow */}
            <div
              className={cn(
                "podium-card flex flex-col items-center justify-between p-5 sm:p-6",
                meta.height,
                meta.cardExtra,
              )}
            >
              <div className="flex flex-col items-center gap-3 pt-4">
                <PlayerAvatar
                  id={p.id}
                  name={p.name}
                  photoUrl={p.photoUrl}
                  size="lg"
                  className={cn(
                    meta.place === 1 &&
                      "ring-4 ring-gold-bright/70 ring-offset-4 ring-offset-card",
                    "shadow-xl",
                  )}
                />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 font-semibold">
                    <span className="truncate">{p.name}</span>
                    {isYou ? (
                      <span className="rounded bg-primary text-primary-foreground px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                        You
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex justify-center">
                    <CaptainBadge role={p.role} variant="pill" />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col items-center">
                <div
                  className={cn(
                    "scoreboard-num text-6xl sm:text-7xl text-primary",
                    meta.place === 1 && "scoreboard-glow",
                  )}
                >
                  {p.averageRating}
                </div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Avg rating
                </div>
                <div className="mt-3 flex gap-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <span className="flex flex-col items-center">
                    <span className="text-[11px] font-bold tabular-nums text-foreground">
                      {p.battingRating}
                    </span>
                    BAT
                  </span>
                  <span className="w-px bg-border" />
                  <span className="flex flex-col items-center">
                    <span className="text-[11px] font-bold tabular-nums text-foreground">
                      {p.fieldingRating}
                    </span>
                    FLD
                  </span>
                  <span className="w-px bg-border" />
                  <span className="flex flex-col items-center">
                    <span className="text-[11px] font-bold tabular-nums text-foreground">
                      {p.bowlingRating}
                    </span>
                    BWL
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
