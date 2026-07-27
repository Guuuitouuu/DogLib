import { config } from "dotenv";

config();
config({ path: ".env.local", override: true });

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  const tables = await prisma.$queryRaw<
    { table_name: string }[]
  >`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`;

  const userCount = await prisma.user.count();
  const host = process.env.DATABASE_URL?.includes("supabase.co")
    ? "supabase"
    : "other";

  console.log(
    JSON.stringify({
      ok: true,
      host,
      tables: tables.map((t) => t.table_name),
      userCount,
    }),
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exit(1);
});
