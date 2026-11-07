import React, { useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { MOBILE_CONFIG } from "../lib/config";
import { CandidateVenue, ParticipantLocation } from "@georynth/domain";

// Initialize MapLibre
MapLibreGL.setAccessToken(null);

interface NativeMapProps {
  styleUrl?: string;
  center?: [number, number]; // [lng, lat]
  zoomLevel?: number;
  participants?: ParticipantLocation[];
  venues?: CandidateVenue[];
  selectedVenueId?: string;
  onSelectVenue?: (venue: CandidateVenue) => void;
  routeGeoJson?: any;
}

export function NativeMap({
  styleUrl = MOBILE_CONFIG.MAP_STYLES.STREETS,
  center = MOBILE_CONFIG.DEFAULT_CENTER,
  zoomLevel = MOBILE_CONFIG.DEFAULT_ZOOM,
  participants = [],
  venues = [],
  selectedVenueId,
  onSelectVenue,
  routeGeoJson,
}: NativeMapProps) {
  const cameraRef = useRef<MapLibreGL.Camera>(null);

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        mapStyle={styleUrl}
        logoEnabled={false}
        attributionPosition={{ bottom: 8, right: 8 }}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          centerCoordinate={center}
          zoomLevel={zoomLevel}
          animationMode="flyTo"
          animationDuration={1500}
        />

        {/* Confirmed Routes Layer */}
        {routeGeoJson && (
          <MapLibreGL.ShapeSource id="routeSource" shape={routeGeoJson}>
            <MapLibreGL.LineLayer
              id="routeLine"
              style={{
                lineColor: "#10b981",
                lineWidth: 4,
                lineCap: "round",
                lineJoin: "round",
                lineOpacity: 0.85,
              }}
            />
          </MapLibreGL.ShapeSource>
        )}

        {/* Participant Origin Markers */}
        {participants.map((p, idx) => (
          <MapLibreGL.PointAnnotation
            key={`participant-${p.id || idx}`}
            id={`participant-${p.id || idx}`}
            coordinate={[p.longitude, p.latitude]}
          >
            <View style={styles.participantMarker}>
              <View style={styles.participantAvatar}>
                <Text style={styles.participantInitial}>
                  {(p.memberName || p.label || "U")[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.participantBadge}>
                <Text style={styles.participantText} numberOfLines={1}>
                  {p.memberName || p.label}
                </Text>
              </View>
            </View>
          </MapLibreGL.PointAnnotation>
        ))}

        {/* Candidate Venue Markers */}
        {venues.map((v) => {
          const isSelected = v.id === selectedVenueId || v.venueId === selectedVenueId;
          return (
            <MapLibreGL.PointAnnotation
              key={`venue-${v.id}`}
              id={`venue-${v.id}`}
              coordinate={[v.longitude, v.latitude]}
              onSelected={() => onSelectVenue && onSelectVenue(v)}
            >
              <View style={[styles.venueMarker, isSelected && styles.venueMarkerSelected]}>
                <Text style={styles.venueMarkerIcon}>📍</Text>
                {isSelected && (
                  <View style={styles.venueBubble}>
                    <Text style={styles.venueBubbleTitle} numberOfLines={1}>{v.name}</Text>
                    <Text style={styles.venueBubbleSubtitle}>
                      ~{Math.round(v.avgDurationSec / 60)} min avg
                    </Text>
                  </View>
                )}
              </View>
            </MapLibreGL.PointAnnotation>
          );
        })}
      </MapLibreGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  map: {
    flex: 1,
  },
  participantMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#06b6d4",
    borderWidth: 2,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  participantInitial: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  participantBadge: {
    marginTop: 2,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.3)",
  },
  participantText: {
    color: "#f8fafc",
    fontSize: 10,
    fontWeight: "600",
  },
  venueMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  venueMarkerSelected: {
    transform: [{ scale: 1.2 }],
  },
  venueMarkerIcon: {
    fontSize: 28,
  },
  venueBubble: {
    position: "absolute",
    bottom: 34,
    backgroundColor: "#0f172a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#10b981",
    alignItems: "center",
    minWidth: 90,
  },
  venueBubbleTitle: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  venueBubbleSubtitle: {
    color: "#10b981",
    fontSize: 9,
    fontWeight: "600",
  },
});
