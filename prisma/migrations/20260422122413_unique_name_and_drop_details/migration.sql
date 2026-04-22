-- Enforce uniqueness on player name (case-sensitive; trimmed server-side by Zod).
-- Drop the additionalDetails column — removed from the form by user request.

CREATE UNIQUE INDEX "players_name_key" ON "players" ("name");

ALTER TABLE "players" DROP COLUMN "additionalDetails";
