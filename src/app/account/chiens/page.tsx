import { notFound } from "next/navigation";

import { listClientDogs } from "@/actions/client-dogs";
import { ClientDogsPanel } from "@/components/client/client-dogs-panel";

export default async function ClientChiensPage() {
  const dogsResult = await listClientDogs();

  if (!dogsResult.success) {
    notFound();
  }

  return <ClientDogsPanel initialDogs={dogsResult.data} />;
}
