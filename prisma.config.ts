import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local explicitly — Next.js convention that Prisma CLI does not read by default.
loadEnv({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Prisma CLI (migrate, db push, studio) uses this URL.
  // MUST be the direct/session pooler on :5432 — pgbouncer's transaction mode
  // can't execute DDL that prepared statements rely on.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
