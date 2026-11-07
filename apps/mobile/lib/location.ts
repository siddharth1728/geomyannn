import * as Location from "expo-location";

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export async function requestForegroundLocation(): Promise<{
  coordinates?: UserCoordinates;
  error?: string;
  permissionDenied?: boolean;
}> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return {
        permissionDenied: true,
        error: "Location permission not granted. You can select your starting point manually.",
      };
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      coordinates: {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
      },
    };
  } catch (e: any) {
    return {
      error: e.message || "Failed to obtain current location",
    };
  }
}
