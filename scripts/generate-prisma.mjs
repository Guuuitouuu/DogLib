import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clientFile = join(root, "src/generated/prisma/client.ts");

// prisma generate n’a pas besoin d’une vraie DB, mais Prisma 7 lit DATABASE_URL via prisma.config.ts
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
}

const result = spawnSync(
  "npx",
  ["prisma", "generate", "--schema=prisma/schema.prisma"],
  {
    cwd: root,
    env: process.env,
    stdio: "inherit",
    shell: true,
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

if (!existsSync(clientFile)) {
  console.error(
    `[generate-prisma] Missing client after generate: ${clientFile}`,
  );
  process.exit(1);
}

console.log(`[generate-prisma] OK → ${clientFile}`);
