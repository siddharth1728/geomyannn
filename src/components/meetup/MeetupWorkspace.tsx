"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Scale, 
  Navigation, 
  ThumbsUp, 
  Plus, 
  Copy, 
  Check, 
  AlertCircle, 
  Loader2, 
  Zap,
  Star,
  X,
  ExternalLink,
  MessageCircle,
  Car,
  Compass
} from "lucide-react";
import { 
  Meetup, 
  CandidateVenue, 
  RankingMode, 
  ParticipantLocation 
} from "@/types/meetup";
import { RouteResult } from "@/types/geo";
import { useAuth } from "@/lib/auth/AuthContext";
import { rankVenues } from "@/lib/providers/matrix";
import { VenueCard } from "./VenueCard";

interface MeetupWorkspaceProps {
  meetup: Meetup;
  onUpdateMeetup: (updated: Meetup) => void;
  onSelectVenueOnMap?: (venue: CandidateVenue) => void;
  onDisplayDirections?: (routes: RouteResult[]) => void;
  onClose: () => void;
  selectedVenueId?: string | null;
  onSaveVenue?: (venue: CandidateVenue) => void;
  savedVenueIds?: string[];
}

type WorkspaceTab = "places" | "people" | "votes";

// Distinct avatar palette
const AVATAR_COLORS = [
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
];

