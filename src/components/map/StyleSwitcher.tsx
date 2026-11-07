"use client";

import React from "react";
import { Map as MapIcon, Globe, Moon } from "lucide-react";
import { MapStyleType } from "@/lib/map/config";

interface StyleSwitcherProps {
  currentStyle: MapStyleType;
  onSelectStyle: (style: MapStyleType) => void;
}

export function StyleSwitcher({ currentStyle, onSelectStyle }: StyleSwitcherProps) {
  const styles: { id: MapStyleType; label: string; icon: any }[] = [
    {
      id: "streets",
      label: "Street Map",
      icon: MapIcon,
    },
    {
      id: "hybrid",
      label: "Satellite",
      icon: Globe,
    },
    {
      id: "dark",
      label: "Night Map",
      icon: Moon,
    },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-card z-20">
      {styles.map((item) => {
        const Icon = item.icon;
        const isSelected = currentStyle === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectStyle(item.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isSelected
                ? "bg-primary-soft text-primary font-bold shadow-subtle border border-primary/20"
                : "text-text-muted hover:text-text-primary hover:bg-surface-secondary border border-transparent"
            }`}
            title={`Switch to ${item.label}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
