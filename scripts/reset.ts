import { prisma } from "../lib/db";
import { createSupabaseServerClient } from "../lib/supabase/server";

const BUCKET = "player-photos";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("reset script is disabled in production");
  }

  console.log("Deleting all players…");
  const { count } = await prisma.player.deleteMany({});
  console.log(`  removed ${count} rows.`);

  console.log(`Emptying ${BUCKET} bucket…`);
  const supabase = createSupabaseServerClient();

  // Supabase doesn't expose a truncate-bucket API — list and delete in batches.
  let total = 0;
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list("", {
      limit: 1000,
      offset,
    });
    if (error) {
      if (error.message.includes("Bucket not found")) {
        console.log("  bucket does not exist yet — skipping.");
        break;
      }
      throw error;
    }
    if (!data || data.length === 0) break;

    const paths = data.map((f) => f.name);
    const { error: rmError } = await supabase.storage.from(BUCKET).remove(paths);
    if (rmError) throw rmError;
    total += paths.length;

    if (data.length < 1000) break;
    offset += data.length;
  }
  console.log(`  removed ${total} object(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
