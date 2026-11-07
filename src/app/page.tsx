"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { HYDERABAD_CENTER, DEFAULT_ZOOM, MapStyleType } from "@/lib/map/config";
import { useGeolocation } from "@/hooks/useGeolocation";
import { MissionSidebar } from "@/components/layout/MissionSidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { DirectionsPanel } from "@/components/routing/DirectionsPanel";
import { ReportIssueModal } from "@/components/reports/ReportIssueModal";
import { ReportDetailsPanel } from "@/components/reports/ReportDetailsPanel";
import { SavedPlacesPanel } from "@/components/saved/SavedPlacesPanel";
import { NetworkLegend } from "@/components/network/NetworkLegend";
import { MapControls } from "@/components/map/MapControls";
import { StyleSwitcher } from "@/components/map/StyleSwitcher";
import { AuthModal } from "@/components/auth/AuthModal";
import type { Map as MapLibreMap } from "maplibre-gl";

// Dynamically import MapContainer to prevent SSR evaluation of browser WebGL MapLibre
const DynamicMapContainer = dynamic(
  () => import("@/components/map/MapContainer").then((mod) => mod.MapContainer),
  { ssr: false }
);

export default function GeorynthMissionApp() {
  // Navigation & panel states
  const [activeMode, setActiveMode] = useState<ActiveMode>("explore");
  const [networkModeActive, setNetworkModeActive] = useState(false);
  const [mapStyleType, setMapStyleType] = useState<MapStyleType>("streets");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);
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
    supabaseConfigured: false,
  });

  // Geolocation hook
  const {
    coordinates: userCoords,
    status: geoStatus,
    requestLocation,
    clearLocation,
  } = useGeolocation();

  // Map instance ref for programmatic control
  const mapInstanceRef = useRef<MapLibreMap | null>(null);

  // Fetch provider status & initial community reports
  useEffect(() => {
    async function initTelemetry() {
      try {
        const [statusRes, reportsRes] = await Promise.all([
          fetch("/api/status").catch(() => null),
          fetch("/api/reports").catch(() => null),
        ]);

        if (statusRes && statusRes.ok) {
          const sData = await statusRes.json();
          setProviderStatus({
            maptilerConfigured: sData.maptilerConfigured,
            graphhopperConfigured: sData.graphhopperConfigured,
            supabaseConfigured: sData.supabaseConfigured,
          });
        }

        if (reportsRes && reportsRes.ok) {
          const rData = await reportsRes.json();
          if (rData.reports) {
            setCommunityReports(rData.reports);
          }
        }
      } catch (err) {
        console.warn("Telemetry init error:", err);
      }
    }

    initTelemetry();
  }, []);

  // Mode Selection Dispatcher
  const handleSelectMode = (mode: ActiveMode) => {
    if (mode === "network") {
      setNetworkModeActive((prev) => !prev);
      setActiveMode("network");
    } else if (mode === "reports") {
      setIsReportModalOpen(true);
      setActiveMode("reports");
    } else if (mode === "account") {
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

  // Save place handler
  const handleSavePlace = (place: PlaceResult) => {
    const newPlace: SavedPlace = {
      id: `saved-${Date.now()}`,
      userId: "guest-user",
      label: place.name,
      placeName: place.fullAddress,
      latitude: place.latitude,
      longitude: place.longitude,
      createdAt: new Date().toISOString(),
    };
    setSavedPlaces((prev) => [newPlace, ...prev]);
    setActiveMode("saved");
  };

  const handleDeleteSavedPlace = (id: string) => {
    setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSelectSavedPlace = (place: SavedPlace) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [place.longitude, place.latitude],
        zoom: 14.5,
      });
    }
  };

  const handleMapClick = (coords: Coordinates) => {
    setSelectedReport(null);
  };

  return (
    <div className="relative flex flex-col md:flex-row w-screen h-screen overflow-hidden bg-background">
      {/* 1. Mission Sidebar */}
      <MissionSidebar
        activeMode={activeMode}
        onSelectMode={handleSelectMode}
        reportCount={communityReports.length}
        savedCount={savedPlaces.length}
        networkModeActive={networkModeActive}
      />

      {/* 2. Main Map Workspace */}
      <main className="relative flex-1 h-full overflow-hidden flex flex-col">
        {/* Interactive Map Engine */}
        <div className="relative flex-1 w-full h-full">
          <DynamicMapContainer
            onViewportChange={setViewport}
            onMapClick={handleMapClick}
            onSelectReport={(r) => setSelectedReport(r)}
            selectedPlace={selectedPlace}
            activeRoute={activeRoute}
            communityReports={communityReports}
            networkMode={networkModeActive}
            userLocation={userCoords}
            mapStyleType={mapStyleType}
            onMapReady={(map) => {
              mapInstanceRef.current = map;
            }}
          />

          {/* Floating Top Controls: Global Search */}
          <div className="absolute top-3 left-3 right-3 md:left-6 md:right-auto md:w-96 z-20">
            <GlobalSearch
              onSelectPlace={(place) => {
                setSelectedPlace(place);
                setSelectedReport(null);
              }}
              onDirectionsTo={(place) => {
                setSelectedPlace(place);
                setActiveMode("directions");
              }}
              onSavePlace={handleSavePlace}
              currentCenterLonLat={[viewport.center.longitude, viewport.center.latitude]}
            />
          </div>

          {/* Floating Contextual Panels (Directions, Saved, Report Details, Network) */}
          <div className="absolute top-20 left-3 md:left-6 z-20 flex flex-col gap-3 max-h-[calc(100vh-160px)] overflow-y-auto">
            {/* Directions Panel */}
            {activeMode === "directions" && (
              <DirectionsPanel
                onRouteCalculated={(route) => setActiveRoute(route)}
                onClose={() => setActiveMode("explore")}
                initialDestination={
                  selectedPlace
                    ? {
                        name: selectedPlace.name,
                        coordinates: {
                          latitude: selectedPlace.latitude,
                          longitude: selectedPlace.longitude,
                        },
                      }
                    : null
                }
                userLocation={userCoords}
                onRequestUserLocation={requestLocation}
              />
            )}

            {/* Saved Places Panel */}
            {activeMode === "saved" && (
              <SavedPlacesPanel
                savedPlaces={savedPlaces}
                onSelectPlace={handleSelectSavedPlace}
                onDeletePlace={handleDeleteSavedPlace}
                onClose={() => setActiveMode("explore")}
              />
            )}

            {/* Selected Incident Report Details */}
            {selectedReport && (
              <ReportDetailsPanel
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
                onNavigateTo={(rep) => {
                  setSelectedPlace({
                    id: rep.id,
                    name: `Incident: ${rep.category}`,
                    fullAddress: rep.description,
                    latitude: rep.latitude,
                    longitude: rep.longitude,
                    provider: "maptiler",
                  });
                  setActiveMode("directions");
                  setSelectedReport(null);
                }}
              />
            )}

            {/* Road Network Legend */}
            {networkModeActive && (
              <NetworkLegend
                active={networkModeActive}
                onToggle={() => setNetworkModeActive(!networkModeActive)}
              />
            )}
          </div>

          {/* Floating Google Map Style Switcher (Bottom-Left) */}
          <div className="absolute bottom-5 left-4 z-20">
            <StyleSwitcher
              currentStyle={mapStyleType}
              onSelectStyle={(s) => setMapStyleType(s)}
            />
          </div>

          {/* Floating Map Controls (Zoom, Reset, Compass, Locate) */}
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

        {/* 3. Status Bar Telemetry */}
        <StatusBar
          center={viewport.center}
          zoom={viewport.zoom}
          pitch={viewport.pitch}
          bearing={viewport.bearing}
          networkMode={networkModeActive}
          providerStatus={providerStatus}
        />
      </main>

      {/* Community Report Modal */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportCreated={(newRep) => {
          setCommunityReports((prev) => [newRep, ...prev]);
        }}
        defaultCoordinates={viewport.center}
        userLocation={userCoords}
      />

      {/* Auth & Mission Status Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        providerStatus={providerStatus}
      />
    </div>
  );
}
