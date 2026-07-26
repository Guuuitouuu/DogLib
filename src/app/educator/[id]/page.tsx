import { notFound } from "next/navigation";

import { getEducatorPublicProfile } from "@/actions/booking";
import {
  EducatorBookingSection,
  EducatorPublicHeader,
} from "@/components/educator/educator-public-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EducatorPublicPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getEducatorPublicProfile(id);

  if (!result.success) {
    notFound();
  }

  const profile = result.data;
  const returnPath = `/educator/${id}`;

  return (
    <div className="flex min-h-full flex-col bg-background">
      <EducatorPublicHeader
        name={profile.educatorName}
        city={profile.city}
        bio={profile.bio}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-5 py-8 md:px-8">
        <EducatorBookingSection
          educatorProfileId={profile.id}
          services={profile.services}
          returnPath={returnPath}
        />
      </main>
    </div>
  );
}
