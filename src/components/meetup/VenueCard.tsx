"use client";

import React, { useState } from "react";
import { 
  Clock, 
  MapPin, 
  ThumbsUp, 
  Check, 
  Navigation, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Bookmark, 
  Sparkles,
  Coffee,
  UtensilsCrossed,
  Film,
  Trees,
  ShoppingBag,
  ExternalLink,
  Car
} from "lucide-react";
import { CandidateVenue } from "@/types/meetup";
import { formatDuration, formatDistance } from "@/lib/utils/formatters";

interface VenueCardProps {
  venue: CandidateVenue;
  rank: number;
  isSelected?: boolean;
  isConfirmed?: boolean;
  hasVoted?: boolean;
  isCreator?: boolean;
  confirming?: boolean;
  onSelect: () => void;
  onVote: () => void;
  onConfirm?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

// Category visual helper
function getCategoryVisual(category: string) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("coffee") || cat.includes("cafe")) {
    return {
      icon: Coffee,
      label: "Cafe & Coffee",
      color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    };
  }
  if (cat.includes("cinema") || cat.includes("movie") || cat.includes("theater")) {
    return {
      icon: Film,
      label: "Cinema & Shows",
      color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
      gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
    };
  }
  if (cat.includes("park") || cat.includes("garden") || cat.includes("outdoor")) {
    return {
      icon: Trees,
      label: "Park & Outdoors",
      color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    };
  }
  if (cat.includes("mall") || cat.includes("shop")) {
    return {
      icon: ShoppingBag,
      label: "Shopping & Retail",
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    };
  }
  return {
    icon: UtensilsCrossed,
    label: "Dining & Food",
    color: "bg-primary-soft text-primary border-primary/20",
    gradient: "from-primary/10 via-primary/5 to-transparent",
  };
}

// Friend avatar color helper for consistency
const AVATAR_COLORS = [
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
];

