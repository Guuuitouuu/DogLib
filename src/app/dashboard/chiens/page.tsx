import { notFound } from "next/navigation";

import { listEducatorDogs } from "@/actions/educator-dogs";
import { ChiensGrid } from "@/components/dashboard/chiens-grid";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardChiensPage() {
  const result = await listEducatorDogs();

  if (!result.success) {
    notFound();
  }

  const count = result.data.length;
  const eyebrow =
    count === 0
      ? "Aucun chien pour le moment"
      : `${count} chien${count !== 1 ? "s" : ""} avec réservation`;

  return (
    <>
      <Topbar eyebrow={eyebrow} title="Vos chiens" />
      <main className="flex-1 px-5 py-6 md:px-8">
        <ChiensGrid dogs={result.data} />
      </main>
    </>
  );
}
