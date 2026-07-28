import { listEducatorPersonalDogs } from "@/actions/educator-personal-dogs";
import { EducatorPersonalDogsPanel } from "@/components/dashboard/educator-personal-dogs-panel";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardMesChiensPage() {
  const result = await listEducatorPersonalDogs();
  const dogs = result.success ? result.data : [];
  const count = dogs.length;

  return (
    <>
      <Topbar
        eyebrow="Fiche publique"
        title="Mes chiens"
        actionLabel="Ma fiche publique"
        actionShortLabel="Fiche"
        actionHref="/dashboard/fiche-publique"
      />
      <main className="flex-1 px-5 py-6 md:px-8">
        <div className="mx-auto max-w-5xl space-y-4">
          {!result.success ? (
            <p className="text-sm text-destructive" role="alert">
              {result.error}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            {count === 0
              ? "Ajoutez vos chiens personnels — ils seront visibles sur votre vitrine."
              : `${count} chien${count > 1 ? "s" : ""} affiché${count > 1 ? "s" : ""} sur votre fiche publique.`}
          </p>
          <EducatorPersonalDogsPanel initialDogs={dogs} />
        </div>
      </main>
    </>
  );
}
