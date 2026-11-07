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
    <div className="w-full h-full p-4 flex flex-col gap-3 overflow-y-auto animate-in fade-in transition-colors">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Explore Nearby Places
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
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: "restaurant", label: "Dining" },
            { id: "cafe", label: "Cafes" },
            { id: "cinema", label: "Movies" },
            { id: "park", label: "Parks" },
            { id: "shopping", label: "Shopping" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => setCategory(item.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              category === item.id
                ? "bg-primary text-white font-bold shadow-subtle"
                : "bg-surface-secondary text-text-secondary hover:text-text-primary"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Venues List */}
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Discovering local venues...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {venues.map((v) => (
            <div
              key={v.venueId}
              onClick={() => onSelectVenue(v)}
              className="p-3 rounded-xl bg-surface-secondary hover:bg-surface border border-border hover:border-primary/40 cursor-pointer transition-all flex flex-col gap-1 group shadow-subtle"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                  {v.name}
                </div>
                {v.rating && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-warning/15 text-warning font-bold shrink-0">
                    ★ {v.rating}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-text-muted truncate">
                {v.address}
              </div>
              <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-border/50">
                <span className="capitalize">{v.category}</span>
                <span className="text-primary font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  <Navigation className="w-3 h-3" /> View on Map
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
