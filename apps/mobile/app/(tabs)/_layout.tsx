import React from "react";
import { Tabs } from "expo-router";
import { Text, StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#020617",
          borderTopColor: "rgba(51, 65, 85, 0.6)",
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: "#38bdf8",
        tabBarInactiveTintColor: "#64748b",
        headerStyle: {
          backgroundColor: "#020617",
          borderBottomColor: "rgba(51, 65, 85, 0.4)",
        },
        headerTintColor: "#f8fafc",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Plan",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🧭</Text>,
        }}
      />
      <Tabs.Screen
        name="my-meetups"
        options={{
          title: "My Meetups",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🗺️</Text>,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🔖</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
