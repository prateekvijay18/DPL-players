"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SortKey } from "@/lib/schemas/leaderboard";

const SORT_OPTIONS: { label: string; key: SortKey }[] = [
  { label: "Avg", key: "averageRating" },
  { label: "Bat", key: "battingRating" },
  { label: "Field", key: "fieldingRating" },
  { label: "Bowl", key: "bowlingRating" },
  { label: "Name", key: "name" },
];

export function MobileSortBar() {
  const pathname = usePathname();
  const params = useSearchParams();
  const currentSort = params.get("sort") ?? "averageRating";
  const currentOrder = params.get("order") ?? "desc";

  return (
    <div className="sm:hidden flex items-center gap-2 px-1 pb-2 overflow-x-auto">
      <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        Sort
      </span>
      {SORT_OPTIONS.map(({ label, key }) => {
        const isActive = currentSort === key;
        const nextOrder =
          isActive && currentOrder === "desc" ? "asc" : isActive ? "desc" : "desc";
        const next = new URLSearchParams(params.toString());
        next.set("sort", key);
        next.set("order", nextOrder);
        next.set("page", "1");

        return (
          <Link
            key={key}
            href={`${pathname}?${next.toString()}`}
            scroll={false}
            className={cn(
              "shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {label}
            <span aria-hidden className="text-[10px]">
              {isActive ? (currentOrder === "desc" ? "▾" : "▴") : "▾"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
