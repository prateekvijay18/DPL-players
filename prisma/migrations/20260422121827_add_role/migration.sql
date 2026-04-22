-- Add Role enum (PLAYER, CAPTAIN) and a role column on players.
-- Existing rows default to 'PLAYER'. The DEFAULT stays (sensible fallback) —
-- but the Zod schema always supplies a value from the form.

CREATE TYPE "Role" AS ENUM ('PLAYER', 'CAPTAIN');

ALTER TABLE "players" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'PLAYER';
