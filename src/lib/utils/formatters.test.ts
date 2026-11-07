import { describe, it, expect } from "vitest";
import { formatDistance, formatDuration, formatCoordinates } from "./formatters";
import { CoordinatesSchema, GeocodeQuerySchema, RouteRequestSchema } from "../validation/schemas";

describe("Formatters", () => {
  it("formats distances correctly in meters and kilometers", () => {
    expect(formatDistance(450)).toBe("450 m");
    expect(formatDistance(1000)).toBe("1.0 km");
    expect(formatDistance(15400)).toBe("15.4 km");
  });

  it("formats durations correctly into minutes and hours", () => {
    expect(formatDuration(25000)).toBe("< 1 min");
    expect(formatDuration(180000)).toBe("3 min");
    expect(formatDuration(3600000)).toBe("1 hr");
    expect(formatDuration(5400000)).toBe("1 hr 30 min");
  });

  it("formats coordinates with directional notation", () => {
    expect(formatCoordinates(17.385, 78.4867)).toBe("17.3850° N, 78.4867° E");
    expect(formatCoordinates(-33.8688, 151.2093)).toBe("33.8688° S, 151.2093° E");
    expect(formatCoordinates(40.7128, -74.006)).toBe("40.7128° N, 74.0060° W");
  });
});

describe("Zod Validation Schemas", () => {
  it("validates coordinate boundaries", () => {
    expect(CoordinatesSchema.safeParse({ latitude: 17.385, longitude: 78.4867 }).success).toBe(true);
    expect(CoordinatesSchema.safeParse({ latitude: 95, longitude: 78.4867 }).success).toBe(false);
    expect(CoordinatesSchema.safeParse({ latitude: 17.385, longitude: 190 }).success).toBe(false);
  });

  it("validates geocode query inputs", () => {
    expect(GeocodeQuerySchema.safeParse({ q: "Hyderabad" }).success).toBe(true);
    expect(GeocodeQuerySchema.safeParse({ q: "H" }).success).toBe(false);
    expect(GeocodeQuerySchema.safeParse({ q: "Charminar", proximity: "78.4747,17.3616" }).success).toBe(true);
  });

  it("validates route requests", () => {
    const valid = {
      origin: { latitude: 17.385, longitude: 78.4867 },
      destination: { latitude: 17.44, longitude: 78.39 },
      mode: "car",
    };
    expect(RouteRequestSchema.safeParse(valid).success).toBe(true);
  });
});
