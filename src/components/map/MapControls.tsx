"use client";

import React from "react";
import { 
  Plus, 
  Minus, 
  Compass, 
  Maximize, 
  Minimize, 
  LocateFixed, 
  RotateCcw,
  Loader2 
} from "lucide-react";
import { GeolocationStatus } from "@/hooks/useGeolocation";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetNorth: () => void;
  onResetCenter: () => void;
  onLocateUser: () => void;
  geolocationStatus: GeolocationStatus;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onResetNorth,
  onResetCenter,
  onLocateUser,
  geolocationStatus,
  isFullscreen,
  onToggleFullscreen,
}: MapControlsProps) {
  return (
    <div className="flex flex-col gap-1.5 z-20">
      {/* Zoom controls */}
      <div className="flex flex-col bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <button
          onClick={onZoomIn}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors border-b border-border/50"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Locate Me */}
      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <button
          onClick={onLocateUser}
          className={`p-2 transition-colors flex items-center justify-center ${
            geolocationStatus === "granted"
              ? "text-primary bg-primary-soft"
              : geolocationStatus === "requesting"
              ? "text-secondary"
              : geolocationStatus === "denied"
              ? "text-danger"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
          }`}
          title={
            geolocationStatus === "granted"
              ? "Fly to My Location"
              : geolocationStatus === "denied"
              ? "Location Permission Denied"
              : "Locate Me"
          }
        >
          {geolocationStatus === "requesting" ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <LocateFixed className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Compass / Reset North */}
      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <button
          onClick={onResetNorth}
          className="p-2 text-text-secondary hover:text-primary hover:bg-surface-secondary transition-colors"
          title="Reset Pitch & North Bearing"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Reset to Hyderabad Base */}
      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <button
          onClick={onResetCenter}
          className="p-2 text-text-secondary hover:text-secondary hover:bg-surface-secondary transition-colors"
          title="Reset to Center"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Fullscreen */}
      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <button
          onClick={onToggleFullscreen}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
