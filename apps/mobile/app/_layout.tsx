import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { View, StyleSheet } from "react-native";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Handle deep links: georynth://meetup/:inviteCode or https://georynth.app/meetup/:inviteCode
    const handleUrl = (event: { url: string }) => {
      const parsed = Linking.parse(event.url);
      if (parsed.path && parsed.path.startsWith("meetup/")) {
        const inviteCode = parsed.path.split("/")[1];
        if (inviteCode) {
          router.push({
            pathname: "/join-modal",
            params: { code: inviteCode },
          } as any);
        }
      }
    };

    const sub = Linking.addEventListener("url", handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => sub.remove();
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#020617" },
          headerTintColor: "#f8fafc",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#020617" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="meetup/[id]"
          options={{
            title: "Meetup Cockpit",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="plan-modal"
          options={{
            presentation: "modal",
            title: "Plan a Meetup",
          }}
        />
        <Stack.Screen
          name="join-modal"
          options={{
            presentation: "modal",
            title: "Join Meetup",
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
});
