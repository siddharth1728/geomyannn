"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Users, 
  MapPin, 
  Navigation,
  Compass,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Check
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

type AuthMode = "signin" | "signup" | "forgot";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signIn, signUp, resetPassword, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");

  // Form Fields - Strictly Zero-Default (Empty Initial State)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already logged in, redirect to workspace
  useEffect(() => {
    if (user && !authLoading) {
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    }
  }, [user, authLoading, router, searchParams]);

  // Compute Password Strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-border" };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score <= 3) return { score: 3, label: "Good", color: "bg-sky-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      if (mode === "signin") {
        if (!email.trim() || !password) {
          throw new Error("Please enter your email and password.");
        }
        const { error } = await signIn(email, password);
        if (error) {
          throw new Error(error.message || "Failed to sign in. Please verify your credentials.");
        }
        router.push("/");
      } else if (mode === "signup") {
        if (!fullName.trim()) {
          throw new Error("Please enter your full name.");
        }
        if (!email.trim()) {
          throw new Error("Please enter a valid email address.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const { error, user: newUser } = await signUp(fullName, email, password);
        if (error) {
          throw new Error(error.message || "Could not complete registration.");
        }

        if (newUser && !newUser.confirmed_at) {
          setSuccessMessage("Account created! If email confirmation is enabled, please check your inbox.");
        } else {
          router.push("/");
        }
      } else if (mode === "forgot") {
        if (!email.trim()) {
          throw new Error("Please enter your email address.");
        }
        const { error } = await resetPassword(email);
        if (error) {
          throw new Error(error.message || "Could not send password reset email.");
        }
        setSuccessMessage("Password reset email sent! Check your inbox for instructions.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#FBFBFA] dark:bg-[#0D1318] text-text-primary flex flex-col font-sans transition-colors">
      {/* Top Mobile Bar (Visible on mobile only) */}
      <header className="md:hidden h-14 border-b border-border bg-surface/90 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-black text-sm">
            G
          </div>
          <span className="font-extrabold text-sm tracking-tight">GEORYNTH</span>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to map</span>
        </Link>
      </header>

      {/* Main Two-Panel Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-y-auto">
        {/* LEFT PANEL: Brand Story & Social Convergence Visual (Desktop) */}
        <section className="hidden md:flex md:w-1/2 lg:w-[55%] bg-surface border-r border-border p-8 lg:p-14 flex-col justify-between relative overflow-hidden select-none">
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Identity */}
          <div className="z-10">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-subtle group-hover:scale-105 transition-transform">
                G
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-text-primary">
                  GEORYNTH
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-primary-soft text-primary uppercase">
                  Meetup Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Emotional Headline & Interactive Convergence Graphic */}
          <div className="my-auto py-8 z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Social Mobility Reimagined</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black text-text-primary tracking-tight leading-tight">
              Good plans start with everyone.
            </h1>

            <p className="text-sm lg:text-base text-text-secondary mt-3 leading-relaxed">
              Find places everyone can reach. Bring your friends together. Balance road travel times across every starting point and make meeting up effortless.
            </p>

            {/* Stylized Convergence Visual Card */}
            <div className="mt-8 p-5 rounded-2xl bg-surface-secondary/70 border border-border shadow-card relative">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  How GEORYNTH Balances Your Group
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  Zero Travel Bias
                </span>
              </div>

              {/* Convergence Diagram */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface border border-border/80 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-primary">Aarav</div>
                    <div className="text-[10px] text-text-muted">Kukatpally • 22m</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border/80 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-sky-500/15 text-sky-700 font-bold text-xs flex items-center justify-center border border-sky-500/30">
                    D
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-primary">Diya</div>
                    <div className="text-[10px] text-text-muted">Secunderabad • 20m</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border/80 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-700 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                    R
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-primary">Rohan</div>
                    <div className="text-[10px] text-text-muted">Mehdipatnam • 18m</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border/80 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-purple-500/15 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-500/30">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-primary">Ananya</div>
                    <div className="text-[10px] text-text-muted">Dilsukhnagar • 21m</div>
                  </div>
                </div>
              </div>

              {/* Optimal Central Spot Banner */}
              <div className="mt-3 p-2.5 rounded-xl bg-primary-soft border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center text-xs font-black">
                    ★
                  </div>
                  <span className="text-xs font-bold text-primary">
                    Optimal Center: Roastery Coffee House
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-primary">
                  Gap: 4 min
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Note */}
          <div className="z-10 pt-4 flex items-center justify-between text-xs text-text-muted border-t border-border/60">
            <span>Built for friends, students & family hangouts</span>
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Map View</span>
            </Link>
          </div>
        </section>

        {/* RIGHT PANEL: Authentication Form */}
        <section className="flex-1 flex items-center justify-center p-5 sm:p-8 lg:p-12 bg-[#FBFBFA] dark:bg-[#0D1318]">
          <div className="w-full max-w-md space-y-6">
            {/* Header Titles */}
            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                {mode === "signin"
                  ? "Welcome back."
                  : mode === "signup"
                  ? "Let's bring your group together."
                  : "Reset your password."}
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary">
                {mode === "signin"
                  ? "Your next meetup is just a few steps away."
                  : mode === "signup"
                  ? "Create your account and start planning better meetups."
                  : "Enter your email address and we'll send you reset instructions."}
              </p>
            </div>

            {/* Mode Switcher Tabs (Sign In vs Create Account) */}
            {mode !== "forgot" && (
              <div className="grid grid-cols-2 p-1 bg-surface-secondary rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === "signin"
                      ? "bg-surface text-primary shadow-subtle"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === "signup"
                      ? "bg-surface text-primary shadow-subtle"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Feedback Notifications */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field (Registration only) */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-primary">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. Diya Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-subtle"
                  />
                </div>
              )}

              {/* Email Address Field (Always empty initially) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-primary">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-subtle"
                />
              </div>

              {/* Password Field (Not in forgot password mode) */}
              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-text-primary">
                      Password
                    </label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-subtle pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator (Registration only) */}
                  {mode === "signup" && password && (
                    <div className="pt-1 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-text-muted">Password Strength:</span>
                        <span className={strength.score >= 3 ? "text-emerald-600" : "text-text-secondary"}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-surface-secondary rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-full flex-1 rounded-full transition-all ${
                              level <= strength.score ? strength.color : "bg-border/60"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password Field (Registration only) */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-primary">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-subtle"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === "signin"
                        ? "Sign In"
                        : mode === "signup"
                        ? "Create Account"
                        : "Send Reset Link"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch Back from Forgot Password */}
              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
                >
                  Back to Sign In
                </button>
              )}
            </form>

            {/* Terms & Privacy Note */}
            {mode === "signup" && (
              <p className="text-[11px] text-text-muted text-center leading-relaxed">
                By creating an account, you agree to our{" "}
                <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>{" "}
                and{" "}
                <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
              </p>
            )}

            {/* Quick Switch Prompt */}
            {mode === "signin" && (
              <p className="text-xs text-center text-text-secondary">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  Create one now
                </button>
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
