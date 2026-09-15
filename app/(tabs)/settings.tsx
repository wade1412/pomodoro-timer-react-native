import ScreenHeader from "@/components/ui/ScreenHeader";
import SettingsTitle from "@/components/ui/SettingsTitle";
import { theme } from "@/constants/theme";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, typography, spacing, radius } = theme;

export default function SettingsScreen() {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.mainContainer,
          { paddingBottom: tabBarHeight + spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentColumn}>
          <ScreenHeader title="Settings" subtitle="Customize your experience" />

          <View style={styles.selectionContainer}>
            <SettingsTitle
              title="Focus Duration"
              subtitle="Standard Pomodoro"
            />

            <Pressable style={styles.settingPressable} hitSlop={8}>
              <Text style={styles.settingPressableText}>25 minutes</Text>
            </Pressable>
          </View>

          <View style={styles.selectionContainer}>
            <SettingsTitle title="Short Break" subtitle="After each round" />

            <Pressable style={styles.settingPressable} hitSlop={8}>
              <Text style={styles.settingPressableText}>5 minutes</Text>
            </Pressable>
          </View>

          <View style={styles.selectionContainer}>
            <SettingsTitle title="Long Break" subtitle="After 4 rounds" />

            <Pressable style={styles.settingPressable} hitSlop={8}>
              <Text style={styles.settingPressableText}>15 minutes</Text>
            </Pressable>
          </View>

          <View style={styles.selectionContainer}>
            <SettingsTitle
              title="Sound Alerts"
              subtitle="Play sound when timer ends"
            />

            <Pressable style={styles.settingPressable} hitSlop={8}>
              <Text style={styles.settingPressableText}>On</Text>
            </Pressable>
          </View>

          <View style={styles.selectionContainer}>
            <SettingsTitle title="Vibration" subtitle="Haptic feedback" />

            <Pressable style={styles.settingPressable} hitSlop={8}>
              <Text style={styles.settingPressableText}>On</Text>
            </Pressable>
          </View>

          <View style={styles.selectionContainer}>
            <SettingsTitle
              title="Auto-start breaks"
              subtitle="Automatically start break timer"
            />

            <Pressable style={styles.settingPressable} hitSlop={8}>
              <Text style={styles.settingPressableText}>On</Text>
            </Pressable>
          </View>

          <View style={styles.hintContainer}>
            <Text style={styles.hintTitle}>ABOUT</Text>
            <Text style={styles.hint}>
              The Pomodoro Technique is a simple time-management method that
              breaks work into 25-minute focused intervals followed by short
              5-minute breaks
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  contentColumn: {
    width: "100%",
    maxWidth: 500,
    gap: spacing.md,
  },
  selectionContainer: {
    flexDirection: "row",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    width: "100%",
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingPressable: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  settingPressableText: {
    ...typography.button,
    color: colors.focus,
  },
  hintContainer: {
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  hintTitle: {
    ...typography.sectionTitle,
    color: colors.textSecondary,
  },
  hint: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "400",
    color: colors.textMuted,
  },
});
