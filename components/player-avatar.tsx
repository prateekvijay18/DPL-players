"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
};

// Deterministic hue from id so the same player always gets the same fallback colour.
function hueFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 360;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function PlayerAvatar({
  id,
  name,
  photoUrl,
  size = "md",
  className,
}: Props) {
  const hue = hueFromId(id);
  const bg = `oklch(0.72 0.14 ${hue})`;
  const fg = `oklch(0.2 0.04 ${hue})`;

  return (
    <Avatar className={cn(SIZE[size], className)}>
      {photoUrl ? <AvatarImage src={photoUrl} alt={name} /> : null}
      <AvatarFallback
        className="font-semibold tabular-nums"
        style={{ backgroundColor: bg, color: fg }}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
