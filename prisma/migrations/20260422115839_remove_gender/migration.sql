-- Drop the gender column and its enum type (data loss accepted by user request)
ALTER TABLE "players" DROP COLUMN "gender";
DROP TYPE "Gender";
