"use client";

import dynamic from "next/dynamic";

type Props = {
  lat: number;
  lng: number;
  label: string;
  educatorName: string;
};

const MapInner = dynamic(
  () =>
    import("@/components/educator/educator-profile-location-map").then(
      (m) => m.EducatorProfileLocationMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-muted/40 text-sm text-muted-foreground">
        Chargement de la carte…
      </div>
    ),
  },
);

export function EducatorProfileLocationMapLazy(props: Props) {
  return <MapInner {...props} />;
}
