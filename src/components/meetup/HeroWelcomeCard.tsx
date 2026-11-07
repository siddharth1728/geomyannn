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
  Clock,
  Zap,
  Coffee,
  Utensils
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
    <div className="w-full h-full p-4 sm:p-5 flex flex-col gap-4 animate-in fade-in transition-colors">
      {/* Brand Header & Positioning */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-2.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Social Meetup Intelligence</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight leading-snug">
          Let&apos;s make a plan.
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-text-secondary mt-1">
          Find a place everyone can reach.
        </p>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          Balance road travel times across every friend&apos;s location and discover the fairest hangout spot in seconds.
        </p>
      </div>

      {/* Returning User Context (if any active plan exists) */}
      {recentMeetupTitle && onOpenRecentMeetup && (
        <div className="p-3 rounded-xl bg-surface-secondary border border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Active Plan in Progress
              </p>
              <p className="text-xs font-bold text-text-primary truncate max-w-[200px]">
                {recentMeetupTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenRecentMeetup}
            className="px-2.5 py-1 rounded-lg bg-surface text-primary border border-border text-xs font-bold hover:border-primary transition-colors"
          >
            Resume
          </button>
        </div>
      )}

      {/* 3 Core Action Cards */}
      <div className="flex flex-col gap-2.5">
        {/* Action 1: Plan a Meetup */}
        <button
          onClick={onPlanMeetup}
          className="group p-3.5 rounded-2xl bg-primary text-white shadow-subtle hover:bg-primary-hover transition-all text-left flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">Plan a Meetup</div>
              <div className="text-[11px] text-white/80">3 easy steps: What, When & Preferences</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Action 2: Join a Meetup */}
        <button
          onClick={onJoinMeetup}
          className="group p-3.5 rounded-2xl bg-surface-secondary hover:bg-surface border border-border hover:border-primary/40 transition-all text-left flex items-center justify-between shadow-subtle"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-text-primary tracking-tight">Join with Code</div>
              <div className="text-[11px] text-text-muted">Enter a 6-character group invite code</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </button>

        {/* Action 3: Explore Nearby */}
        <button
          onClick={onExploreNearby}
          className="group p-3.5 rounded-2xl bg-surface-secondary hover:bg-surface border border-border hover:border-primary/40 transition-all text-left flex items-center justify-between shadow-subtle"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-text-primary tracking-tight">Explore Nearby Places</div>
              <div className="text-[11px] text-text-muted">Top cafes, food, cinema & parks near you</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* 1-Click Fast Track: Hyderabad 4-Friend Demo Scenario */}
      <div className="mt-1 p-3.5 rounded-2xl bg-surface-secondary border border-border flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
              Try Interactive Demo
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
            1-Click Scenario
          </span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          4 friends across Hyderabad (Kukatpally, Secunderabad, Mehdipatnam, Dilsukhnagar) find the fairest cafe in Banjara Hills.
        </p>
        <button
          onClick={onFastTrackHyderabad}
          className="w-full mt-1 py-2 rounded-xl bg-surface border border-border hover:border-primary text-primary hover:bg-primary-soft text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-subtle active:scale-95"
        >
          <span>Launch Hyderabad Hangout</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
