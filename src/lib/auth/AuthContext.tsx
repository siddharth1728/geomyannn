"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: AuthError | Error | null; user: User | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to manage authentication cookies for server-side verification
function setAuthCookies(session: Session | null, name?: string) {
  if (typeof document === "undefined") return;

  if (session?.access_token) {
    // 7 days expiration
    const maxAge = 7 * 24 * 60 * 60;
    document.cookie = `georynth_auth_token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `georynth_user_id=${session.user.id}; path=/; max-age=${maxAge}; SameSite=Lax`;
    const displayName = name || session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User";
    document.cookie = `georynth_user_name=${encodeURIComponent(displayName)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } else {
    document.cookie = "georynth_auth_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "georynth_user_id=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "georynth_user_name=; path=/; max-age=0; SameSite=Lax";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!error && initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        setAuthCookies(initialSession);
      } else {
        setSession(null);
        setUser(null);
        setAuthCookies(null);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // 2. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setAuthCookies(currentSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error("Authentication provider is currently unconfigured.") };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (!error && data.session) {
      setSession(data.session);
      setUser(data.user);
      setAuthCookies(data.session);
    }
    return { error };
  };

  const signUp = async (name: string, email: string, password: string) => {
    if (!supabase) {
      return { error: new Error("Authentication provider is currently unconfigured."), user: null };
    }
    const trimmedName = name.trim();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: trimmedName,
        },
      },
    });

    if (!error && data.session) {
      setSession(data.session);
      setUser(data.user);
      setAuthCookies(data.session, trimmedName);
    }
    return { error, user: data.user };
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setAuthCookies(null);
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: new Error("Authentication provider is currently unconfigured.") };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login?reset=true` : undefined,
    });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
