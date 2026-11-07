"use client";

import React, { useState } from "react";
import { 
  KeyRound, 
  X, 
  MapPin, 
  Loader2, 
  LocateFixed, 
  Users 
} from "lucide-react";
import { Meetup } from "@/types/meetup";
import { Coordinates } from "@/types/geo";

interface JoinMeetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetupJoined: (meetup: Meetup) => void;
  userLocation?: Coordinates | null;
  onRequestUserLocation?: () => void;
}

export function JoinMeetupModal({
  isOpen,
  onClose,
  onMeetupJoined,
  userLocation,
  onRequestUserLocation,
}: JoinMeetupModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [userName, setUserName] = useState("");
  const [locationLabel, setLocationLabel] = useState("Secunderabad");
  const [coords, setCoords] = useState<Coordinates>({ latitude: 17.4399, longitude: 78.4983 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || !userName.trim()) {
      setError("Please provide an invite code and your name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch meetup by invite code
      const fetchRes = await fetch(`/api/meetups?code=${encodeURIComponent(inviteCode.trim().toUpperCase())}`);
      const fetchData = await fetchRes.json();

      if (!fetchRes.ok || !fetchData.meetup) {
        throw new Error(fetchData.error || "Invalid invite code");
      }

      const meetup: Meetup = fetchData.meetup;

      // 2. Join as member
      const memberId = `mem-${Date.now()}`;
      await fetch(`/api/meetups/${meetup.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: memberId, userName: userName.trim() }),
      });

      // 3. Submit location
      await fetch(`/api/meetups/${meetup.id}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          memberName: userName.trim(),
          label: locationLabel.trim(),
          latitude: coords.latitude,
          longitude: coords.longitude,
          isApproximate: false,
        }),
      });

      // 4. Fetch updated meetup state
      const finalRes = await fetch(`/api/meetups/${meetup.id}`);
      const finalData = await finalRes.json();

      onMeetupJoined(finalData.meetup);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to join meetup");
    } finally {
      setLoading(false);
    }
  };

  const handleUseGps = () => {
    if (userLocation) {
      setCoords(userLocation);
      setLocationLabel("Current GPS Location");
    } else if (onRequestUserLocation) {
      onRequestUserLocation();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-panel-glow p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/30">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Join Meetup Room</h2>
              <p className="text-[11px] text-text-muted">Enter group invitation token</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          {/* Invite Code */}
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1 font-mono">
              INVITE CODE
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. HYD-782"
              className="w-full bg-surface-elevated border border-border rounded-lg p-2.5 text-sm font-mono tracking-wider font-bold text-accent-secondary uppercase placeholder-text-muted focus:outline-none focus:border-accent-secondary"
              required
            />
          </div>

          {/* User Name */}
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1 font-mono">
              YOUR NAME
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Ananya, Rahul..."
              className="w-full bg-surface-elevated border border-border rounded-lg p-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary"
              required
            />
          </div>

          {/* Starting Location */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-text-secondary font-mono">
                YOUR STARTING LOCATION
              </span>
              <button
                type="button"
                onClick={handleUseGps}
                className="text-[10px] text-accent-primary hover:underline flex items-center gap-1 font-mono"
              >
                <LocateFixed className="w-3 h-3" />
                Use GPS
              </button>
            </div>
            <input
              type="text"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="Neighborhood or landmark (e.g. Secunderabad)"
              className="w-full bg-surface-elevated border border-border rounded-lg p-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary"
              required
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-surface-elevated border border-border text-xs text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-accent-primary/20 hover:bg-accent-primary/30 border border-accent-primary/40 text-accent-primary text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Enter Meetup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
