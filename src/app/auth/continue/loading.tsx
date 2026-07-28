export default function AuthContinueLoading() {
  return (
    <main
      className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-16 text-center"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-foreground">
        Connexion en cours…
      </p>
      <p className="text-xs text-muted-foreground">
        Redirection vers votre espace DogLib.
      </p>
    </main>
  );
}
