"use client";

import React, { useState } from "react";
import { 
  Bookmark, 
  Trash2, 
  MapPin, 
  X, 
  Navigation2, 
  Plus, 
  ExternalLink 
} from "lucide-react";
import { SavedPlace } from "@/types/geo";
import { formatCoordinates } from "@/lib/utils/formatters";

interface SavedPlacesPanelProps {
  savedPlaces: SavedPlace[];
  onSelectPlace: (place: SavedPlace) => void;
  onDeletePlace: (id: string) => void;
  onClose: () => void;
  onAddNew?: () => void;
}

export function SavedPlacesPanel({
  savedPlaces,
  onSelectPlace,
  onDeletePlace,
  onClose,
  onAddNew,
}: SavedPlacesPanelProps) {
  return (
    <div className="w-full max-w-sm bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-panel-glow p-4 z-20 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-accent-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary font-mono">
            Saved Coordinates ({savedPlaces.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Places List */}
      {savedPlaces.length > 0 ? (
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {savedPlaces.map((place) => (
            <div
              key={place.id}
              className="p-2.5 rounded-lg bg-surface-elevated/70 border border-border hover:border-accent-primary/40 transition-all flex items-start justify-between gap-2 group"
            >
              <div 
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => onSelectPlace(place)}
              >
                <div className="text-xs font-semibold text-text-primary group-hover:text-accent-primary transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                  <span className="truncate">{place.label}</span>
                </div>
                <div className="text-[11px] text-text-muted truncate mt-0.5">
                  {place.placeName}
                </div>
                <div className="text-[10px] text-text-muted/70 font-mono mt-0.5">
                  {formatCoordinates(place.latitude, place.longitude)}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onSelectPlace(place)}
                  className="p-1 rounded text-text-muted hover:text-accent-primary transition-colors"
                  title="Fly to location"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeletePlace(place.id)}
                  className="p-1 rounded text-text-muted hover:text-danger transition-colors"
                  title="Delete bookmark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-text-muted flex flex-col items-center gap-1.5">
          <Bookmark className="w-6 h-6 text-text-muted/40 mb-1" />
          <div>No saved coordinates yet.</div>
          <div className="text-[11px]">Search any place and tap bookmark to pin it here.</div>
        </div>
      )}
    </div>
  );
}
