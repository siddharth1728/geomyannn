"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  Coordinates, 
  RouteResult, 
  CommunityReport, 
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
import { MissionSidebar } from "@/components/layout/MissionSidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { DirectionsPanel } from "@/components/routing/DirectionsPanel";
import { ReportIssueModal } from "@/components/reports/ReportIssueModal";
import { SavedPlacesPanel } from "@/components/saved/SavedPlacesPanel";
import { NetworkLegend } from "@/components/network/NetworkLegend";
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

export default function GeorynthMeetupApp() {
  // Navigation & panel states: Default is "plan" (the primary meetup journey)
  const [activeMode, setActiveMode] = useState<ActiveMode>("plan");
  const [networkModeActive, setNetworkModeActive] = useState(false);
  const [mapStyleType, setMapStyleType] = useState<MapStyleType>("streets");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Group Meetup state
  const [allMeetups, setAllMeetups] = useState<Meetup[]>([]);
  const [activeMeetup, setActiveMeetup] = useState<Meetup | null>(null);
  const [multiRoutes, setMultiRoutes] = useState<RouteResult[]>([]);

  // Map viewport telemetry
  const [viewport, setViewport] = useState({
    center: { latitude: HYDERABAD_CENTER[1], longitude: HYDERABAD_CENTER[0] },
    zoom: DEFAULT_ZOOM,
    pitch: 0,
    bearing: 0,
  });

  // Geographical entities
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([
    {
      id: "sav-hyd-1",
      userId: "guest-user",
      label: "Charminar Monument",
      placeName: "Charminar, Old City, Hyderabad",
      latitude: 17.3616,
      longitude: 78.4747,
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

  // Provider configuration telemetry
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
    maptilerConfigured: true,
    graphhopperConfigured: true,
    supabaseConfigured: true,
  });

  // Geolocation hook
  const {
    coordinates: userCoords,
    status: geoStatus,
    requestLocation,
  } = useGeolocation();

  const mapInstanceRef = useRef<MapLibreMap | null>(null);

  // Initialize telemetry, reports, and meetups
  useEffect(() => {
    async function init() {
      try {
        const [statusRes, reportsRes, meetupsRes] = await Promise.all([
          fetch("/api/status").catch(() => null),
          fetch("/api/reports").catch(() => null),
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

        if (reportsRes && reportsRes.ok) {
          const r = await reportsRes.json();
          if (r.reports) setCommunityReports(r.reports);
        }

        if (meetupsRes && meetupsRes.ok) {
          const m = await meetupsRes.json();
          if (m.meetups) setAllMeetups(m.meetups);
        }
      } catch (err) {
        console.warn("Init error:", err);
      }
    }
    init();
  }, []);

  // 5-Tab Navigation Dispatcher
  const handleSelectMode = (mode: ActiveMode) => {
    if (mode === "settings") {
      setIsAuthModalOpen(true);
    } else {
      setActiveMode(mode);
    }
  };

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
      const res = await fetch("/api/meetups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Hyderabad Group Dinner",
          creatorName: "Siddharth",
          category: "restaurant",
          plannedAt: new Date(Date.now() + 86400000).toISOString(),
          budget: "moderate",
          transportMode: "car",
        }),
      });

      const data = await res.json();
      const meetup: Meetup = data.meetup;

      const participants = [
        { name: "Rahul", label: "Kukatpally", lat: 17.4947, lon: 78.3996 },
        { name: "Ananya", label: "Secunderabad", lat: 17.4399, lon: 78.4983 },
        { name: "Siddharth", label: "Mehdipatnam", lat: 17.3916, lon: 78.4398 },
        { name: "Vikram", label: "Dilsukhnagar", lat: 17.3688, lon: 78.5247 },
      ];

      for (const p of participants) {
        const memId = `mem-${p.name.toLowerCase()}`;
        await fetch(`/api/meetups/${meetup.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: memId, userName: p.name }),
        });

        await fetch(`/api/meetups/${meetup.id}/locations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId: memId,
            memberName: p.name,
            label: p.label,
            latitude: p.lat,
            longitude: p.lon,
          }),
        });
      }

      await fetch(`/api/meetups/${meetup.id}/matrix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rankingMode: "fairest" }),
      });

      const finalRes = await fetch(`/api/meetups/${meetup.id}`);
      const finalData = await finalRes.json();

      setActiveMeetup(finalData.meetup);
      setAllMeetups((prev) => [finalData.meetup, ...prev]);
      setActiveMode("active_meetup");
      setIsPlanModalOpen(false);
    } catch (e) {
      console.error("Preset scenario error:", e);
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row w-screen h-screen overflow-hidden bg-background">
      {/* 1. Main Navigation: Plan, My Meetups, Explore, Saved Places, Settings */}
      <MissionSidebar
        activeMode={activeMode}
        onSelectMode={handleSelectMode}
        meetupCount={allMeetups.length}
        savedCount={savedPlaces.length}
      />

      {/* 2. Main Geospatial Workspace */}
      <main className="relative flex-1 h-full overflow-hidden flex flex-col">
        <div className="relative flex-1 w-full h-full">
          <DynamicMapContainer
            onViewportChange={setViewport}
            selectedPlace={selectedPlace}
            activeRoute={activeRoute}
            multiRoutes={multiRoutes}
            communityReports={communityReports}
            participantLocations={activeMeetup?.locations || []}
            candidateVenues={activeMeetup?.venues || []}
            networkMode={networkModeActive}
            userLocation={userCoords}
            mapStyleType={mapStyleType}
            onSelectVenue={(v) => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo({
                  center: [v.longitude, v.latitude],
                  zoom: 15,
                });
              }
            }}
            onMapReady={(map) => {
              mapInstanceRef.current = map;
            }}
          />

          {/* Top Search Bar */}
          <div className="absolute top-3 left-3 right-3 md:left-6 md:right-auto md:w-96 z-20">
            <GlobalSearch
              onSelectPlace={(place) => {
                setSelectedPlace(place);
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

          {/* Floating Workspace Panels */}
          <div className="absolute top-20 left-3 md:left-6 z-20 flex flex-col gap-3 max-h-[calc(100vh-160px)]">
            {/* 1. Default First-Screen Hero: Plan, Join, Explore Nearby */}
            {activeMode === "plan" && !activeMeetup && (
              <HeroWelcomeCard
                onPlanMeetup={() => setIsPlanModalOpen(true)}
                onJoinMeetup={() => setIsJoinModalOpen(true)}
                onExploreNearby={() => setActiveMode("explore")}
                onFastTrackHyderabad={handleLoadHyderabadPreset}
              />
            )}

            {/* 2. Active Meetup Cockpit */}
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

            {/* 3. My Meetups Drawer */}
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

            {/* 4. Explore Nearby Venues Panel */}
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

            {/* 5. Saved Places Drawer */}
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

          {/* Layer Style Switcher (Google Streets, Satellite, Dark) */}
          <div className="absolute bottom-5 left-4 z-20">
            <StyleSwitcher
              currentStyle={mapStyleType}
              onSelectStyle={(s) => setMapStyleType(s)}
            />
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-5 right-4 z-20">
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

        {/* Status Bar */}
        <StatusBar
          center={viewport.center}
          zoom={viewport.zoom}
          pitch={viewport.pitch}
          bearing={viewport.bearing}
          networkMode={networkModeActive}
          providerStatus={providerStatus}
        />
      </main>

      {/* Plan Meetup Modal with Group Preferences */}
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

      {/* Join Meetup Modal */}
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

      {/* Settings & Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        providerStatus={providerStatus}
      />
    </div>
  );
}
