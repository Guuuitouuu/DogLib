import { notFound } from "next/navigation";

import { getClientProfile } from "@/actions/client-profile";
import { ClientProfileForm } from "@/components/client/client-profile-form";

export default async function ClientProfilePage() {
  const result = await getClientProfile();
  if (!result.success) {
    notFound();
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mon profil</h1>
        <p className="mt-1 break-words text-sm text-muted-foreground">
          Photo, identité, téléphone et adresse — tout ce qui concerne votre
          compte propriétaire.
        </p>
      </div>
      <ClientProfileForm profile={result.data} />
    </div>
  );
}
