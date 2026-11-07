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

  // Group Meetup state
  const [allMeetups, setAllMeetups] = useState<Meetup[]>([]);
  const [activeMeetup, setActiveMeetup] = useState<Meetup | null>(null);
  const [multiRoutes, setMultiRoutes] = useState<RouteResult[]>([]);

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

  // Initialize meetups and provider telemetry
  useEffect(() => {
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
            // Default to first active meetup if available
            setActiveMeetup(m.meetups[0]);
          }
        }
      } catch (err) {
        console.warn("Init error:", err);
      }
    }
    init();
  }, []);

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

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
              center: [78.4485, 17.4194],
              zoom: 12,
            });
          }
        }
      }
    } catch (e) {
      console.warn("Error loading preset:", e);
    }
  };

  // Adjust map camera padding so selected venues and routes are never hidden behind the left panel
  const isPanelOpen = activeMode !== "explore" || activeMeetup !== null;

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-text-primary overflow-hidden font-sans select-none">
      {/* 1. Universal Responsive Header */}
      <AppHeader
        activeMode={activeMode}
        onChangeMode={(mode) => setActiveMode(mode)}
        onOpenPlanModal={() => setIsPlanModalOpen(true)}
        onOpenSettings={() => setIsAuthModalOpen(true)}
        activeMeetupTitle={activeMeetup?.title}
        meetupCount={allMeetups.length}
      />

      {/* 2. Main Work Area */}
      <main className="relative flex-1 w-full h-[calc(100vh-56px)] overflow-hidden">
        {/* Full-bleed MapLibre Vector Canvas */}
        <div className="absolute inset-0 z-0">
          <DynamicMapContainer
            mapStyleType={mapStyleType}
            networkMode={false}
            activeRoute={activeRoute}
            selectedPlace={selectedPlace}
            communityReports={[]}
            userLocation={userCoords}
            participantLocations={activeMeetup?.locations || []}
            candidateVenues={activeMeetup?.venues || []}
            onSelectVenue={(v) => {
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
        </div>

        {/* Top Floating Search Bar */}
        <div className="absolute top-4 left-4 right-4 md:left-6 md:right-auto md:w-96 z-20">
          <GlobalSearch
            onSelectPlace={(place) => {
              setSelectedPlace(place);
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo({
                  center: [place.longitude, place.latitude],
                  zoom: 14,
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

        {/* Left Side: Contextual Workspace Panels */}
        <div className="absolute top-20 left-4 md:left-6 z-20 flex flex-col gap-3 max-h-[calc(100vh-160px)]">
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

          {/* B. Active Meetup Cockpit */}
          {(activeMode === "active_meetup" || (activeMode === "plan" && activeMeetup)) && activeMeetup && (
            <MeetupWorkspace
              meetup={activeMeetup}
              onUpdateMeetup={(updated) => setActiveMeetup(updated)}
              onSelectVenueOnMap={(v) => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo({
                    center: [v.longitude, v.latitude],
                    zoom: 15,
                  });
                }
              }}
              onDisplayDirections={(routes) => setMultiRoutes(routes)}
              onClose={() => {
                setActiveMeetup(null);
                setActiveMode("plan");
              }}
            />
          )}

          {/* C. My Meetups Drawer */}
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

          {/* D. Explore Nearby Panel */}
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

          {/* E. Saved Places Drawer */}
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

        {/* Bottom Left: Map Style Switcher (Street / Satellite / Night) */}
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
      </main>

      {/* 3. Mobile Bottom Tab Bar (sm screens only) */}
      <MobileTabBar
        activeMode={activeMode}
        onChangeMode={(mode) => setActiveMode(mode)}
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
