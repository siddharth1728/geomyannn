"use client";

import React from "react";
import { 
  Sparkles, 
  Calendar, 
  Compass, 
  Bookmark, 
  Settings, 
  Users 
} from "lucide-react";
import { ActiveMode } from "@/types/geo";

interface MissionSidebarProps {
  activeMode: ActiveMode;
  onSelectMode: (mode: ActiveMode) => void;
  meetupCount?: number;
  savedCount?: number;
}

export function MissionSidebar({
  activeMode,
  onSelectMode,
  meetupCount = 0,
  savedCount = 0,
}: MissionSidebarProps) {
  // Main Navigation per specification: Plan, My Meetups, Explore, Saved Places, Settings
  const navItems = [
    {
      id: "plan" as ActiveMode,
      label: "Plan",
      icon: Sparkles,
      highlight: true,
      description: "Smart Meetup",
    },
    {
      id: "my_meetups" as ActiveMode,
      label: "My Meetups",
      icon: Calendar,
      badge: meetupCount > 0 ? meetupCount : undefined,
      description: "Active Group Rooms",
    },
    {
      id: "explore" as ActiveMode,
      label: "Explore",
      icon: Compass,
      description: "Interactive Map & POIs",
    },
    {
      id: "saved" as ActiveMode,
      label: "Saved Places",
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : undefined,
      description: "Secured Locations",
    },
    {
      id: "settings" as ActiveMode,
      label: "Settings",
      icon: Settings,
      description: "Preferences & Keys",
    },
  ];

  return (
    <aside 
      aria-label="Primary Navigation"
      className="z-30 flex md:flex-col items-center justify-between md:justify-start bg-surface/95 backdrop-blur-md border-t md:border-t-0 md:border-r border-border p-2 md:p-3 w-full md:w-20 lg:w-60 transition-all duration-300"
    >
      {/* Brand Header */}
      <div className="hidden md:flex items-center gap-3 px-3 py-3 w-full border-b border-border mb-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-surface-elevated border border-accent-secondary/30 text-accent-secondary shadow-panel-glow">
          <Users className="w-5 h-5 text-accent-secondary animate-pulse" />
          <div className="absolute inset-0 rounded-xl bg-accent-secondary/10 animate-ping opacity-25" />
        </div>
        <div className="hidden lg:block text-left">
          <div className="text-sm font-bold tracking-wider text-text-primary uppercase flex items-center gap-1.5 font-mono">
            GEORYNTH
            <span className="w-2 h-2 rounded-full bg-accent-secondary inline-block" />
          </div>
          <div className="text-[10px] text-text-muted">Less planning. More meeting.</div>
        </div>
      </div>

      {/* Primary 5-Tab Navigation Items */}
      <nav className="flex md:flex-col items-center md:items-stretch w-full gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            activeMode === item.id || 
            (item.id === "plan" && (activeMode === "active_meetup" || activeMode === "join"));

          return (
            <button
              key={item.id}
              onClick={() => onSelectMode(item.id)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                item.highlight && activeMode === "plan"
                  ? "bg-accent-secondary/20 hover:bg-accent-secondary/30 text-accent-secondary border border-accent-secondary/40 shadow-sm"
                  : isActive
                  ? "bg-surface-elevated text-accent-secondary border border-accent-secondary/30 shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated/60 border border-transparent"
              }`}
              title={item.label}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? "text-accent-secondary" : "text-text-secondary"
                }`} />
              </div>

              <div className="hidden lg:block flex-1 min-w-0">
                <div className="text-xs font-bold leading-none tracking-wide">
                  {item.label}
                </div>
                <div className="text-[10px] text-text-muted truncate mt-0.5">
                  {item.description}
                </div>
              </div>

              {item.badge !== undefined && (
                <span className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-surface text-accent-secondary border border-border">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Mission Control Signature */}
      <div className="hidden md:flex flex-col items-center lg:items-start w-full mt-auto pt-3 border-t border-border px-3 text-[10px] text-text-muted font-mono">
        <span className="text-accent-secondary font-bold">HYDERABAD HUB</span>
        <span className="hidden lg:inline">Fair Midpoint Engine</span>
      </div>
    </aside>
  );
}
