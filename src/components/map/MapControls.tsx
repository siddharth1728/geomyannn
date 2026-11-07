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
      <div className="flex flex-col bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-panel-glow overflow-hidden">
        <button
          onClick={onZoomIn}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors border-b border-border/50"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Locate Me */}
      <div className="bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-panel-glow overflow-hidden">
        <button
          onClick={onLocateUser}
          className={`p-2 transition-colors flex items-center justify-center ${
            geolocationStatus === "granted"
              ? "text-accent-primary bg-accent-primary/10"
              : geolocationStatus === "requesting"
              ? "text-accent-secondary"
              : geolocationStatus === "denied"
              ? "text-danger"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
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
            <Loader2 className="w-4 h-4 animate-spin text-accent-secondary" />
          ) : (
            <LocateFixed className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Compass / Reset North */}
      <div className="bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-panel-glow overflow-hidden">
        <button
          onClick={onResetNorth}
          className="p-2 text-text-secondary hover:text-accent-primary hover:bg-surface-elevated transition-colors"
          title="Reset Pitch & North Bearing"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Reset to Hyderabad Base */}
      <div className="bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-panel-glow overflow-hidden">
        <button
          onClick={onResetCenter}
          className="p-2 text-text-secondary hover:text-accent-secondary hover:bg-surface-elevated transition-colors"
          title="Reset to Hyderabad Showcase Base"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Fullscreen */}
      <div className="bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-panel-glow overflow-hidden">
        <button
          onClick={onToggleFullscreen}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
