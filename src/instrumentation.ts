import { assertProductionEnv } from "@/lib/env";

export async function register() {
  // Ne pas faire échouer `next build` si les secrets ne sont pas injectés localement.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      assertProductionEnv();
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        throw error;
      }
      console.warn(
        "[instrumentation]",
        error instanceof Error ? error.message : error,
      );
    }
  }
}
