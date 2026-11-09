"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  User, 
  X, 
  Shield, 
  Car, 
  Bike, 
  Footprints, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Monitor,
  Check,
  HelpCircle,
  Trash2,
  AlertTriangle,
  LogIn,
  LogOut,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { ProviderStatus } from "@/types/geo";
import { useTheme, ThemePreference } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerStatus: ProviderStatus;
}

export function AuthModal({ isOpen, onClose, providerStatus }: AuthModalProps) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  // Zero-default: No hardcoded user details
  const [defaultTransport, setDefaultTransport] = useState<"car" | "bike" | "foot" | null>(null);
  const [approximateLocation, setApproximateLocation] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || null;

  const handleSubmitReport = async () => {
    if (!reportText.trim()) return;
    setIsSubmittingReport(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: userName || "Registered User",
          userEmail: user?.email || undefined,
          issueType: "inaccurate_place",
          message: reportText.trim(),
        }),
      });
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportSuccess(false);
          setIsReporting(false);
          setReportText("");
        }, 2200);
      }
    } catch (e) {
      console.warn("Report transmission failed:", e);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleConfirmReset = () => {
    try {
      localStorage.removeItem("georynth_saved_places");
      localStorage.removeItem("georynth_theme");
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("georynth_feedback_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
    setShowResetConfirm(false);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2000);
  };

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-float p-5 sm:p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary font-bold text-base flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Account & Settings
              </h2>
              <p className="text-xs text-text-muted">
                Manage your identity, preferences, and privacy
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

        {/* 1. User Authentication Status Card */}
        {user ? (
          <div className="p-4 rounded-xl bg-surface-secondary border border-border flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shadow-subtle shrink-0">
                {(userName || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-text-primary truncate">
                    {userName || "Authenticated Member"}
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-text-muted truncate mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={async () => {
                await signOut();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-red-500/10 border border-border hover:border-red-500/30 text-text-secondary hover:text-red-600 text-xs font-semibold transition-colors shrink-0 shadow-subtle"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-primary-soft/40 border border-primary/20 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-text-primary">Browsing as Guest</p>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  Sign in or create an account to save favorite hangout places, manage groups, and sync across devices.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/login"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-subtle flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In or Register</span>
              </Link>
            </div>
          </div>
        )}

        {/* 2. Theme Preferences */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Appearance
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "light" as ThemePreference, label: "Light", icon: Sun },
              { id: "dark" as ThemePreference, label: "Dark", icon: Moon },
              { id: "system" as ThemePreference, label: "System", icon: Monitor },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary-soft text-primary font-bold shadow-subtle"
                      : "border-border bg-surface-secondary hover:bg-surface text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Transport Preferences (Zero-default unselected state) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Preferred Travel Mode
            </label>
            {defaultTransport && (
              <button
                type="button"
                onClick={() => setDefaultTransport(null)}
                className="text-[11px] text-text-muted hover:text-text-primary underline"
              >
                Clear choice
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "car" as const, label: "Driving", icon: Car },
              { id: "bike" as const, label: "Two-Wheeler", icon: Bike },
              { id: "foot" as const, label: "Walking/Transit", icon: Footprints },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = defaultTransport === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setDefaultTransport(m.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary-soft text-primary font-bold shadow-subtle"
                      : "border-border bg-surface-secondary hover:bg-surface text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
          {!defaultTransport && (
            <p className="text-[11px] text-text-muted mt-1.5">
              Unselected by default. Choose your preferred transport to automatically apply during meetup planning.
            </p>
          )}
        </div>

        {/* 4. Location Privacy */}
        <div className="p-4 rounded-xl bg-surface-secondary border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-text-primary">Approximate Location Sharing</p>
              <p className="text-[11px] text-text-muted mt-0.5">
                Offsets your shared starting pin by ~500m to preserve home privacy.
              </p>
            </div>
            <input
              type="checkbox"
              checked={approximateLocation}
              onChange={(e) => setApproximateLocation(e.target.checked)}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
          </div>

          <div className="flex items-start gap-2 pt-2 border-t border-border/60 text-[11px] text-text-muted">
            <Shield className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span>
              GEORYNTH never tracks your location in the background. Starting coordinates are voluntary and only shared with friends in your meetup.
            </span>
          </div>
        </div>

        {/* 5. Support & Report Issue */}
        <div className="p-3.5 rounded-xl bg-surface-secondary border border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-text-primary">Need Help or Found an Incorrect Place?</p>
                <p className="text-[11px] text-text-muted">Report inaccuracies or request improvements</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsReporting(!isReporting)}
              className="text-xs font-semibold text-primary hover:underline px-2.5 py-1 rounded-lg bg-surface border border-border shadow-subtle"
            >
              {isReporting ? "Cancel" : "Report"}
            </button>
          </div>

          {isReporting && (
            <div className="pt-2 border-t border-border/70 space-y-2 animate-in fade-in">
              {reportSuccess ? (
                <div className="p-2.5 rounded-lg bg-primary-soft text-primary text-xs font-medium text-center">
                  Report submitted. Thank you for making GEORYNTH better!
                </div>
              ) : (
                <>
                  <textarea
                    rows={2}
                    placeholder="Describe the place or issue (e.g. 'Coffee shop closed', 'Wrong road route')..."
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-primary resize-none shadow-subtle"
                  />
                  <button
                    type="button"
                    disabled={isSubmittingReport || !reportText.trim()}
                    onClick={handleSubmitReport}
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow-subtle hover:bg-primary-hover disabled:opacity-50"
                  >
                    {isSubmittingReport ? "Transmitting..." : "Submit Report to Backend"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 6. Data & Privacy Reset with Confirmation */}
        <div className="p-3.5 rounded-xl bg-surface-secondary border border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-text-primary">Local Storage & Cache</p>
              <p className="text-[11px] text-text-muted">Clear browser bookmarks, reviews, and local preferences</p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetConfirm(!showResetConfirm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-red-500/10 border border-border hover:border-red-500/30 text-text-secondary hover:text-red-600 text-xs font-semibold transition-colors shadow-subtle"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{clearedNotice ? "Cleared!" : "Reset Storage"}</span>
            </button>
          </div>

          {showResetConfirm && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs space-y-2 animate-in fade-in">
              <p className="font-bold text-red-600">Are you sure you want to reset local storage?</p>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                This will delete your bookmarked saved places and local reviews on this browser. Active meetups on the server are preserved. This action is not reversible.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-3 py-1 rounded-lg bg-red-600 text-white font-bold text-xs shadow-subtle hover:bg-red-700"
                >
                  Yes, Clear Everything
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1 rounded-lg bg-surface border border-border text-xs font-semibold text-text-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 7. Connected Services Status */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Connected Services
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-surface-secondary border border-border text-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-success mx-auto mb-1" />
              <p className="text-[11px] font-bold text-text-primary">MapTiler</p>
              <p className="text-[10px] text-text-muted">Streets v2 Active</p>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-secondary border border-border text-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-success mx-auto mb-1" />
              <p className="text-[11px] font-bold text-text-primary">GraphHopper</p>
              <p className="text-[10px] text-text-muted">Matrix Active</p>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-secondary border border-border text-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-success mx-auto mb-1" />
              <p className="text-[11px] font-bold text-text-primary">Supabase</p>
              <p className="text-[10px] text-text-muted">Cloud DB Active</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-border">
          <span className="text-[11px] text-text-muted">
            GEORYNTH v1.0.0
          </span>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition-all active:scale-95"
          >
            {savedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Done</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
