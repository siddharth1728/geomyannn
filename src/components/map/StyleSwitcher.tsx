"use client";

import React from "react";
import { Layers, Map as MapIcon, Globe, Moon } from "lucide-react";
import { MapStyleType } from "@/lib/map/config";

interface StyleSwitcherProps {
  currentStyle: MapStyleType;
  onSelectStyle: (style: MapStyleType) => void;
}

export function StyleSwitcher({ currentStyle, onSelectStyle }: StyleSwitcherProps) {
  const styles: { id: MapStyleType; label: string; icon: any; preview: string }[] = [
    {
      id: "streets",
      label: "Google Streets",
      icon: MapIcon,
      preview: "bg-[#e8ece9] text-[#1a73e8]",
    },
    {
      id: "hybrid",
      label: "Satellite",
      icon: Globe,
      preview: "bg-[#0b1d28] text-white",
    },
    {
      id: "dark",
      label: "Mission Dark",
      icon: Moon,
      preview: "bg-[#101821] text-[#75E6C2]",
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-panel-glow z-20">
      {styles.map((item) => {
        const Icon = item.icon;
        const isSelected = currentStyle === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectStyle(item.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isSelected
                ? "bg-surface-elevated text-text-primary border border-accent-secondary/50 shadow-sm font-semibold"
                : "text-text-muted hover:text-text-primary hover:bg-surface-elevated/50 border border-transparent"
            }`}
            title={`Switch to ${item.label}`}
          >
            <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-accent-secondary" : ""}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
