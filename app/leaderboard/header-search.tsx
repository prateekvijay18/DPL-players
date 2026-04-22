"use client";

import * as React from "react";
import { parseAsString, useQueryState } from "nuqs";
import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function HeaderSearch({ className }: { className?: string }) {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: false }),
  );

  const [draft, setDraft] = React.useState(search);
  const debounce = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setDraft(search);
  }, [search]);

  const commit = (next: string) => {
    setDraft(next);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setSearch(next || null);
    }, 300);
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <SearchIcon
        aria-hidden
        className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none"
      />
      <Input
        type="search"
        value={draft}
        onChange={(e) => commit(e.target.value)}
        placeholder="Search…"
        className="h-8 pl-8 pr-8 text-xs font-normal normal-case tracking-normal"
        aria-label="Search player name"
      />
      {draft ? (
        <button
          type="button"
          onClick={() => commit("")}
          aria-label="Clear search"
          className="absolute right-2 flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <XIcon className="size-3" />
        </button>
      ) : null}
    </div>
  );
}
