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
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [styleLoaded, setStyleLoaded] = useState(false);

  // 1. Initialize MapLibre instance (strictly browser-only, strictly once)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const { url } = getMapStyleUrl();

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: url,
      center: HYDERABAD_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: 35,
      bearing: -10,
      attributionControl: false, // Custom attribution rendered in StatusBar per specification
    });

    mapRef.current = map;

    const handleLoad = () => {
      setStyleLoaded(true);
      if (onMapReady) onMapReady(map);

      // Initialize GeoJSON sources
      // A) Route Source
      if (!map.getSource(MAP_SOURCES.ROUTE)) {
        map.addSource(MAP_SOURCES.ROUTE, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        // Outer glow casing
        map.addLayer({
          id: MAP_LAYERS.ROUTE_CASING,
          type: "line",
          source: MAP_SOURCES.ROUTE,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#71B9E8",
            "line-width": 8,
            "line-opacity": 0.4,
            "line-blur": 3,
          },
        });

        // Core route line
        map.addLayer({
          id: MAP_LAYERS.ROUTE_LINE,
          type: "line",
          source: MAP_SOURCES.ROUTE,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#75E6C2",
            "line-width": 4.5,
            "line-opacity": 0.95,
          },
        });
      }

      // B) Community Reports Source
      if (!map.getSource(MAP_SOURCES.COMMUNITY_REPORTS)) {
        map.addSource(MAP_SOURCES.COMMUNITY_REPORTS, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        // Pulsing circle marker
        map.addLayer({
          id: MAP_LAYERS.REPORTS_CIRCLES,
          type: "circle",
          source: MAP_SOURCES.COMMUNITY_REPORTS,
          paint: {
            "circle-radius": 7,
            "circle-color": [
              "match",
              ["get", "status"],
              "verified", "#71B9E8",
              "resolved", "#75E6C2",
              "#E8B86B", // default reported warning amber
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#080D13",
          },
        });
      }

      // C) Search Selection Marker Source
      if (!map.getSource(MAP_SOURCES.SEARCH_MARKER)) {
        map.addSource(MAP_SOURCES.SEARCH_MARKER, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        map.addLayer({
          id: MAP_LAYERS.SEARCH_MARKER,
          type: "circle",
          source: MAP_SOURCES.SEARCH_MARKER,
          paint: {
            "circle-radius": 9,
            "circle-color": "#75E6C2",
            "circle-stroke-width": 3,
            "circle-stroke-color": "#101821",
          },
        });
      }

      // D) User Location Source
      if (!map.getSource(MAP_SOURCES.USER_LOCATION)) {
        map.addSource(MAP_SOURCES.USER_LOCATION, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        map.addLayer({
          id: MAP_LAYERS.USER_LOCATION_PULSE,
          type: "circle",
          source: MAP_SOURCES.USER_LOCATION,
          paint: {
            "circle-radius": 14,
            "circle-color": "#71B9E8",
            "circle-opacity": 0.25,
          },
        });

        map.addLayer({
          id: MAP_LAYERS.USER_LOCATION_DOT,
          type: "circle",
          source: MAP_SOURCES.USER_LOCATION,
          paint: {
            "circle-radius": 6,
            "circle-color": "#71B9E8",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      }
    };

    map.on("load", handleLoad);

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

    // Click handler on map canvas
    map.on("click", (e) => {
      // Check if a community report circle was clicked
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

    // Cursor pointer on report hover
    map.on("mouseenter", MAP_LAYERS.REPORTS_CIRCLES, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", MAP_LAYERS.REPORTS_CIRCLES, () => {
      map.getCanvas().style.cursor = "";
    });

    // Resize observer for responsive map container
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []); // Run strictly once on mount

  // 2. Synchronize Active Route Layer
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

      // Fit map bounds to show complete calculated route
      const coords = activeRoute.geometry.coordinates;
      if (coords.length > 1) {
        const bounds = coords.reduce(
          (b, coord) => b.extend(coord as [number, number]),
          new maplibregl.LngLatBounds(coords[0], coords[0])
        );
        map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 1200 });
      }
    } else {
      source.setData({
        type: "FeatureCollection",
        features: [],
      });
    }
  }, [activeRoute, styleLoaded]);

  // 3. Synchronize Community Reports Markers
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

  // 4. Synchronize Selected Place Marker & FlyTo
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
        curve: 1.2,
        essential: true,
      });
    } else {
      source.setData({
        type: "FeatureCollection",
        features: [],
      });
    }
  }, [selectedPlace, styleLoaded]);

  // 5. Synchronize User Location Pulse Dot
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
      source.setData({
        type: "FeatureCollection",
        features: [],
      });
    }
  }, [userLocation, styleLoaded]);

  // 6. Synchronize Road-Network Intelligence Mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded) return;

    toggleRoadNetworkMode(map, networkMode);
  }, [networkMode, styleLoaded]);

  return (
    <div className="relative w-full h-full bg-[#080D13] overflow-hidden select-none">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
