"use client";

import React from "react";
import { 
  Sparkles, 
  Users, 
  KeyRound, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  MapPin 
} from "lucide-react";

interface HeroWelcomeCardProps {
  onPlanMeetup: () => void;
  onJoinMeetup: () => void;
  onExploreNearby: () => void;
  onFastTrackHyderabad: () => void;
}

export function HeroWelcomeCard({
  onPlanMeetup,
  onJoinMeetup,
  onExploreNearby,
  onFastTrackHyderabad,
}: HeroWelcomeCardProps) {
  return (
    <div className="w-full max-w-md bg-surface/95 backdrop-blur-md border border-border rounded-2xl shadow-panel-glow p-5 flex flex-col gap-4 animate-in fade-in">
      {/* Brand Header & Positioning */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-secondary/15 text-accent-secondary text-[11px] font-bold border border-accent-secondary/30 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Group Discovery</span>
        </div>
        <h1 className="text-xl font-extrabold text-text-primary tracking-tight leading-snug">
          Find a place everyone can reach.
        </h1>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          Less planning. More meeting. Balance travel times across every friend&apos;s origin and discover the fairest spot in seconds.
        </p>
      </div>

      {/* 3 Primary Action Cards */}
      <div className="flex flex-col gap-2">
        {/* 1. Plan a Meetup (Primary) */}
        <button
          onClick={onPlanMeetup}
          className="w-full p-3.5 rounded-xl bg-accent-secondary/15 hover:bg-accent-secondary/25 border border-accent-secondary/40 text-text-primary flex items-center justify-between group transition-all text-left shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-surface border border-accent-secondary/30 text-accent-secondary">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-accent-secondary flex items-center gap-1.5">
                Plan a Meetup
                <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
              </div>
              <div className="text-[11px] text-text-muted">
                Pick a category, invite friends & equalize drive times
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-accent-secondary group-hover:translate-x-1 transition-transform shrink-0" />
        </button>

        {/* 2. Join a Meetup */}
        <button
          onClick={onJoinMeetup}
          className="w-full p-3 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-text-primary flex items-center justify-between group transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-surface border border-border text-accent-primary">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">
                Join a Meetup
              </div>
              <div className="text-[11px] text-text-muted">
                Enter your invitation code & submit your starting spot
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 group-hover:text-text-primary transition-all shrink-0" />
        </button>

        {/* 3. Explore Nearby */}
        <button
          onClick={onExploreNearby}
          className="w-full p-3 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-text-primary flex items-center justify-between group transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-surface border border-border text-text-secondary">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">
                Explore Nearby
              </div>
              <div className="text-[11px] text-text-muted">
                Browse dining, cafes, cinemas & parks across Hyderabad
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 group-hover:text-text-primary transition-all shrink-0" />
        </button>
      </div>

      {/* 1-Click 4-Friend Test Scenario Fast Track */}
      <div className="pt-2 border-t border-border/80">
        <button
          onClick={onFastTrackHyderabad}
          className="w-full py-2.5 px-3 rounded-xl bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/30 text-accent-primary text-xs font-semibold flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Try 4-Friend Scenario (Kukatpally, Secunderabad, etc.)</span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold">1-Click</span>
        </button>
      </div>
    </div>
  );
}
