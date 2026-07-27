const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const GEOCODE_TIMEOUT_MS = 8_000;

const FALLBACK = { lat: 48.8566, lng: 2.3522 };

export async function geocodeAddressFr(params: {
  address: string;
  city: string;
  zipCode: string;
}): Promise<{ lat: number; lng: number }> {
  const query = `${params.address}, ${params.zipCode} ${params.city}, France`;

  try {
    const url = new URL(NOMINATIM);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", query);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "DogLib/1.0 (address-geocode)",
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(GEOCODE_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error("Geocode failed");
    }

    const data = (await response.json()) as { lat: string; lon: string }[];
    if (data[0]?.lat && data[0]?.lon) {
      return {
        lat: Number.parseFloat(data[0].lat),
        lng: Number.parseFloat(data[0].lon),
      };
    }
  } catch {
    /* fallback below */
  }

  return FALLBACK;
}

/** Géocode léger ville + CP (plus rapide, utilisé en secours). */
export async function geocodeCityZipFr(params: {
  city: string;
  zipCode: string;
}): Promise<{ lat: number; lng: number }> {
  return geocodeAddressFr({
    address: params.city,
    city: params.city,
    zipCode: params.zipCode,
  });
}
