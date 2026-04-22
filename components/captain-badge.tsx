import { cn } from "@/lib/utils";

type Props = {
  role: "PLAYER" | "CAPTAIN";
  variant?: "inline" | "pill";
  className?: string;
};

/**
 * Small "(C)" indicator shown next to a captain's name. Renders nothing for
 * regular players so the UI stays clean.
 */
export function CaptainBadge({ role, variant = "inline", className }: Props) {
  if (role !== "CAPTAIN") return null;

  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-accent/90 text-accent-foreground px-2 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-sm",
          className,
        )}
        title="Captain"
      >
        <span className="text-[11px] leading-none">🧢</span>
        Captain
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-black",
        className,
      )}
      title="Captain"
      aria-label="Captain"
    >
      C
    </span>
  );
}
