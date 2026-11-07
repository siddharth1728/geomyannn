"use client";

import React, { useState } from "react";
import { 
  User, 
  X, 
  Shield, 
  MapPin, 
  Car, 
  Bike, 
  Footprints, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Monitor,
  Check
} from "lucide-react";
import { ProviderStatus } from "@/types/geo";
import { useTheme, ThemePreference } from "@/hooks/useTheme";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerStatus: ProviderStatus;
}

export function AuthModal({ isOpen, onClose, providerStatus }: AuthModalProps) {
  const { theme, setTheme } = useTheme();
  const [userName, setUserName] = useState("Siddharth");
  const [defaultTransport, setDefaultTransport] = useState<"car" | "bike" | "foot">("car");
  const [approximateLocation, setApproximateLocation] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-float p-5 sm:p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary font-bold text-base flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Profile & App Settings
              </h2>
              <p className="text-xs text-text-muted">
                Manage your preferences, privacy and theme
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

        {/* 1. User Profile */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

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

        {/* 3. Transport Preferences */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Default Transport Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "car" as const, label: "Car / Cab", icon: Car },
              { id: "bike" as const, label: "Two-Wheeler", icon: Bike },
              { id: "foot" as const, label: "Transit", icon: Footprints },
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

        {/* 5. Connected Services Status */}
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
