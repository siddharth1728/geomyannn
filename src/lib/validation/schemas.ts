import { z } from "zod";

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90),
  longitude: z.number().min(-180, "Longitude must be between -180 and 180").max(180),
});

export const GeocodeQuerySchema = z.object({
  q: z.string().trim().min(2, "Search query must be at least 2 characters").max(200),
  limit: z.coerce.number().min(1).max(20).default(5),
  proximity: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const parts = val.split(",").map(Number);
        return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]);
      },
      { message: "Proximity must be 'longitude,latitude'" }
    ),
});

export const RouteRequestSchema = z.object({
  origin: CoordinatesSchema,
  destination: CoordinatesSchema,
  mode: z.enum(["car", "bike", "foot"]).default("car"),
});

export const CommunityReportInputSchema = z.object({
  category: z.enum([
    "pothole",
    "waterlogging",
    "road_closure",
    "traffic_disruption",
    "broken_streetlight",
    "blocked_footpath",
    "other",
  ]),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const SavedPlaceInputSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(100),
  placeName: z.string().trim().min(1, "Place name is required").max(200),
  address: z.string().trim().max(500).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
