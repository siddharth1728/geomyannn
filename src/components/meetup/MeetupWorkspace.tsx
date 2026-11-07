"use client";

import React, { useState } from "react";
import { 
  Users, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Scale, 
  Navigation, 
  ThumbsUp, 
  Share2, 
  Plus, 
  Copy, 
  Check, 
  AlertCircle, 
  Loader2, 
  Zap,
  Star,
  Info,
  X,
  ExternalLink,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  Meetup, 
  CandidateVenue, 
  RankingMode, 
  ParticipantLocation 
} from "@/types/meetup";
import { formatDuration, formatDistance } from "@/lib/utils/formatters";
import { RouteResult } from "@/types/geo";

interface MeetupWorkspaceProps {
  meetup: Meetup;
  onUpdateMeetup: (updated: Meetup) => void;
  onSelectVenueOnMap?: (venue: CandidateVenue) => void;
  onDisplayDirections?: (routes: RouteResult[]) => void;
  onClose: () => void;
}

export function MeetupWorkspace({
  meetup,
  onUpdateMeetup,
  onSelectVenueOnMap,
  onDisplayDirections,
  onClose,
}: MeetupWorkspaceProps) {
  const [rankingMode, setRankingMode] = useState<RankingMode>("fairest");
  const [calculating, setCalculating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedTimesVenueId, setExpandedTimesVenueId] = useState<string | null>(null);

  // New participant input state
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberLabel, setNewMemberLabel] = useState("");
  const [newMemberCoords, setNewMemberCoords] = useState<{ lat: number; lon: number }>({ lat: 17.3916, lon: 78.4398 });

  const currentMemberId = meetup.members[0]?.userId || "user-me";

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(meetup.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add participant
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberLabel.trim()) return;

    try {
      const memberId = `mem-${Date.now()}`;
      await fetch(`/api/meetups/${meetup.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: memberId, userName: newMemberName.trim() }),
      });

      const res = await fetch(`/api/meetups/${meetup.id}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          memberName: newMemberName.trim(),
          label: newMemberLabel.trim(),
          latitude: newMemberCoords.lat,
          longitude: newMemberCoords.lon,
        }),
      });

      const data = await res.json();
      if (data.meetup) {
        onUpdateMeetup(data.meetup);
        setIsAddingMember(false);
        setNewMemberName("");
        setNewMemberLabel("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to add participant");
    }
  };

  // Run Matrix calculation
  const handleCalculateMatrix = async (mode: RankingMode = rankingMode) => {
    if (meetup.locations.length === 0) {
      setError("Please add at least one participant location before calculating travel times.");
      return;
    }

    setCalculating(true);
    setError(null);

    try {
      const res = await fetch(`/api/meetups/${meetup.id}/matrix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Matrix calculation failed");
      }

      const data = await res.json();
      onUpdateMeetup({
        ...meetup,
        venues: data.venues || [],
        status: "voting",
      });
    } catch (err: any) {
      setError(err.message || "Failed to calculate matrix");
    } finally {
      setCalculating(false);
    }
  };

  // Cast vote
  const handleVote = async (venueId: string) => {
    try {
      const res = await fetch(`/api/meetups/${meetup.id}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: currentMemberId, venueId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.meetup) {
          onUpdateMeetup(data.meetup);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to record vote");
    }
  };

  // Confirm final venue
  const handleConfirmVenue = async (venueId: string) => {
    setConfirming(true);
    setError(null);

    try {
      const res = await fetch(`/api/meetups/${meetup.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueId }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Failed to confirm venue");
      }

      const data = await res.json();
      if (data.meetup) {
        onUpdateMeetup(data.meetup);
      }

      if (data.directions && onDisplayDirections) {
        const routes: RouteResult[] = data.directions
          .map((d: any) => d.route)
          .filter(Boolean);
        onDisplayDirections(routes);
      }
    } catch (err: any) {
      setError(err.message || "Failed to confirm meetup");
    } finally {
      setConfirming(false);
    }
  };

  const confirmedVenue = meetup.venues.find(
    (v) => v.venueId === meetup.confirmedVenueId || v.id === meetup.confirmedVenueId
  );

  return (
    <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-card overflow-hidden flex flex-col max-h-[calc(100vh-140px)] animate-in fade-in transition-colors">
      {/* Header Bar */}
      <div className="p-4 border-b border-border bg-surface-secondary/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-bold shrink-0">
            👥
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {meetup.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <span>{meetup.members.length} friends</span>
              <span>•</span>
              <span className="capitalize">{meetup.category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Invite Code Pill */}
          <button
            onClick={handleCopyInvite}
            title="Click to copy invite code"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border hover:border-primary text-xs font-mono font-bold text-primary transition-all active:scale-95"
          >
            {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            <span>{meetup.inviteCode}</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1">
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. CONFIRMED CELEBRATION CARD */}
        {meetup.status === "confirmed" && confirmedVenue && (
          <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-text-primary space-y-3">
            <div className="flex items-center gap-2 text-success font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Official Meeting Destination Confirmed!</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-text-primary">
                {confirmedVenue.name}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {confirmedVenue.address}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1 text-xs text-text-muted">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Average travel time: ~{Math.round(confirmedVenue.avgDurationSec / 60)} min</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${confirmedVenue.latitude},${confirmedVenue.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Navigate in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* 2. PARTICIPANT ROSTER */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Participants ({meetup.locations.length})
            </span>
            <button
              onClick={() => setIsAddingMember(!isAddingMember)}
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Starting Point</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {meetup.locations.map((loc) => (
              <div
                key={loc.id}
                className="p-2.5 rounded-xl bg-surface-secondary border border-border flex items-center gap-2.5"
              >
                <div className="w-7 h-7 rounded-full bg-primary-soft text-primary font-bold text-xs flex items-center justify-center shrink-0">
                  {loc.memberName[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-text-primary truncate">
                    {loc.memberName}
                  </p>
                  <p className="text-[11px] text-text-muted truncate">
                    {loc.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Inline Add Participant Drawer */}
          {isAddingMember && (
            <form onSubmit={handleAddParticipant} className="mt-3 p-3.5 rounded-xl bg-surface-secondary border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">Add Friend Origin</span>
                <button type="button" onClick={() => setIsAddingMember(false)} className="text-xs text-text-muted">Cancel</button>
              </div>
              <input
                type="text"
                placeholder="Friend's Name (e.g. Diya)"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="Neighborhood / Area (e.g. Secunderabad)"
                value={newMemberLabel}
                onChange={(e) => setNewMemberLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
              >
                Save Starting Point
              </button>
            </form>
          )}
        </div>

        {/* 3. RECOMMENDATION CRITERIA & RECALCULATE */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Recommendation Mode
            </span>
            <button
              onClick={() => handleCalculateMatrix(rankingMode)}
              disabled={calculating}
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 disabled:opacity-50"
            >
              {calculating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Refresh Matrix</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-surface-secondary border border-border">
            {[
              { id: "fairest" as RankingMode, label: "Fairest", icon: Scale },
              { id: "quickest" as RankingMode, label: "Quickest", icon: Zap },
              { id: "best_match" as RankingMode, label: "Best Match", icon: Star },
            ].map((m) => {
              const Icon = m.icon;
              const isActive = rankingMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setRankingMode(m.id);
                    handleCalculateMatrix(m.id);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-surface text-primary font-bold shadow-subtle"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. CANDIDATE VENUES SHORTLIST */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Candidate Venues ({meetup.venues.length})
            </span>
            {meetup.venues.length > 0 && (
              <span className="text-[11px] text-text-muted">
                1 vote per friend
              </span>
            )}
          </div>

          {meetup.venues.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-border text-center space-y-2">
              <Sparkles className="w-6 h-6 text-primary mx-auto" />
              <p className="text-xs font-bold text-text-primary">No venues generated yet</p>
              <p className="text-[11px] text-text-muted">
                Click Refresh Matrix above to compute real road travel times from each participant origin.
              </p>
              <button
                onClick={() => handleCalculateMatrix("fairest")}
                disabled={calculating}
                className="mt-2 py-2 px-4 rounded-lg bg-primary text-white text-xs font-semibold shadow-subtle hover:bg-primary-hover"
              >
                Calculate Travel Fairness
              </button>
            </div>
          ) : (
            meetup.venues.map((venue, idx) => {
              const hasVoted = meetup.votes[currentMemberId] === venue.venueId;
              const isSelected = venue.venueId === meetup.confirmedVenueId;
              const isExpanded = expandedTimesVenueId === venue.id;

              return (
                <div
                  key={venue.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "border-success bg-success/5 shadow-subtle"
                      : "border-border bg-surface hover:border-primary/40 shadow-subtle"
                  }`}
                >
                  {/* Card Header: Rank, Title, Rating */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-soft text-primary font-mono">
                          #{idx + 1}
                        </span>
                        <h4 
                          onClick={() => onSelectVenueOnMap && onSelectVenueOnMap(venue)}
                          className="text-sm font-bold text-text-primary hover:text-primary cursor-pointer truncate"
                        >
                          {venue.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5 truncate">
                        {venue.address}
                      </p>
                    </div>

                    {venue.rating && (
                      <span className="px-2 py-0.5 rounded-md bg-warning/15 text-warning text-xs font-bold shrink-0">
                        ★ {venue.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="p-2 rounded-lg bg-surface-secondary text-center">
                      <p className="text-[10px] uppercase font-semibold text-text-muted">Avg Drive</p>
                      <p className="text-xs font-bold text-text-primary tabular-nums">
                        ~{Math.round(venue.avgDurationSec / 60)} min
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-secondary text-center">
                      <p className="text-[10px] uppercase font-semibold text-text-muted">Time Gap</p>
                      <p className={`text-xs font-bold tabular-nums ${Math.round(venue.disparitySec / 60) <= 12 ? "text-success" : "text-warning"}`}>
                        ±{Math.round(venue.disparitySec / 60)} min
                      </p>
                    </div>
                  </div>

                  {/* Transparent Recommendation Reason */}
                  <p className="text-xs text-text-secondary mt-2.5 font-medium italic">
                    &ldquo;{venue.recommendationReason}&rdquo;
                  </p>

                  {/* Expandable Individual Travel Times */}
                  {venue.participantTimes && venue.participantTimes.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => setExpandedTimesVenueId(isExpanded ? null : venue.id)}
                        className="w-full flex items-center justify-between text-[11px] font-semibold text-text-muted hover:text-text-primary"
                      >
                        <span>Individual travel times ({venue.participantTimes.length})</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-1.5 pl-1">
                          {venue.participantTimes.map((pt, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-text-secondary font-medium">
                                {pt.memberName} <span className="text-text-muted">({pt.originLabel})</span>
                              </span>
                              <span className="text-primary font-bold font-mono tabular-nums">
                                {formatDuration(pt.durationSeconds)} ({formatDistance(pt.distanceMeters)})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Voting & Confirmation Buttons */}
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-border/80">
                    <button
                      onClick={() => handleVote(venue.venueId)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        hasVoted
                          ? "bg-primary text-white font-bold"
                          : "bg-surface-secondary hover:bg-surface text-text-secondary hover:text-text-primary border border-border"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{hasVoted ? "Voted" : "Vote"} ({venue.voteCount || 0})</span>
                    </button>

                    {meetup.status !== "confirmed" && (
                      <button
                        onClick={() => handleConfirmVenue(venue.venueId)}
                        disabled={confirming}
                        className="py-1.5 px-3 rounded-lg bg-success hover:bg-success/90 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
