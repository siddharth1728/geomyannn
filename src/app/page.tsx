"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  Coordinates, 
  RouteResult, 
  PlaceResult, 
  SavedPlace, 
  ActiveMode, 
  ProviderStatus 
} from "@/types/geo";
import { 
  Meetup, 
  CandidateVenue 
} from "@/types/meetup";
import { HYDERABAD_CENTER, DEFAULT_ZOOM, MapStyleType } from "@/lib/map/config";
import { useGeolocation } from "@/hooks/useGeolocation";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { SavedPlacesPanel } from "@/components/saved/SavedPlacesPanel";
import { MapControls } from "@/components/map/MapControls";
import { StyleSwitcher } from "@/components/map/StyleSwitcher";
import { AuthModal } from "@/components/auth/AuthModal";
import { PlanMeetupModal } from "@/components/meetup/PlanMeetupModal";
import { JoinMeetupModal } from "@/components/meetup/JoinMeetupModal";
import { MeetupWorkspace } from "@/components/meetup/MeetupWorkspace";
import { DiscoverPlacesPanel } from "@/components/meetup/DiscoverPlacesPanel";
import { MyMeetupsList } from "@/components/meetup/MyMeetupsList";
import { HeroWelcomeCard } from "@/components/meetup/HeroWelcomeCard";
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { Map as MapLibreMap } from "maplibre-gl";

const DynamicMapContainer = dynamic(
  () => import("@/components/map/MapContainer").then((mod) => mod.MapContainer),
  { ssr: false }
);

