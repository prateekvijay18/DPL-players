"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const current = mounted ? (theme === "system" ? resolvedTheme : theme) : "dark";
  const next = current === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={`Switch to ${next} theme`}
      onClick={() => setTheme(next)}
      className={cn(
        "relative rounded-full border-white/15 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white transition-colors",
        className,
      )}
    >
      <SunIcon
        className={cn(
          "size-4 transition-all",
          current === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0 absolute",
        )}
      />
      <MoonIcon
        className={cn(
          "size-4 transition-all",
          current === "dark" ? "rotate-90 scale-0 absolute" : "rotate-0 scale-100",
        )}
      />
    </Button>
  );
}
