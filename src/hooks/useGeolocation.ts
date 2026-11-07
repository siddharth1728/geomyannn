"use client";

import { useState, useCallback } from "react";
import { Coordinates } from "@/types/geo";

export type GeolocationStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export function useGeolocation() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      setErrorMessage("Geolocation is not supported by your browser environment.");
      return;
    }

    setStatus("requesting");
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus("granted");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied");
          setErrorMessage("Location permission was denied. Please allow location access in your browser settings.");
        } else {
          setStatus("unavailable");
          setErrorMessage(error.message || "Unable to acquire current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  return {
    coordinates,
    status,
    errorMessage,
    requestLocation,
    clearLocation,
  };
}
