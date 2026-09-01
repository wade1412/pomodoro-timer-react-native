import { theme } from "@/constants/theme";
import { shortBreakPhaseDuration } from "@/constants/timer.constants";
import { TimerPhase, TimerSession } from "@/constants/types";
import { Pressable, StyleSheet, Text, View } from "react-native";
import EndPhaseButton from "./EndPhaseButton";

const { colors, typography, radius, spacing } = theme;

interface TimerControlsProps {
  timerSession: TimerSession;
  buttonText: string;
  toggleSessionRunning: () => void;
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
      <Pressable
        accessibilityRole="button"
        onPress={onNewSessionRound}
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
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.addBreakButtonText,
                  pressed && { color: colors.breakPressed },
                  breakExtended && { color: colors.breakPressed },
                ]}
              >{`+${shortBreakPhaseDuration / 60} min`}</Text>
            )}
          </Pressable>
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
  toggleSessionRunning,
  onTimerReset,
  onAddBreakTime,
  onBreakComplete,
  onNewSessionRound,
  onEndSession,
}: TimerControlsProps) {
  const { currentRoundNumber, phase, status, breakExtended, timerDuration } =
    timerSession;

  const isFocusPhase = phase === "focus";

  return (
    <>
      {status === "completed" && (
        <CompletedRoundControls
          currentRoundNumber={currentRoundNumber}
          onNewSessionRound={onNewSessionRound}
          onEndSession={onEndSession}
        />
      )}

      {status !== "completed" && (
        <View style={styles.buttonContainer}>
          {/* Start/Pause Button */}
          <Pressable
            accessibilityRole="button"
            onPress={toggleSessionRunning}
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
