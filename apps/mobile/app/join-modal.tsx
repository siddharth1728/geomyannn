import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { requestForegroundLocation } from "../lib/location";

const hyderabadPresets = [
  { label: "Kukatpally", lat: 17.4947, lng: 78.3996 },
  { label: "Secunderabad", lat: 17.4399, lng: 78.4983 },
  { label: "Mehdipatnam", lat: 17.3916, lng: 78.4414 },
  { label: "Dilsukhnagar", lat: 17.3688, lng: 78.5247 },
  { label: "Banjara Hills", lat: 17.4156, lng: 78.4357 },
  { label: "Gachibowli", lat: 17.4401, lng: 78.3489 },
];

export default function JoinModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const [inviteCode, setInviteCode] = useState(params.code || "");
  const [name, setName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>("Kukatpally");
  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleUseGPS = async () => {
    setIsLocating(true);
    const res = await requestForegroundLocation();
    setIsLocating(false);

    if (res.error) {
      Alert.alert("Location Notice", res.error);
    } else if (res.coordinates) {
      setCustomCoords({
        lat: res.coordinates.latitude,
        lng: res.coordinates.longitude,
      });
      setSelectedPreset(null);
      Alert.alert("Location Detected", "Using your current voluntary GPS position.");
    }
  };

  const handleJoin = () => {
    if (!inviteCode.trim()) {
      Alert.alert("Invite Code Missing", "Please enter the 6-character meetup invite code.");
      return;
    }

    router.replace({
      pathname: "/meetup/[id]",
      params: { id: "hyd-demo-1" },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Join a Meetup</Text>
      <Text style={styles.subheading}>
        Enter the invite code and choose your voluntary starting origin.
      </Text>

      {/* Code Input */}
      <Text style={styles.fieldLabel}>INVITE CODE</Text>
      <TextInput
        style={[styles.input, styles.codeInput]}
        placeholder="e.g. HYD789"
        placeholderTextColor="#64748b"
        autoCapitalize="characters"
        maxLength={8}
        value={inviteCode}
        onChangeText={setInviteCode}
      />

      {/* Your Name */}
      <Text style={styles.fieldLabel}>YOUR DISPLAY NAME</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Aarav / Diya"
        placeholderTextColor="#64748b"
        value={name}
        onChangeText={setName}
      />

      {/* Origin Selection */}
      <Text style={styles.fieldLabel}>YOUR STARTING ORIGIN</Text>
      <TouchableOpacity
        onPress={handleUseGPS}
        disabled={isLocating}
        style={styles.gpsButton}
      >
        {isLocating ? (
          <ActivityIndicator color="#38bdf8" />
        ) : (
          <Text style={styles.gpsButtonText}>📍 Use Current Device Location</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.orText}>— OR SELECT HYDERABAD AREA —</Text>

      <View style={styles.presetGrid}>
        {hyderabadPresets.map((p) => {
          const isSelected = selectedPreset === p.label;
          return (
            <TouchableOpacity
              key={p.label}
              onPress={() => {
                setSelectedPreset(p.label);
                setCustomCoords(null);
              }}
              style={[styles.presetChip, isSelected && styles.presetChipActive]}
            >
              <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Privacy note */}
      <View style={styles.privacyNote}>
        <Text style={styles.privacyText}>
          🔒 Privacy Notice: Your starting origin is only visible to confirmed members of this meetup and automatically expires when the meetup closes.
        </Text>
      </View>

      {/* Join Button */}
      <TouchableOpacity onPress={handleJoin} style={styles.joinButton}>
        <Text style={styles.joinButtonText}>Join Meetup & Drop Pin →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
  },
  subheading: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  },
  fieldLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.7)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#f8fafc",
    fontSize: 15,
  },
  codeInput: {
    letterSpacing: 3,
    fontSize: 18,
    fontWeight: "700",
    color: "#38bdf8",
  },
  gpsButton: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#0284c7",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  gpsButtonText: {
    color: "#38bdf8",
    fontWeight: "700",
    fontSize: 14,
  },
  orText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 14,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetChip: {
    width: "48%",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.7)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  presetChipActive: {
    borderColor: "#0284c7",
    backgroundColor: "rgba(2, 132, 199, 0.15)",
  },
  presetText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  presetTextActive: {
    color: "#38bdf8",
    fontWeight: "700",
  },
  privacyNote: {
    backgroundColor: "rgba(6, 182, 212, 0.08)",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.2)",
  },
  privacyText: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 16,
  },
  joinButton: {
    backgroundColor: "#0284c7",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  joinButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
