import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";

import { theme } from "@/constants/theme";
import { StyleSheet } from "react-native";

const { colors } = theme;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.focus,
        tabBarInactiveTintColor: colors.tabInactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          position: "absolute",
          justifyContent: "center",
          flexDirection: "row",
          alignItems: "center",
          zIndex: 999,
          bottom: 0,
          left: 0,
          right: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Focus",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "clock",
                android: "clock_arrow_up",
                web: "clock_arrow_up",
              }}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "calendar",
                android: "calendar_check",
                web: "calendar_check",
              }}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="my-goal"
        options={{
          title: "My Goal",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "target",
                android: "target",
                web: "target",
              }}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "gearshape",
                android: "mobile_gear",
                web: "mobile_gear",
              }}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
    </Tabs>
  );
}
