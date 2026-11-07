"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  X, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  LocateFixed 
} from "lucide-react";
import { Coordinates, ReportCategory, CommunityReport } from "@/types/geo";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: (report: CommunityReport) => void;
  defaultCoordinates: Coordinates;
  userLocation?: Coordinates | null;
}

const CATEGORIES: { id: ReportCategory; label: string; icon: string }[] = [
  { id: "pothole", label: "Pothole / Road Damage", icon: "⚠️" },
  { id: "waterlogging", label: "Waterlogging / Flooding", icon: "🌊" },
  { id: "road_closure", label: "Road Closure / Detour", icon: "⛔" },
  { id: "traffic_disruption", label: "Traffic Disruption", icon: "🚦" },
  { id: "broken_streetlight", label: "Broken Streetlight", icon: "💡" },
  { id: "blocked_footpath", label: "Blocked Footpath", icon: "🚶" },
  { id: "other", label: "Other Infrastructure Hazard", icon: "🔧" },
];

export function ReportIssueModal({
  isOpen,
  onClose,
  onReportCreated,
  defaultCoordinates,
  userLocation,
}: ReportIssueModalProps) {
  const [category, setCategory] = useState<ReportCategory>("pothole");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates>(defaultCoordinates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 5) {
      setError("Please provide a description of at least 5 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description: description.trim(),
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit community report.");
      }

      setSuccess(true);
      onReportCreated(data.report);

      setTimeout(() => {
        setSuccess(false);
        setDescription("");
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  const handleUseUserLocation = () => {
    if (userLocation) {
      setCoordinates(userLocation);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-panel-glow p-5 flex flex-col gap-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-warning/10 text-warning border border-warning/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary tracking-wide">
                Report Infrastructure Issue
              </h2>
              <p className="text-[11px] text-text-muted">
                Community Geographical Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
            <CheckCircle2 className="w-10 h-10 text-accent-primary animate-bounce" />
            <div className="text-sm font-bold text-text-primary">Report Submitted Successfully</div>
            <div className="text-xs text-text-muted">
              Incident pinned to active mission layer with status: Reported
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Category Select */}
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1.5 font-mono">
                INCIDENT CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-surface">
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1.5 font-mono">
                DESCRIPTION & CONTEXT
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue, severity, lane blockage, or visibility..."
                rows={3}
                className="w-full bg-surface-elevated border border-border rounded-lg p-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary resize-none"
              />
            </div>

            {/* Coordinates Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-text-secondary font-mono">
                  INCIDENT COORDINATES
                </span>
                {userLocation && (
                  <button
                    type="button"
                    onClick={handleUseUserLocation}
                    className="text-[10px] text-accent-primary hover:underline flex items-center gap-1 font-mono"
                  >
                    <LocateFixed className="w-3 h-3" />
                    Use Current GPS
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 bg-surface-elevated border border-border rounded-lg p-2 text-xs font-mono text-text-muted">
                <MapPin className="w-3.5 h-3.5 text-accent-secondary" />
                <span>
                  LAT: {coordinates.latitude.toFixed(5)}° | LON: {coordinates.longitude.toFixed(5)}°
                </span>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger">
                {error}
              </div>
            )}

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-lg bg-surface-elevated border border-border text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-warning/20 hover:bg-warning/30 border border-warning/40 text-warning text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
