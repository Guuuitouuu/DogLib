import { notFound } from "next/navigation";

import { getEducatorDogById } from "@/actions/educator-dogs";
import { DogDetailView } from "@/components/dashboard/dog-detail-view";
import { Topbar } from "@/components/dashboard/topbar";

type PageProps = {
  params: Promise<{ dogId: string }>;
};

export default async function DashboardDogDetailPage({ params }: PageProps) {
  const { dogId } = await params;
  const result = await getEducatorDogById({ dogId });

  if (!result.success) {
    notFound();
  }

  return (
    <>
      <Topbar eyebrow="Fiche chien" title={result.data.name} />
      <main className="flex-1 px-5 py-6 md:px-8">
        <DogDetailView dog={result.data} />
      </main>
    </>
  );
}
