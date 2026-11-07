"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2, Navigation2, BookmarkPlus } from "lucide-react";
import { PlaceResult } from "@/types/geo";

interface GlobalSearchProps {
  onSelectPlace: (place: PlaceResult) => void;
  onDirectionsTo: (place: PlaceResult) => void;
  onSavePlace?: (place: PlaceResult) => void;
  currentCenterLonLat?: [number, number];
}

export function GlobalSearch({
  onSelectPlace,
  onDirectionsTo,
  onSavePlace,
  currentCenterLonLat,
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search logic with request cancellation
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const proximityParam = currentCenterLonLat
          ? `&proximity=${currentCenterLonLat[0]},${currentCenterLonLat[1]}`
          : "";
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}${proximityParam}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || `Search failed (${res.status})`);
        }

        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to search places");
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, currentCenterLonLat]);

  const handleSelect = (place: PlaceResult) => {
    setSelectedPlace(place);
    setQuery(place.name);
    setIsOpen(false);
    onSelectPlace(place);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSelectedPlace(null);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md z-20">
      {/* Search Bar Input */}
      <div className="relative flex items-center bg-surface/95 backdrop-blur-md rounded-2xl border border-border shadow-card focus-within:border-primary transition-all">
        <div className="pl-3.5 text-text-muted">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search places, cafes, landmarks..."
          aria-label="Search places"
          className="w-full bg-transparent px-3 py-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none"
        />

        {query && (
          <button
            onClick={handleClear}
            className="p-1.5 mr-1.5 text-text-muted hover:text-text-primary rounded-lg transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-2xl shadow-float overflow-hidden z-30 max-h-80 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-danger bg-danger/10 border-b border-border">
              {error}
            </div>
          )}

          {results.length > 0 ? (
            <ul className="divide-y divide-border/40">
              {results.map((result, idx) => (
                <li
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={`px-3.5 py-2.5 cursor-pointer flex items-start gap-2.5 transition-colors ${
                    idx === selectedIndex
                      ? "bg-surface-secondary text-primary"
                      : "hover:bg-surface-secondary/70 text-text-secondary"
                  }`}
                >
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-text-primary truncate">
                      {result.name}
                    </div>
                    <div className="text-[11px] text-text-muted truncate">
                      {result.fullAddress}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !loading &&
            query.trim().length >= 2 && (
              <div className="p-4 text-center text-xs text-text-muted">
                No matching locations found for &quot;{query}&quot;.
              </div>
            )
          )}
        </div>
      )}

      {/* Selected Result Action Card */}
      {selectedPlace && !isOpen && (
        <div className="mt-2 p-3 bg-surface border border-border rounded-xl shadow-subtle flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-text-primary truncate">
              {selectedPlace.name}
            </p>
            <p className="text-[11px] text-text-muted truncate">
              {selectedPlace.fullAddress}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onSavePlace && (
              <button
                onClick={() => onSavePlace(selectedPlace)}
                className="p-1.5 rounded-lg border border-border bg-surface-secondary text-text-secondary hover:text-primary transition-colors"
                title="Save place"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onDirectionsTo(selectedPlace)}
              className="py-1 px-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Navigation2 className="w-3 h-3" />
              <span>Explore</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
