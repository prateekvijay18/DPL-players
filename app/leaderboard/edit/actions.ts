"use server";

import { updatePlayerSchema } from "@/lib/schemas/player";
import { toDecimal } from "@/lib/decimal";
import { prisma } from "@/lib/db";
import { getPlayerId } from "@/lib/cookies";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UpdateResult = { ok: true } | { ok: false; error: string };

const BUCKET = "player-photos";

function storagePathFromPublicUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const marker = `/object/public/${BUCKET}/`;
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    return u.pathname.slice(idx + marker.length);
  } catch {
    return null;
  }
}

export async function updatePlayer(formData: FormData): Promise<UpdateResult> {
  // 1. Identity: cookie is the ONLY source. A crafted request body with an id is ignored.
  const cookiePlayerId = await getPlayerId();
  if (!cookiePlayerId) {
    return { ok: false, error: "Not signed in" };
  }

  const existing = await prisma.player.findUnique({
    where: { id: cookiePlayerId },
    select: { id: true, photoUrl: true },
  });
  if (!existing) {
    return { ok: false, error: "Profile no longer exists" };
  }

  // 2. Parse + validate.
  const raw = {
    name: String(formData.get("name") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    role: String(formData.get("role") ?? "PLAYER"),
    battingRating: Number(formData.get("battingRating") ?? Number.NaN),
    fieldingRating: Number(formData.get("fieldingRating") ?? Number.NaN),
    bowlingRating: Number(formData.get("bowlingRating") ?? Number.NaN),
  };
  const parsed = updatePlayerSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first
        ? `${first.path.join(".")}: ${first.message}`
        : "Invalid input",
    };
  }
  const data = parsed.data;

  // 3. Photo handling. photoAction ∈ 'keep' | 'replace' | 'remove'.
  const photoAction = String(formData.get("photoAction") ?? "keep");
  let nextPhotoUrl: string | null | undefined = undefined; // undefined = don't touch
  let pendingDeletePath: string | null = null;

  if (photoAction === "replace") {
    const photo = formData.get("photo");
    if (!(photo instanceof File) || photo.size === 0) {
      return { ok: false, error: "No photo provided for replacement" };
    }
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
    nextPhotoUrl = publicUrl.publicUrl;
    if (existing.photoUrl) {
      pendingDeletePath = storagePathFromPublicUrl(existing.photoUrl);
    }
  } else if (photoAction === "remove") {
    nextPhotoUrl = null;
    if (existing.photoUrl) {
      pendingDeletePath = storagePathFromPublicUrl(existing.photoUrl);
    }
  }

  // 4. Update — scoped to the cookie id, WHERE id = cookiePlayerId. No id from the body.
  try {
    await prisma.player.update({
      where: { id: cookiePlayerId },
      data: {
        name: data.name,
        gender: data.gender,
        role: data.role,
        battingRating: toDecimal(data.battingRating),
        fieldingRating: toDecimal(data.fieldingRating),
        bowlingRating: toDecimal(data.bowlingRating),
        ...(nextPhotoUrl !== undefined ? { photoUrl: nextPhotoUrl } : {}),
      },
    });
  } catch (err) {
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
      err instanceof Error ? err.message : "Failed to update player";
    return { ok: false, error: message };
  }

  // 5. Best-effort: delete the superseded photo object. A failure here is non-fatal.
  if (pendingDeletePath) {
    try {
      const supabase = createSupabaseServerClient();
      await supabase.storage.from(BUCKET).remove([pendingDeletePath]);
    } catch {
      /* swallow */
    }
  }

  return { ok: true };
}
