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
  ChevronUp,
  MessageCircle,
  Car,
  Bike,
  Footprints
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

type WorkspaceTab = "people" | "places" | "votes";

export function MeetupWorkspace({
  meetup,
  onUpdateMeetup,
  onSelectVenueOnMap,
  onDisplayDirections,
  onClose,
}: MeetupWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("places");
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

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! Planning a hangout: "${meetup.title}". Check out the fairest meeting spot & vote here:\n${window.location.origin}?invite=${meetup.inviteCode}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
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
      setError(err.message || "Failed to add friend location");
    }
  };

  // Recalculate matrix
  const handleRecalculate = async () => {
    setCalculating(true);
    setError(null);

    try {
      const res = await fetch(`/api/meetups/${meetup.id}/matrix`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to compute travel times");
      }

      if (data.meetup) {
        onUpdateMeetup(data.meetup);
      }
    } catch (err: any) {
      setError(err.message || "Matrix calculation failed");
    } finally {
      setCalculating(false);
    }
  };

  // Record vote
  const handleVote = async (venueId: string) => {
    setError(null);
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

  // Sort venues based on ranking mode
  const sortedVenues = [...meetup.venues].sort((a, b) => {
    if (rankingMode === "fairest") {
      return (a.disparitySec || 0) - (b.disparitySec || 0);
    }
    if (rankingMode === "quickest") {
      return (a.totalDurationSec || 0) - (b.totalDurationSec || 0);
    }
    return (b.rating || 4.0) - (a.rating || 4.0);
  });

  return (
    <div className="w-full h-full bg-surface flex flex-col transition-colors">
      {/* 1. Header Bar */}
      <div className="p-4 border-b border-border bg-surface-secondary/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-sm shrink-0">
            👥
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {meetup.title}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
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
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface border border-border hover:border-primary text-xs font-mono font-bold text-primary transition-all active:scale-95"
          >
            {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
            <span>{meetup.inviteCode}</span>
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={handleWhatsAppShare}
            title="Share on WhatsApp"
            className="p-1.5 rounded-lg bg-surface border border-border hover:border-green-500 text-green-600 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Compact Segmented Control (People | Places | Votes) */}
      <div className="p-2 border-b border-border bg-surface shrink-0">
        <div className="grid grid-cols-3 gap-1 bg-surface-secondary p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("people")}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "people"
                ? "bg-surface text-primary shadow-subtle"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>People ({meetup.locations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("places")}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "places"
                ? "bg-surface text-primary shadow-subtle"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Places ({meetup.venues.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("votes")}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "votes"
                ? "bg-surface text-primary shadow-subtle"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Votes ({Object.keys(meetup.votes || {}).length})</span>
          </button>
        </div>
      </div>

      {/* 3. Confirmed Venue Banner (Sticky if confirmed) */}
      {confirmedVenue && (
        <div className="mx-3 mt-3 p-3 rounded-xl bg-primary-soft border border-primary/30 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-primary">Confirmed Location</p>
                <p className="text-xs text-text-primary font-semibold">{confirmedVenue.name}</p>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${confirmedVenue.latitude},${confirmedVenue.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-bold text-primary bg-surface px-2.5 py-1 rounded-lg shadow-subtle hover:underline"
            >
              <span>Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* 4. Tab Content Area (Independent Smooth Scrolling) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB A: PEOPLE */}
        {activeTab === "people" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Group Starting Points
              </span>
              <button
                onClick={() => setIsAddingMember(!isAddingMember)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Friend</span>
              </button>
            </div>

            {/* Friend List */}
            <div className="space-y-2">
              {meetup.locations.map((loc, idx) => (
                <div
                  key={loc.id || idx}
                  className="p-2.5 rounded-xl bg-surface-secondary border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {loc.memberName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">{loc.memberName}</p>
                      <p className="text-[11px] text-text-muted">{loc.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-text-muted bg-surface px-2 py-0.5 rounded-md border border-border">
                    <Car className="w-3 h-3 text-primary" />
                    <span>Drive</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Friend Form */}
            {isAddingMember && (
              <form
                onSubmit={handleAddParticipant}
                className="p-3 rounded-xl bg-surface-secondary border border-border space-y-2.5 animate-in fade-in"
              >
                <p className="text-xs font-bold text-text-primary">Add Starting Location</p>
                <input
                  type="text"
                  placeholder="Friend's Name (e.g. Diya)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Neighborhood (e.g. Gachibowli)"
                  value={newMemberLabel}
                  onChange={(e) => setNewMemberLabel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow-subtle hover:bg-primary-hover"
                  >
                    Save & Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingMember(false)}
                    className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-semibold text-text-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Recalculate CTA */}
            <button
              onClick={handleRecalculate}
              disabled={calculating || meetup.locations.length < 2}
              className="w-full mt-2 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-subtle hover:bg-primary-hover flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {calculating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Road Times...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Recalculate Travel Matrix</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB B: PLACES (RECOMMENDATIONS) */}
        {activeTab === "places" && (
          <div className="space-y-3">
            {/* 3 Ranking Modes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  Recommendation Mode
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-surface-secondary p-1 rounded-xl">
                <button
                  onClick={() => setRankingMode("fairest")}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                    rankingMode === "fairest"
                      ? "bg-surface text-primary shadow-subtle"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  ⚖️ Fairest
                </button>
                <button
                  onClick={() => setRankingMode("quickest")}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                    rankingMode === "quickest"
                      ? "bg-surface text-primary shadow-subtle"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  ⚡ Quickest
                </button>
                <button
                  onClick={() => setRankingMode("best_match")}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                    rankingMode === "best_match"
                      ? "bg-surface text-primary shadow-subtle"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  ✨ Best Match
                </button>
              </div>
            </div>

            {/* Candidate Venues List */}
            {sortedVenues.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-surface-secondary/50 border border-border space-y-2">
                <p className="text-xs font-semibold text-text-secondary">No candidate venues calculated yet.</p>
                <button
                  onClick={handleRecalculate}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow-subtle"
                >
                  Compute Meeting Spots
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedVenues.map((venue, idx) => {
                  const isExpanded = expandedTimesVenueId === venue.id;
                  const hasVoted = meetup.votes && meetup.votes[currentMemberId] === venue.venueId;
                  const isConfirmed = meetup.confirmedVenueId === venue.venueId || meetup.confirmedVenueId === venue.id;

                  return (
                    <div
                      key={venue.id || idx}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isConfirmed
                          ? "bg-primary-soft/30 border-primary shadow-subtle"
                          : "bg-surface-secondary/40 border-border hover:border-border hover:bg-surface-secondary/70"
                      }`}
                    >
                      {/* Top Row: Name, Category, Rating */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <h3 className="text-sm font-bold text-text-primary truncate">
                              {venue.name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5 truncate">
                            {venue.category} • {venue.address}
                          </p>
                        </div>
                        {venue.rating && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-xs font-bold shrink-0">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span>{venue.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Travel Summary Badge */}
                      <div className="mt-2.5 p-2 rounded-xl bg-surface border border-border/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-text-primary font-semibold">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>Avg: {formatDuration(venue.avgDurationSec || 0)}</span>
                        </div>
                        <div className="text-[11px] text-text-muted">
                          Max: <span className="font-semibold text-text-primary">{formatDuration(venue.maxDurationSec || 0)}</span>
                        </div>
                      </div>

                      {/* Recommendation Explanation */}
                      {venue.recommendationReason && (
                        <p className="mt-2 text-[11px] text-text-secondary leading-relaxed bg-surface/50 p-2 rounded-lg border border-border/50">
                          💡 {venue.recommendationReason}
                        </p>
                      )}

                      {/* Expandable Per-Participant Travel Breakdown */}
                      <button
                        onClick={() => setExpandedTimesVenueId(isExpanded ? null : venue.id)}
                        className="mt-2 w-full flex items-center justify-between text-[11px] font-semibold text-text-secondary hover:text-text-primary pt-1"
                      >
                        <span>See travel for each friend</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {isExpanded && venue.participantTimes && (
                        <div className="mt-2 pt-2 border-t border-border/60 space-y-1.5 animate-in fade-in">
                          {venue.participantTimes.map((pt, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-surface/80"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-primary-soft text-primary font-bold text-[10px] flex items-center justify-center">
                                  {pt.memberName[0]}
                                </span>
                                <span className="font-medium text-text-primary">{pt.memberName}</span>
                                <span className="text-[10px] text-text-muted">({pt.originLabel})</span>
                              </div>
                              <span className="font-mono font-bold text-primary text-[11px]">
                                {formatDuration(pt.durationSeconds)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Row: Center on Map, Vote, Confirm */}
                      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-border/60">
                        <button
                          onClick={() => onSelectVenueOnMap && onSelectVenueOnMap(venue)}
                          className="px-2.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1 shadow-subtle"
                        >
                          <Navigation className="w-3 h-3 text-primary" />
                          <span>Show on Map</span>
                        </button>

                        <button
                          onClick={() => handleVote(venue.venueId)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-subtle ${
                            hasVoted
                              ? "bg-primary text-white"
                              : "bg-surface border border-border text-text-primary hover:border-primary"
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{hasVoted ? "Voted!" : "Vote"}</span>
                          {venue.voteCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-primary-soft text-primary font-extrabold">
                              {venue.voteCount}
                            </span>
                          )}
                        </button>

                        {!isConfirmed && (
                          <button
                            onClick={() => handleConfirmVenue(venue.venueId)}
                            disabled={confirming}
                            className="px-3 py-1.5 rounded-xl bg-primary-soft hover:bg-primary text-primary hover:text-white text-xs font-bold transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB C: VOTES */}
        {activeTab === "votes" && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Group Voting Status
            </span>

            {Object.keys(meetup.votes || {}).length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-surface-secondary/50 border border-border space-y-1">
                <p className="text-xs font-semibold text-text-secondary">No votes cast yet.</p>
                <p className="text-[11px] text-text-muted">Switch to Places tab to cast the first vote!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {meetup.venues.map((v) => {
                  const votes = Object.entries(meetup.votes || {}).filter(([_, venueId]) => venueId === v.venueId);
                  if (votes.length === 0) return null;

                  return (
                    <div
                      key={v.id}
                      className="p-3 rounded-xl bg-surface-secondary border border-border flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-text-primary">{v.name}</p>
                        <p className="text-[11px] text-text-muted">{votes.length} votes</p>
                      </div>
                      <div className="flex -space-x-1.5">
                        {votes.map(([memberId], i) => (
                          <div
                            key={i}
                            title={memberId}
                            className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center border-2 border-surface"
                          >
                            {memberId.slice(0, 2).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* WhatsApp Group Reminder */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full mt-2 py-2 rounded-xl bg-surface border border-border hover:border-green-500 text-green-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-subtle"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Remind Group to Vote on WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
