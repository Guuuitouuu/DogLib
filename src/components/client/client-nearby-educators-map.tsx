"use client";

import Link from "next/link";
import { GraduationCap, Loader2, MapPin, Navigation } from "lucide-react";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { searchMarketplaceEducators } from "@/actions/marketplace";
import { buttonVariants } from "@/components/ui/button";
import { formatDistanceKm } from "@/lib/geo-distance";
import { cn } from "@/lib/utils";
import type { MarketplaceEducatorItem } from "@/types/marketplace";

export type ClientNearbyEducatorsMapProps = {
  homeLat: number;
  homeLng: number;
  homeLabel: string;
  initialEducators: MarketplaceEducatorItem[];
  maxRadiusKm?: number;
  className?: string;
};

const educatorIcon = L.divIcon({
  className: "",
  html: `<span style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:12px;background:#18181b;color:#fafafa;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:16px;">🐾</span>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const homeIcon = L.divIcon({
  className: "",
  html: `<span style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;background:#f4f4f5;color:#18181b;box-shadow:0 0 0 3px #fff,0 2px 10px rgba(0,0,0,0.12);font-size:18px;">🏠</span>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

function MapMoveHandler({
  onCenterChange,
}: {
  onCenterChange: (lat: number, lng: number) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextRef = useRef(true);

  useMapEvents({
    moveend: (event) => {
      if (skipNextRef.current) {
        skipNextRef.current = false;
        return;
      }
      const map = event.target as L.Map;
      const center = map.getCenter();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onCenterChange(center.lat, center.lng);
      }, 400);
    },
  });

  return null;
}

function RecenterControl({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  const map = useMap();

  return (
    <button
      type="button"
      title={label}
      onClick={() => map.flyTo([lat, lng], map.getZoom(), { duration: 0.6 })}
      className="absolute bottom-4 right-4 z-[1000] flex size-11 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-md transition-colors hover:bg-secondary"
      aria-label="Revenir à mon adresse"
    >
      <Navigation className="size-5" />
    </button>
  );
}

export function ClientNearbyEducatorsMap({
  homeLat,
  homeLng,
  homeLabel,
  initialEducators,
  maxRadiusKm = 50,
  className,
}: ClientNearbyEducatorsMapProps) {
  const [educators, setEducators] =
    useState<MarketplaceEducatorItem[]>(initialEducators);
  const [mapCenter, setMapCenter] = useState({ lat: homeLat, lng: homeLng });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const loadForCenter = useCallback(
    (lat: number, lng: number) => {
      setMapCenter({ lat, lng });
      startTransition(async () => {
        const result = await searchMarketplaceEducators({
          nearLat: lat,
          nearLng: lng,
          maxRadiusKm,
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        setError(null);
        setEducators(result.data);
      });
    },
    [maxRadiusKm],
  );

  const bounds = useMemo(() => {
    const points: L.LatLngExpression[] = [[homeLat, homeLng]];
    for (const e of educators) {
      points.push([e.lat, e.lng]);
    }
    return L.latLngBounds(points).pad(0.15);
  }, [educators, homeLat, homeLng]);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <MapPin className="size-5 text-primary" aria-hidden />
            Éducateurs autour de vous
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Déplacez la carte pour explorer d&apos;autres quartiers · rayon{" "}
            {maxRadiusKm} km
          </p>
        </div>
        {pending ? (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Mise à jour…
          </span>
        ) : (
          <span className="text-xs font-semibold text-primary">
            {educators.length} éducateur
            {educators.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {error ? (
        <p className="px-5 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="relative h-[min(420px,55vh)] w-full">
        <MapContainer
          bounds={bounds}
          boundsOptions={{ maxZoom: 14 }}
          className="h-full w-full z-0"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[homeLat, homeLng]} icon={homeIcon}>
            <Popup>
              <p className="text-sm font-semibold">Votre adresse</p>
              <p className="max-w-[200px] text-xs text-muted-foreground">
                {homeLabel}
              </p>
            </Popup>
          </Marker>
          {educators.map((educator) => (
            <Marker
              key={educator.id}
              position={[educator.lat, educator.lng]}
              icon={educatorIcon}
            >
              <Popup minWidth={220}>
                <div className="space-y-2 pr-1">
                  <p className="font-semibold text-foreground">
                    {educator.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {educator.city}
                    {educator.distanceKm != null
                      ? ` · ${formatDistanceKm(educator.distanceKm)}`
                      : null}
                  </p>
                  {educator.specialties[0] ? (
                    <p className="flex items-center gap-1 text-xs text-foreground">
                      <GraduationCap className="size-3.5 shrink-0" />
                      {educator.specialties[0]}
                    </p>
                  ) : null}
                  <Link
                    href={`/educator/${educator.id}`}
                    className={buttonVariants({
                      size: "sm",
                      className: "mt-1 h-8 w-full",
                    })}
                  >
                    Voir le profil
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
          <MapMoveHandler onCenterChange={loadForCenter} />
          <RecenterControl lat={homeLat} lng={homeLng} label={homeLabel} />
        </MapContainer>
      </div>

      <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
        Centre actuel : {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
      </p>
    </section>
  );
}