export function MeetupWorkspace({
  meetup,
  onUpdateMeetup,
  onSelectVenueOnMap,
  onDisplayDirections,
  onClose,
  selectedVenueId,
  onSaveVenue,
  savedVenueIds = [],
}: MeetupWorkspaceProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("places");
  const [rankingMode, setRankingMode] = useState<RankingMode>("fairest");
  const [calculating, setCalculating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeVenueId, setActiveVenueId] = useState<string | null>(selectedVenueId || null);

  // New participant input state
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberLabel, setNewMemberLabel] = useState("");

  // Post-Meetup Feedback State
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackAccuracy, setFeedbackAccuracy] = useState<string>("accurate");
  const [feedbackSuitability, setFeedbackSuitability] = useState<string>("great");
  const [feedbackNote, setFeedbackNote] = useState<string>("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const currentMemberId = user?.id || meetup.members[0]?.userId || "attendee-1";
  const isCreator = Boolean(!user || user.id === meetup.creatorId || meetup.members[0]?.userId === currentMemberId);

  useEffect(() => {
    if (selectedVenueId) {
      setActiveVenueId(selectedVenueId);
      setActiveTab("places");
    }
  }, [selectedVenueId]);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(meetup.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! Planning our meetup: "${meetup.title}". Check out the fairest meeting spots & vote here:\n${window.location.origin}?invite=${meetup.inviteCode}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  // Add participant starting point
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberLabel.trim()) return;

    try {
      let lat = 17.4156;
      let lon = 78.4357;

      // Dynamically geocode the neighborhood or landmark entered
      try {
        const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(newMemberLabel.trim())}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            lat = geoData.results[0].coordinates.latitude;
            lon = geoData.results[0].coordinates.longitude;
          }
        }
      } catch (geoErr) {
        console.warn("Geocoding participant location error:", geoErr);
      }

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
          latitude: lat,
          longitude: lon,
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

  // Sort venues based on ranking mode & user preferences
  const sortedVenues = rankVenues(meetup.venues, rankingMode, meetup.preferences);

  // Group voting progress
  const voteCount = Object.keys(meetup.votes || {}).length;
  const totalMembers = meetup.members.length || meetup.locations.length || 1;
  const isAllVoted = voteCount >= totalMembers && totalMembers > 0;

  // Meetup progress stage (1: Plan, 2: Invite, 3: Discover, 4: Decide, 5: Meet)
  const currentStage = confirmedVenue ? 5 : voteCount > 0 ? 4 : meetup.venues.length > 0 ? 3 : meetup.locations.length > 1 ? 2 : 1;

  return (
    <div className="w-full h-full bg-surface flex flex-col transition-colors select-none">
      {/* 1. Header & Meetup Summary (Compact & Refined) */}
      <div className="p-4 border-b border-border bg-surface-secondary/40 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-text-primary tracking-tight truncate">
                {meetup.title}
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                confirmedVenue 
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                  : "bg-primary-soft text-primary"
              }`}>
                {confirmedVenue ? "Confirmed" : "Voting"}
              </span>
            </div>

            {/* Friends Avatars & Status Subtitle */}
            <div className="flex items-center gap-2.5 mt-1.5">
              {/* Overlapping Avatar Stack */}
              <div className="flex -space-x-1.5 overflow-hidden">
                {meetup.locations.slice(0, 5).map((loc, idx) => {
                  const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <div
                      key={loc.id || idx}
                      title={`${loc.memberName} (${loc.label})`}
                      className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-surface shadow-subtle ${colorClass}`}
                    >
                      {loc.memberName[0]?.toUpperCase()}
                    </div>
                  );
                })}
              </div>

              <span className="text-xs font-semibold text-text-secondary">
                {meetup.locations.length} {meetup.locations.length === 1 ? "friend" : "friends"}
              </span>
              <span className="text-text-muted">•</span>
              <span className="text-xs text-text-muted capitalize">
                {meetup.category || "Social hangout"}
              </span>
            </div>
          </div>

          {/* Quick Actions: Copy Invite Code & WhatsApp Share & Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* 1-Click Invite Code Pill */}
            <button
              onClick={handleCopyInvite}
              title="Copy 6-character group invite code"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface border border-border hover:border-primary text-xs font-mono font-bold text-text-primary transition-all active:scale-95 shadow-subtle"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-sans text-[11px]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-text-muted" />
                  <span>{meetup.inviteCode}</span>
                </>
              )}
            </button>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              title="Share meetup link on WhatsApp"
              className="p-2 rounded-xl bg-surface border border-border hover:border-emerald-500 text-emerald-600 transition-colors shadow-subtle"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>

            {/* Close Sidebar / Return */}
            <button
              onClick={onClose}
              title="Close meetup workspace"
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-secondary border border-transparent hover:border-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Compact Meetup Progress Tracker */}
        <div className="mt-3 pt-3 border-t border-border/60">
          <div className="flex items-center justify-between text-[11px] font-bold text-text-muted mb-1.5 px-0.5">
            <span className={currentStage >= 1 ? "text-primary font-bold" : ""}>1. Plan</span>
            <span className={currentStage >= 2 ? "text-primary font-bold" : ""}>2. Invite</span>
            <span className={currentStage >= 3 ? "text-primary font-bold" : ""}>3. Discover</span>
            <span className={currentStage >= 4 ? "text-primary font-bold" : ""}>4. Decide</span>
            <span className={currentStage >= 5 ? "text-primary font-bold" : ""}>5. Meet</span>
          </div>

          <div className="w-full h-1.5 bg-surface-secondary rounded-full overflow-hidden flex">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${(currentStage / 5) * 100}%` }}
            />
          </div>

          {/* Natural Language Group Activity Status */}
          <div className="mt-2 flex items-center justify-between text-xs">
            <p className="text-text-secondary font-medium text-[11px]">
              {confirmedVenue
                ? "✨ Final place confirmed! Get directions below."
                : isAllVoted
                ? "🎉 Everyone has voted! Review votes and confirm."
                : voteCount > 0
                ? `${voteCount} of ${totalMembers} friends voted • Waiting for remaining votes`
                : "Compare candidate spots and cast your vote!"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Segmented Navigation Tabs (Places | People | Votes) */}
      <div className="p-2.5 border-b border-border bg-surface shrink-0">
        <div className="grid grid-cols-3 gap-1 bg-surface-secondary p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("places")}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "places"
                ? "bg-surface text-primary shadow-subtle"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Places ({meetup.venues.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("people")}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "people"
                ? "bg-surface text-primary shadow-subtle"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Friends ({meetup.locations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("votes")}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "votes"
                ? "bg-surface text-primary shadow-subtle"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Votes ({voteCount})</span>
          </button>
        </div>
      </div>

      {/* 4. Confirmed Spot Spotlight Banner (If Meetup is Confirmed) */}
      {confirmedVenue && (
        <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between shrink-0 shadow-subtle">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Confirmed Gathering Spot
              </div>
              <div className="text-sm font-black text-text-primary truncate">
                {confirmedVenue.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setFeedbackOpen(!feedbackOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-surface border border-emerald-500/20 hover:border-emerald-500 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-subtle transition-all"
            >
              <Star className="w-3.5 h-3.5 fill-emerald-600 inline mr-1" />
              <span>Review</span>
            </button>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${confirmedVenue.latitude},${confirmedVenue.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-surface border border-border hover:border-primary text-text-secondary hover:text-primary shadow-subtle transition-all"
              title="Open directions in Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Post-Meetup Feedback Card Modal / Expandable */}
      {feedbackOpen && confirmedVenue && (
        <div className="mx-4 mt-2 p-4 rounded-2xl bg-surface border border-border shadow-card space-y-3 animate-in fade-in shrink-0">
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-text-primary">How did the meetup go?</span>
            </div>
            <button onClick={() => setFeedbackOpen(false)} className="text-text-muted hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          </div>

          {feedbackSubmitted ? (
            <div className="p-3 text-center rounded-xl bg-primary-soft/50 border border-primary/20 space-y-1">
              <p className="text-xs font-bold text-primary">Thanks for your feedback!</p>
              <p className="text-[11px] text-text-muted">Your rating helps calibrate travel fairness estimates.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">
                  Overall Group Experience
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= feedbackRating
                            ? "text-amber-500 fill-amber-500"
                            : "text-border hover:text-amber-400"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-text-primary">
                    {feedbackRating === 5 ? "Loved it!" : feedbackRating === 4 ? "Great" : "Okay"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">
                  Travel Time Accuracy
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "accurate", label: "🎯 Spot-on" },
                    { id: "slight_delay", label: "⏳ +5-10m delay" },
                    { id: "heavy_delay", label: "🚦 Heavy traffic" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFeedbackAccuracy(item.id)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                        feedbackAccuracy === item.id
                          ? "bg-primary text-white border-primary"
                          : "bg-surface-secondary text-text-secondary border-border"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch(`/api/meetups/${meetup.id}/feedback`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        memberId: currentMemberId,
                        rating: feedbackRating,
                        accuracy: feedbackAccuracy,
                        suitability: feedbackSuitability,
                        note: feedbackNote,
                      }),
                    });
                  } catch (e) {
                    console.warn(e);
                  }
                  setFeedbackSubmitted(true);
                }}
                className="w-full py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-subtle hover:bg-primary-hover transition-all"
              >
                Submit Feedback
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Tab Content Area with Smooth Scrolling */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: PLACES (DISCOVERY & VENUE CARDS) */}
        {activeTab === "places" && (
          <div className="space-y-4">
            {/* Recommendation Mode Segmented Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Recommendation Strategy
                </span>
                <span className="text-[11px] text-text-muted">
                  {rankingMode === "fairest"
                    ? "Minimizes longest trip"
                    : rankingMode === "quickest"
                    ? "Lowest total drive time"
                    : "Balanced with preferences"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 bg-surface-secondary p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRankingMode("fairest")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    rankingMode === "fairest"
                      ? "bg-surface text-primary shadow-subtle"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Fairest</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRankingMode("quickest")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    rankingMode === "quickest"
                      ? "bg-surface text-primary shadow-subtle"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Quickest</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRankingMode("best_match")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    rankingMode === "best_match"
                      ? "bg-surface text-primary shadow-subtle"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Best Match</span>
                </button>
              </div>
            </div>

            {/* Candidate Venues Discovery Cards */}
            {sortedVenues.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-surface-secondary/40 border border-border space-y-3">
                <Compass className="w-8 h-8 text-text-muted mx-auto" />
                <p className="text-xs font-bold text-text-primary">No candidate places calculated yet.</p>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Add at least two friends with their starting points and calculate the optimal meetup spot.
                </p>
                <button
                  onClick={handleRecalculate}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-subtle hover:bg-primary-hover"
                >
                  Find Optimal Meeting Spots
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedVenues.map((venue, idx) => {
                  const hasVoted = Boolean(meetup.votes && meetup.votes[currentMemberId] === venue.venueId);
                  const isConfirmed = Boolean(
                    meetup.confirmedVenueId === venue.venueId || meetup.confirmedVenueId === venue.id
                  );
                  const isSelected = activeVenueId === venue.venueId || activeVenueId === venue.id;

                  return (
                    <VenueCard
                      key={venue.id || venue.venueId || idx}
                      venue={venue}
                      rank={idx + 1}
                      isSelected={isSelected}
                      isConfirmed={isConfirmed}
                      hasVoted={hasVoted}
                      isCreator={isCreator}
                      confirming={confirming}
                      onSelect={() => {
                        setActiveVenueId(venue.venueId);
                        if (onSelectVenueOnMap) onSelectVenueOnMap(venue);
                      }}
                      onVote={() => handleVote(venue.venueId)}
                      onConfirm={() => handleConfirmVenue(venue.venueId)}
                      onSave={() => onSaveVenue && onSaveVenue(venue)}
                      isSaved={savedVenueIds.includes(venue.venueId)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FRIENDS / STARTING POINTS */}
        {activeTab === "people" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Friend Starting Locations
                </span>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Used by the matrix engine to balance travel times
                </p>
              </div>

              <button
                onClick={() => setIsAddingMember(!isAddingMember)}
                className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary text-xs font-bold text-primary transition-all flex items-center gap-1 shadow-subtle"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Friend</span>
              </button>
            </div>

            {/* Friend Locations List */}
            <div className="space-y-2">
              {meetup.locations.map((loc, idx) => {
                const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <div
                    key={loc.id || idx}
                    className="p-3 rounded-2xl bg-surface border border-border shadow-subtle flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border ${colorClass}`}>
                        {loc.memberName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">{loc.memberName}</p>
                        <p className="text-[11px] text-text-muted">{loc.label}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-secondary text-[11px] font-bold text-text-secondary border border-border">
                      <Car className="w-3.5 h-3.5 text-primary" />
                      <span>Driving</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline Add Friend Form */}
            {isAddingMember && (
              <form
                onSubmit={handleAddParticipant}
                className="p-4 rounded-2xl bg-surface-secondary border border-border space-y-3 animate-in fade-in"
              >
                <div className="text-xs font-bold text-text-primary">Add Friend & Starting Point</div>
                <input
                  type="text"
                  placeholder="Friend's Name (e.g. Diya)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Neighborhood (e.g. Gachibowli)"
                  value={newMemberLabel}
                  onChange={(e) => setNewMemberLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-subtle hover:bg-primary-hover transition-all"
                  >
                    Add to Group
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingMember(false)}
                    className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-semibold text-text-secondary"
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
              className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-subtle hover:bg-primary-hover flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
            >
              {calculating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Calculating Real Road Times...</span>
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

        {/* TAB 3: VOTES & GROUP CONSENSUS */}
        {activeTab === "votes" && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Group Votes & Consensus
              </span>
              <p className="text-[11px] text-text-muted mt-0.5">
                {voteCount} of {totalMembers} friends have chosen their favorite place
              </p>
            </div>

            {voteCount === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-surface-secondary/40 border border-border space-y-2">
                <ThumbsUp className="w-8 h-8 text-text-muted mx-auto" />
                <p className="text-xs font-bold text-text-primary">No votes cast yet</p>
                <p className="text-[11px] text-text-muted">
                  Head over to the Places tab to vote for your preferred spot!
                </p>
                <button
                  onClick={() => setActiveTab("places")}
                  className="px-3.5 py-1.5 rounded-xl bg-surface border border-border hover:border-primary text-xs font-bold text-primary shadow-subtle"
                >
                  Explore Places
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {meetup.venues.map((v) => {
                  const votes = Object.entries(meetup.votes || {}).filter(([_, venueId]) => venueId === v.venueId);
                  if (votes.length === 0) return null;

                  return (
                    <div
                      key={v.id || v.venueId}
                      className="p-3.5 rounded-2xl bg-surface border border-border shadow-subtle flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-text-primary">{v.name}</p>
                        <p className="text-[11px] text-text-muted">{votes.length} {votes.length === 1 ? "vote" : "votes"}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                          {votes.map(([memberId], i) => (
                            <div
                              key={i}
                              title={memberId}
                              className="w-7 h-7 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center border-2 border-surface shadow-subtle"
                            >
                              {memberId.slice(0, 2).toUpperCase()}
                            </div>
                          ))}
                        </div>

                        {!confirmedVenue && (
                          <button
                            onClick={() => handleConfirmVenue(v.venueId)}
                            className="ml-2 px-2.5 py-1 rounded-xl bg-primary-soft hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all shadow-subtle"
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

            {/* WhatsApp Reminder Button */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full py-2.5 rounded-xl bg-surface border border-border hover:border-emerald-500 text-emerald-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-subtle"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Remind Group to Vote on WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
