"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  X, 
  Key, 
  Database, 
  Radio, 
  Map as MapIcon, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink 
} from "lucide-react";
import { ProviderStatus } from "@/types/geo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerStatus: ProviderStatus;
}

export function AuthModal({ isOpen, onClose, providerStatus }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerStatus.supabaseConfigured) {
      setMessage("Supabase Cloud credentials are required to authenticate persistent user sessions. See instructions below.");
      return;
    }
    setMessage("Authentication session request dispatched.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-panel-glow p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-surface-elevated border border-accent-primary/30 text-accent-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary tracking-wide">
                Mission Status & Integration Telemetry
              </h2>
              <p className="text-[11px] text-text-muted">
                API Handshakes, Cloud Persistence & Credentials
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

        {/* Integration Status Badges */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-text-secondary font-mono">
            EXTERNAL PROVIDER HANDSHAKES
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* MapTiler */}
            <div className="p-2.5 rounded-xl bg-surface-elevated border border-border flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <MapIcon className="w-4 h-4 text-accent-primary" />
                {providerStatus.maptilerConfigured ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary" />
                ) : (
                  <span className="text-[10px] text-text-muted font-mono">FALLBACK</span>
                )}
              </div>
              <div className="text-xs font-bold text-text-primary mt-1">MapTiler Tiles</div>
              <div className="text-[10px] text-text-muted">
                {providerStatus.maptilerConfigured ? "Connected (Custom Key)" : "OpenStreetMap Fallback"}
              </div>
            </div>

            {/* GraphHopper */}
            <div className="p-2.5 rounded-xl bg-surface-elevated border border-border flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <Radio className="w-4 h-4 text-accent-secondary" />
                {providerStatus.graphhopperConfigured ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-secondary" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-warning" />
                )}
              </div>
              <div className="text-xs font-bold text-text-primary mt-1">GraphHopper</div>
              <div className="text-[10px] text-text-muted">
                {providerStatus.graphhopperConfigured ? "Connected (Live Routes)" : "Requires API Key"}
              </div>
            </div>

            {/* Supabase */}
            <div className="p-2.5 rounded-xl bg-surface-elevated border border-border flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <Database className="w-4 h-4 text-accent-primary" />
                {providerStatus.supabaseConfigured ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary" />
                ) : (
                  <span className="text-[10px] text-text-muted font-mono">LOCAL</span>
                )}
              </div>
              <div className="text-xs font-bold text-text-primary mt-1">Supabase DB</div>
              <div className="text-[10px] text-text-muted">
                {providerStatus.supabaseConfigured ? "Connected (Postgres RLS)" : "Local In-Memory Cache"}
              </div>
            </div>
          </div>
        </div>

        {/* Guest Exploration Notice */}
        <div className="p-3 bg-surface-muted/60 border border-border rounded-xl text-xs text-text-secondary flex flex-col gap-1">
          <div className="font-semibold text-text-primary flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-accent-primary" />
            Unrestricted Guest Exploration
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            GEORYNTH operates fully in autonomous guest mode. You can explore global maps, search locations, inspect the road-network layer, and report community incidents without an account.
          </p>
        </div>

        {/* Auth form for Supabase */}
        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
          <div className="text-xs font-semibold text-text-secondary font-mono">
            {isSignUp ? "CREATE MISSION ACCOUNT" : "AUTHENTICATED SIGN IN"}
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Operator email address..."
            className="w-full bg-surface-elevated border border-border rounded-lg p-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Security token / password..."
            className="w-full bg-surface-elevated border border-border rounded-lg p-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary"
          />

          {message && (
            <div className="p-2.5 rounded-lg bg-warning/10 border border-warning/30 text-xs text-warning">
              {message}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-accent-primary hover:underline"
            >
              {isSignUp ? "Already registered? Sign in" : "Need an account? Sign up"}
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-accent-primary/20 hover:bg-accent-primary/30 border border-accent-primary/40 text-accent-primary text-xs font-bold transition-all"
            >
              {isSignUp ? "Register" : "Authenticate"}
            </button>
          </div>
        </form>

        {/* Configuration Setup Guide */}
        <div className="border-t border-border pt-3 flex flex-col gap-1.5 text-[11px] font-mono text-text-muted">
          <div className="text-text-secondary font-bold">CONFIGURE KEYS IN .env.local:</div>
          <div className="bg-surface-elevated p-2 rounded-lg text-[10px] space-y-0.5 overflow-x-auto">
            <div>NEXT_PUBLIC_MAPTILER_KEY=your_key_here</div>
            <div>GRAPHHOPPER_API_KEY=your_key_here</div>
            <div>NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co</div>
            <div>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key</div>
          </div>
        </div>
      </div>
    </div>
  );
}
