export const HYDERABAD_CENTER: [number, number] = [78.4867, 17.385]; // [lon, lat]
export const DEFAULT_ZOOM = 11.2;

export function getMapStyleUrl(): { url: string; isFallback: boolean } {
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const styleId = process.env.NEXT_PUBLIC_MAPTILER_STYLE_ID || "streets-v2-dark";

  if (maptilerKey && maptilerKey.trim().length > 0) {
    return {
      url: `https://api.maptiler.com/maps/${styleId}/style.json?key=${maptilerKey}`,
      isFallback: false,
    };
  }

  // Fallback to high-contrast open dark vector tiles when MapTiler key is not yet supplied
  return {
    url: "https://tiles.openfreemap.org/styles/dark",
    isFallback: true,
  };
}

export const MAP_SOURCES = {
  ROUTE: "georynth-route-source",
  COMMUNITY_REPORTS: "georynth-reports-source",
  SEARCH_MARKER: "georynth-search-marker-source",
  USER_LOCATION: "georynth-user-location-source",
};

export const MAP_LAYERS = {
  ROUTE_CASING: "georynth-route-casing-layer",
  ROUTE_LINE: "georynth-route-line-layer",
  REPORTS_CIRCLES: "georynth-reports-circles-layer",
  REPORTS_LABELS: "georynth-reports-labels-layer",
  SEARCH_MARKER: "georynth-search-marker-layer",
  USER_LOCATION_PULSE: "georynth-user-location-pulse-layer",
  USER_LOCATION_DOT: "georynth-user-location-dot-layer",
};
