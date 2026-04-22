-- Re-add Gender enum (MALE, FEMALE only) and the gender column on players.
-- Existing rows default to 'MALE'; the default is dropped afterwards so future
-- inserts must supply a value (enforced by the Zod schema at the server boundary).

CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

ALTER TABLE "players" ADD COLUMN "gender" "Gender" NOT NULL DEFAULT 'MALE';

ALTER TABLE "players" ALTER COLUMN "gender" DROP DEFAULT;
