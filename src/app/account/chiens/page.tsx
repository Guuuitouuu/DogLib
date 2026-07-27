import { notFound } from "next/navigation";

import { listClientDogs } from "@/actions/client-dogs";
import { ClientDogsPanel } from "@/components/client/client-dogs-panel";

export default async function ClientChiensPage() {
  const result = await listClientDogs();
  if (!result.success) {
    notFound();
  }

  return <ClientDogsPanel initialDogs={result.data} />;
}
