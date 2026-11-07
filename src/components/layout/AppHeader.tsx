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
  meetupCount?: number;
}

export function AppHeader({
  activeMode,
  onChangeMode,
  onOpenPlanModal,
  onOpenSettings,
  meetupCount = 0,
}: AppHeaderProps) {
  const navItems: { id: ActiveMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "explore", label: "Explore", icon: MapPin },
    { id: "my_meetups", label: "Meetups", icon: Users },
    { id: "saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <header className="h-14 border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 transition-colors">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => onChangeMode("explore")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-base shadow-subtle group-hover:scale-105 transition-transform">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-text-primary">
                GEORYNTH
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-primary-soft text-primary">
                MEETUP PLATFORM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Primary Navigation (Explore | Meetups | Saved) */}
      <nav className="hidden md:flex items-center gap-1 bg-surface-secondary p-1 rounded-xl border border-border">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeMode === item.id ||
            (item.id === "my_meetups" && (activeMode === "active_meetup" || activeMode === "plan"));

          return (
            <button
              key={item.id}
              onClick={() => onChangeMode(item.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-surface text-primary shadow-subtle"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.id === "my_meetups" && meetupCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary-soft text-primary">
                  {meetupCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Plan Meetup CTA & User Profile/Settings */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenPlanModal}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-subtle transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Plan Meetup</span>
        </button>

        {/* User Avatar / Profile Settings Trigger */}
        <button
          onClick={onOpenSettings}
          title="Account & Settings"
          className="w-8 h-8 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors shadow-subtle"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
