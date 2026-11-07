import React, { useRef } from "react";
import { StyleSheet, View, Text, Platform, TouchableOpacity } from "react-native";
import { MOBILE_CONFIG } from "../lib/config";
import { CandidateVenue, ParticipantLocation } from "@georynth/domain";

// Only import native MapLibre module on iOS/Android
let MapLibreGL: any = null;
if (Platform.OS !== "web") {
  try {
    MapLibreGL = require("@maplibre/maplibre-react-native").default;
    if (MapLibreGL && MapLibreGL.setAccessToken) {
      MapLibreGL.setAccessToken(null);
    }
  } catch (e) {
    console.warn("MapLibre native module unavailable, using mobile fallback view.");
  }
}

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
  const cameraRef = useRef<any>(null);

  // If running in Web browser or native module isn't loaded yet
  if (Platform.OS === "web" || !MapLibreGL) {
    return (
      <View style={styles.webFallbackContainer}>
        {/* Background Grid Pattern */}
        <View style={styles.webGridOverlay}>
          <Text style={styles.webCanvasTitle}>GEOSPATIAL MISSION CANVAS</Text>
          <Text style={styles.webCanvasCoords}>
            CENTER: {center[1].toFixed(4)}° N, {center[0].toFixed(4)}° E • ZOOM {zoomLevel}
          </Text>
        </View>

        {/* Participant Nodes */}
        <View style={styles.webParticipantsLayer}>
          {participants.map((p, idx) => (
            <View key={p.id || idx} style={styles.webParticipantItem}>
              <View style={styles.webAvatar}>
                <Text style={styles.participantInitial}>
                  {(p.memberName || p.label || "U")[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.webParticipantName}>{p.memberName || p.label}</Text>
              <Text style={styles.webParticipantLocation}>({p.label})</Text>
            </View>
          ))}
        </View>

        {/* Venue Nodes */}
        <View style={styles.webVenuesLayer}>
          {venues.map((v) => {
            const isSelected = v.id === selectedVenueId || v.venueId === selectedVenueId;
            return (
              <TouchableOpacity
                key={v.id}
                onPress={() => onSelectVenue && onSelectVenue(v)}
                style={[styles.webVenueBadge, isSelected && styles.webVenueBadgeSelected]}
              >
                <Text style={styles.webVenueIcon}>📍</Text>
                <View>
                  <Text style={styles.webVenueName}>{v.name}</Text>
                  <Text style={styles.webVenueTime}>~{Math.round(v.avgDurationSec / 60)} min avg</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Status Bar */}
        <View style={styles.webStatusBar}>
          <Text style={styles.webStatusText}>
            {Platform.OS === "web"
              ? "🌐 Web Preview Mode (Native MapLibre GL compiles on iOS/Android device)"
              : "🗺️ Vector Canvas Active"}
          </Text>
        </View>
      </View>
    );
  }

  // Native iOS / Android MapLibre GL
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
  webFallbackContainer: {
    flex: 1,
    backgroundColor: "#070d19",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    padding: 14,
    justifyContent: "space-between",
  },
  webGridOverlay: {
    marginBottom: 8,
  },
  webCanvasTitle: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  webCanvasCoords: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 2,
    fontFamily: "monospace",
  },
  webParticipantsLayer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 6,
  },
  webParticipantItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.4)",
    gap: 6,
  },
  webAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#0284c7",
    alignItems: "center",
    justifyContent: "center",
  },
  webParticipantName: {
    color: "#f8fafc",
    fontSize: 11,
    fontWeight: "600",
  },
  webParticipantLocation: {
    color: "#38bdf8",
    fontSize: 10,
  },
  webVenuesLayer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 6,
  },
  webVenueBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.8)",
    gap: 6,
  },
  webVenueBadgeSelected: {
    borderColor: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  webVenueIcon: {
    fontSize: 16,
  },
  webVenueName: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "700",
  },
  webVenueTime: {
    color: "#10b981",
    fontSize: 10,
  },
  webStatusBar: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(51, 65, 85, 0.4)",
  },
  webStatusText: {
    color: "#94a3b8",
    fontSize: 10,
    fontStyle: "italic",
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
