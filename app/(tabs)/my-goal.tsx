import CurrentGoalSection from "@/components/FocusGoal/CurrentGoalSection";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { theme } from "@/constants/theme";
import { dailyGoalSecondsExample } from "@/constants/timer.constants";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, typography, spacing, radius } = theme;

const QUICK_PRESETS = [3000, 4500, 6000, 7500, 9000, 12000];
const MIN_DAILY_GOAL_MINUTES = 1;
const MAX_DAILY_GOAL_MINUTES = 1440;

export default function MyGoalScreen() {
  const [number, setNumber] = useState("");
  const [dailyGoalSeconds, setDailyGoalSeconds] = useState(
    dailyGoalSecondsExample,
  );
  const [selectedPreset, setSelectedPreset] = useState<null | number>(
    QUICK_PRESETS.includes(dailyGoalSecondsExample)
      ? dailyGoalSecondsExample
      : null,
  );

  const handleTextChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9]/g, "");
    setNumber(cleanedText);
  };

  const tabBarHeight = useBottomTabBarHeight();
  const customMinutes = Number(number);
  const isCustomGoalValid =
    number.length > 0 &&
    customMinutes >= MIN_DAILY_GOAL_MINUTES &&
    customMinutes <= MAX_DAILY_GOAL_MINUTES;

  const handlePresetPress = (presetSeconds: number) => {
    setSelectedPreset(presetSeconds);
    setDailyGoalSeconds(presetSeconds);
    setNumber("");
  };

  const handleSetCustomGoal = () => {
    if (!isCustomGoalValid) return;

    setDailyGoalSeconds(customMinutes * 60);
    setSelectedPreset(null);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.mainContainer,
            { paddingBottom: tabBarHeight + spacing.md },
          ]}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentColumn}>
            <ScreenHeader
              title="My Goal"
              subtitle="Set your daily focus target"
            />

            <CurrentGoalSection dailyGoalSeconds={dailyGoalSeconds} />

            <View style={styles.verticalContainer}>
              <Text style={styles.sectionCaption}>QUICK PRESETS</Text>
              <View style={styles.quickPresetsGrid}>
                {QUICK_PRESETS.map((presetSeconds) => {
                  const isSelected = presetSeconds === selectedPreset;

                  const presetMinutes = Math.floor(presetSeconds / 60);
                  return (
                    <AnimatedPressable
                      accessibilityRole="button"
                      accessibilityLabel={`Apply ${presetMinutes} minutes preset`}
                      accessibilityState={{ selected: isSelected }}
                      key={presetSeconds}
                      onPress={() => handlePresetPress(presetSeconds)}
                      containerStyle={{
                        width: "31%",
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                      style={({ pressed }) => [
                        styles.presetCard,
                        pressed && styles.presetCardPressed,
                        isSelected && styles.presetCardSelected,
                        isSelected &&
                          pressed &&
                          styles.presetCardSelectedPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetCardText,
                          isSelected && styles.presetCardTextSelected,
                        ]}
                      >{`${presetMinutes} min`}</Text>
                    </AnimatedPressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.verticalContainer}>
              <Text style={styles.sectionCaption}>CUSTOM</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  accessibilityLabel="Custom daily goal in minutes"
                  style={styles.minutesInput}
                  value={number}
                  onChangeText={handleTextChange}
                  onSubmitEditing={handleSetCustomGoal}
                  placeholder="Enter minutes..."
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={4}
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="done"
                />

                <AnimatedPressable
                  accessibilityRole="button"
                  accessibilityLabel="Set goal minutes"
                  accessibilityState={{ disabled: !isCustomGoalValid }}
                  disabled={!isCustomGoalValid}
                  onPress={handleSetCustomGoal}
                  style={({ pressed }) => [
                    styles.setMinutesButton,
                    pressed && styles.setMinutesButtonPressed,
                    !isCustomGoalValid && styles.setMinutesButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.setMinutesButtonText,
                      !isCustomGoalValid && styles.setMinutesButtonTextDisabled,
                    ]}
                  >
                    Set
                  </Text>
                </AnimatedPressable>
              </View>
            </View>

            <View style={styles.hintContainer}>
              <Text style={styles.hint}>
                Your daily goal tracks total focus time spent today. The
                calendar shows days where you have hit your goal
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
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
    gap: spacing.lg,
  },
  verticalContainer: {
    flexDirection: "column",
    gap: spacing.md,
    width: "100%",
  },
  sectionCaption: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1,
  },

  quickPresetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  presetCard: {
    width: "100%",
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
  },
  presetCardPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  presetCardSelected: {
    backgroundColor: colors.focus,
    borderColor: colors.focus,
  },
  presetCardSelectedPressed: {
    backgroundColor: colors.focusPressed,
    borderColor: colors.focusPressed,
  },
  presetCardText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  presetCardTextSelected: {
    color: colors.background,
  },
  inputContainer: {
    width: "100%",
    gap: spacing.md,
    flexDirection: "row",
  },
  minutesInput: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },

  setMinutesButton: {
    height: "100%",
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.focus,
  },
  setMinutesButtonPressed: {
    backgroundColor: colors.focusPressed,
  },
  setMinutesButtonDisabled: {
    backgroundColor: colors.surfaceElevated,
  },
  setMinutesButtonText: {
    ...typography.button,
    color: colors.background,
  },
  setMinutesButtonTextDisabled: {
    color: colors.textMuted,
  },

  hintContainer: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  hint: {
    ...typography.body,
    fontSize: 13,
    fontWeight: 400,
    color: colors.textMuted,
  },
});
