"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlayerAvatar } from "@/components/player-avatar";
import { RankMedal } from "@/components/rank-medal";
import { CaptainBadge } from "@/components/captain-badge";
import { Sheet } from "@/components/ui/sheet";
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
import { PlayerDrawerContent } from "./player-drawer";
import type { PlayerRow } from "@/lib/queries/players";

type Props = {
  players: PlayerRow[];
  youId: string;
};

export function LeaderboardTable({ players, youId }: Props) {
  const [selected, setSelected] = useState<{ player: PlayerRow; rank: number } | null>(null);

  return (
    <>
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
              const isYou = p.id === youId;
              return (
                <TableRow
                  key={p.id}
                  className={cn(
                    "lb-row border-b border-border/50 cursor-pointer",
                    isYou && "lb-row-you",
                  )}
                  onClick={() => setSelected({ player: p, rank })}
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
                    <span className="avg-pill scoreboard-num text-lg">{p.averageRating}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Sheet open={selected !== null} onClose={() => setSelected(null)}>
        {selected && (
          <PlayerDrawerContent
            player={selected.player}
            rank={selected.rank}
            isYou={selected.player.id === youId}
            onClose={() => setSelected(null)}
          />
        )}
      </Sheet>
    </>
  );
}
