import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { RankingMode } from "@georynth/domain";

interface RankingModeSelectorProps {
  currentMode: RankingMode;
  onSelectMode: (mode: RankingMode) => void;
}

export function RankingModeSelector({
  currentMode,
  onSelectMode,
}: RankingModeSelectorProps) {
  const modes: { id: RankingMode; label: string; icon: string }[] = [
    { id: "fairest", label: "Fairest", icon: "⚖️" },
    { id: "quickest", label: "Quickest", icon: "⚡" },
    { id: "best_match", label: "Best Match", icon: "⭐" },
  ];

  return (
    <View style={styles.container}>
      {modes.map((m) => {
        const isActive = currentMode === m.id;
        return (
          <TouchableOpacity
            key={m.id}
            onPress={() => onSelectMode(m.id)}
            style={[styles.button, isActive && styles.buttonActive]}
          >
            <Text style={styles.buttonIcon}>{m.icon}</Text>
            <Text style={[styles.buttonLabel, isActive && styles.buttonLabelActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    padding: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.7)",
    gap: 4,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  buttonActive: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.4)",
  },
  buttonIcon: {
    fontSize: 14,
  },
  buttonLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  buttonLabelActive: {
    color: "#38bdf8",
    fontWeight: "700",
  },
});
