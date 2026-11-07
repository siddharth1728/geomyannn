"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
          setError(err.message || "Unable to search locations");
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, currentCenterLonLat]);

  const handleSelect = useCallback(
    (place: PlaceResult) => {
      setSelectedPlace(place);
      setIsOpen(false);
      setQuery(place.name);
      onSelectPlace(place);
    },
    [onSelectPlace]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      }
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

  // Quick preset destinations in Hyderabad for rapid validation
  const quickPresets = [
    { name: "Charminar", lat: 17.3616, lon: 78.4747, address: "Old City, Hyderabad" },
    { name: "HITEC City", lat: 17.4474, lon: 78.3762, address: "Madhapur, Hyderabad" },
    { name: "Hussain Sagar", lat: 17.4239, lon: 78.4738, address: "Tank Bund, Hyderabad" },
    { name: "Golconda Fort", lat: 17.3833, lon: 78.4011, address: "Ibrahim Bagh, Hyderabad" },
  ];

  return (
    <div ref={containerRef} className="relative w-full max-w-lg z-20">
      {/* Search Bar Input */}
      <div className="relative flex items-center bg-surface/95 backdrop-blur-md rounded-xl border border-border shadow-panel-glow focus-within:border-accent-primary transition-all duration-200">
        <div className="pl-3 text-text-muted">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />
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
          placeholder="Search global coordinates, cities, or landmarks..."
          aria-label="Search places"
          className="w-full bg-transparent px-3 py-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none"
        />

        {query && (
          <button
            onClick={handleClear}
            className="p-1.5 mr-1 text-text-muted hover:text-text-primary rounded-md transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-panel-glow overflow-hidden z-30 max-h-80 overflow-y-auto">
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
                  className={`px-3 py-2.5 cursor-pointer flex items-start gap-2.5 transition-colors ${
                    idx === selectedIndex
                      ? "bg-surface-elevated text-accent-primary"
                      : "hover:bg-surface-elevated/70 text-text-secondary"
                  }`}
                >
                  <MapPin className="w-4 h-4 mt-0.5 text-accent-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-text-primary truncate">
                      {result.name}
                    </div>
                    <div className="text-[11px] text-text-muted truncate">
                      {result.fullAddress}
                    </div>
                    <div className="text-[10px] text-text-muted/70 font-mono mt-0.5">
                      {result.latitude.toFixed(4)}°, {result.longitude.toFixed(4)}° • {result.provider}
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

          {/* Quick Presets Footer */}
          <div className="p-2 bg-surface-muted/60 border-t border-border flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="text-text-muted px-1">Hyderabad Shortcuts:</span>
            {quickPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() =>
                  handleSelect({
                    id: `preset-${preset.name}`,
                    name: preset.name,
                    fullAddress: preset.address,
                    latitude: preset.lat,
                    longitude: preset.lon,
                    provider: "maptiler",
                  })
                }
                className="px-2 py-0.5 rounded bg-surface border border-border text-text-secondary hover:text-accent-primary hover:border-accent-primary/50 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Place Context Card */}
      {selectedPlace && (
        <div className="mt-2 p-3 bg-surface/95 backdrop-blur-md border border-accent-primary/30 rounded-xl shadow-panel-glow flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-accent-primary truncate flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {selectedPlace.name}
            </div>
            <div className="text-[11px] text-text-secondary truncate mt-0.5">
              {selectedPlace.fullAddress}
            </div>
            <div className="text-[10px] text-text-muted font-mono mt-0.5">
              LAT: {selectedPlace.latitude.toFixed(4)}° | LON: {selectedPlace.longitude.toFixed(4)}°
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onDirectionsTo(selectedPlace)}
              className="px-2.5 py-1 rounded-lg bg-accent-primary/10 border border-accent-primary/40 text-accent-primary text-xs font-medium hover:bg-accent-primary/20 transition-all flex items-center gap-1"
              title="Get directions to this location"
            >
              <Navigation2 className="w-3 h-3" />
              Route
            </button>

            {onSavePlace && (
              <button
                onClick={() => onSavePlace(selectedPlace)}
                className="p-1.5 rounded-lg bg-surface-elevated border border-border text-text-secondary hover:text-text-primary transition-all"
                title="Save this place"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
