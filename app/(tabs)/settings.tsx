import DurationPickerSheet from "@/components/Settings/DurationPickerSheet";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SettingsTitle from "@/components/ui/SettingsTitle";
import {
  FOCUS_MINUTES_OPTIONS,
  LONG_BREAK_MINUTES_OPTIONS,
  SHORT_BREAK_MINUTES_OPTIONS,
} from "@/constants/settings.constants";
import { theme } from "@/constants/theme";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, typography, spacing, radius } = theme;

type DurationSetting = "focus" | "shortBreak" | "longBreak";

const DURATION_CONFIG = {
  focus: { title: "Focus Duration", options: FOCUS_MINUTES_OPTIONS },
  shortBreak: { title: "Short Break", options: SHORT_BREAK_MINUTES_OPTIONS },
  longBreak: { title: "Long Break", options: LONG_BREAK_MINUTES_OPTIONS },
} as const;

interface DurationRowProps {
  title: string;
  subtitle: string;
  durationSeconds: number;
  onPress: () => void;
}

function DurationRow({
  title,
  subtitle,
  durationSeconds,
  onPress,
}: DurationRowProps) {
  return (
    <Pressable
      accessibilityHint="Opens a duration picker"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.selectionContainer,
        pressed && styles.selectionContainerPressed,
      ]}
    >
      <SettingsTitle title={title} subtitle={subtitle} />
      <Text style={styles.settingValue}>{durationSeconds / 60} minutes</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const {
    focusDurationSeconds,
    shortBreakDurationSeconds,
    longBreakDurationSeconds,
    updateFocusDurationSeconds,
    updateShortBreakDurationSeconds,
    updateLongBreakDurationSeconds,
  } = useAppSettings();
  const [activePicker, setActivePicker] =
    useState<DurationSetting | null>(null);
  const [draftMinutes, setDraftMinutes] = useState(0);
  const tabBarHeight = useBottomTabBarHeight();

  const openDurationPicker = (
    setting: DurationSetting,
    durationSeconds: number,
  ) => {
    setDraftMinutes(durationSeconds / 60);
    setActivePicker(setting);
  };

  const closeDurationPicker = () => setActivePicker(null);

  const confirmDuration = () => {
    const durationSeconds = draftMinutes * 60;

    if (activePicker === "focus") {
      updateFocusDurationSeconds(durationSeconds);
    } else if (activePicker === "shortBreak") {
      updateShortBreakDurationSeconds(durationSeconds);
    } else if (activePicker === "longBreak") {
      updateLongBreakDurationSeconds(durationSeconds);
    }

    closeDurationPicker();
  };

  return (
    <>
      <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
        <ScrollView
          contentContainerStyle={[
            styles.mainContainer,
            { paddingBottom: tabBarHeight + spacing.md },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentColumn}>
            <ScreenHeader
              title="Settings"
              subtitle="Customize your experience"
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TIMER</Text>
              <DurationRow
                durationSeconds={focusDurationSeconds}
                onPress={() =>
                  openDurationPicker("focus", focusDurationSeconds)
                }
                subtitle="Standard Pomodoro"
                title="Focus Duration"
              />
              <DurationRow
                durationSeconds={shortBreakDurationSeconds}
                onPress={() =>
                  openDurationPicker("shortBreak", shortBreakDurationSeconds)
                }
                subtitle="After each round"
                title="Short Break"
              />
              <DurationRow
                durationSeconds={longBreakDurationSeconds}
                onPress={() =>
                  openDurationPicker("longBreak", longBreakDurationSeconds)
                }
                subtitle="After 4 rounds"
                title="Long Break"
              />
            </View>

            <View style={styles.hintContainer}>
              <Text style={styles.hintTitle}>ABOUT</Text>
              <Text style={styles.hint}>
                The Pomodoro Technique is a simple time-management method that
                breaks work into focused intervals followed by short breaks.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <DurationPickerSheet
        onCancel={closeDurationPicker}
        onConfirm={confirmDuration}
        onValueChange={setDraftMinutes}
        optionsMinutes={
          activePicker ? DURATION_CONFIG[activePicker].options : []
        }
        title={activePicker ? DURATION_CONFIG[activePicker].title : "Duration"}
        valueMinutes={draftMinutes}
        visible={activePicker !== null}
      />
    </>
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
    maxWidth: 320,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.sectionTitle,
    paddingHorizontal: spacing.sm,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  selectionContainer: {
    width: "100%",
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  selectionContainerPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  settingValue: {
    ...typography.body,
    flexShrink: 0,
    color: colors.focus,
  },
  hintContainer: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  hintTitle: {
    ...typography.sectionTitle,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
