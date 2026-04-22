"use client";

import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GENDER_FILTER_VALUES,
  SORT_KEYS,
  type GenderFilter,
  type SortKey,
} from "@/lib/schemas/leaderboard";

export function ClearFiltersButton() {
  const [{ search, gender, sort, order }, setFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      gender: parseAsStringEnum<GenderFilter>([
        ...GENDER_FILTER_VALUES,
      ]).withDefault("ALL"),
      sort: parseAsStringEnum<SortKey>([...SORT_KEYS]).withDefault(
        "averageRating",
      ),
      order: parseAsStringEnum<"asc" | "desc">(["asc", "desc"]).withDefault(
        "desc",
      ),
    },
    { shallow: false },
  );

  const hasFilters =
    Boolean(search) ||
    gender !== "ALL" ||
    sort !== "averageRating" ||
    order !== "desc";
  if (!hasFilters) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() =>
        setFilters({ search: null, gender: null, sort: null, order: null })
      }
      className="h-8 rounded-full gap-1 text-xs font-semibold"
    >
      <XIcon className="size-3" />
      Clear filters
    </Button>
  );
}
