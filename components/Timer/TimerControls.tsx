import { theme } from "@/constants/theme";
import {
  longBreakPhaseDuration,
  shortBreakPhaseDuration,
} from "@/constants/timer.constants";
import { TimerSession } from "@/constants/types";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import EndPhaseButton from "./EndPhaseButton";

const { colors, typography, radius, spacing } = theme;

interface TimerControlsProps {
  timerSession: TimerSession;
  buttonText: string;
  onStartPress: () => void;
  onReset: () => void;
  onAddBreakTime: (breakTime: number) => void;
}

export default function TimerControls({
  timerSession,
  buttonText,
  onStartPress,
  onReset,
  onAddBreakTime,
}: TimerControlsProps) {
  const [hasAddedBreak, setHasAddedBreak] = useState(false);

  const { currentRoundNumber, phase, status } = timerSession;

  const isFocusPhase = phase === "focus";
  const isLongBreak = currentRoundNumber % 4 === 0;
  const currentBreakLength = isLongBreak
    ? shortBreakPhaseDuration
    : longBreakPhaseDuration;

  const handleAddBreakTime = (breakTime: number) => {
    onAddBreakTime(breakTime);
    setHasAddedBreak(true);
  };

  return (
    <>
      {status === "completed" && (
        <View style={styles.buttonContainer}>
          <Text
            style={styles.hintText}
          >{`Round ${currentRoundNumber} complete. Ready for another?`}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onStartPress}
            style={({ pressed }) => [
              styles.timerButton,
              {
                backgroundColor: colors.focus,
              },
              pressed && {
                backgroundColor: colors.focusPressed,
              },
            ]}
          >
            <Text
              style={styles.timerButtonText}
            >{`Start Round ${currentRoundNumber + 1}`}</Text>
          </Pressable>

          <EndPhaseButton
            onPress={() => {}}
            label="End Session"
            isRoundEnd={true}
          />
        </View>
      )}

      {status !== "completed" && (
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
              <View style={styles.buttonsRow}>
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
                {phase !== "focus" && !hasAddedBreak && (
                  <Pressable
                    disabled={hasAddedBreak}
                    style={({ pressed }) => [
                      styles.addBreakButton,
                      pressed && { borderColor: colors.breakPressed },
                    ]}
                    onPress={() => handleAddBreakTime(currentBreakLength)}
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

              {phase !== "focus" ? (
                <EndPhaseButton label={"End break"} onPress={() => {}} />
              ) : (
                <EndPhaseButton label={"End Session"} onPress={() => {}} />
              )}
            </View>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    flexDirection: "column",
    gap: spacing.md,
  },
  hintText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
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
    flexDirection: "column",
    gap: spacing.md,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
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
