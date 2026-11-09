"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { 
  Coordinates, 
  RouteResult, 
  CommunityReport, 
  PlaceResult 
} from "@/types/geo";
import { 
  ParticipantLocation, 
  CandidateVenue 
} from "@/types/meetup";
import { 
  HYDERABAD_CENTER, 
  DEFAULT_ZOOM, 
  getMapStyleUrl, 
  MapStyleType,
  MAP_SOURCES, 
  MAP_LAYERS 
} from "@/lib/map/config";
import { toggleRoadNetworkMode } from "@/lib/map/roadNetworkStyle";

interface MapContainerProps {
  onViewportChange: (viewport: { center: Coordinates; zoom: number; pitch: number; bearing: number }) => void;
  onMapClick?: (coords: Coordinates) => void;
  onSelectReport?: (report: CommunityReport) => void;
  onSelectVenue?: (venue: CandidateVenue) => void;
  selectedVenueId?: string | null;
  selectedPlace?: PlaceResult | null;
  activeRoute?: RouteResult | null;
  multiRoutes?: RouteResult[];
  communityReports?: CommunityReport[];
  participantLocations?: ParticipantLocation[];
  candidateVenues?: CandidateVenue[];
  networkMode: boolean;
  userLocation?: Coordinates | null;
  onMapReady?: (map: maplibregl.Map) => void;
  mapStyleType?: MapStyleType;
}

