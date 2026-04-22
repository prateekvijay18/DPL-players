-- Drop the case-sensitive unique index on name
DROP INDEX IF EXISTS "players_name_key";

-- Create a case-insensitive unique index using LOWER()
CREATE UNIQUE INDEX "players_name_lower_key" ON "players" (LOWER("name"));
