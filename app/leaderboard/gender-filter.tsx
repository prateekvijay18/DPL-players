"use client";

import { parseAsStringEnum, useQueryState } from "nuqs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GENDER_FILTER_VALUES, type GenderFilter } from "@/lib/schemas/leaderboard";
import { useNavigationStore } from "@/lib/stores/navigation-store";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function GenderFilterToggle({ className }: Props) {
  const [value, setValue] = useQueryState(
    "gender",
    parseAsStringEnum<GenderFilter>([...GENDER_FILTER_VALUES])
      .withDefault("ALL")
      .withOptions({ shallow: false }),
  );
  const startNav = useNavigationStore((s) => s.start);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
        Show
      </span>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => {
          if (!v) return;
          startNav();
          setValue(v === "ALL" ? null : (v as GenderFilter));
        }}
        variant="outline"
        size="sm"
        className="
          rounded-full bg-card/60 backdrop-blur-sm p-0.5
          *:rounded-full *:border-none *:px-3 *:text-xs *:font-semibold
          *:data-[state=on]:bg-primary *:data-[state=on]:text-primary-foreground
          *:data-[state=on]:shadow-sm
        "
      >
        <ToggleGroupItem value="ALL" aria-label="All players">
          All
        </ToggleGroupItem>
        <ToggleGroupItem value="MALE" aria-label="Men only">
          Men
        </ToggleGroupItem>
        <ToggleGroupItem value="FEMALE" aria-label="Women only">
          Women
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
