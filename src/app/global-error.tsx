"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#fbf7f0",
          color: "#18181b",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>
            DogLib — erreur
          </h1>
          <p style={{ marginBottom: "1.5rem", color: "#52525b" }}>
            Une erreur inattendue empêche l’affichage de la page.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              borderRadius: "0.75rem",
              border: "none",
              background: "#18181b",
              color: "#fafafa",
              padding: "0.75rem 1.25rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
