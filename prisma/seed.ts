import { Prisma } from "@prisma/client";
import { prisma } from "../lib/db";

// 10 players with varied 1-decimal ratings spanning the full 0.0–5.0 range.
// Includes a tie on averageRating (Karan and Sana both 3.50) that differs on
// batting — exercises the tiebreaker at read time.
const players: ReadonlyArray<{
  name: string;
  gender: "MALE" | "FEMALE";
  role: "PLAYER" | "CAPTAIN";
  batting: string;
  fielding: string;
  bowling: string;
}> = [
  { name: "Rohan",  gender: "MALE",   role: "PLAYER",  batting: "4.8", fielding: "4.2", bowling: "3.5" },
  { name: "Aisha",  gender: "FEMALE", role: "CAPTAIN", batting: "4.5", fielding: "4.8", bowling: "4.0" },
  { name: "Vikram", gender: "MALE",   role: "PLAYER",  batting: "3.2", fielding: "3.5", bowling: "4.5" },
  { name: "Priya",  gender: "FEMALE", role: "PLAYER",  batting: "4.2", fielding: "3.8", bowling: "3.0" },
  { name: "Arjun",  gender: "MALE",   role: "PLAYER",  batting: "4.8", fielding: "3.0", bowling: "2.5" },
  { name: "Sana",   gender: "FEMALE", role: "PLAYER",  batting: "3.0", fielding: "3.5", bowling: "4.0" },
  { name: "Karan",  gender: "MALE",   role: "PLAYER",  batting: "4.0", fielding: "3.5", bowling: "3.0" },
  { name: "Meera",  gender: "FEMALE", role: "PLAYER",  batting: "2.0", fielding: "2.5", bowling: "2.0" },
  { name: "Dev",    gender: "MALE",   role: "CAPTAIN", batting: "5.0", fielding: "4.5", bowling: "4.8" },
  { name: "Tara",   gender: "FEMALE", role: "PLAYER",  batting: "0.5", fielding: "1.0", bowling: "1.5" },
];

async function main() {
  await prisma.player.deleteMany({});

  for (const p of players) {
    await prisma.player.create({
      data: {
        name: p.name,
        gender: p.gender,
        role: p.role,
        battingRating:  new Prisma.Decimal(p.batting),
        fieldingRating: new Prisma.Decimal(p.fielding),
        bowlingRating:  new Prisma.Decimal(p.bowling),
      },
    });
  }

  const rows = await prisma.player.findMany({
    orderBy: [
      { averageRating: "desc" },
      { battingRating: "desc" },
      { bowlingRating: "desc" },
      { name: "asc" },
    ],
    select: { name: true, battingRating: true, fieldingRating: true, bowlingRating: true, averageRating: true },
  });

  console.log(`Seeded ${rows.length} players:`);
  for (const r of rows) {
    console.log(
      `  ${r.name.padEnd(8)}  bat=${r.battingRating.toFixed(1)}  field=${r.fieldingRating.toFixed(1)}  bowl=${r.bowlingRating.toFixed(1)}  avg=${r.averageRating.toFixed(2)}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
