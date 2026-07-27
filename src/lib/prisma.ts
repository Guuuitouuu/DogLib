import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  /** Bump when Prisma schema changes so dev HMR does not keep a stale client. */
  prismaSchemaRevision: string | undefined;
};

const PRISMA_SCHEMA_REVISION = "2026-07-user-address";

if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prismaSchemaRevision !== PRISMA_SCHEMA_REVISION
) {
  globalForPrisma.prisma = undefined;
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

  // Sur Vercel / serverless : peu de connexions par instance.
  const isProd = process.env.NODE_ENV === "production";
  const max = Number(process.env.DB_POOL_MAX ?? (isProd ? 3 : 10));

  return new Pool({
    connectionString,
    max: Number.isFinite(max) && max > 0 ? max : isProd ? 3 : 10,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: isProd ? 10_000 : 30_000,
    allowExitOnIdle: isProd,
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
