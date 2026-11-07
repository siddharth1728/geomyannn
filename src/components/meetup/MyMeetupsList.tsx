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
    <div className="w-full h-full p-4 flex flex-col gap-3 overflow-y-auto animate-in fade-in transition-colors">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
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
        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition-all flex items-center justify-center gap-1.5"
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
              className="p-3.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border hover:border-primary/40 cursor-pointer transition-all flex flex-col gap-1.5 group shadow-subtle"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                  {m.title}
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  m.status === "confirmed"
                    ? "bg-success/15 text-success"
                    : "bg-primary-soft text-primary"
                }`}>
                  {m.status}
                </span>
              </div>

              <div className="text-[11px] text-text-muted flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(m.plannedAt).toLocaleDateString()}
                </span>
                <span>• {m.locations.length} participants</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border/60">
                <span className="font-mono font-bold text-primary">Code: {m.inviteCode}</span>
                <span className="text-primary font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Open Room <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-text-muted space-y-1">
          <p className="font-semibold text-text-primary">No meetups yet</p>
          <p>Tap &apos;Plan New Meetup&apos; to find a spot everyone can reach.</p>
        </div>
      )}
    </div>
  );
}
