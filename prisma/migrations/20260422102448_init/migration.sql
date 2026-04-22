-- Enable trigram extension for case-insensitive name search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "gender" "Gender" NOT NULL,
    "age" INTEGER NOT NULL,
    "photoUrl" TEXT,
    "additionalDetails" VARCHAR(500),
    "battingRating" DECIMAL(3,2) NOT NULL,
    "fieldingRating" DECIMAL(3,2) NOT NULL,
    "bowlingRating" DECIMAL(3,2) NOT NULL,
    -- Generated column — computed by Postgres on every INSERT/UPDATE of the three rating columns.
    -- Applications must NOT write to "averageRating"; Prisma's types allow it but the DB will reject.
    "averageRating" DECIMAL(4,2) GENERATED ALWAYS AS (("battingRating" + "fieldingRating" + "bowlingRating") / 3.0) STORED,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex — B-tree on the generated column, descending for default sort
CREATE INDEX "players_averageRating_idx" ON "players"("averageRating" DESC);

-- CreateIndex — GIN trigram index on name for fast ILIKE '%query%' search
CREATE INDEX "players_name_idx" ON "players" USING GIN ("name" gin_trgm_ops);
