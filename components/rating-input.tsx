"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type RatingInputProps = {
  value: number;
  onChange: (next: number) => void;
  label: string;
  id?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
};

const clamp = (n: number) => Math.max(0, Math.min(5, n));
const snap = (n: number) => Math.round(n * 10) / 10;
const normalize = (n: number) => snap(clamp(n));

export function RatingInput({
  value,
  onChange,
  label,
  id,
  disabled,
  error,
  className,
}: RatingInputProps) {
  const reactId = React.useId();
  const sliderId = id ?? `rating-${reactId}`;
  const errorId = `${sliderId}-error`;

  const commit = React.useCallback(
    (n: number) => {
      const next = normalize(n);
      if (next !== value) onChange(next);
    },
    [onChange, value],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <Label htmlFor={sliderId} className="text-sm font-medium">
          {label}
        </Label>
        <span className="tabular-nums text-2xl font-semibold leading-none text-primary">
          {value.toFixed(1)}
          <span className="ml-1 align-baseline text-sm font-normal text-muted-foreground">
            / 5
          </span>
        </span>
      </div>

      <Slider
        id={sliderId}
        disabled={disabled}
        min={0}
        max={5}
        step={0.1}
        value={[value]}
        onValueChange={([v]) => {
          if (typeof v === "number") commit(v);
        }}
        aria-label={label}
        aria-valuetext={`${value.toFixed(1)} out of 5`}
        aria-describedby={error ? errorId : undefined}
        className="rating-slider"
      />

      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <span>0.0</span>
        <span>Step 0.1</span>
        <span>5.0</span>
      </div>

      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
