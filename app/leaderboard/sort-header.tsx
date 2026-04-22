"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { SortKey } from "@/lib/schemas/leaderboard";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  sortKey: SortKey;
  align?: "left" | "right";
  className?: string;
};

/**
 * Server-friendly sort header: clicking cycles asc → desc → asc for the given column
 * by navigating to a URL with updated ?sort and ?order params.
 * Renders as <Link> so server component re-renders take over.
 */
export function SortHeader({ label, sortKey, align = "left", className }: Props) {
  const pathname = usePathname();
  const params = useSearchParams();
  const currentSort = params.get("sort") ?? "averageRating";
  const currentOrder = params.get("order") ?? "desc";
  const isActive = currentSort === sortKey;

  const nextOrder =
    isActive && currentOrder === "desc" ? "asc" : isActive ? "desc" : "desc";

  const next = new URLSearchParams(params.toString());
  next.set("sort", sortKey);
  next.set("order", nextOrder);
  next.set("page", "1");

  return (
    <Link
      href={`${pathname}?${next.toString()}`}
      scroll={false}
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
        align === "right" && "justify-end",
        className,
      )}
    >
      {label}
      {isActive ? (
        <span aria-hidden className="text-xs">
          {currentOrder === "desc" ? "▾" : "▴"}
        </span>
      ) : (
        <span aria-hidden className="text-xs opacity-30">▾</span>
      )}
    </Link>
  );
}
