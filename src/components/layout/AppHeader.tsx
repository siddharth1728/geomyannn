"use client";

import React from "react";
import { Compass, Users, MapPin, Bookmark, Settings, Plus } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { ActiveMode } from "@/types/geo";

interface AppHeaderProps {
  activeMode: ActiveMode;
  onChangeMode: (mode: ActiveMode) => void;
  onOpenPlanModal: () => void;
  onOpenSettings: () => void;
  activeMeetupTitle?: string;
  meetupCount?: number;
}

export function AppHeader({
  activeMode,
  onChangeMode,
  onOpenPlanModal,
  onOpenSettings,
  activeMeetupTitle,
  meetupCount = 0,
}: AppHeaderProps) {
  const navItems: { id: ActiveMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "plan", label: "Plan", icon: Compass },
    { id: "my_meetups", label: "My Meetups", icon: Users },
    { id: "explore", label: "Explore", icon: MapPin },
    { id: "saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <header className="h-14 border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 transition-colors">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => onChangeMode("plan")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-bold text-base shadow-subtle group-hover:scale-105 transition-transform">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-text-primary">
                GEORYNTH
              </span>
              <span className="hidden lg:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-primary-soft text-primary">
                MEETUP PLATFORM
              </span>
            </div>
            <p className="text-[11px] text-text-muted hidden md:block -mt-0.5">
              Find a place everyone can reach
            </p>
          </div>
        </div>

        {/* Active Meetup Pill (if any) */}
        {activeMeetupTitle && (
          <div className="hidden xl:flex items-center gap-2 ml-4 px-3 py-1 rounded-full bg-surface-secondary border border-border text-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-medium text-text-secondary">Active:</span>
            <span className="font-semibold text-text-primary max-w-[180px] truncate">
              {activeMeetupTitle}
            </span>
          </div>
        )}
      </div>

      {/* Center: 4 Primary Tabs (Desktop) */}
      <nav className="hidden md:flex items-center gap-1 bg-surface-secondary p-1 rounded-xl border border-border">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeMode === item.id ||
            (item.id === "plan" && activeMode === "active_meetup");

          return (
            <button
              key={item.id}
              onClick={() => onChangeMode(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-surface text-primary font-bold shadow-subtle"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.id === "my_meetups" && meetupCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary text-white font-bold">
                  {meetupCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Actions, Theme & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Plan CTA Button */}
        <button
          onClick={onOpenPlanModal}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-subtle transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Plan Meetup</span>
        </button>

        {/* Adaptive Theme Toggle */}
        <ThemeToggle />

        {/* Settings / Profile Button */}
        <button
          onClick={onOpenSettings}
          title="Profile & Settings"
          className="w-8 h-8 rounded-lg bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
