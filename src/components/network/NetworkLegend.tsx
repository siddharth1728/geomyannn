"use client";

import React from "react";
import { Network, Eye, EyeOff, Layers } from "lucide-react";

interface NetworkLegendProps {
  active: boolean;
  onToggle: () => void;
}

export function NetworkLegend({ active, onToggle }: NetworkLegendProps) {
  return (
    <div className="bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-panel-glow p-3.5 z-20 flex flex-col gap-2.5 max-w-xs">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-accent-primary" />
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-text-primary">
            Road Network Intelligence
          </span>
        </div>
        <button
          onClick={onToggle}
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
            active
              ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/40"
              : "bg-surface-elevated text-text-muted border border-border hover:text-text-primary"
          }`}
        >
          {active ? (
            <>
              <Eye className="w-3 h-3" /> ON
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3" /> OFF
            </>
          )}
        </button>
      </div>

      <p className="text-[11px] text-text-muted leading-relaxed">
        Real-time vector extraction of transport hierarchies directly from OpenStreetMap & MapTiler planet tiles.
      </p>

      {/* Legend Items */}
      <div className="flex flex-col gap-1.5 pt-1 text-[11px] font-mono">
        <div className="flex items-center gap-2.5">
          <span className="w-4 h-1 rounded bg-[#75E6C2] shadow-sm shrink-0" />
          <span className="text-text-primary font-medium">Motorway / Arterial Corridors</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-4 h-1 rounded bg-[#71B9E8] shadow-sm shrink-0" />
          <span className="text-text-secondary">Primary & Secondary Connectors</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-4 h-0.5 rounded bg-[#4E6982] shrink-0" />
          <span className="text-text-muted">Local & Urban Streets</span>
        </div>
      </div>
    </div>
  );
}
