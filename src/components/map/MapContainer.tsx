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
  selectedPlace?: PlaceResult | null;
  activeRoute?: RouteResult | null;
  communityReports?: CommunityReport[];
  networkMode: boolean;
  userLocation?: Coordinates | null;
  onMapReady?: (map: maplibregl.Map) => void;
  mapStyleType?: MapStyleType;
}

export function MapContainer({
  onViewportChange,
  onMapClick,
  onSelectReport,
  selectedPlace,
  activeRoute,
  communityReports = [],
  networkMode,
  userLocation,
  onMapReady,
  mapStyleType = "streets",
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [styleLoaded, setStyleLoaded] = useState(false);

  // Helper to attach all interactive sources and layers
  const setupLayers = useCallback((map: maplibregl.Map) => {
    // A) Route Source
    if (!map.getSource(MAP_SOURCES.ROUTE)) {
      map.addSource(MAP_SOURCES.ROUTE, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Outer glow casing
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

      // Core route line (Google navigation blue / vibrant cyan)
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

    // B) Community Reports Source
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
          "circle-radius": 8,
          "circle-color": [
            "match",
            ["get", "status"],
            "verified", "#0284C7",
            "resolved", "#10B981",
            "#F59E0B",
          ],
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
        },
      });
    }

    // C) Search Selection Marker Source
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
          "circle-color": "#EA4335", // Google red location pin
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });
    }

    // D) User Location Source
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

  // 1. Initialize MapLibre instance
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

    // Safety fallback: if style fails to load, gracefully switch to open Google-style Liberty tiles
    map.on("error", (e) => {
      if (e?.error?.status === 403 || (e?.error?.message && e.error.message.includes("403"))) {
        console.warn("MapTiler key unauthorized, falling back to open Google-style Liberty vector tiles.");
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

    // Viewport telemetry updates
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

    // Map click handler
    map.on("click", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [MAP_LAYERS.REPORTS_CIRCLES],
      });

      if (features.length > 0 && onSelectReport) {
        const featureProps = features[0].properties as any;
        if (featureProps && featureProps.id) {
          const report = communityReports.find((r) => r.id === featureProps.id);
          if (report) {
            onSelectReport(report);
            return;
          }
        }
      }

      if (onMapClick) {
        onMapClick({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
      }
    });

    map.on("mouseenter", MAP_LAYERS.REPORTS_CIRCLES, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", MAP_LAYERS.REPORTS_CIRCLES, () => {
      map.getCanvas().style.cursor = "";
    });

    // Immediate and delayed resize triggers to guarantee canvas dimension calibration
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

  // 2. Handle map style switching (Streets, Hybrid, Dark)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const { url } = getMapStyleUrl(mapStyleType);
    setStyleLoaded(false);
    map.setStyle(url);
  }, [mapStyleType]);

  // 3. Synchronize Active Route Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded) return;

    const source = map.getSource(MAP_SOURCES.ROUTE) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    if (activeRoute && activeRoute.geometry) {
      source.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: activeRoute.geometry,
            properties: {
              distance: activeRoute.distanceMeters,
              duration: activeRoute.durationMilliseconds,
            },
          },
        ],
      });

      const coords = activeRoute.geometry.coordinates;
      if (coords.length > 1) {
        const bounds = coords.reduce(
          (b, coord) => b.extend(coord as [number, number]),
          new maplibregl.LngLatBounds(coords[0], coords[0])
        );
        map.fitBounds(bounds, { padding: 90, maxZoom: 15, duration: 1200 });
      }
    } else {
      source.setData({ type: "FeatureCollection", features: [] });
    }
  }, [activeRoute, styleLoaded]);

  // 4. Synchronize Community Reports Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded) return;

    const source = map.getSource(MAP_SOURCES.COMMUNITY_REPORTS) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    source.setData({
      type: "FeatureCollection",
      features: communityReports.map((r) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [r.longitude, r.latitude],
        },
        properties: {
          id: r.id,
          category: r.category,
          description: r.description,
          status: r.status,
        },
      })),
    });
  }, [communityReports, styleLoaded]);

  // 5. Synchronize Selected Place Marker & FlyTo
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
            properties: {
              name: selectedPlace.name,
            },
          },
        ],
      });

      map.flyTo({
        center: [selectedPlace.longitude, selectedPlace.latitude],
        zoom: 14.5,
        speed: 1.3,
        essential: true,
      });
    } else {
      source.setData({ type: "FeatureCollection", features: [] });
    }
  }, [selectedPlace, styleLoaded]);

  // 6. Synchronize User Location Pulse Dot
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

  // 7. Synchronize Road-Network Intelligence Mode
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
