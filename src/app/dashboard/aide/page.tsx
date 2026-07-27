import { Topbar } from "@/components/dashboard/topbar";

export default function DashboardAidePage() {
  return (
    <>
      <Topbar eyebrow="Support" title="Aide" />
      <main className="flex-1 space-y-4 px-5 py-6 md:px-8">
        <section className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground">Besoin d’aide ?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pour l’instant, contactez-nous à{" "}
            <a
              className="font-medium text-primary underline-offset-2 hover:underline"
              href="mailto:support@doglib.fr"
            >
              support@doglib.fr
            </a>
            . Une base de connaissances sera ajoutée bientôt.
          </p>
        </section>
      </main>
    </>
  );
}
