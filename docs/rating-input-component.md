# `<RatingInput>` — the reusable 0–5 slider

Used 3× on `/register` and 3× on `/leaderboard/edit`. **Slider-only input** — the original design had a numeric input paired with the slider; that was removed post-v0 by user request to keep interaction to a single control.

## Props

```ts
type RatingInputProps = {
  value: number;                    // 0–5, step 0.1
  onChange: (next: number) => void;
  label: string;                    // e.g., "Batting"
  id?: string;                      // for <label htmlFor>
  disabled?: boolean;
  error?: string;                   // from react-hook-form
  className?: string;
};
```

## Behavioural contract

1. **Single source of truth**: `value` is the only state; the slider is the sole control.
2. **Clamping + snapping**: any `onValueChange` from the slider is rounded to 1 decimal and clamped to `[0, 5]` before invoking `onChange`.
3. **Step**: `0.1` — slider step + keyboard arrow delta (native Radix behaviour).
4. **Keyboard** (native from Radix Slider):
   - `ArrowRight` / `ArrowUp` → +0.1
   - `ArrowLeft` / `ArrowDown` → −0.1
   - `Home` → 0.0, `End` → 5.0
5. **Mobile**: slider is touch-draggable and snaps to 0.1 (step).
6. **Display**: current value shown large next to the label, formatted to one decimal (e.g., `3.5 / 5`). A small axis label below the slider reads `0.0 · Step 0.1 · 5.0`.
7. **Colour-graded bar**: the slider track has a red→yellow→green gradient (`.rating-slider` class in `globals.css`); the thumb is pitch-green with a glow ring.
8. **Accessibility**:
   - `<label>` linked via `htmlFor`.
   - Slider exposes `aria-valuemin=0`, `aria-valuemax=5`, `aria-valuenow={value}`, and an explicit `aria-valuetext={`${value.toFixed(1)} out of 5`}`.
   - Error text (from `error` prop) is linked via `aria-describedby`.

## Layout

```
┌────────────────────────────────────────┐
│ Batting                      4.2 / 5   │  ← label + big readout
│                                        │
│ ━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━       │  ← gradient slider
│                                        │
│ 0.0       STEP 0.1         5.0         │  ← axis label
└────────────────────────────────────────┘
```

## Skeleton (final source: `components/rating-input.tsx`)

```tsx
'use client';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const clamp = (n: number) => Math.max(0, Math.min(5, n));
const snap = (n: number) => Math.round(n * 10) / 10;

export function RatingInput({ value, onChange, label, error }: RatingInputProps) {
  const commit = (n: number) => onChange(snap(clamp(n)));

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        <span className="tabular-nums text-2xl font-semibold text-primary">
          {value.toFixed(1)} <span className="text-sm text-muted-foreground">/ 5</span>
        </span>
      </div>
      <Slider
        min={0}
        max={5}
        step={0.1}
        value={[value]}
        onValueChange={([v]) => commit(v)}
        aria-valuetext={`${value.toFixed(1)} out of 5`}
        className="rating-slider"
      />
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <span>0.0</span><span>Step 0.1</span><span>5.0</span>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

## Integration with react-hook-form

```tsx
<Controller
  control={form.control}
  name="battingRating"
  render={({ field, fieldState }) => (
    <RatingInput
      label="Batting"
      value={field.value}
      onChange={field.onChange}
      error={fieldState.error?.message}
    />
  )}
/>
```

## Manual test checklist

- Drag slider — readout updates to one decimal.
- Focus slider, press `ArrowRight` — value increases by 0.1.
- Press `Home` / `End` — jumps to 0.0 / 5.0.
- On iPhone viewport — touch-drag works smoothly, snaps to 0.1 stops.
- Screen reader reads "Batting, 4.2 out of 5, slider" on focus.
