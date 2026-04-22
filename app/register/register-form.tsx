"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RegisterPlayerInput } from "@/lib/schemas/player";
import { PlayerForm } from "@/components/player-form";
import { registerPlayer } from "./actions";

const DEFAULTS: RegisterPlayerInput = {
  name: "",
  gender: "MALE",
  role: "PLAYER",
  photoUrl: null,
  battingRating: 3.0,
  fieldingRating: 3.0,
  bowlingRating: 3.0,
};

export function RegisterForm() {
  const router = useRouter();

  return (
    <PlayerForm
      defaults={DEFAULTS}
      submitLabel="Join the league 🏏"
      submittingLabel="Joining…"
      onSubmit={registerPlayer}
      onSuccess={() => {
        toast.success("Welcome to the league!");
        router.push("/leaderboard");
        router.refresh();
      }}
    />
  );
}
