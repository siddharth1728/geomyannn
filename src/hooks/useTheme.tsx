"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";

interface ThemeContextType {
  theme: ThemePreference;
  resolvedTheme: "light" | "dark";
  setTheme: (t: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Read saved preference from localStorage
    const saved = localStorage.getItem("georynth-theme") as ThemePreference | null;
    if (saved && (saved === "light" || saved === "dark" || saved === "system")) {
      setThemeState(saved);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateResolved = () => {
      let active: "light" | "dark" = "light";
      if (theme === "dark") {
        active = "dark";
      } else if (theme === "light") {
        active = "light";
      } else {
        // System preference
        active = mediaQuery.matches ? "dark" : "light";
      }

      setResolvedTheme(active);

      if (active === "dark") {
        root.setAttribute("data-theme", "dark");
        root.classList.add("dark");
      } else {
        root.removeAttribute("data-theme");
        root.classList.remove("dark");
      }
    };

    updateResolved();
    mediaQuery.addEventListener("change", updateResolved);
    return () => mediaQuery.removeEventListener("change", updateResolved);
  }, [theme]);

  const setTheme = (t: ThemePreference) => {
    setThemeState(t);
    localStorage.setItem("georynth-theme", t);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
