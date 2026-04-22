"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RegisterPlayerInput } from "@/lib/schemas/player";
import { PlayerForm } from "@/components/player-form";
import { updatePlayer } from "./actions";

type Props = {
  defaults: RegisterPlayerInput;
  initialPhotoUrl: string | null;
};

export function EditForm({ defaults, initialPhotoUrl }: Props) {
  const router = useRouter();

  return (
    <PlayerForm
      defaults={defaults}
      initialPhotoUrl={initialPhotoUrl}
      submitLabel="Save changes"
      submittingLabel="Saving…"
      onSubmit={updatePlayer}
      onSuccess={() => {
        toast.success("Profile updated.");
        router.push("/leaderboard");
        router.refresh();
      }}
    />
  );
}
