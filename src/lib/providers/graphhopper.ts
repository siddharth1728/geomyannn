import { Coordinates, RouteResult, RoutingProfile } from "@/types/geo";

export interface GraphHopperRouteResponse {
  paths: Array<{
    distance: number; // in meters
    time: number; // in milliseconds
    points: {
      type: "LineString";
      coordinates: [number, number][]; // [longitude, latitude]
    };
    bbox?: [number, number, number, number];
  }>;
  message?: string;
  hints?: Array<{ message: string }>;
}

export async function calculateRoute(
  origin: Coordinates,
  destination: Coordinates,
  mode: RoutingProfile = "car"
): Promise<{ route?: RouteResult; error?: string; status: number }> {
  const apiKey = process.env.GRAPHHOPPER_API_KEY;

  if (!apiKey) {
    return {
      error: "GraphHopper routing API key not configured. Please set GRAPHHOPPER_API_KEY in your .env.local file to enable live route calculations.",
      status: 503,
    };
  }

  // Profile resolution from environment or standard defaults
  const profileMap: Record<RoutingProfile, string> = {
    car: process.env.GRAPHHOPPER_PROFILE_CAR || "car",
    bike: process.env.GRAPHHOPPER_PROFILE_BIKE || "bike",
    foot: process.env.GRAPHHOPPER_PROFILE_FOOT || "foot",
  };

  const profile = profileMap[mode] || "car";

  try {
    const url = new URL("https://graphhopper.com/api/1/route");
    // GraphHopper expects points in latitude,longitude order
    url.searchParams.append("point", `${origin.latitude},${origin.longitude}`);
    url.searchParams.append("point", `${destination.latitude},${destination.longitude}`);
    url.searchParams.set("profile", profile);
    url.searchParams.set("locale", "en");
    url.searchParams.set("points_encoded", "false");
    url.searchParams.set("instructions", "false");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 429) {
        return {
          error: "GraphHopper rate limit reached or quota exhausted. Please try again in a few moments.",
          status: 429,
        };
      }

      if (res.status === 401 || res.status === 403) {
        return {
          error: "Invalid or unauthorized GraphHopper API Key.",
          status: 403,
        };
      }

      const errData = await res.json().catch(() => null);
      const message =
        errData?.message ||
        errData?.hints?.[0]?.message ||
        `GraphHopper API request failed with status ${res.status}`;

      return {
        error: message,
        status: res.status,
      };
    }

    const data = (await res.json()) as GraphHopperRouteResponse;

    if (!data.paths || data.paths.length === 0) {
      return {
        error: "No route could be found between the specified coordinates.",
        status: 404,
      };
    }

    const path = data.paths[0];

    // Coordinates returned from points_encoded=false are already [lon, lat] GeoJSON LineString coordinates
    const route: RouteResult = {
      geometry: {
        type: "LineString",
        coordinates: path.points.coordinates,
      },
      distanceMeters: Math.round(path.distance),
      durationMilliseconds: Math.round(path.time),
      profile: mode,
      provider: "graphhopper",
    };

    return { route, status: 200 };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Route calculation network error",
      status: 500,
    };
  }
}
