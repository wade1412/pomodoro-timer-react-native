import { theme } from "@/constants/theme";
import { breakExtensionDuration } from "@/constants/timer.constants";
import { TimerPhase, TimerSession } from "@/constants/types";
import { StyleSheet, Text, View } from "react-native";
import AnimatedPressable from "../ui/AnimatedPressable";
import EndPhaseButton from "./EndPhaseButton";

const { colors, typography, radius, spacing } = theme;

interface TimerControlsProps {
  timerSession: TimerSession;
  buttonText: string;
  onRunTimerPhase: () => void;
  onPauseTimerPhase: () => void;
  onTimerReset: () => void;
  onAddBreakTime: () => void;
  onBreakComplete: () => void;
  onNewSessionRound: () => void;
  onEndSession: () => void;
}

interface OptionalControlsProps {
  phase: TimerPhase;
  onReset: () => void;
  breakExtended: boolean;
  handleAddBreakTime: () => void;
  handleEndBreak: () => void;
  onEndSession: () => void;
}

function CompletedRoundControls({
  currentRoundNumber,
  onNewSessionRound,
  onEndSession,
}: {
  currentRoundNumber: number;
  onNewSessionRound: () => void;
  onEndSession: () => void;
}) {
  return (
    <View style={styles.buttonContainer}>
      <Text
        style={styles.hintText}
      >{`Round ${currentRoundNumber} complete. Ready for another?`}</Text>
      <AnimatedPressable
        accessibilityRole="button"
        onPress={onNewSessionRound}
        containerStyle={styles.fullWidthButton}
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
      </AnimatedPressable>

      <EndPhaseButton
        onPress={onEndSession}
        label="End Session"
        isRoundEnd={true}
      />
    </View>
  );
}

function OptionalControls({
  phase,
  onReset,
  breakExtended,
  handleAddBreakTime,
  handleEndBreak,
  onEndSession,
}: OptionalControlsProps) {
  return (
    <View style={styles.optionalButtonsContainer}>
      <View style={styles.buttonsRow}>
        <AnimatedPressable
          onPress={onReset}
          containerStyle={styles.secondaryButtonWrapper}
          style={({ pressed }) => [styles.resetButton]}
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
        </AnimatedPressable>

        {/* Add Break Time Button */}
        {phase !== "focus" && (
          <AnimatedPressable
            disabled={breakExtended}
            style={({ pressed }) => [
              styles.addBreakButton,
              pressed && { borderColor: colors.breakPressed },
              breakExtended && {
                backgroundColor: colors.background,
                borderColor: colors.breakPressed,
                borderStyle: "dashed",
              },
            ]}
            onPress={handleAddBreakTime}
            containerStyle={styles.secondaryButtonWrapper}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.addBreakButtonText,
                  pressed && { color: colors.breakPressed },
                  breakExtended && { color: colors.breakPressed },
                ]}
              >{`+${breakExtensionDuration / 60} min`}</Text>
            )}
          </AnimatedPressable>
        )}
      </View>

      {phase !== "focus" ? (
        <EndPhaseButton label={"End break"} onPress={handleEndBreak} />
      ) : (
        <EndPhaseButton label={"End Session"} onPress={onEndSession} />
      )}
    </View>
  );
}

export default function TimerControls({
  timerSession,
  buttonText,
  onRunTimerPhase,
  onPauseTimerPhase,
  onTimerReset,
  onAddBreakTime,
  onBreakComplete,
  onNewSessionRound,
  onEndSession,
}: TimerControlsProps) {
  const { currentRoundNumber, phase, status, breakExtended } = timerSession;

  const isFocusPhase = phase === "focus";
  const phaseColor = isFocusPhase ? colors.focus : colors.break;
  const phasePressedColor = isFocusPhase
    ? colors.focusPressed
    : colors.breakPressed;

  return (
    <>
      {/* Completed Round controls */}
      {status === "completed" && (
        <CompletedRoundControls
          currentRoundNumber={currentRoundNumber}
          onNewSessionRound={onNewSessionRound}
          onEndSession={onEndSession}
        />
      )}

      {status !== "completed" && (
        // Start Pause/Resume Button
        <View style={styles.buttonContainer}>
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Start or pause the timer"
            containerStyle={styles.fullWidthButton}
            style={({ pressed }) => [
              styles.timerButton,
              {
                backgroundColor: phaseColor,
              },
              pressed && {
                backgroundColor: phasePressedColor,
              },
            ]}
            onPress={
              status === "ready" || status === "paused"
                ? onRunTimerPhase
                : onPauseTimerPhase
            }
          >
            <Text style={styles.timerButtonText}>{buttonText}</Text>
          </AnimatedPressable>

          {/* Reset Button */}
          {status !== "ready" && (
            <OptionalControls
              phase={phase}
              onReset={onTimerReset}
              breakExtended={breakExtended}
              handleAddBreakTime={onAddBreakTime}
              handleEndBreak={onBreakComplete}
              onEndSession={onEndSession}
            />
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
  fullWidthButton: {
    width: "100%",
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
  secondaryButtonWrapper: {
    flex: 1,
  },
  resetButton: {
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
