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
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  Compass
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
  { id: "restaurant", label: "Restaurants", icon: Utensils },
  { id: "cafe", label: "Cafes & Coffee", icon: Coffee },
  { id: "cinema", label: "Movies & Cinema", icon: Film },
  { id: "entertainment", label: "Gaming & Fun", icon: Gamepad2 },
  { id: "park", label: "Parks & Outdoors", icon: Trees },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "sports", label: "Sports", icon: Activity },
  { id: "activity", label: "Activities", icon: Compass },
];

export function PlanMeetupModal({
  isOpen,
  onClose,
  onMeetupCreated,
  onLoadHyderabadPreset,
}: PlanMeetupModalProps) {
  // 3-Step Wizard state: 1 = What, 2 = When, 3 = Preferences
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: What are we doing? (Zero-Default Policy: All fields start empty/unselected)
  const [title, setTitle] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [category, setCategory] = useState<MeetupCategory | null>(null);

  // Step 2: When? (Zero-Default: unselected)
  const [dateChoice, setDateChoice] = useState<"today" | "tomorrow" | "custom" | null>(null);
  const [customDate, setCustomDate] = useState("");
  const [plannedTime, setPlannedTime] = useState("");
  const [transportMode, setTransportMode] = useState<"car" | "bike" | "foot" | null>(null);

  // Step 3: Preferences (Zero-Default: unselected/optional)
  const [budget, setBudget] = useState<MeetupBudget | null>(null);
  const [maxTravelTime, setMaxTravelTime] = useState<number | null>(null);
  const [strictMaxTravel, setStrictMaxTravel] = useState(false);
  const [cuisine, setCuisine] = useState<CuisinePreference | null>(null);
  const [dietary, setDietary] = useState<DietaryRequirement | null>(null);
  const [atmosphere, setAtmosphere] = useState<AtmospherePreference | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!title.trim()) {
        throw new Error("Please enter a title for your meetup.");
      }
      if (!creatorName.trim()) {
        throw new Error("Please enter your name as the host.");
      }
      if (!category) {
        throw new Error("Please choose an activity category.");
      }

      let finalDate = customDate;
      const today = new Date();
      if (dateChoice === "today") {
        finalDate = today.toISOString().split("T")[0];
      } else if (dateChoice === "tomorrow") {
        const tomorrow = new Date(today.getTime() + 86400000);
        finalDate = tomorrow.toISOString().split("T")[0];
      }

      const timeStr = plannedTime.trim() || "19:00";
      const dateStr = finalDate || today.toISOString().split("T")[0];
      const plannedAt = new Date(`${dateStr}T${timeStr}:00Z`).toISOString();

      const res = await fetch("/api/meetups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          creatorName: creatorName.trim(),
          category,
          plannedAt,
          budget: budget || "any",
          transportMode: transportMode || "car",
          preferences: {
            category,
            budget: budget || undefined,
            cuisine: cuisine || undefined,
            dietary: dietary || undefined,
            atmosphere: atmosphere || undefined,
            maxTravelTimeMinutes: maxTravelTime || undefined,
            strictMaxTravel,
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Failed to create meetup");
      }

      const data = await res.json();
      onMeetupCreated(data.meetup);
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-float overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Steps */}
        <div className="p-5 border-b border-border bg-surface-secondary/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold">
              {step}/3
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {step === 1 && "What are we doing?"}
                {step === 2 && "When is the meetup?"}
                {step === 3 && "Group preferences"}
              </h2>
              <p className="text-xs text-text-muted">
                {step === 1 && "Choose an activity and give your gathering a title"}
                {step === 2 && "Pick the planned date, time and transport mode"}
                {step === 3 && "Set budget and travel limits for the group"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="h-1 bg-surface-secondary w-full">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs">
              {error}
            </div>
          )}

          {/* STEP 1: WHAT ARE WE DOING? */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Meetup Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Hyderabad Weekend Hangout"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Your Name (Host)
                </label>
                <input
                  type="text"
                  required
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="e.g. Diya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Select Activity Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary-soft text-primary font-bold shadow-subtle"
                            : "border-border bg-surface-secondary hover:bg-surface text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fast Track Demo Shortcut */}
              {onLoadHyderabadPreset && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadHyderabadPreset();
                      onClose();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text-primary text-xs flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>Or load 4-friend Hyderabad test preset directly</span>
                    </span>
                    <span className="text-[10px] font-bold text-primary">Fast Track →</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: WHEN? */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  When are you meeting?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDateChoice("today")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                      dateChoice === "today"
                        ? "border-primary bg-primary-soft text-primary font-bold shadow-subtle"
                        : "border-border bg-surface-secondary text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateChoice("tomorrow")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                      dateChoice === "tomorrow"
                        ? "border-primary bg-primary-soft text-primary font-bold shadow-subtle"
                        : "border-border bg-surface-secondary text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateChoice("custom")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                      dateChoice === "custom"
                        ? "border-primary bg-primary-soft text-primary font-bold shadow-subtle"
                        : "border-border bg-surface-secondary text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Select Date
                  </button>
                </div>
              </div>

              {dateChoice === "custom" && (
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                    Planned Date
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Planned Time
                </label>
                <input
                  type="time"
                  value={plannedTime}
                  onChange={(e) => setPlannedTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Primary Mode of Travel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransportMode("car")}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                      transportMode === "car"
                        ? "border-primary bg-primary-soft text-primary font-bold shadow-subtle"
                        : "border-border bg-surface-secondary text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    <span>Car / Cab</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransportMode("bike")}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                      transportMode === "bike"
                        ? "border-primary bg-primary-soft text-primary font-bold shadow-subtle"
                        : "border-border bg-surface-secondary text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span>Bike / 2W</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransportMode("foot")}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                      transportMode === "foot"
                        ? "border-primary bg-primary-soft text-primary font-bold shadow-subtle"
                        : "border-border bg-surface-secondary text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Footprints className="w-4 h-4" />
                    <span>Transit</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREFERENCES & CONSTRAINTS */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Budget per Person
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "budget", label: "₹ Budget" },
                    { id: "moderate", label: "₹₹ Moderate" },
                    { id: "premium", label: "₹₹₹ Premium" },
                    { id: "any", label: "Any" },
                  ].map((b) => (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => setBudget(b.id as MeetupBudget)}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-medium text-center transition-all ${
                        budget === b.id
                          ? "border-primary bg-primary-soft text-primary font-bold shadow-subtle"
                          : "border-border bg-surface-secondary text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Max Travel Time Cap
                  </label>
                  <span className="text-xs font-bold text-primary font-mono tabular-nums">
                    {maxTravelTime ? `${maxTravelTime} mins` : "No limit set"}
                  </span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={60}
                  step={5}
                  value={maxTravelTime ?? 35}
                  onChange={(e) => setMaxTravelTime(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-secondary rounded-lg cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-text-muted mt-1">
                  <span>15m (hyper-local)</span>
                  <span>60m (city-wide)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Atmosphere
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "casual", label: "Casual" },
                    { id: "lively", label: "Lively" },
                    { id: "cozy", label: "Cozy" },
                    { id: "fine_dining", label: "Fine Dining" },
                    { id: "outdoor", label: "Outdoor" },
                    { id: "work_friendly", label: "Work Friendly" },
                  ].map((atm) => (
                    <button
                      type="button"
                      key={atm.id}
                      onClick={() => setAtmosphere(atm.id as AtmospherePreference)}
                      className={`py-2 px-2 rounded-xl border text-xs font-medium text-center transition-all ${
                        atmosphere === atm.id
                          ? "border-primary bg-primary-soft text-primary font-bold shadow-subtle"
                          : "border-border bg-surface-secondary text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {atm.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-text-primary text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1) {
                    if (!title.trim() || !creatorName.trim() || !category) {
                      setError("Please provide a meetup title, your name, and choose an activity category.");
                      return;
                    }
                  }
                  setError(null);
                  setStep((s) => (s + 1) as any);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition-all active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Meetup...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Create Meetup & Invite Friends</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