export function MapContainer({
  onViewportChange,
  onMapClick,
  onSelectReport,
  onSelectVenue,
  selectedVenueId,
  selectedPlace,
  activeRoute,
  multiRoutes = [],
  communityReports = [],
  participantLocations = [],
  candidateVenues = [],
  networkMode,
  userLocation,
  onMapReady,
  mapStyleType = "streets",
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [styleLoaded, setStyleLoaded] = useState(false);

  // Setup interactive layers
  const setupLayers = useCallback((map: maplibregl.Map) => {
    // 1. Route Source & Layers
    if (!map.getSource(MAP_SOURCES.ROUTE)) {
      map.addSource(MAP_SOURCES.ROUTE, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: MAP_LAYERS.ROUTE_CASING,
        type: "line",
        source: MAP_SOURCES.ROUTE,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#2563EB",
          "line-width": 8,
          "line-opacity": 0.45,
          "line-blur": 2,
        },
      });

      map.addLayer({
        id: MAP_LAYERS.ROUTE_LINE,
        type: "line",
        source: MAP_SOURCES.ROUTE,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#0284C7",
          "line-width": 5,
          "line-opacity": 0.95,
        },
      });
    }

    // 2. Participant Locations Source & Layer (Green/Teal Pins)
    if (!map.getSource(MAP_SOURCES.PARTICIPANTS)) {
      map.addSource(MAP_SOURCES.PARTICIPANTS, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: MAP_LAYERS.PARTICIPANTS_PULSE,
        type: "circle",
        source: MAP_SOURCES.PARTICIPANTS,
        paint: {
          "circle-radius": 15,
          "circle-color": "#10B981",
          "circle-opacity": 0.25,
        },
      });

      map.addLayer({
        id: MAP_LAYERS.PARTICIPANTS_DOTS,
        type: "circle",
        source: MAP_SOURCES.PARTICIPANTS,
        paint: {
          "circle-radius": 8,
          "circle-color": "#059669",
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "participants-labels",
        type: "symbol",
        source: MAP_SOURCES.PARTICIPANTS,
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-offset": [0, 1.4],
          "text-anchor": "top",
          "text-optional": true,
        },
        paint: {
          "text-color": "#17211F",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        },
      });
    }

    // 3. Candidate Venues Source & Layer (Ranked Badges)
    if (!map.getSource(MAP_SOURCES.VENUES)) {
      map.addSource(MAP_SOURCES.VENUES, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: MAP_LAYERS.VENUES_CIRCLES,
        type: "circle",
        source: MAP_SOURCES.VENUES,
        paint: {
          "circle-radius": [
            "case",
            ["boolean", ["get", "isSelected"], false],
            14,
            ["==", ["get", "rank"], 1],
            12,
            10,
          ],
          "circle-color": [
            "case",
            ["boolean", ["get", "isSelected"], false],
            "#168B6D",
            ["==", ["get", "rank"], 1],
            "#059669",
            "#2563EB",
          ],
          "circle-stroke-width": [
            "case",
            ["boolean", ["get", "isSelected"], false],
            4,
            3,
          ],
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "venues-labels",
        type: "symbol",
        source: MAP_SOURCES.VENUES,
        layout: {
          "text-field": ["concat", "#", ["get", "rank"], " ", ["get", "name"]],
          "text-size": 12,
          "text-offset": [0, 1.4],
          "text-anchor": "top",
          "text-optional": true,
        },
        paint: {
          "text-color": "#17211F",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        },
      });
    }

    // 4. Community Reports Source & Layer
    if (!map.getSource(MAP_SOURCES.COMMUNITY_REPORTS)) {
      map.addSource(MAP_SOURCES.COMMUNITY_REPORTS, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: MAP_LAYERS.REPORTS_CIRCLES,
        type: "circle",
        source: MAP_SOURCES.COMMUNITY_REPORTS,
        paint: {
          "circle-radius": 7,
          "circle-color": [
            "match",
            ["get", "status"],
            "verified", "#0284C7",
            "resolved", "#10B981",
            "#F59E0B",
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
    }

    // 5. Search Selection Marker Source
    if (!map.getSource(MAP_SOURCES.SEARCH_MARKER)) {
      map.addSource(MAP_SOURCES.SEARCH_MARKER, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: MAP_LAYERS.SEARCH_MARKER,
        type: "circle",
        source: MAP_SOURCES.SEARCH_MARKER,
        paint: {
          "circle-radius": 9,
          "circle-color": "#EA4335",
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });
    }

    // 6. User Location Source
    if (!map.getSource(MAP_SOURCES.USER_LOCATION)) {
      map.addSource(MAP_SOURCES.USER_LOCATION, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: MAP_LAYERS.USER_LOCATION_PULSE,
        type: "circle",
        source: MAP_SOURCES.USER_LOCATION,
        paint: {
          "circle-radius": 16,
          "circle-color": "#3B82F6",
          "circle-opacity": 0.25,
        },
      });

      map.addLayer({
        id: MAP_LAYERS.USER_LOCATION_DOT,
        type: "circle",
        source: MAP_SOURCES.USER_LOCATION,
        paint: {
          "circle-radius": 7,
          "circle-color": "#2563EB",
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
        },
      });
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const { url } = getMapStyleUrl(mapStyleType);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: url,
      center: HYDERABAD_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("error", (e) => {
      if (e?.error?.status === 403 || (e?.error?.message && e.error.message.includes("403"))) {
        map.setStyle("https://tiles.openfreemap.org/styles/liberty");
      }
    });

    const handleLoad = () => {
      setStyleLoaded(true);
      setupLayers(map);
      map.resize();
      if (onMapReady) onMapReady(map);
    };

    map.on("load", handleLoad);
    map.on("style.load", () => {
      setupLayers(map);
      setStyleLoaded(true);
      map.resize();
    });

    const updateViewport = () => {
      const c = map.getCenter();
      onViewportChange({
        center: { latitude: c.lat, longitude: c.lng },
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      });
    };

    map.on("move", updateViewport);
    map.on("zoom", updateViewport);
    map.on("pitch", updateViewport);
    map.on("rotate", updateViewport);

    // Click handler for candidate venues & community reports
    map.on("click", (e) => {
      // Check candidate venues first
      const venueFeatures = map.queryRenderedFeatures(e.point, {
        layers: [MAP_LAYERS.VENUES_CIRCLES, "venues-labels"],
      });

      if (venueFeatures.length > 0 && onSelectVenue) {
        const vId = (venueFeatures[0].properties as any)?.venueId;
        const matched = candidateVenues.find((v) => v.venueId === vId);
        if (matched) {
          onSelectVenue(matched);
          return;
        }
      }

      // Check community reports
      const reportFeatures = map.queryRenderedFeatures(e.point, {
        layers: [MAP_LAYERS.REPORTS_CIRCLES],
      });

      if (reportFeatures.length > 0 && onSelectReport) {
        const rId = (reportFeatures[0].properties as any)?.id;
        const matched = communityReports.find((r) => r.id === rId);
        if (matched) {
          onSelectReport(matched);
          return;
        }
      }

      if (onMapClick) {
        onMapClick({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
      }
    });

    map.on("mouseenter", MAP_LAYERS.VENUES_CIRCLES, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", MAP_LAYERS.VENUES_CIRCLES, () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("mouseenter", "venues-labels", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "venues-labels", () => {
      map.getCanvas().style.cursor = "";
    });

    const resizeTimer = setTimeout(() => {
      map.resize();
    }, 150);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Style
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const { url } = getMapStyleUrl(mapStyleType);
    setStyleLoaded(false);
    map.setStyle(url);
  }, [mapStyleType]);

  // Synchronize Active & Multi Routes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded) return;

    const source = map.getSource(MAP_SOURCES.ROUTE) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    const allRoutes: RouteResult[] = [];
    if (activeRoute) allRoutes.push(activeRoute);
    if (multiRoutes.length > 0) allRoutes.push(...multiRoutes);

    if (allRoutes.length > 0) {
      const features = allRoutes.map((r, i) => ({
        type: "Feature" as const,
        geometry: r.geometry,
        properties: {
          index: i,
          distance: r.distanceMeters,
          duration: r.durationMilliseconds,
        },
      }));

      source.setData({
        type: "FeatureCollection",
        features,
      });

      // Fit bounds to cover all routes
      const allCoords = allRoutes.flatMap((r) => r.geometry.coordinates);
      if (allCoords.length > 1) {
        const bounds = allCoords.reduce(
          (b, coord) => b.extend(coord as [number, number]),
          new maplibregl.LngLatBounds(allCoords[0], allCoords[0])
        );
        map.fitBounds(bounds, { padding: 90, maxZoom: 15, duration: 1200 });
      }
    } else {
      source.setData({ type: "FeatureCollection", features: [] });
    }
  }, [activeRoute, multiRoutes, styleLoaded]);

  // Synchronize Participant Locations
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded) return;

    const source = map.getSource(MAP_SOURCES.PARTICIPANTS) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    source.setData({
      type: "FeatureCollection",
      features: participantLocations.map((p) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [p.longitude, p.latitude],
        },
        properties: {
          memberId: p.memberId,
          name: p.memberName,
          label: p.label,
        },
      })),
    });

    if (participantLocations.length > 1 && multiRoutes.length === 0) {
      const bounds = participantLocations.reduce(
        (b, p) => b.extend([p.longitude, p.latitude]),
        new maplibregl.LngLatBounds([participantLocations[0].longitude, participantLocations[0].latitude], [participantLocations[0].longitude, participantLocations[0].latitude])
      );
      map.fitBounds(bounds, { padding: 90, maxZoom: 14, duration: 1000 });
    }
  }, [participantLocations, styleLoaded, multiRoutes]);

  // Synchronize Candidate Venues
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded) return;

    const source = map.getSource(MAP_SOURCES.VENUES) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    source.setData({
      type: "FeatureCollection",
      features: candidateVenues.map((v, i) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [v.longitude, v.latitude],
        },
        properties: {
          venueId: v.venueId,
          name: v.name,
          category: v.category,
          avgDurationSec: v.avgDurationSec,
          rank: i + 1,
          isSelected: Boolean(selectedVenueId && (v.venueId === selectedVenueId || v.id === selectedVenueId)),
        },
      })),
    });
  }, [candidateVenues, styleLoaded, selectedVenueId]);

  // Synchronize Selected Place Marker & FlyTo
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded) return;

    const source = map.getSource(MAP_SOURCES.SEARCH_MARKER) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    if (selectedPlace) {
      source.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [selectedPlace.longitude, selectedPlace.latitude],
            },
            properties: { name: selectedPlace.name },
          },
        ],
      });

      map.flyTo({
        center: [selectedPlace.longitude, selectedPlace.latitude],
        zoom: 14.5,
        speed: 1.3,
      });
    } else {
      source.setData({ type: "FeatureCollection", features: [] });
    }
  }, [selectedPlace, styleLoaded]);

  // Synchronize User Location Pulse Dot
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded) return;

    const source = map.getSource(MAP_SOURCES.USER_LOCATION) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    if (userLocation) {
      source.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [userLocation.longitude, userLocation.latitude],
            },
            properties: {},
          },
        ],
      });

      map.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 14,
        speed: 1.2,
      });
    } else {
      source.setData({ type: "FeatureCollection", features: [] });
    }
  }, [userLocation, styleLoaded]);

  // Road Network Intelligence Mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded) return;
    toggleRoadNetworkMode(map, networkMode);
  }, [networkMode, styleLoaded]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-[#E5E3DF] overflow-hidden select-none">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
