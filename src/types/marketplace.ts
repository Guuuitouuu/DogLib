export type MarketplaceEducatorItem = {
  id: string;
  name: string;
  city: string;
  bio: string | null;
  specialties: string[];
  photoUrl: string | null;
  distanceKm: number | null;
  lat: number;
  lng: number;
};

export type MarketplaceFilterOptions = {
  cities: string[];
  specialties: string[];
};

export type MarketplaceSearchParams = {
  q?: string;
  city?: string;
  specialty?: string;
};