export default function GeorynthApp() {
  // Navigation & panel states: Default is "plan"
  const [activeMode, setActiveMode] = useState<ActiveMode>("plan");
  const [mapStyleType, setMapStyleType] = useState<MapStyleType>("streets");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Group Meetup state
  const [allMeetups, setAllMeetups] = useState<Meetup[]>([]);
  const [activeMeetup, setActiveMeetup] = useState<Meetup | null>(null);
  const [multiRoutes, setMultiRoutes] = useState<RouteResult[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [mobileSheetState, setMobileSheetState] = useState<"peek" | "half" | "full">("half");

  // Map viewport
  const [viewport, setViewport] = useState({
    center: { latitude: HYDERABAD_CENTER[1], longitude: HYDERABAD_CENTER[0] },
    zoom: DEFAULT_ZOOM,
    pitch: 0,
    bearing: 0,
  });

  // Geographical entities
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([
    {
      id: "sav-hyd-1",
      userId: "guest-user",
      label: "Roastery Coffee House",
      placeName: "Road No 14, Banjara Hills, Hyderabad",
      latitude: 17.4184,
      longitude: 78.4382,
      createdAt: new Date().toISOString(),
    },
    {
      id: "sav-hyd-2",
      userId: "guest-user",
      label: "HITEC City Cyber Towers",
      placeName: "HITEC City, Madhapur, Hyderabad",
      latitude: 17.4474,
      longitude: 78.3762,
      createdAt: new Date().toISOString(),
    },
  ]);

  // Provider status
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
    maptilerConfigured: true,
    graphhopperConfigured: true,
    supabaseConfigured: true,
  });

  const {
    coordinates: userCoords,
    status: geoStatus,
    requestLocation,
  } = useGeolocation();

  const mapInstanceRef = useRef<MapLibreMap | null>(null);

  // Smoothly trigger MapLibre resize when dock collapses/expands
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    }, 320);
    return () => clearTimeout(timer);
  }, [isDockCollapsed]);

  // Initialize meetups and provider telemetry
  useEffect(() => {
    // 1. Hydrate saved places from local storage if available
    try {
      const storedPlaces = localStorage.getItem("georynth_saved_places");
      if (storedPlaces) {
        const parsed = JSON.parse(storedPlaces);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedPlaces(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load saved places from localStorage", e);
    }

    // 2. Fetch remote provider telemetry and meetups
    async function init() {
      try {
        const [statusRes, meetupsRes] = await Promise.all([
          fetch("/api/status").catch(() => null),
          fetch("/api/meetups").catch(() => null),
        ]);

        if (statusRes && statusRes.ok) {
          const s = await statusRes.json();
          setProviderStatus({
            maptilerConfigured: s.maptilerConfigured,
            graphhopperConfigured: s.graphhopperConfigured,
            supabaseConfigured: s.supabaseConfigured,
          });
        }

        if (meetupsRes && meetupsRes.ok) {
          const m = await meetupsRes.json();
          if (m.meetups && m.meetups.length > 0) {
            setAllMeetups(m.meetups);
            setActiveMeetup(m.meetups[0]);
          }
        }
      } catch (err) {
        console.warn("Init error:", err);
      }
    }
    init();
  }, []);

  // Sync saved places updates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("georynth_saved_places", JSON.stringify(savedPlaces));
    } catch (e) {
      console.warn("Could not sync saved places to localStorage", e);
    }
  }, [savedPlaces]);

  // Map Controls Callbacks
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetNorth = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.easeTo({ bearing: 0, pitch: 0 });
    }
  };

  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: HYDERABAD_CENTER,
        zoom: DEFAULT_ZOOM,
        pitch: 0,
        bearing: 0,
      });
    }
  };

  const handleLocateUser = () => {
    if (userCoords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [userCoords.longitude, userCoords.latitude],
        zoom: 14,
      });
    } else {
      requestLocation();
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // 1-Click Fast Track: Hyderabad 4-Friend Scenario
  const handleLoadHyderabadPreset = async () => {
    try {
      const res = await fetch("/api/meetups?code=HYD789");
      if (res.ok) {
        const data = await res.json();
        if (data.meetup) {
          setActiveMeetup(data.meetup);
          setActiveMode("active_meetup");
          setIsDockCollapsed(false);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
              center: [78.4485, 17.4194],
              zoom: 12.5,
              duration: 1200,
            });
          }
        }
      }
    } catch (e) {
      console.warn("Error loading preset:", e);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-text-primary overflow-hidden font-sans select-none">
      {/* 1. Global Navigation Header */}
      <AppHeader
        activeMode={activeMode}
        onChangeMode={(mode) => {
          setActiveMode(mode);
          if (isDockCollapsed) setIsDockCollapsed(false);
        }}
        onOpenPlanModal={() => setIsPlanModalOpen(true)}
        onOpenSettings={() => setIsAuthModalOpen(true)}
        meetupCount={allMeetups.length}
      />

      {/* 2. Integrated Two-Column Workspace (Google Maps-Grade Shell) */}
      <main className="relative flex-1 w-full h-[calc(100vh-56px)] flex overflow-hidden">
        {/* Left Column: Context / Results / Meetup Dock (380-420px, Collapsible Desktop / Responsive Mobile Sheet) */}
        <aside
          className={`transition-all duration-300 z-20 bg-surface flex flex-col ${
            isDockCollapsed
              ? "md:w-0 overflow-hidden md:border-none hidden md:flex"
              : "md:h-full md:border-r md:border-border md:w-[380px] lg:w-[420px] md:relative"
          } ${
            activeMeetup
              ? `fixed md:static inset-x-0 bottom-0 md:bottom-auto rounded-t-3xl md:rounded-none border-t md:border-t-0 border-border shadow-float md:shadow-none transition-all duration-300 ${
                  mobileSheetState === "peek"
                    ? "h-20 md:h-full"
                    : mobileSheetState === "half"
                    ? "h-[50vh] md:h-full"
                    : "h-[85vh] md:h-full"
                }`
              : "w-full md:w-[380px] lg:w-[420px] h-full"
          }`}
        >
          {/* Mobile Sheet Handle (Only on mobile when active meetup is open) */}
          {activeMeetup && (
            <div
              onClick={() =>
                setMobileSheetState((prev) =>
                  prev === "half" ? "full" : prev === "full" ? "peek" : "half"
                )
              }
              className="md:hidden w-full py-2 flex flex-col items-center justify-center cursor-pointer bg-surface hover:bg-surface-secondary rounded-t-3xl border-b border-border/40 shrink-0 select-none"
            >
              <div className="w-10 h-1 bg-border rounded-full" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">
                {mobileSheetState === "peek"
                  ? "Tap to view places"
                  : mobileSheetState === "half"
                  ? "Tap for full list"
                  : "Tap to collapse"}
              </span>
            </div>
          )}

          {/* Top Search Field Embedded in Dock */}
          <div className="p-3 border-b border-border bg-surface shrink-0 flex items-center gap-2">
            <div className="flex-1">
              <GlobalSearch
                onSelectPlace={(place) => {
                  setSelectedPlace(place);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo({
                      center: [place.longitude, place.latitude],
                      zoom: 15,
                    });
                  }
                }}
                onDirectionsTo={(place) => {
                  setSelectedPlace(place);
                  setActiveMode("explore");
                }}
                onSavePlace={(p) => {
                  const sp: SavedPlace = {
                    id: `saved-${Date.now()}`,
                    userId: "guest",
                    label: p.name,
                    placeName: p.fullAddress,
                    latitude: p.latitude,
                    longitude: p.longitude,
                    createdAt: new Date().toISOString(),
                  };
                  setSavedPlaces((prev) => [sp, ...prev]);
                  setActiveMode("saved");
                }}
                currentCenterLonLat={[viewport.center.longitude, viewport.center.latitude]}
              />
            </div>

            {/* Collapse Dock Button (Desktop) */}
            <button
              onClick={() => setIsDockCollapsed(true)}
              title="Collapse sidebar (Expand map)"
              className="hidden md:flex p-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-text-muted hover:text-text-primary transition-colors shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Dock Content Area with Smooth Independent Scrolling */}
          <div className="flex-1 overflow-y-auto">
            {/* A. Plan Mode / New User Hero Card */}
            {activeMode === "plan" && !activeMeetup && (
              <HeroWelcomeCard
                onPlanMeetup={() => setIsPlanModalOpen(true)}
                onJoinMeetup={() => setIsJoinModalOpen(true)}
                onExploreNearby={() => setActiveMode("explore")}
                onFastTrackHyderabad={handleLoadHyderabadPreset}
                recentMeetupTitle={allMeetups[0]?.title}
                onOpenRecentMeetup={() => {
                  setActiveMeetup(allMeetups[0]);
                  setActiveMode("active_meetup");
                }}
              />
            )}

            {/* B. Active Meetup Cockpit (People | Places | Votes Tabs) */}
            {(activeMode === "active_meetup" || (activeMode === "plan" && activeMeetup)) && activeMeetup && (
              <MeetupWorkspace
                meetup={activeMeetup}
                onUpdateMeetup={(updated) => setActiveMeetup(updated)}
                selectedVenueId={selectedVenueId}
                onSelectVenueOnMap={(v) => {
                  setSelectedVenueId(v.venueId);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo({
                      center: [v.longitude, v.latitude],
                      zoom: 15,
                      duration: 800,
                    });
                  }
                }}
                onDisplayDirections={(routes) => setMultiRoutes(routes)}
                onSaveVenue={(v) => {
                  const sp: SavedPlace = {
                    id: `saved-${Date.now()}`,
                    userId: "guest",
                    label: v.name,
                    placeName: v.address,
                    latitude: v.latitude,
                    longitude: v.longitude,
                    createdAt: new Date().toISOString(),
                  };
                  setSavedPlaces((prev) => [sp, ...prev]);
                }}
                savedVenueIds={savedPlaces.map((sp) => sp.label)}
                onClose={() => {
                  setActiveMeetup(null);
                  setSelectedVenueId(null);
                  setActiveMode("plan");
                }}
              />
            )}

            {/* C. My Meetups List */}
            {activeMode === "my_meetups" && (
              <MyMeetupsList
                meetups={allMeetups}
                onSelectMeetup={(m) => {
                  setActiveMeetup(m);
                  setActiveMode("active_meetup");
                }}
                onPlanNew={() => setIsPlanModalOpen(true)}
                onClose={() => setActiveMode("plan")}
              />
            )}

            {/* D. Explore Nearby Places */}
            {activeMode === "explore" && (
              <DiscoverPlacesPanel
                onSelectVenue={(v) => {
                  setSelectedPlace({
                    id: v.venueId,
                    name: v.name,
                    fullAddress: v.address,
                    latitude: v.latitude,
                    longitude: v.longitude,
                    provider: "maptiler",
                  });
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo({
                      center: [v.longitude, v.latitude],
                      zoom: 15,
                    });
                  }
                }}
                onClose={() => setActiveMode("plan")}
                currentCenter={viewport.center}
              />
            )}

            {/* E. Saved Places */}
            {activeMode === "saved" && (
              <SavedPlacesPanel
                savedPlaces={savedPlaces}
                onSelectPlace={(p) => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo({
                      center: [p.longitude, p.latitude],
                      zoom: 15,
                    });
                  }
                }}
                onDeletePlace={(id) => setSavedPlaces((prev) => prev.filter((p) => p.id !== id))}
                onClose={() => setActiveMode("plan")}
              />
            )}
          </div>
        </aside>

        {/* Right Column: Full-Bleed Vector Map Canvas */}
        <div className="flex-1 h-full relative overflow-hidden">
          {/* Floating Expand Button (Visible when Dock is Collapsed on Desktop) */}
          {isDockCollapsed && (
            <button
              onClick={() => setIsDockCollapsed(false)}
              title="Show results panel"
              className="hidden md:flex absolute top-4 left-4 z-20 items-center gap-1.5 px-3 py-2 rounded-xl bg-surface/95 backdrop-blur-md border border-border shadow-card text-xs font-bold text-text-primary hover:text-primary transition-all active:scale-95"
            >
              <PanelLeftOpen className="w-4 h-4 text-primary" />
              <span>Show Results</span>
            </button>
          )}

          {/* MapLibre GL Vector Map */}
          <DynamicMapContainer
            mapStyleType={mapStyleType}
            networkMode={false}
            activeRoute={activeRoute}
            selectedPlace={selectedPlace}
            communityReports={[]}
            userLocation={userCoords}
            participantLocations={activeMeetup?.locations || []}
            candidateVenues={activeMeetup?.venues || []}
            selectedVenueId={selectedVenueId}
            onSelectVenue={(v) => {
              setSelectedVenueId(v.venueId);
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo({
                  center: [v.longitude, v.latitude],
                  zoom: 15,
                  duration: 800,
                });
              }
            }}
            multiRoutes={multiRoutes}
            onViewportChange={(vp) => setViewport(vp)}
            onMapReady={(map) => {
              mapInstanceRef.current = map;
            }}
          />

          {/* Bottom Left: Map Style Switcher (Streets / Satellite / Night) */}
          <div className="absolute bottom-6 left-4 z-20 hidden sm:block">
            <StyleSwitcher
              currentStyle={mapStyleType}
              onSelectStyle={(s) => setMapStyleType(s)}
            />
          </div>

          {/* Bottom Right: Unified Map Controls */}
          <div className="absolute bottom-6 right-4 z-20">
            <MapControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetNorth={handleResetNorth}
              onResetCenter={handleResetCenter}
              onLocateUser={handleLocateUser}
              geolocationStatus={geoStatus}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
            />
          </div>
        </div>
      </main>

      {/* 3. Mobile Bottom Tab Bar (sm screens only) */}
      <MobileTabBar
        activeMode={activeMode}
        onChangeMode={(mode) => {
          setActiveMode(mode);
          setIsDockCollapsed(false);
        }}
        onOpenPlanModal={() => setIsPlanModalOpen(true)}
        meetupCount={allMeetups.length}
      />

      {/* 4. Plan Meetup 3-Step Wizard Modal */}
      <PlanMeetupModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onMeetupCreated={(m) => {
          setActiveMeetup(m);
          setAllMeetups((prev) => [m, ...prev]);
          setActiveMode("active_meetup");
          setIsDockCollapsed(false);
        }}
        onLoadHyderabadPreset={handleLoadHyderabadPreset}
      />

      {/* 5. Join Meetup Modal */}
      <JoinMeetupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onMeetupJoined={(m) => {
          setActiveMeetup(m);
          setAllMeetups((prev) => [m, ...prev]);
          setActiveMode("active_meetup");
          setIsDockCollapsed(false);
        }}
        userLocation={userCoords}
        onRequestUserLocation={requestLocation}
      />

      {/* 6. Profile & App Settings Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        providerStatus={providerStatus}
      />
    </div>
  );
}
