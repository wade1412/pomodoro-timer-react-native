import { theme } from "@/constants/theme";
import { shortBreakPhaseDuration } from "@/constants/timer.constants";
import { TimerPhase, TimerStatus } from "@/constants/types";
import { Pressable, StyleSheet, Text, View } from "react-native";

const { colors, typography, radius, spacing } = theme;

interface TimerControlsProps {
  status: TimerStatus;
  phase: TimerPhase;
  buttonText: string;
  onStartPress: () => void;
  onReset: () => void;
}

export default function TimerControls({
  status,
  phase,
  buttonText,
  onStartPress,
  onReset,
}: TimerControlsProps) {
  const isFocusPhase = phase === "focus";

  return (
    <View style={styles.buttonContainer}>
      {/* Start/Pause Button */}
      <Pressable
        accessibilityRole="button"
        onPress={onStartPress}
        style={({ pressed }) => [
          styles.timerButton,
          {
            backgroundColor: isFocusPhase ? colors.focus : colors.break,
          },
          pressed && {
            backgroundColor: isFocusPhase
              ? colors.focusPressed
              : colors.breakPressed,
          },
        ]}
      >
        <Text style={styles.timerButtonText}>{buttonText}</Text>
      </Pressable>

      {/* Reset Button */}
      {status !== "ready" && (
        <View style={styles.optionalButtonsContainer}>
          <Pressable
            onPress={onReset}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && {
                borderColor: colors.textMuted,
              },
            ]}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.resetButtonText,
                  pressed && {
                    color: colors.textSecondary,
                  },
                ]}
              >
                Reset Timer
              </Text>
            )}
          </Pressable>

          {/* Add Break Time Button */}
          {phase !== "focus" && (
            <Pressable
              style={({ pressed }) => [
                styles.addBreakButton,
                pressed && { borderColor: colors.breakPressed },
              ]}
            >
              {({ pressed }) => (
                <Text
                  style={[
                    styles.addBreakButtonText,
                    pressed && { color: colors.breakPressed },
                  ]}
                >{`+${shortBreakPhaseDuration / 60} min`}</Text>
              )}
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    flexDirection: "column",
    gap: spacing.md,
  },
  // Buttons
  timerButton: {
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  timerButtonText: {
    ...typography.button,
    color: colors.background,
  },
  // Optional Buttons
  optionalButtonsContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  resetButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: radius.md,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  resetButtonText: {
    ...typography.button,
    color: colors.textMuted,
    fontWeight: 400,
  },
  addBreakButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.break,
  },
  addBreakButtonText: {
    ...typography.button,
    color: colors.break,
    textAlign: "center",
  },
});
