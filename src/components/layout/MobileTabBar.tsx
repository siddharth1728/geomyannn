"use client";

import React from "react";
import { Compass, Users, MapPin, Bookmark, Plus } from "lucide-react";
import { ActiveMode } from "@/types/geo";

interface MobileTabBarProps {
  activeMode: ActiveMode;
  onChangeMode: (mode: ActiveMode) => void;
  onOpenPlanModal: () => void;
  meetupCount?: number;
}

export function MobileTabBar({
  activeMode,
  onChangeMode,
  onOpenPlanModal,
  meetupCount = 0,
}: MobileTabBarProps) {
  const tabs = [
    { id: "plan" as ActiveMode, label: "Plan", icon: Compass },
    { id: "my_meetups" as ActiveMode, label: "Meetups", icon: Users },
    { id: "explore" as ActiveMode, label: "Explore", icon: MapPin },
    { id: "saved" as ActiveMode, label: "Saved", icon: Bookmark },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-lg border-t border-border flex items-center justify-around px-2 z-40 transition-colors">
      {tabs.slice(0, 2).map((tab) => {
        const Icon = tab.icon;
        const isActive =
          activeMode === tab.id ||
          (tab.id === "plan" && activeMode === "active_meetup");

        return (
          <button
            key={tab.id}
            onClick={() => onChangeMode(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
              isActive ? "text-primary font-bold" : "text-text-secondary"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}

      {/* Center Quick Plan Floating Action */}
      <div className="-mt-5">
        <button
          onClick={onOpenPlanModal}
          title="Plan a Meetup"
          className="w-12 h-12 rounded-full bg-primary text-white shadow-float flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {tabs.slice(2).map((tab) => {
        const Icon = tab.icon;
        const isActive = activeMode === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChangeMode(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
              isActive ? "text-primary font-bold" : "text-text-secondary"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
