"use client";

import React from "react";
import { Coordinates, ProviderStatus } from "@/types/geo";
import { formatCoordinates } from "@/lib/utils/formatters";
import { Activity, Radio, Database, Map as MapIcon } from "lucide-react";

interface StatusBarProps {
  center: Coordinates;
  zoom: number;
  pitch: number;
  bearing: number;
  networkMode: boolean;
  providerStatus: ProviderStatus;
}

export function StatusBar({
  center,
  zoom,
  pitch,
  bearing,
  networkMode,
  providerStatus,
}: StatusBarProps) {
  return (
    <footer className="z-20 flex flex-wrap items-center justify-between gap-3 bg-surface/90 backdrop-blur-md border-t border-border px-3 py-1.5 text-[11px] font-mono text-text-muted">
      {/* Telemetry Coordinates */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Activity className="w-3.5 h-3.5 text-accent-primary animate-pulse" />
          <span>POS: {formatCoordinates(center.latitude, center.longitude)}</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-text-muted">
          <span>ZOOM: {zoom.toFixed(1)}</span>
          <span>PITCH: {Math.round(pitch)}°</span>
          <span>BEARING: {Math.round(bearing)}°</span>
        </div>

        {networkMode && (
          <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-accent-primary/10 text-accent-primary border border-accent-primary/30 text-[10px] uppercase font-bold tracking-wider">
            Network Intelligence Active
          </span>
        )}
      </div>

      {/* Provider Status Telemetry */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2">
          {/* Map Provider */}
          <span
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
              providerStatus.maptilerConfigured
                ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/20"
                : "bg-surface-muted text-text-muted border border-border"
            }`}
            title={providerStatus.maptilerConfigured ? "MapTiler Cloud Vector Active" : "OpenStreetMap Vector Active"}
          >
            <MapIcon className="w-3 h-3" />
            {providerStatus.maptilerConfigured ? "MAPTILER" : "OSM TILES"}
          </span>

          {/* GraphHopper */}
          <span
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
              providerStatus.graphhopperConfigured
                ? "bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20"
                : "bg-warning/10 text-warning border border-warning/30"
            }`}
            title={
              providerStatus.graphhopperConfigured
                ? "GraphHopper Routing Active"
                : "GraphHopper Key Pending"
            }
          >
            <Radio className="w-3 h-3" />
            {providerStatus.graphhopperConfigured ? "ROUTING: ACTIVE" : "ROUTING: STANDBY"}
          </span>

          {/* Supabase */}
          <span
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
              providerStatus.supabaseConfigured
                ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/20"
                : "bg-surface-muted text-text-muted border border-border"
            }`}
            title={providerStatus.supabaseConfigured ? "Supabase Cloud Connected" : "Local Store Active"}
          >
            <Database className="w-3 h-3" />
            {providerStatus.supabaseConfigured ? "SUPABASE: CLOUD" : "STORE: LOCAL"}
          </span>
        </div>

        {/* Mandatory Attribution */}
        <div className="text-[10px] text-text-muted hover:text-text-secondary transition-colors">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenStreetMap</a> contributors | <a href="https://www.maptiler.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">MapTiler</a>
        </div>
      </div>
    </footer>
  );
}
