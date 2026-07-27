import { notFound } from "next/navigation";

import { getClientDogById } from "@/actions/client-dogs";
import { ClientDogDetailView } from "@/components/client/client-dog-detail-view";

type PageProps = {
  params: Promise<{ dogId: string }>;
};

export default async function ClientDogDetailPage({ params }: PageProps) {
  const { dogId } = await params;
  const result = await getClientDogById({ dogId });
  if (!result.success) {
    notFound();
  }

  return <ClientDogDetailView dog={result.data} />;
}
