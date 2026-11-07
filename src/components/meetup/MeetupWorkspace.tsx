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
  Info
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

  // Run Matrix calculation with selected ranking mode
  const handleCalculateMatrix = async (mode: RankingMode = rankingMode) => {
    setCalculating(true);
    setError(null);

    try {
      const res = await fetch(`/api/meetups/${meetup.id}/matrix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rankingMode: mode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to compute group travel times");
      }

      const updatedRes = await fetch(`/api/meetups/${meetup.id}`);
      const updatedData = await updatedRes.json();
      if (updatedData.meetup) {
        onUpdateMeetup(updatedData.meetup);
      }
    } catch (err: any) {
      setError(err.message || "Matrix calculation error");
    } finally {
      setCalculating(false);
    }
  };

  // Cast vote
  const handleVote = async (venueId: string, memberId: string = currentMemberId) => {
    try {
      const res = await fetch(`/api/meetups/${meetup.id}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, venueId }),
      });

      const data = await res.json();
      if (data.meetup) {
        onUpdateMeetup(data.meetup);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit vote");
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm venue");
      }

      if (data.meetup) {
        onUpdateMeetup(data.meetup);
      }

      if (data.directions && onDisplayDirections) {
        const validRoutes: RouteResult[] = data.directions
          .map((d: any) => d.route)
          .filter(Boolean);
        onDisplayDirections(validRoutes);
      }
    } catch (err: any) {
      setError(err.message || "Failed to confirm venue");
    } finally {
      setConfirming(false);
    }
  };

  const confirmedVenue = meetup.venues.find((v) => v.venueId === meetup.confirmedVenueId);

  return (
    <div className="w-full max-w-xl bg-surface/95 backdrop-blur-md border border-border rounded-2xl shadow-panel-glow p-4 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      {/* 1. Header & Quick Invite */}
      <div className="flex flex-col gap-2 border-b border-border pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/30">
                {meetup.category}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                meetup.status === "confirmed"
                  ? "bg-accent-primary/15 text-accent-primary border-accent-primary/40"
                  : "bg-warning/15 text-warning border-warning/40"
              }`}>
                {meetup.status}
              </span>
            </div>
            <h1 className="text-base font-bold text-text-primary mt-1">
              {meetup.title}
            </h1>
            <div className="text-xs text-text-muted flex items-center gap-2 mt-0.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span>{new Date(meetup.plannedAt).toLocaleDateString()} {new Date(meetup.plannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>• Hosted by {meetup.creatorName}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Share Invite Code Box */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated border border-border">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-accent-secondary" />
            <span className="text-xs text-text-secondary">Invitation Code:</span>
            <span className="text-xs font-mono font-bold tracking-wider text-accent-secondary bg-surface px-2 py-0.5 rounded border border-border">
              {meetup.inviteCode}
            </span>
          </div>

          <button
            onClick={handleCopyInvite}
            className="px-2.5 py-1 rounded bg-surface border border-border text-xs text-text-secondary hover:text-accent-secondary flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-accent-primary" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Share"}</span>
          </button>
        </div>
      </div>

      {/* 2. Group Participant Starting Locations */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
            <Users className="w-4 h-4 text-accent-primary" />
            <span>Group Members ({meetup.locations.length})</span>
          </div>

          <button
            onClick={() => setIsAddingMember(!isAddingMember)}
            className="text-[11px] text-accent-secondary hover:underline flex items-center gap-1 font-semibold"
          >
            <Plus className="w-3 h-3" />
            Add Member
          </button>
        </div>

        {/* Participant list pills */}
        <div className="grid grid-cols-2 gap-2">
          {meetup.locations.map((loc) => (
            <div
              key={loc.memberId}
              className="p-2 rounded-xl bg-surface-elevated/70 border border-border flex items-center gap-2 min-w-0"
            >
              <div className="w-6 h-6 rounded-full bg-accent-secondary/15 border border-accent-secondary/30 text-accent-secondary font-bold text-xs flex items-center justify-center shrink-0">
                {loc.memberName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-text-primary truncate">
                  {loc.memberName}
                </div>
                <div className="text-[10px] text-text-muted truncate flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 text-accent-primary shrink-0" />
                  <span>{loc.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Participant Input Form */}
        {isAddingMember && (
          <form onSubmit={handleAddParticipant} className="p-3 rounded-xl bg-surface-elevated border border-accent-secondary/30 flex flex-col gap-2 animate-in fade-in">
            <div className="text-xs font-bold text-text-primary">Add Member Location</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Name"
                className="p-2 text-xs bg-surface border border-border rounded-lg text-text-primary focus:outline-none"
                required
              />
              <input
                type="text"
                value={newMemberLabel}
                onChange={(e) => setNewMemberLabel(e.target.value)}
                placeholder="Starting Location (e.g. Madhapur)"
                className="p-2 text-xs bg-surface border border-border rounded-lg text-text-primary focus:outline-none"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingMember(false)}
                className="px-2 py-1 text-xs text-text-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/40 rounded-lg font-bold"
              >
                Add
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. Recommendation Modes (3 Distinct Modes) */}
      <div className="flex flex-col gap-2 pt-1 border-t border-border">
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleCalculateMatrix(rankingMode)}
            disabled={calculating || meetup.locations.length === 0}
            className="w-full py-2.5 rounded-xl bg-accent-secondary/20 hover:bg-accent-secondary/30 border border-accent-secondary/40 text-accent-secondary font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm"
          >
            {calculating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculating Live Travel Times...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {meetup.venues.length > 0 ? "Recalculate Travel Times" : "Find Best Meeting Places"}
              </>
            )}
          </button>
        </div>

        {/* Mode Selector per requirement: 1. Fairest for Everyone, 2. Quickest Overall, 3. Best Group Match */}
        {meetup.venues.length > 0 && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-elevated border border-border">
            {[
              { id: "fairest", label: "Fairest for Everyone", icon: Scale },
              { id: "quickest", label: "Quickest Overall", icon: Zap },
              { id: "best_match", label: "Best Group Match", icon: Star },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = rankingMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setRankingMode(m.id as RankingMode);
                    handleCalculateMatrix(m.id as RankingMode);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/40 shadow-sm"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Confirmed Victory State */}
      {confirmedVenue && (
        <div className="p-4 rounded-xl bg-accent-primary/10 border border-accent-primary/40 flex flex-col gap-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent-primary font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmed Meeting Place</span>
            </div>
            {confirmedVenue.rating && (
              <span className="text-xs font-bold text-accent-primary">
                ★ {confirmedVenue.rating}
              </span>
            )}
          </div>

          <div className="text-sm font-bold text-text-primary">
            {confirmedVenue.name}
          </div>
          <div className="text-xs text-text-muted">
            {confirmedVenue.address}
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-1 text-xs">
            <div className="bg-surface/80 p-2 rounded-lg border border-border">
              <div className="text-[10px] text-text-muted">AVG TRAVEL TIME</div>
              <div className="text-text-primary font-bold mt-0.5">
                {formatDuration(confirmedVenue.avgDurationSec * 1000)}
              </div>
            </div>
            <div className="bg-surface/80 p-2 rounded-lg border border-border">
              <div className="text-[10px] text-text-muted">MAX TRAVEL TIME</div>
              <div className="text-accent-secondary font-bold mt-0.5">
                {formatDuration(confirmedVenue.maxDurationSec * 1000)}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-accent-primary/90 bg-accent-primary/5 p-2 rounded-lg border border-accent-primary/20 flex items-start gap-1.5 mt-1">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{confirmedVenue.recommendationReason}</span>
          </div>
        </div>
      )}

      {/* 5. Venue Comparison Cards */}
      {meetup.venues.length > 0 && !confirmedVenue && (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold text-text-secondary uppercase">
            Recommended Venues ({meetup.venues.length})
          </div>

          <div className="flex flex-col gap-3">
            {meetup.venues.map((venue, idx) => {
              const isTopPick = idx === 0;
              const userVotedThis = meetup.votes[currentMemberId] === venue.venueId;

              return (
                <div
                  key={venue.venueId}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 ${
                    isTopPick
                      ? "bg-surface-elevated border-accent-secondary/50 shadow-sm"
                      : "bg-surface-elevated/70 border-border hover:border-text-muted"
                  }`}
                >
                  {/* Top: Name, Category, Rating */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {isTopPick && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30 uppercase">
                            Top Recommendation
                          </span>
                        )}
                        <span className="text-[11px] text-text-muted">
                          {venue.category}
                        </span>
                      </div>
                      <h2 
                        className="text-sm font-bold text-text-primary mt-0.5 cursor-pointer hover:text-accent-secondary transition-colors"
                        onClick={() => onSelectVenueOnMap && onSelectVenueOnMap(venue)}
                      >
                        {venue.name}
                      </h2>
                      <p className="text-[11px] text-text-muted truncate mt-0.5">
                        {venue.address}
                      </p>
                    </div>

                    {venue.rating && (
                      <span className="text-xs font-bold text-warning shrink-0 bg-warning/10 px-2 py-0.5 rounded-md border border-warning/20">
                        ★ {venue.rating}
                      </span>
                    )}
                  </div>

                  {/* Transparent Explanation (NO arbitrary scores) */}
                  <div className="bg-surface/80 p-2 rounded-lg border border-border text-[11px] text-text-secondary flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-accent-secondary shrink-0 mt-0.5" />
                    <span>{venue.recommendationReason}</span>
                  </div>

                  {/* Group Convenience: Average and Max Time */}
                  <div className="grid grid-cols-2 gap-2 text-center text-[11px] bg-surface/50 p-2 rounded-lg border border-border/60">
                    <div>
                      <div className="text-[10px] text-text-muted">AVERAGE TIME</div>
                      <div className="font-bold text-text-primary mt-0.5">
                        {formatDuration(venue.avgDurationSec * 1000)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-muted">MAX TRAVEL TIME</div>
                      <div className="font-bold text-text-secondary mt-0.5">
                        {formatDuration(venue.maxDurationSec * 1000)}
                      </div>
                    </div>
                  </div>

                  {/* Each Participant's Individual Travel Time */}
                  <div className="flex flex-col gap-1 text-[11px] pt-1">
                    <div className="text-[10px] text-text-muted uppercase font-semibold">
                      Travel Time for Each Member:
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {venue.participantTimes.map((pt) => (
                        <div key={pt.memberId} className="flex items-center justify-between p-1.5 rounded bg-surface/70 border border-border/40 text-[11px]">
                          <span className="truncate text-text-primary font-medium">
                            {pt.memberName}
                          </span>
                          <span className="font-bold text-accent-secondary shrink-0 ml-1">
                            {formatDuration(pt.durationSeconds * 1000)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Controls: Vote & Confirm */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <button
                      onClick={() => handleVote(venue.venueId)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        userVotedThis
                          ? "bg-accent-primary/25 text-accent-primary border border-accent-primary/50"
                          : "bg-surface-elevated text-text-secondary hover:text-text-primary border border-border"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{userVotedThis ? "Voted" : "Vote"} ({venue.voteCount})</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectVenueOnMap && onSelectVenueOnMap(venue)}
                        className="px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
                      >
                        <Navigation className="w-3 h-3" />
                        Preview
                      </button>

                      <button
                        onClick={() => handleConfirmVenue(venue.venueId)}
                        disabled={confirming}
                        className="px-3.5 py-1.5 rounded-lg bg-accent-secondary/20 hover:bg-accent-secondary/30 border border-accent-secondary/40 text-accent-secondary text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        {confirming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Venue"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
