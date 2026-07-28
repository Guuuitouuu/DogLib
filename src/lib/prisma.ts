import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  /** Bump when Prisma schema changes so dev HMR does not keep a stale client. */
  prismaSchemaRevision: string | undefined;
};

const PRISMA_SCHEMA_REVISION = "2026-07-educator-profile-appearance-v2";

if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prismaSchemaRevision !== PRISMA_SCHEMA_REVISION
) {
  void globalForPrisma.pool?.end().catch(() => undefined);
  globalForPrisma.prisma = undefined;
  globalForPrisma.pool = undefined;
  globalForPrisma.prismaSchemaRevision = PRISMA_SCHEMA_REVISION;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const useSsl =
    connectionString.includes("supabase.co") ||
    connectionString.includes("sslmode=require");

  return new Pool({
    connectionString,
    max: 10,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    ...(useSsl
      ? { ssl: { rejectUnauthorized: false } }
      : {}),
  });
}

function createPrismaClient() {
  const pool = globalForPrisma.pool ?? createPool();
  const adapter = new PrismaPg(pool);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
