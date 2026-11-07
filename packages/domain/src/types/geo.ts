export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type RoutingProfile = "car" | "bike" | "foot";

export interface GeoFeature {
  id: string;
  name: string;
  placeName: string;
  center: [number, number]; // [lng, lat]
  bbox?: [number, number, number, number];
  properties?: Record<string, any>;
}

export interface RouteWaypoint {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface RouteInstruction {
  text: string;
  distance: number; // meters
  time: number; // milliseconds
  street_name?: string;
}

export interface CalculatedRoute {
  id: string;
  profile: RoutingProfile;
  distanceMeters: number;
  durationSeconds: number;
  coordinates: [number, number][]; // [lng, lat]
  instructions?: RouteInstruction[];
  bbox?: [number, number, number, number];
}
