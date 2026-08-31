import DailyGoalCard from "@/components/GoalProgressBar/DailyGoalCard";
import CircularTimer from "@/components/Timer/CircularTimer";
import TimerControls from "@/components/Timer/TimerControls";
import { theme } from "@/constants/theme";
import {
  focusPhaseDuration,
  longBreakPhaseDuration,
  shortBreakPhaseDuration,
} from "@/constants/timer.constants";
import { DEFAULT_TIMER_SESSION, TimerSession } from "@/constants/types";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, typography, spacing, radius } = theme;

export default function FocusScreen() {
  const [timerSession, setTimerSession] = useState<TimerSession>(
    DEFAULT_TIMER_SESSION,
  );

  const isFocusPhase = timerSession.phase === "focus";
  const isLongBreak = false;

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Timer Handlers
  const onStartButtonPress = () => {
    setTimerSession((prev) => ({
      ...prev,
      status: prev.status === "running" ? "paused" : "running",
    }));
  };
  const onResetButtonPress = () => {
    setTimerSession((prev) => {
      const currentPhaseDefaultDuration =
        prev.phase === "focus"
          ? focusPhaseDuration
          : prev.currentRoundNumber % 4 === 0
            ? longBreakPhaseDuration
            : shortBreakPhaseDuration;

      return {
        ...prev,
        elapsedSeconds: 0,
        timerDuration: currentPhaseDefaultDuration,
      };
    });
  };
  const onFocusComplete = () => {
    setTimerSession((prev) => {
      const newCompletedRounds = prev.currentRoundNumber + 1;

      return {
        ...prev,
        phase: "break",
        status: "ready",
        currentRoundNumber: newCompletedRounds,
      };
    });
  };
  const onAddBreakTime = (breakTime: number) => {
    setTimerSession((prev) => {
      const newDuration = prev.timerDuration + breakTime;
      return { ...prev, timerDuration: newDuration };
    });
  };

  const timerButtonText = [
    timerSession.status === "ready"
      ? "Start"
      : timerSession.status === "paused"
        ? "Resume"
        : "Pause",
    timerSession.phase === "focus" ? "Focus" : "Break",
  ].join(" ");

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <View style={styles.mainContainer}>
        <View style={styles.contentColumn}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Focus</Text>

            <Text style={styles.date}>{formattedDate}</Text>
          </View>

          <DailyGoalCard />

          {/* Timer Area */}
          <View style={styles.timerAndActionsContainer}>
            <CircularTimer
              durationSeconds={timerSession.timerDuration}
              secondsRemaining={timerSession.timerDuration - 20}
              phase={timerSession.phase}
              status={timerSession.status}
            />

            <TimerControls
              timerSession={timerSession}
              buttonText={timerButtonText}
              onStartPress={onStartButtonPress}
              onReset={onResetButtonPress}
              onAddBreakTime={onAddBreakTime}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
    overflowY: "auto",
  },
  contentColumn: {
    flex: 1,
    width: "100%",
    maxWidth: 320,
    gap: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing["3xl"],
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  date: {
    ...typography.body,
    color: colors.textSecondary,
    letterSpacing: 1.2,
  },
  timerAndActionsContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing["2xl"],
  },
});
