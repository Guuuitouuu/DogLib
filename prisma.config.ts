import { defineConfig } from "prisma/config";

// Sur Vercel / CI : pas de .env local — les vars viennent du process.
// En local, Next et la CLI chargent déjà .env / .env.local selon le contexte.
try {
  const { config } = await import("dotenv");
  config();
  config({ path: ".env.local", override: true });
} catch {
  // dotenv optionnel
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env["DATABASE_URL"] ??
      "postgresql://postgres:postgres@127.0.0.1:5432/postgres",
  },
});
