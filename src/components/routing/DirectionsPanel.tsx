"use client";

import React, { useState } from "react";
import { 
  Car, 
  Bike, 
  Footprints, 
  ArrowUpDown, 
  Navigation, 
  X, 
  Loader2, 
  MapPin, 
  AlertCircle,
  LocateFixed
} from "lucide-react";
import { Coordinates, RouteResult, RoutingProfile } from "@/types/geo";
import { formatDistance, formatDuration } from "@/lib/utils/formatters";

interface DirectionsPanelProps {
  onRouteCalculated: (route: RouteResult | null) => void;
  onClose: () => void;
  initialDestination?: { name: string; coordinates: Coordinates } | null;
  userLocation?: Coordinates | null;
  onRequestUserLocation?: () => void;
}

export function DirectionsPanel({
  onRouteCalculated,
  onClose,
  initialDestination,
  userLocation,
  onRequestUserLocation,
}: DirectionsPanelProps) {
  // Endpoints: Charminar to HITEC City default pair in Hyderabad for easy 1-click test
  const [originText, setOriginText] = useState("Charminar, Hyderabad");
  const [originCoords, setOriginCoords] = useState<Coordinates>({ latitude: 17.3616, longitude: 78.4747 });

  const [destText, setDestText] = useState(initialDestination?.name || "HITEC City, Hyderabad");
  const [destCoords, setDestCoords] = useState<Coordinates>(
    initialDestination?.coordinates || { latitude: 17.4474, longitude: 78.3762 }
  );

  const [mode, setMode] = useState<RoutingProfile>("car");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState<RouteResult | null>(null);

  const handleSwap = () => {
    setOriginText(destText);
    setDestText(originText);
    const tempCoords = originCoords;
    setOriginCoords(destCoords);
    setDestCoords(tempCoords);
  };

  const handleUseMyLocationAsOrigin = () => {
    if (userLocation) {
      setOriginCoords(userLocation);
      setOriginText("My Current Location");
    } else if (onRequestUserLocation) {
      onRequestUserLocation();
    }
  };

  const handleCalculateRoute = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: originCoords,
          destination: destCoords,
          mode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Route calculation failed with code ${res.status}`);
      }

      if (data.route) {
        setCurrentRoute(data.route);
        onRouteCalculated(data.route);
      }
    } catch (err: any) {
      setError(err.message || "Route calculation error");
      setCurrentRoute(null);
      onRouteCalculated(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearRoute = () => {
    setCurrentRoute(null);
    setError(null);
    onRouteCalculated(null);
  };

  return (
    <div className="w-full max-w-sm bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-panel-glow p-4 z-20 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-accent-secondary" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary font-mono">
            GraphHopper Directions
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary p-1 rounded-md transition-colors"
          title="Close directions panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Origin & Destination Inputs */}
      <div className="flex flex-col gap-2 relative">
        {/* Origin */}
        <div className="flex items-center gap-2 bg-surface-elevated/70 border border-border rounded-lg px-2.5 py-1.5 focus-within:border-accent-secondary">
          <MapPin className="w-4 h-4 text-accent-primary shrink-0" />
          <input
            type="text"
            value={originText}
            onChange={(e) => setOriginText(e.target.value)}
            placeholder="Starting origin..."
            className="w-full bg-transparent text-xs text-text-primary placeholder-text-muted focus:outline-none"
          />
          <button
            onClick={handleUseMyLocationAsOrigin}
            className="text-text-muted hover:text-accent-primary p-1 shrink-0"
            title="Use current GPS location"
          >
            <LocateFixed className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Swap Button */}
        <div className="flex justify-end pr-2 -my-1 z-10">
          <button
            onClick={handleSwap}
            className="p-1 rounded-full bg-surface border border-border text-text-muted hover:text-accent-secondary transition-colors"
            title="Swap origin and destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-2 bg-surface-elevated/70 border border-border rounded-lg px-2.5 py-1.5 focus-within:border-accent-secondary">
          <MapPin className="w-4 h-4 text-accent-secondary shrink-0" />
          <input
            type="text"
            value={destText}
            onChange={(e) => setDestText(e.target.value)}
            placeholder="Destination address or coordinates..."
            className="w-full bg-transparent text-xs text-text-primary placeholder-text-muted focus:outline-none"
          />
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-1 bg-surface-muted/60 p-1 rounded-lg border border-border">
        {(
          [
            { id: "car", label: "Car", icon: Car },
            { id: "bike", label: "Cycling", icon: Bike },
            { id: "foot", label: "Walking", icon: Footprints },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const isSelected = mode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                isSelected
                  ? "bg-surface-elevated text-accent-secondary border border-accent-secondary/30 shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCalculateRoute}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-accent-secondary/15 hover:bg-accent-secondary/25 border border-accent-secondary/40 text-accent-secondary text-xs font-bold transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              Compute Route
            </>
          )}
        </button>

        {currentRoute && (
          <button
            onClick={handleClearRoute}
            className="px-3 py-2 rounded-lg bg-surface-elevated border border-border text-text-muted hover:text-danger text-xs font-medium transition-colors"
            title="Clear active route"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error / Provider Notification */}
      {error && (
        <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-tight">{error}</div>
        </div>
      )}

      {/* Route Results Metric Card */}
      {currentRoute && (
        <div className="p-3 bg-surface-elevated border border-accent-secondary/30 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted uppercase">Trip Metrics</span>
            <span className="text-accent-secondary font-bold uppercase">{currentRoute.profile}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-surface/80 p-2 rounded-lg border border-border">
              <div className="text-[10px] text-text-muted uppercase font-mono">Distance</div>
              <div className="text-base font-bold text-text-primary font-mono mt-0.5">
                {formatDistance(currentRoute.distanceMeters)}
              </div>
            </div>

            <div className="bg-surface/80 p-2 rounded-lg border border-border">
              <div className="text-[10px] text-text-muted uppercase font-mono">Est. Duration</div>
              <div className="text-base font-bold text-accent-secondary font-mono mt-0.5">
                {formatDuration(currentRoute.durationMilliseconds)}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-text-muted font-mono flex items-center justify-between pt-1 border-t border-border">
            <span>GraphHopper Engine</span>
            <span>{currentRoute.geometry.coordinates.length} waypoints</span>
          </div>
        </div>
      )}
    </div>
  );
}
