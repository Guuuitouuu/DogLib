import { config } from "dotenv";

config();
config({ path: ".env.local", override: true });

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  const rls = await prisma.$queryRaw<
    { relname: string; relrowsecurity: boolean }[]
  >`SELECT c.relname, c.relrowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname IN ('Service', 'Availability')`;

  console.log(JSON.stringify(rls, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
