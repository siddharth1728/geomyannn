import Constants from "expo-constants";
import { Platform } from "react-native";

const extra = Constants.expoConfig?.extra || {};

// For Android emulator 10.0.2.2 points to host localhost; for iOS simulator localhost works
const defaultDevHost = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export const MOBILE_CONFIG = {
  MAPTILER_KEY: extra.maptilerKey || "gDCzA1avLA0udEVVgHhl",
  SUPABASE_URL: extra.supabaseUrl || "https://ppytdnhvvbmhaaurydza.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: extra.supabasePublishableKey || "sb_publishable_1PBI0qGXF2hKfxqmkQhJkg_l0B5YuLU",
  API_BASE_URL: extra.apiBaseUrl || defaultDevHost,
  MAP_STYLES: {
    STREETS: "https://api.maptiler.com/maps/streets-v2/style.json?key=gDCzA1avLA0udEVVgHhl",
    SATELLITE: "https://api.maptiler.com/maps/hybrid/style.json?key=gDCzA1avLA0udEVVgHhl",
    DARK: "https://api.maptiler.com/maps/streets-v2-dark/style.json?key=gDCzA1avLA0udEVVgHhl",
    FALLBACK: "https://tiles.openfreemap.org/styles/liberty",
  },
  DEFAULT_CENTER: [78.4867, 17.385] as [number, number], // Hyderabad [lng, lat]
  DEFAULT_ZOOM: 11,
};
