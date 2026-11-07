"use client";

import React from "react";
import { 
  Compass, 
  Navigation, 
  Network, 
  AlertTriangle, 
  Bookmark, 
  ShieldCheck, 
  Globe2 
} from "lucide-react";
import { ActiveMode } from "@/types/geo";

interface MissionSidebarProps {
  activeMode: ActiveMode;
  onSelectMode: (mode: ActiveMode) => void;
  reportCount?: number;
  savedCount?: number;
  networkModeActive: boolean;
}

export function MissionSidebar({
  activeMode,
  onSelectMode,
  reportCount = 0,
  savedCount = 0,
  networkModeActive,
}: MissionSidebarProps) {
  const navItems = [
    {
      id: "explore" as ActiveMode,
      label: "Explore",
      icon: Compass,
      description: "Global Vector Reconnaissance",
    },
    {
      id: "directions" as ActiveMode,
      label: "Directions",
      icon: Navigation,
      description: "GraphHopper Mobility Engine",
    },
    {
      id: "network" as ActiveMode,
      label: "Road Network",
      icon: Network,
      activeIndicator: networkModeActive,
      description: "Infrastructure Intelligence",
    },
    {
      id: "reports" as ActiveMode,
      label: "Community",
      icon: AlertTriangle,
      badge: reportCount > 0 ? reportCount : undefined,
      description: "Live Incident Reporting",
    },
    {
      id: "saved" as ActiveMode,
      label: "Saved Places",
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : undefined,
      description: "Secured Coordinates",
    },
    {
      id: "account" as ActiveMode,
      label: "Mission Status",
      icon: ShieldCheck,
      description: "System & Auth Verification",
    },
  ];

  return (
    <aside 
      aria-label="Mission Control Navigation"
      className="z-30 flex md:flex-col items-center justify-between md:justify-start bg-surface/95 backdrop-blur-md border-t md:border-t-0 md:border-r border-border p-2 md:p-3 w-full md:w-20 lg:w-64 transition-all duration-300"
    >
      {/* Brand Header */}
      <div className="hidden md:flex items-center gap-3 px-3 py-4 w-full border-b border-border mb-4">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-surface-elevated border border-accent-primary/30 text-accent-primary shadow-mission-glow">
          <Globe2 className="w-6 h-6 animate-pulse" />
          <div className="absolute inset-0 rounded-lg bg-accent-primary/10 animate-ping opacity-25" />
        </div>
        <div className="hidden lg:block text-left">
          <div className="text-sm font-bold tracking-widest text-text-primary uppercase flex items-center gap-1.5 font-mono">
            GEORYNTH
            <span className="w-2 h-2 rounded-full bg-accent-primary inline-block" />
          </div>
          <div className="text-[11px] text-text-muted font-medium">Mission Control</div>
        </div>
      </div>

      {/* Nav Actions */}
      <nav className="flex md:flex-col items-center md:items-stretch w-full gap-1.5 md:gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.id || (item.id === "network" && networkModeActive);

          return (
            <button
              key={item.id}
              onClick={() => onSelectMode(item.id)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                isActive
                  ? "bg-surface-elevated text-accent-primary border border-accent-primary/40 shadow-mission-glow"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated/60 border border-transparent"
              }`}
              title={item.label}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isActive ? "text-accent-primary" : "text-text-secondary"
                }`} />
                {item.activeIndicator && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent-primary ring-2 ring-surface animate-ping" />
                )}
              </div>

              <div className="hidden lg:block flex-1 min-w-0">
                <div className="text-xs font-semibold leading-none tracking-wide">
                  {item.label}
                </div>
                <div className="text-[10px] text-text-muted truncate mt-0.5">
                  {item.description}
                </div>
              </div>

              {item.badge !== undefined && (
                <span className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-surface-muted text-accent-secondary border border-border">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Version Tag */}
      <div className="hidden md:flex flex-col items-center lg:items-start w-full mt-auto pt-4 border-t border-border px-3 text-[10px] text-text-muted font-mono">
        <span className="text-accent-primary/80">SYS-REL 2026.11</span>
        <span className="hidden lg:inline">HYDERABAD BASE 17.38°N</span>
      </div>
    </aside>
  );
}
