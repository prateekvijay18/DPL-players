"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  registerPlayerSchema,
  type RegisterPlayerInput,
  GENDER_OPTIONS,
  ROLE_OPTIONS,
} from "@/lib/schemas/player";
import { compressPlayerPhoto } from "@/app/register/photo-upload";
import { RatingInput } from "@/components/rating-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type PlayerFormResult =
  | { ok: true; playerId?: string }
  | { ok: false; error: string };

export type PhotoAction = "keep" | "replace" | "remove";

type Props = {
  defaults: RegisterPlayerInput;
  initialPhotoUrl?: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (formData: FormData) => Promise<PlayerFormResult>;
  onSuccess?: (result: PlayerFormResult) => void;
};

export function PlayerForm({
  defaults,
  initialPhotoUrl,
  submitLabel,
  submittingLabel,
  onSubmit,
  onSuccess,
}: Props) {
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(
    initialPhotoUrl ?? null,
  );
  const [photoAction, setPhotoAction] = React.useState<PhotoAction>("keep");
  const [photoBusy, setPhotoBusy] = React.useState(false);

  const form = useForm<RegisterPlayerInput>({
    resolver: zodResolver(registerPlayerSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;

  React.useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Photo is too large (max 10 MB before compression).");
      return;
    }
    setPhotoBusy(true);
    try {
      const compressed = await compressPlayerPhoto(file);
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoFile(compressed);
      setPhotoPreview(URL.createObjectURL(compressed));
      setPhotoAction("replace");
    } catch (err) {
      console.error(err);
      toast.error("Could not process the image. Try another file.");
    } finally {
      setPhotoBusy(false);
    }
  }

  function handleRemovePhoto() {
    if (photoPreview && photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoAction(initialPhotoUrl ? "remove" : "keep");
  }

  const onSubmitInternal = async (values: RegisterPlayerInput) => {
    const fd = new FormData();
    fd.set("name", values.name);
    fd.set("gender", values.gender);
    fd.set("role", values.role);
    fd.set("battingRating", String(values.battingRating));
    fd.set("fieldingRating", String(values.fieldingRating));
    fd.set("bowlingRating", String(values.bowlingRating));
    fd.set("photoAction", photoAction);
    if (photoFile && photoAction === "replace") fd.set("photo", photoFile);

    const result = await onSubmit(fd);
    if (result.ok) {
      onSuccess?.(result);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitInternal)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="Enter your full name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Gender</Label>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <ToggleGroup
                type="single"
                value={field.value}
                onValueChange={(v) => { if (v) field.onChange(v); }}
                variant="outline"
                className="w-full *:data-[state=on]:bg-primary *:data-[state=on]:text-primary-foreground *:data-[state=on]:border-primary"
              >
                {GENDER_OPTIONS.map((opt) => (
                  <ToggleGroupItem
                    key={opt.value}
                    value={opt.value}
                    className="flex-1 h-10"
                    aria-label={opt.label}
                  >
                    {opt.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <ToggleGroup
                type="single"
                value={field.value}
                onValueChange={(v) => { if (v) field.onChange(v); }}
                variant="outline"
                className="w-full *:data-[state=on]:bg-accent *:data-[state=on]:text-accent-foreground *:data-[state=on]:border-accent"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <ToggleGroupItem
                    key={opt.value}
                    value={opt.value}
                    className="flex-1 h-10 gap-1.5"
                    aria-label={opt.label}
                  >
                    <span className="text-base leading-none">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
        </div>
      </div>

      {/* Photo */}
      <div className="space-y-2">
        <Label htmlFor="photo">
          Photo{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div className="flex items-start gap-4">
          {photoPreview ? (
            <div className="size-24 overflow-hidden rounded-xl border-2 border-gold/40 bg-muted shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="preview"
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div className="flex size-24 items-center justify-center rounded-xl border-2 border-dashed border-border/60 text-xs text-muted-foreground">
              Preview
            </div>
          )}
          <div className="flex-1 space-y-2">
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              disabled={photoBusy || isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {photoBusy
                ? "Compressing…"
                : photoFile
                  ? `Ready to upload · ${(photoFile.size / 1024).toFixed(0)} KB (webp)`
                  : photoPreview
                    ? "Current photo — upload a new one to replace"
                    : ".jpg / .png / .webp · auto-compressed to ~1 MB"}
            </p>
            {photoPreview ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemovePhoto}
                disabled={isSubmitting}
              >
                Remove photo
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div className="relative rounded-2xl border border-gold/20 bg-linear-to-b from-gold/4 to-transparent p-6 space-y-6">
        <div className="seam-divider absolute inset-x-0 -top-3" />
        <div className="flex items-baseline justify-between">
          <h2 className="scoreboard-num text-2xl text-primary">SKILL RATINGS</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            0.0 – 5.0 · step 0.1
          </span>
        </div>

        <Controller
          control={control}
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
        <Controller
          control={control}
          name="fieldingRating"
          render={({ field, fieldState }) => (
            <RatingInput
              label="Fielding"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="bowlingRating"
          render={({ field, fieldState }) => (
            <RatingInput
              label="Bowling"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full btn-gold rounded-full text-base"
        disabled={isSubmitting || photoBusy}
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </form>
  );
}
