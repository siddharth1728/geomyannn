export const HYDERABAD_CENTER: [number, number] = [78.4867, 17.385]; // [lon, lat]
export const DEFAULT_ZOOM = 11.5;

export type MapStyleType = "streets" | "hybrid" | "dark";

export function getMapStyleUrl(selectedStyle: MapStyleType = "streets"): { url: string; isFallback: boolean } {
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  const styleIdMap: Record<MapStyleType, string> = {
    streets: "streets-v2", // Rich Google Maps style with all places, POIs, roads, transit
    hybrid: "hybrid",       // High-res satellite imagery + labeled roads & places
    dark: "streets-v2-dark" // Mission Control dark mode
  };

  const styleId = styleIdMap[selectedStyle] || "streets-v2";

  if (maptilerKey && maptilerKey.trim().length > 0) {
    return {
      url: `https://api.maptiler.com/maps/${styleId}/style.json?key=${maptilerKey.trim()}`,
      isFallback: false,
    };
  }

  // Reliable open fallback modeled on Google Maps with all places & features
  return {
    url: "https://tiles.openfreemap.org/styles/liberty",
    isFallback: true,
  };
}

export const MAP_SOURCES = {
  ROUTE: "georynth-route-source",
  COMMUNITY_REPORTS: "georynth-reports-source",
  SEARCH_MARKER: "georynth-search-marker-source",
  USER_LOCATION: "georynth-user-location-source",
  PARTICIPANTS: "georynth-participants-source",
  VENUES: "georynth-venues-source",
};

export const MAP_LAYERS = {
  ROUTE_CASING: "georynth-route-casing-layer",
  ROUTE_LINE: "georynth-route-line-layer",
  REPORTS_CIRCLES: "georynth-reports-circles-layer",
  REPORTS_LABELS: "georynth-reports-labels-layer",
  SEARCH_MARKER: "georynth-search-marker-layer",
  USER_LOCATION_PULSE: "georynth-user-location-pulse-layer",
  USER_LOCATION_DOT: "georynth-user-location-dot-layer",
  PARTICIPANTS_PULSE: "georynth-participants-pulse-layer",
  PARTICIPANTS_DOTS: "georynth-participants-dots-layer",
  PARTICIPANTS_LABELS: "georynth-participants-labels-layer",
  VENUES_CIRCLES: "georynth-venues-circles-layer",
  VENUES_LABELS: "georynth-venues-labels-layer",
};
