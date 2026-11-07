export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type PlaceResult = {
  id: string;
  name: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  category?: string;
  provider: "maptiler" | "openfreemap";
};

export type RoutingProfile = "car" | "bike" | "foot";

export type RouteResult = {
  geometry: {
    type: "LineString";
    coordinates: [number, number][]; // [longitude, latitude]
  };
  distanceMeters: number;
  durationMilliseconds: number;
  profile: RoutingProfile;
  provider: "graphhopper";
};

export type ReportCategory =
  | "pothole"
  | "waterlogging"
  | "road_closure"
  | "traffic_disruption"
  | "broken_streetlight"
  | "blocked_footpath"
  | "other";

export type ReportStatus = "reported" | "verified" | "resolved" | "dismissed";

export type CommunityReport = {
  id: string;
  createdBy?: string | null;
  category: ReportCategory;
  description: string;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  createdAt: string;
  expiresAt: string;
};

export type SavedPlace = {
  id: string;
  userId: string;
  label: string;
  placeName: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
};

export type ActiveMode = 
  | "plan" 
  | "my_meetups" 
  | "explore" 
  | "saved" 
  | "settings"
  | "join"
  | "active_meetup";

export type ProviderStatus = {
  maptilerConfigured: boolean;
  graphhopperConfigured: boolean;
  supabaseConfigured: boolean;
};
