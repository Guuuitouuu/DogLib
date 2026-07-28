import { listEducatorDogs } from "@/actions/educator-dogs";
import { ChiensGrid } from "@/components/dashboard/chiens-grid";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardChiensPage() {
  const result = await listEducatorDogs();

  const dogs = result.success ? result.data : [];
  const count = dogs.length;
  const eyebrow =
    count === 0
      ? "Aucun chien pour le moment"
      : `${count} chien${count !== 1 ? "s" : ""} avec réservation`;

  return (
    <>
      <Topbar eyebrow={eyebrow} title="Chiens suivis" />
      <main className="relative z-0 flex-1 px-5 py-6 md:px-8">
        {!result.success ? (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {result.error}
          </p>
        ) : null}
        <ChiensGrid dogs={dogs} />
      </main>
    </>
  );
}
