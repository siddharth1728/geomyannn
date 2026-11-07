"use client";

import React, { useState, useEffect } from "react";
import { 
  Compass, 
  X, 
  MapPin, 
  Navigation, 
  Loader2, 
  Utensils, 
  Coffee, 
  Film, 
  Trees, 
  ShoppingBag,
  Sparkles 
} from "lucide-react";
import { MeetupCategory } from "@/types/meetup";
import { DiscoveredVenue, searchCandidateVenues } from "@/lib/providers/venues";
import { Coordinates } from "@/types/geo";

interface DiscoverPlacesPanelProps {
  onSelectVenue: (venue: DiscoveredVenue) => void;
  onClose: () => void;
  currentCenter: Coordinates;
}

export function DiscoverPlacesPanel({
  onSelectVenue,
  onClose,
  currentCenter,
}: DiscoverPlacesPanelProps) {
  const [category, setCategory] = useState<MeetupCategory>("restaurant");
  const [venues, setVenues] = useState<DiscoveredVenue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { venues } = await searchCandidateVenues(category, currentCenter, 8);
      setVenues(venues);
      setLoading(false);
    }
    load();
  }, [category, currentCenter]);

  return (
    <div className="w-full max-w-sm bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-panel-glow p-4 flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-accent-secondary" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary font-mono">
            Discover Places
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: "restaurant", label: "Dining" },
            { id: "cafe", label: "Cafes" },
            { id: "cinema", label: "Movies" },
            { id: "park", label: "Parks" },
            { id: "shopping", label: "Malls" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => setCategory(item.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              category === item.id
                ? "bg-accent-secondary/20 text-accent-secondary font-bold border border-accent-secondary/40"
                : "bg-surface-elevated text-text-muted hover:text-text-primary"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Venues List */}
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin text-accent-secondary" />
          <span>Searching real venues...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {venues.map((v) => (
            <div
              key={v.venueId}
              onClick={() => onSelectVenue(v)}
              className="p-2.5 rounded-lg bg-surface-elevated/70 border border-border hover:border-accent-secondary/50 cursor-pointer transition-all flex flex-col gap-1 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-bold text-text-primary group-hover:text-accent-secondary transition-colors truncate">
                  {v.name}
                </div>
                {v.rating && (
                  <span className="text-[11px] font-mono text-warning font-bold shrink-0">
                    ★ {v.rating}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-text-muted truncate">
                {v.address}
              </div>
              <div className="flex items-center justify-between text-[10px] text-text-muted font-mono pt-1">
                <span>{v.category}</span>
                <span className="text-accent-secondary flex items-center gap-0.5">
                  <Navigation className="w-2.5 h-2.5" /> View on Map
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
