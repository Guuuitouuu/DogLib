import { notFound } from "next/navigation";

import { getClientDogById } from "@/actions/client-dogs";
import { ClientDogReportsView } from "@/components/client/client-dog-reports-view";

type PageProps = {
  params: Promise<{ dogId: string }>;
};

export default async function ClientDogReportsPage({ params }: PageProps) {
  const { dogId } = await params;
  const result = await getClientDogById({ dogId });
  if (!result.success) {
    notFound();
  }

  return <ClientDogReportsView dog={result.data} />;
}
