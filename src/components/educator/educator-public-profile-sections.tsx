import Image from "next/image";

import type { EducatorPublicDogItem } from "@/actions/booking";
import { EducatorProfileLocationMapLazy } from "@/components/educator/educator-profile-location-map-lazy";
import { EducatorPublicDogsGrid } from "@/components/educator/educator-public-dogs-grid";

function ProfileSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function EducatorPublicAboutSection({ bio }: { bio: string | null }) {
  if (!bio?.trim()) return null;

  return (
    <ProfileSection title="À propos">
      <p className="text-sm leading-relaxed text-muted-foreground">{bio}</p>
    </ProfileSection>
  );
}

export function EducatorPublicGallerySection({
  galleryUrls,
}: {
  galleryUrls: string[];
}) {
  if (galleryUrls.length === 0) return null;

  return (
    <ProfileSection
      title="En images"
      description="Quelques moments de travail et de complicité"
    >
      <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {galleryUrls.map((url) => {
          const external = url.startsWith("http");
          return (
            <li
              key={url}
              className="relative aspect-[4/3] w-64 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-secondary"
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="256px"
                unoptimized={external}
              />
            </li>
          );
        })}
      </ul>
    </ProfileSection>
  );
}

export function EducatorPublicPersonalDogsSection({
  dogs,
}: {
  dogs: EducatorPublicDogItem[];
}) {
  if (dogs.length === 0) return null;

  return (
    <ProfileSection
      title="Mes chiens"
      description="Les compagnons de l'éducateur"
    >
      <EducatorPublicDogsGrid dogs={dogs} />
    </ProfileSection>
  );
}

export function EducatorPublicEducatedDogsSection({
  dogs,
}: {
  dogs: EducatorPublicDogItem[];
}) {
  if (dogs.length === 0) return null;

  return (
    <ProfileSection
      title="Chiens accompagnés"
      description="Des toutous que j'ai eu le plaisir d'éduquer"
    >
      <EducatorPublicDogsGrid dogs={dogs} />
    </ProfileSection>
  );
}

export function EducatorPublicMapSection({
  showLocationMap,
  lat,
  lng,
  locationLabel,
  educatorName,
}: {
  showLocationMap: boolean;
  lat: number;
  lng: number;
  locationLabel: string;
  educatorName: string;
}) {
  if (!showLocationMap) return null;

  return (
    <ProfileSection title="Zone d'intervention">
      <EducatorProfileLocationMapLazy
        lat={lat}
        lng={lng}
        label={locationLabel}
        educatorName={educatorName}
      />
    </ProfileSection>
  );
}
