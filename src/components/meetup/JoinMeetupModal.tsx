"use client";

import React, { useState } from "react";
import { 
  KeyRound, 
  X, 
  MapPin, 
  Loader2, 
  LocateFixed, 
  Users,
  Shield,
  Check
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

const PRESET_ORIGINS = [
  { label: "Kukatpally", lat: 17.4947, lng: 78.3996 },
  { label: "Secunderabad", lat: 17.4399, lng: 78.4983 },
  { label: "Mehdipatnam", lat: 17.3916, lng: 78.4414 },
  { label: "Dilsukhnagar", lat: 17.3688, lng: 78.5247 },
  { label: "Banjara Hills", lat: 17.4156, lng: 78.4357 },
  { label: "Gachibowli", lat: 17.4401, lng: 78.3489 },
];

export function JoinMeetupModal({
  isOpen,
  onClose,
  onMeetupJoined,
  userLocation,
  onRequestUserLocation,
}: JoinMeetupModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("Secunderabad");
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
      const fetchRes = await fetch(`/api/meetups?code=${encodeURIComponent(inviteCode.trim().toUpperCase())}`);
      const fetchData = await fetchRes.json();

      if (!fetchRes.ok || !fetchData.meetup) {
        throw new Error(fetchData.error || "Invalid invite code");
      }

      const meetup: Meetup = fetchData.meetup;
      const memberId = `mem-${Date.now()}`;

      await fetch(`/api/meetups/${meetup.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: memberId, userName: userName.trim() }),
      });

      const locRes = await fetch(`/api/meetups/${meetup.id}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          memberName: userName.trim(),
          label: selectedPreset,
          latitude: coords.latitude,
          longitude: coords.longitude,
          isApproximate: false,
        }),
      });

      const locData = await locRes.json();
      if (locData.meetup) {
        onMeetupJoined(locData.meetup);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to join meetup");
    } finally {
      setLoading(false);
    }
  };

  const handleUseGPS = () => {
    if (onRequestUserLocation) {
      onRequestUserLocation();
    }
    if (userLocation) {
      setCoords(userLocation);
      setSelectedPreset("Current GPS Location");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-float p-5 sm:p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary font-bold text-base flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Join a Meetup
              </h2>
              <p className="text-xs text-text-muted">
                Enter your invite code and drop your starting pin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Invite Code
            </label>
            <input
              type="text"
              required
              maxLength={8}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. HYD789"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-primary font-mono text-base font-bold tracking-widest uppercase focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Diya / Rohan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Your Starting Point
            </label>

            {/* GPS Button */}
            <button
              type="button"
              onClick={handleUseGPS}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-colors mb-2.5"
            >
              <LocateFixed className="w-4 h-4 text-primary" />
              <span>Use Current Device Location (GPS)</span>
            </button>

            <div className="text-[11px] text-center text-text-muted mb-2 font-medium">
              — OR CHOOSE AN AREA —
            </div>

            <div className="grid grid-cols-2 gap-2">
              {PRESET_ORIGINS.map((p) => {
                const isSelected = selectedPreset === p.label;
                return (
                  <button
                    type="button"
                    key={p.label}
                    onClick={() => {
                      setSelectedPreset(p.label);
                      setCoords({ latitude: p.lat, longitude: p.lng });
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-left truncate transition-all ${
                      isSelected
                        ? "border-primary bg-primary-soft text-primary font-bold shadow-subtle"
                        : "border-border bg-surface-secondary hover:bg-surface text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    📍 {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-surface-secondary border border-border flex items-start gap-2 text-[11px] text-text-muted">
            <Shield className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span>
              Your location is temporary, voluntary, and only shared with verified members of this meetup.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Joining Meetup...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Join Meetup & Share Origin</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
