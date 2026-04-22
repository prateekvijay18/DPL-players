"use server";

import { registerPlayerSchema } from "@/lib/schemas/player";
import { toDecimal } from "@/lib/decimal";
import { prisma } from "@/lib/db";
import { setPlayerId } from "@/lib/cookies";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RegisterResult =
  | { ok: true; playerId: string }
  | { ok: false; error: string };

const BUCKET = "player-photos";

export async function registerPlayer(
  formData: FormData,
): Promise<RegisterResult> {
  // 1. Parse + validate structured fields.
  const raw = {
    name: String(formData.get("name") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    role: String(formData.get("role") ?? "PLAYER"),
    battingRating: Number(formData.get("battingRating") ?? Number.NaN),
    fieldingRating: Number(formData.get("fieldingRating") ?? Number.NaN),
    bowlingRating: Number(formData.get("bowlingRating") ?? Number.NaN),
  };

  const parsed = registerPlayerSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid input",
    };
  }
  const data = parsed.data;

  // 2. Upload photo if provided. Upload first so a DB insert never succeeds with a broken photoUrl.
  let photoUrl: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const supabase = createSupabaseServerClient();
    const ext = photo.name.split(".").pop() || "webp";
    const objectPath = `players/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, photo, {
        contentType: photo.type || "image/webp",
        upsert: false,
      });
    if (uploadError) {
      return { ok: false, error: `Photo upload failed: ${uploadError.message}` };
    }
    const { data: publicUrl } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(objectPath);
    photoUrl = publicUrl.publicUrl;
  }

  // 3. Insert player row. averageRating is computed by Postgres — never in the payload.
  try {
    const player = await prisma.player.create({
      data: {
        name: data.name,
        gender: data.gender,
        role: data.role,
        photoUrl,
        battingRating: toDecimal(data.battingRating),
        fieldingRating: toDecimal(data.fieldingRating),
        bowlingRating: toDecimal(data.bowlingRating),
      },
      select: { id: true },
    });

    await setPlayerId(player.id);
    return { ok: true, playerId: player.id };
  } catch (err) {
    // Best-effort: attempt to clean up the orphan photo object.
    if (photoUrl) {
      try {
        const supabase = createSupabaseServerClient();
        const objectPath = new URL(photoUrl).pathname
          .split(`/${BUCKET}/`)
          .pop();
        if (objectPath) {
          await supabase.storage.from(BUCKET).remove([objectPath]);
        }
      } catch {
        // swallow — user sees the original error below
      }
    }
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return {
        ok: false,
        error: `A player named "${data.name}" already exists. Please enter your full name.`,
      };
    }
    const message =
      err instanceof Error ? err.message : "Failed to create player";
    return { ok: false, error: message };
  }
}
