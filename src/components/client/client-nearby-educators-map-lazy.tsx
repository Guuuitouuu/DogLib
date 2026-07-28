"use client";

import dynamic from "next/dynamic";

import type { ClientNearbyEducatorsMapProps } from "@/components/client/client-nearby-educators-map";

const MapInner = dynamic(
  () =>
    import("@/components/client/client-nearby-educators-map").then(
      (m) => m.ClientNearbyEducatorsMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[min(420px,55vh)] items-center justify-center rounded-3xl border border-border bg-muted/40 text-sm text-muted-foreground"
        role="status"
      >
        Chargement de la carte…
      </div>
    ),
  },
);

export function ClientNearbyEducatorsMapLazy(
  props: ClientNearbyEducatorsMapProps,
) {
  return <MapInner {...props} />;
}
