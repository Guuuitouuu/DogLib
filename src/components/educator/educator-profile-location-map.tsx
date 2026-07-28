"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.divIcon({
  className: "",
  html: `<span style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;background:#18181b;color:#fafafa;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:18px;">📍</span>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

type EducatorProfileLocationMapProps = {
  lat: number;
  lng: number;
  label: string;
  educatorName: string;
};

export function EducatorProfileLocationMap({
  lat,
  lng,
  label,
  educatorName,
}: EducatorProfileLocationMapProps) {
  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl border border-border">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={markerIcon}>
          <Popup>
            <p className="text-sm font-semibold">{educatorName}</p>
            <p className="max-w-[200px] text-xs text-muted-foreground">{label}</p>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
