"use client";

import React, { useState } from "react";
import { 
  Users, 
  X, 
  Utensils, 
  Coffee, 
  Film, 
  Trees, 
  ShoppingBag, 
  Gamepad2, 
  Activity, 
  Calendar, 
  Clock, 
  Car, 
  Bike, 
  Footprints,
  Sparkles,
  Loader2,
  ChevronDown,
  Check,
  ShieldAlert,
  Sliders
} from "lucide-react";
import { 
  MeetupCategory, 
  MeetupBudget, 
  Meetup, 
  CuisinePreference, 
  DietaryRequirement, 
  AtmospherePreference 
} from "@/types/meetup";

interface PlanMeetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetupCreated: (meetup: Meetup) => void;
  onLoadHyderabadPreset?: () => void;
}

const CATEGORIES: { id: MeetupCategory; label: string; icon: any }[] = [
  { id: "restaurant", label: "Dining", icon: Utensils },
  { id: "cafe", label: "Cafes", icon: Coffee },
  { id: "cinema", label: "Movies", icon: Film },
  { id: "park", label: "Outdoors", icon: Trees },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "entertainment", label: "Games", icon: Gamepad2 },
  { id: "sports", label: "Sports", icon: Activity },
];

export function PlanMeetupModal({
  isOpen,
  onClose,
  onMeetupCreated,
  onLoadHyderabadPreset,
}: PlanMeetupModalProps) {
  // Core Info
  const [title, setTitle] = useState("Weekend Group Gathering");
  const [creatorName, setCreatorName] = useState("Siddharth");
  const [category, setCategory] = useState<MeetupCategory>("restaurant");
  const [plannedDate, setPlannedDate] = useState("2026-11-08");
  const [plannedTime, setPlannedTime] = useState("19:30");
  const [transportMode, setTransportMode] = useState<"car" | "bike" | "foot">("car");
  const [budget, setBudget] = useState<MeetupBudget>("moderate");

  // Optional Group Preferences
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cuisine, setCuisine] = useState<CuisinePreference>("any");
  const [dietary, setDietary] = useState<DietaryRequirement>("any");
  const [atmosphere, setAtmosphere] = useState<AtmospherePreference>("casual");
  const [maxTravelTime, setMaxTravelTime] = useState<number>(35);

  // Mandatory Constraints vs Soft Preferences
  const [strictMaxTravel, setStrictMaxTravel] = useState(false);
  const [strictDietary, setStrictDietary] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const plannedAt = new Date(`${plannedDate}T${plannedTime}:00Z`).toISOString();

      const res = await fetch("/api/meetups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          creatorName: creatorName.trim(),
          category,
          plannedAt,
          budget,
          transportMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create meetup");
      }

      onMeetupCreated(data.meetup);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create meetup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-panel-glow p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary tracking-wide">
                Plan a Meetup
              </h2>
              <p className="text-[11px] text-text-muted">
                Find a place everyone can reach
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title & Host */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                MEETUP TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dinner with Friends"
                className="w-full bg-surface-elevated border border-border rounded-lg p-2 text-xs text-text-primary focus:outline-none focus:border-accent-secondary"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                YOUR NAME (HOST)
              </label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="e.g. Siddharth"
                className="w-full bg-surface-elevated border border-border rounded-lg p-2 text-xs text-text-primary focus:outline-none focus:border-accent-secondary"
                required
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1.5">
              ACTIVITY TYPE
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.slice(0, 4).map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-accent-secondary/20 text-accent-secondary border-accent-secondary/50 shadow-sm"
                        : "bg-surface-elevated text-text-secondary border-border hover:border-text-muted"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date, Time & Mode */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                DATE
              </label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg p-2 text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                TIME
              </label>
              <input
                type="time"
                value={plannedTime}
                onChange={(e) => setPlannedTime(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg p-2 text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                TRAVEL MODE
              </label>
              <select
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value as any)}
                className="w-full bg-surface-elevated border border-border rounded-lg p-2 text-xs text-text-primary focus:outline-none"
              >
                <option value="car">Car (Drive)</option>
                <option value="bike">Bike (Ride)</option>
                <option value="foot">Walk</option>
              </select>
            </div>
          </div>

          {/* Advanced Group Preferences Accordion */}
          <div className="border border-border/80 rounded-xl overflow-hidden bg-surface-elevated/40">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-2.5 flex items-center justify-between text-xs text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-accent-secondary" />
                <span>Group Preferences & Constraints (Optional)</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>

            {showAdvanced && (
              <div className="p-3 border-t border-border flex flex-col gap-3 text-xs animate-in fade-in">
                {/* Cuisine & Dietary */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-text-muted block mb-1">Cuisine Style</label>
                    <select
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value as any)}
                      className="w-full bg-surface border border-border rounded-lg p-1.5 text-xs text-text-primary focus:outline-none"
                    >
                      <option value="any">Any Cuisine</option>
                      <option value="hyderabadi">Hyderabadi / Biryani</option>
                      <option value="asian">Asian Fusion</option>
                      <option value="north_indian">North Indian / Tandoor</option>
                      <option value="south_indian">South Indian</option>
                      <option value="continental">Continental</option>
                      <option value="cafe_bakery">Cafe & Bakery</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-text-muted block mb-1">Dietary Requirement</label>
                    <select
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value as any)}
                      className="w-full bg-surface border border-border rounded-lg p-1.5 text-xs text-text-primary focus:outline-none"
                    >
                      <option value="any">No Preference</option>
                      <option value="pure_veg">Pure Vegetarian</option>
                      <option value="halal">Halal</option>
                      <option value="vegan">Vegan</option>
                      <option value="gluten_free">Gluten-Free</option>
                    </select>
                  </div>
                </div>

                {/* Atmosphere & Max Travel Time */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-text-muted block mb-1">Atmosphere</label>
                    <select
                      value={atmosphere}
                      onChange={(e) => setAtmosphere(e.target.value as any)}
                      className="w-full bg-surface border border-border rounded-lg p-1.5 text-xs text-text-primary focus:outline-none"
                    >
                      <option value="casual">Casual / Easygoing</option>
                      <option value="lively">Lively / Energetic</option>
                      <option value="cozy">Cozy / Intimate</option>
                      <option value="fine_dining">Fine Dining</option>
                      <option value="outdoor">Outdoor / Rooftop</option>
                      <option value="work_friendly">Work & Study Friendly</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-text-muted block mb-1">Max Travel Limit ({maxTravelTime} min)</label>
                    <input
                      type="range"
                      min={15}
                      max={60}
                      step={5}
                      value={maxTravelTime}
                      onChange={(e) => setMaxTravelTime(Number(e.target.value))}
                      className="w-full accent-accent-secondary"
                    />
                  </div>
                </div>

                {/* Mandatory Constraints Checkboxes */}
                <div className="pt-2 border-t border-border/60 flex flex-col gap-1.5">
                  <div className="text-[10px] uppercase font-mono font-bold text-text-muted">
                    Mandatory Hard Constraints:
                  </div>

                  <label className="flex items-center gap-2 text-[11px] text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={strictMaxTravel}
                      onChange={(e) => setStrictMaxTravel(e.target.checked)}
                      className="rounded accent-accent-secondary"
                    />
                    <span>Strict cap: Disqualify venues exceeding {maxTravelTime} min for any friend</span>
                  </label>

                  <label className="flex items-center gap-2 text-[11px] text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={strictDietary}
                      onChange={(e) => setStrictDietary(e.target.checked)}
                      className="rounded accent-accent-secondary"
                    />
                    <span>Strict dietary: Require certified dietary options</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger">
              {error}
            </div>
          )}

          {/* Actions */}
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
              className="px-4 py-2 rounded-lg bg-accent-secondary/20 hover:bg-accent-secondary/30 border border-accent-secondary/40 text-accent-secondary text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create Meetup Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
