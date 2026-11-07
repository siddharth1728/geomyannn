"use client";

import React from "react";
import { 
  Sparkles, 
  Users, 
  KeyRound, 
  Compass, 
  ArrowRight, 
  Check, 
  MapPin,
  Clock
} from "lucide-react";

interface HeroWelcomeCardProps {
  onPlanMeetup: () => void;
  onJoinMeetup: () => void;
  onExploreNearby: () => void;
  onFastTrackHyderabad: () => void;
  recentMeetupTitle?: string;
  onOpenRecentMeetup?: () => void;
}

export function HeroWelcomeCard({
  onPlanMeetup,
  onJoinMeetup,
  onExploreNearby,
  onFastTrackHyderabad,
  recentMeetupTitle,
  onOpenRecentMeetup,
}: HeroWelcomeCardProps) {
  return (
    <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-card p-5 sm:p-6 flex flex-col gap-4 animate-in fade-in transition-colors">
      {/* Brand Header & Positioning */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-2.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Group Meetup Intelligence</span>
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight leading-snug">
          Let&apos;s make a plan.
        </h1>
        <p className="text-sm font-medium text-text-secondary mt-1">
          Find somewhere your whole group will love.
        </p>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          Balance travel times across every friend&apos;s starting point and discover the fairest spot in seconds.
        </p>
      </div>

      {/* Returning User Context (if any active plan exists) */}
      {recentMeetupTitle && onOpenRecentMeetup && (
        <div className="p-3 rounded-xl bg-surface-secondary border border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Active Plan in Progress
              </p>
              <p className="text-xs font-bold text-text-primary truncate max-w-[220px]">
                {recentMeetupTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenRecentMeetup}
            className="text-xs font-bold text-primary hover:text-primary-hover px-2.5 py-1 rounded-md bg-primary-soft"
          >
            Resume →
          </button>
        </div>
      )}

      {/* 3 Primary Action Cards */}
      <div className="flex flex-col gap-2.5">
        {/* 1. Plan a Meetup (Primary Action) */}
        <button
          onClick={onPlanMeetup}
          className="w-full p-4 rounded-xl bg-primary text-white hover:bg-primary-hover shadow-subtle flex items-center justify-between group transition-all text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-1.5">
                Plan a Meetup
              </div>
              <div className="text-xs text-white/80 mt-0.5">
                Pick an activity, invite friends & equalize drive times
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform shrink-0" />
        </button>

        {/* 2. Join a Meetup */}
        <button
          onClick={onJoinMeetup}
          className="w-full p-3.5 rounded-xl bg-surface-secondary hover:bg-surface-secondary/80 border border-border text-text-primary flex items-center justify-between group transition-all text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-primary shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">
                Join a Meetup
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                Enter your invite code & submit your starting spot
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 group-hover:text-text-primary transition-all shrink-0" />
        </button>

        {/* 3. Explore Nearby */}
        <button
          onClick={onExploreNearby}
          className="w-full p-3.5 rounded-xl bg-surface-secondary hover:bg-surface-secondary/80 border border-border text-text-primary flex items-center justify-between group transition-all text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-secondary shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">
                Explore Nearby Places
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                Browse cafes, restaurants, cinemas & parks across town
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 group-hover:text-text-primary transition-all shrink-0" />
        </button>
      </div>

      {/* Micro-Stepper Value Props */}
      <div className="grid grid-cols-3 gap-2 py-2 border-y border-border text-center">
        <div className="flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-primary-soft text-primary text-[10px] font-bold flex items-center justify-center mb-1">
            1
          </div>
          <span className="text-[11px] font-medium text-text-secondary">Pick Activity</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-primary-soft text-primary text-[10px] font-bold flex items-center justify-center mb-1">
            2
          </div>
          <span className="text-[11px] font-medium text-text-secondary">Invite Friends</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-primary-soft text-primary text-[10px] font-bold flex items-center justify-center mb-1">
            3
          </div>
          <span className="text-[11px] font-medium text-text-secondary">Fairest Venue</span>
        </div>
      </div>

      {/* 1-Click Hyderabad 4-Friend Test Scenario */}
      <div>
        <button
          onClick={onFastTrackHyderabad}
          className="w-full py-2.5 px-3.5 rounded-xl bg-primary-soft hover:bg-primary-soft/80 text-primary text-xs font-semibold flex items-center justify-between transition-colors border border-primary/20"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Try Hyderabad 4-Friend Hangout</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary text-white shrink-0">
            Demo
          </span>
        </button>
      </div>
    </div>
  );
}
