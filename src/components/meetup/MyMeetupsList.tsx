"use client";

import React from "react";
import { Users, X, Clock, Calendar, ArrowRight, Plus } from "lucide-react";
import { Meetup } from "@/types/meetup";

interface MyMeetupsListProps {
  meetups: Meetup[];
  onSelectMeetup: (meetup: Meetup) => void;
  onPlanNew: () => void;
  onClose: () => void;
}

export function MyMeetupsList({
  meetups,
  onSelectMeetup,
  onPlanNew,
  onClose,
}: MyMeetupsListProps) {
  return (
    <div className="w-full max-w-sm bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-panel-glow p-4 flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-accent-secondary" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary font-mono">
            My Meetups ({meetups.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={onPlanNew}
        className="w-full py-2 rounded-lg bg-accent-secondary/15 hover:bg-accent-secondary/25 border border-accent-secondary/40 text-accent-secondary text-xs font-bold transition-all flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Plan New Meetup
      </button>

      {meetups.length > 0 ? (
        <div className="flex flex-col gap-2">
          {meetups.map((m) => (
            <div
              key={m.id}
              onClick={() => onSelectMeetup(m)}
              className="p-3 rounded-xl bg-surface-elevated/70 border border-border hover:border-accent-secondary/50 cursor-pointer transition-all flex flex-col gap-1.5 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-bold text-text-primary group-hover:text-accent-secondary transition-colors truncate">
                  {m.title}
                </div>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-bold border ${
                  m.status === "confirmed"
                    ? "bg-accent-primary/15 text-accent-primary border-accent-primary/30"
                    : "bg-warning/15 text-warning border-warning/30"
                }`}>
                  {m.status}
                </span>
              </div>

              <div className="text-[11px] text-text-muted flex items-center gap-2 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(m.plannedAt).toLocaleDateString()}
                </span>
                <span>• {m.locations.length} participants</span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-text-muted font-mono pt-1 border-t border-border/50">
                <span>Code: {m.inviteCode}</span>
                <span className="text-accent-secondary flex items-center gap-0.5">
                  Open Room <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-text-muted">
          No meetups organized yet. Tap &apos;Plan New Meetup&apos; to get started!
        </div>
      )}
    </div>
  );
}
