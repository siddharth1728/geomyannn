import { PlaceResult } from "@/types/geo";

interface MapTilerFeature {
  id: string;
  text: string;
  place_name: string;
  center: [number, number]; // [lon, lat]
  place_type?: string[];
}

interface MapTilerGeocodingResponse {
  type: string;
  features: MapTilerFeature[];
}

export async function geocodeSearch(
  query: string,
  proximity?: string,
  limit: number = 5
): Promise<{ results: PlaceResult[]; provider: "maptiler" | "openfreemap"; error?: string }> {
  const apiKey =
    process.env.MAPTILER_GEOCODING_KEY ||
    process.env.NEXT_PUBLIC_MAPTILER_KEY ||
    "gDCzA1avLA0udEVVgHhl";

  if (apiKey) {
    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const url = new URL(`https://api.maptiler.com/geocoding/${encodedQuery}.json`);
      url.searchParams.set("key", apiKey);
      url.searchParams.set("limit", limit.toString());

      if (proximity) {
        url.searchParams.set("proximity", proximity);
      }

      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 }, // Cache responses for 5 minutes
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("MapTiler rate limit reached. Please retry shortly.");
        }
        if (res.status === 403 || res.status === 401) {
          throw new Error("MapTiler API key is invalid or unauthorized.");
        }
        throw new Error(`MapTiler API returned status ${res.status}`);
      }

      const data = (await res.json()) as MapTilerGeocodingResponse;

      const normalized: PlaceResult[] = (data.features || []).map((f) => ({
        id: f.id || `maptiler-${f.center[0]}-${f.center[1]}`,
        name: f.text || f.place_name.split(",")[0],
        fullAddress: f.place_name,
        longitude: f.center[0],
        latitude: f.center[1],
        category: f.place_type?.[0] || "location",
        provider: "maptiler",
      }));

      return { results: normalized, provider: "maptiler" };
    } catch (err) {
      console.warn("MapTiler geocoding failed, falling back to public geocoding:", err);
      // Fallback to OpenStreetMap Nominatim for unhindered real search exploration
      return await fallbackOpenStreetMapGeocode(query, limit);
    }
  }

  // If no MapTiler key, use OpenStreetMap Nominatim for real data
  return await fallbackOpenStreetMapGeocode(query, limit);
}

async function fallbackOpenStreetMapGeocode(
  query: string,
  limit: number
): Promise<{ results: PlaceResult[]; provider: "maptiler" | "openfreemap"; error?: string }> {
  try {
    const encoded = encodeURIComponent(query.trim());
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=${limit}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "GEORYNTH-Geospatial-Intelligence/1.0",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return {
        results: [],
        provider: "openfreemap",
        error: `Search provider returned HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return { results: [], provider: "openfreemap" };
    }

    const normalized: PlaceResult[] = data.map((item: any) => ({
      id: `osm-${item.place_id || item.osm_id}`,
      name: item.name || item.display_name.split(",")[0],
      fullAddress: item.display_name,
      longitude: parseFloat(item.lon),
      latitude: parseFloat(item.lat),
      category: item.type || item.class || "place",
      provider: "openfreemap",
    }));

    return { results: normalized, provider: "openfreemap" };
  } catch (error) {
    return {
      results: [],
      provider: "openfreemap",
      error: error instanceof Error ? error.message : "Geocoding request failed",
    };
  }
}
