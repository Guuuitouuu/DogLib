export function prismaErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;

  const code =
    "code" in error && typeof error.code === "string" ? error.code : null;

  if (code === "P1001" || code === "P1000") {
    return "Impossible de joindre PostgreSQL. Démarrez la base (localhost:5432) ou corrigez DATABASE_URL dans .env.local, puis lancez : npm run db:push";
  }

  if (code === "P2021") {
    return "Les tables Prisma n'existent pas encore. Lancez : npm run db:push";
  }

  if (code === "P2022") {
    return "Schéma base désynchronisé (colonne manquante). Lancez : npm run db:push";
  }

  if (code === "P2003") {
    return "Profil éducateur invalide pour ce service. Reconnectez-vous ou terminez l'onboarding.";
  }

  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : null;

  if (message && process.env.NODE_ENV === "development") {
    return message;
  }

  return null;
}