export function VenueCard({
  venue,
  rank,
  isSelected = false,
  isConfirmed = false,
  hasVoted = false,
  isCreator = false,
  confirming = false,
  onSelect,
  onVote,
  onConfirm,
  onSave,
  isSaved = false,
}: VenueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const catVisual = getCategoryVisual(venue.category);
  const CatIcon = catVisual.icon;

  const totalParticipants = venue.participantTimes?.length || 0;
  const maxTravelMin = Math.round((venue.maxDurationSec || 0) / 60);
  const avgTravelMin = Math.round((venue.avgDurationSec || 0) / 60);

  return (
    <article
      onClick={onSelect}
      className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        isConfirmed
          ? "bg-primary-soft/30 border-primary ring-2 ring-primary/20 shadow-card"
          : isSelected
          ? "bg-surface border-primary ring-2 ring-primary/20 shadow-card"
          : "bg-surface border-border hover:border-primary/40 hover:shadow-subtle"
      }`}
    >
      {/* Top Banner: Category Placeholder or Image with Badges */}
      <div className={`relative h-20 w-full overflow-hidden bg-gradient-to-br ${catVisual.gradient} flex items-center justify-between px-4 border-b border-border/60`}>
        {venue.imageUrl ? (
          <img
            src={venue.imageUrl}
            alt={venue.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center gap-2.5 z-10">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${catVisual.color}`}>
              <CatIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                {catVisual.label}
              </span>
              <p className="text-xs font-semibold text-text-secondary truncate max-w-[200px]">
                {venue.address.split(",")[0] || "Central Location"}
              </p>
            </div>
          </div>
        )}

        {/* Top Badges */}
        <div className="flex items-center gap-1.5 z-10">
          {rank === 1 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wide shadow-subtle">
              <Sparkles className="w-3 h-3" />
              <span>Top Fair Pick</span>
            </span>
          )}

          <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shadow-subtle ${
            rank === 1 ? "bg-primary text-white" : "bg-surface text-text-primary border border-border"
          }`}>
            #{rank}
          </span>

          {onSave && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              title={isSaved ? "Saved place" : "Save this place"}
              className={`p-1.5 rounded-lg border transition-colors ${
                isSaved 
                  ? "bg-primary-soft text-primary border-primary/30" 
                  : "bg-surface/90 text-text-muted hover:text-text-primary border-border"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-primary" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3.5 sm:p-4 space-y-3">
        {/* Venue Title & Rating */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-text-primary tracking-tight truncate group-hover:text-primary transition-colors">
              {venue.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5 truncate">
              <span className="capitalize">{venue.category}</span>
              {venue.address && (
                <>
                  <span>•</span>
                  <span className="truncate">{venue.address}</span>
                </>
              )}
            </div>
          </div>

          {/* Real Rating if Available */}
          {venue.rating ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold shrink-0 border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>{venue.rating.toFixed(1)}</span>
            </div>
          ) : venue.priceLevel ? (
            <span className="px-2 py-0.5 rounded-lg bg-surface-secondary text-text-secondary text-xs font-bold border border-border">
              {venue.priceLevel}
            </span>
          ) : null}
        </div>

        {/* Travel Overview Metric */}
        <div className="p-2.5 rounded-xl bg-surface-secondary/70 border border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-text-muted font-medium">Average Travel</div>
              <div className="text-xs font-bold text-text-primary">
                ~{avgTravelMin} min drive
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-text-muted font-medium">Max Travel</div>
            <div className="text-xs font-bold text-primary">
              All within {maxTravelMin}m
            </div>
          </div>
        </div>

        {/* Recommendation Reason (Natural Language Fairness) */}
        {venue.recommendationReason && (
          <p className="text-[11px] leading-relaxed text-text-secondary bg-surface p-2 rounded-lg border border-border/70 flex items-start gap-1.5">
            <span className="text-primary font-bold">💡</span>
            <span>{venue.recommendationReason}</span>
          </p>
        )}

        {/* Expandable Per-Friend Travel Accordion */}
        {totalParticipants > 0 && (
          <div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="w-full py-1 text-[11px] font-semibold text-text-secondary hover:text-text-primary flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>See travel for all {totalParticipants} friends</span>
              </span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
            </button>

            {isExpanded && venue.participantTimes && (
              <div className="mt-2 pt-2 border-t border-border/60 space-y-1.5 animate-in fade-in">
                {venue.participantTimes.map((pt, pIdx) => {
                  const colorClass = AVATAR_COLORS[pIdx % AVATAR_COLORS.length];
                  return (
                    <div
                      key={pIdx}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-surface-secondary/40 border border-border/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center border ${colorClass}`}>
                          {pt.memberName[0]?.toUpperCase()}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-text-primary leading-none">
                            {pt.memberName}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5">
                            From {pt.originLabel}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-primary">
                          {formatDuration(pt.durationSeconds)}
                        </span>
                        {pt.distanceMeters > 0 && (
                          <div className="text-[10px] text-text-muted">
                            {formatDistance(pt.distanceMeters)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Action Row: Primary Vote, Show on Map, Confirm */}
        <div className="pt-2 border-t border-border/60 flex items-center gap-2">
          {/* Primary Action: Vote */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onVote();
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-subtle active:scale-95 ${
              hasVoted
                ? "bg-primary text-white"
                : "bg-surface border border-border hover:border-primary text-text-primary hover:text-primary"
            }`}
          >
            {hasVoted ? <Check className="w-3.5 h-3.5" /> : <ThumbsUp className="w-3.5 h-3.5" />}
            <span>{hasVoted ? "Voted!" : "Vote for this"}</span>
            {venue.voteCount > 0 && (
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                hasVoted ? "bg-white/20 text-white" : "bg-primary-soft text-primary"
              }`}>
                {venue.voteCount}
              </span>
            )}
          </button>

          {/* Show on Map Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            title="Focus on map"
            className="p-2 rounded-xl bg-surface border border-border hover:border-primary text-text-secondary hover:text-primary transition-colors shadow-subtle"
          >
            <Navigation className="w-4 h-4 text-primary" />
          </button>

          {/* Host Confirm Action */}
          {isCreator && !isConfirmed && onConfirm && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
              }}
              disabled={confirming}
              className="py-2 px-3 rounded-xl bg-primary-soft hover:bg-primary text-primary hover:text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-subtle"
            >
              {confirming ? "Confirming..." : "Confirm"}
            </button>
          )}

          {/* Confirmed Indicator */}
          {isConfirmed && (
            <span className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              ✓ Confirmed Spot
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
