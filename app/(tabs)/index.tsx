import DailyGoalCard from "@/components/GoalProgressBar/DailyGoalCard";
import CircularTimer from "@/components/Timer/CircularTimer";
import TimerControls from "@/components/Timer/TimerControls";
import { theme } from "@/constants/theme";
import {
  breakExtensionDuration,
  focusPhaseDuration,
  longBreakPhaseDuration,
  shortBreakPhaseDuration,
} from "@/constants/timer.constants";
import { DEFAULT_TIMER_SESSION, TimerSession } from "@/constants/types";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, typography, spacing } = theme;

export default function FocusScreen() {
  const [timerSession, setTimerSession] = useState<TimerSession>(
    DEFAULT_TIMER_SESSION,
  );
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Timer Handlers
  const toggleSessionRunning = () => {
    setTimerSession((prev) => ({
      ...prev,
      status: prev.status === "running" ? "paused" : "running",
      sessionActive: true,
    }));
  };
  const onTimerReset = () => {
    setTimerSession((prev) => {
      const defaultPhaseDuration =
        prev.phase === "focus"
          ? focusPhaseDuration
          : prev.phase === "longBreak"
            ? longBreakPhaseDuration
            : shortBreakPhaseDuration;

      return {
        ...prev,
        status: "ready",
        timerDuration: defaultPhaseDuration,
        elapsedSeconds: 0,
        breakExtended: false,
      };
    });
  };
  const onFocusComplete = () => {
    setTimerSession((prev) => {
      const newCompletedRounds = prev.currentRoundNumber + 1;
      const isLongBreakNext = newCompletedRounds % 4 === 0;

      return {
        ...prev,
        currentRoundNumber: newCompletedRounds,
        phase: isLongBreakNext ? "longBreak" : "shortBreak",
        status: "ready",
        timerDuration: isLongBreakNext
          ? longBreakPhaseDuration
          : shortBreakPhaseDuration,
        elapsedSeconds: 0,
        breakExtended: false,
      };
    });
  };

  const onAddBreakTime = () => {
    setTimerSession((prev) => {
      const newDuration = prev.timerDuration + breakExtensionDuration;
      return { ...prev, breakExtended: true, timerDuration: newDuration };
    });
  };

  const onBreakComplete = () => {
    setTimerSession((prev) => {
      return { ...prev, status: "completed" };
    });
  };

  const onNewSessionRound = () => {
    setTimerSession((prev) => {
      return {
        ...prev,
        phase: "focus",
        status: "running",
        timerDuration: focusPhaseDuration,
        elapsedSeconds: 0,
        breakExtended: false,
        sessionActive: true,
      };
    });
  };

  const onEndSession = () => {
    setTimerSession(DEFAULT_TIMER_SESSION);
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
            <CircularTimer timerSession={timerSession} />

            <TimerControls
              timerSession={timerSession}
              buttonText={timerButtonText}
              toggleSessionRunning={toggleSessionRunning}
              onTimerReset={onTimerReset}
              onAddBreakTime={onAddBreakTime}
              onBreakComplete={onBreakComplete}
              onNewSessionRound={onNewSessionRound}
              onEndSession={onEndSession}
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
