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
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, typography, spacing } = theme;

export default function FocusScreen() {
  const [timerSession, setTimerSession] = useState<TimerSession>(
    DEFAULT_TIMER_SESSION,
  );
  const [nowSeconds, setNowSeconds] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (timerSession.status !== "running") return;

    const secondInterval = setInterval(() => {
      const newSeconds = Math.floor(Date.now() / 1000);

      setNowSeconds(newSeconds);
    }, 250);

    return () => clearInterval(secondInterval);
  }, [timerSession.status]);

  useEffect(() => {
    if (timerSession.status !== "running" || !timerSession.endsAtSeconds)
      return;

    if (nowSeconds >= timerSession.endsAtSeconds) {
      timerSession.phase === "focus" ? onFocusComplete() : onBreakEnd();
    }
  }, [
    timerSession.status,
    timerSession.endsAtSeconds,
    timerSession.phase,
    nowSeconds,
  ]);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Timer Handlers
  const runTimerPhase = () => {
    const dateNowSeconds = Math.floor(Date.now() / 1000);
    setNowSeconds(dateNowSeconds);
    setTimerSession((prev) => {
      const remainingDuration =
        prev.timerDurationSeconds - prev.accumulatedActiveSeconds;
      const newEndsAt = dateNowSeconds + remainingDuration;

      return {
        ...prev,
        startedAtSeconds: dateNowSeconds,
        endsAtSeconds: newEndsAt,
        status: "running",
        sessionActive: true,
      };
    });
  };

  const pauseTimerPhase = () => {
    const dateNowSeconds = Math.floor(Date.now() / 1000);
    setTimerSession((prev) => {
      if (prev.status !== "running" || !prev.startedAtSeconds) return prev;

      const newAccumulatedSeconds =
        prev.accumulatedActiveSeconds +
        (dateNowSeconds - prev.startedAtSeconds);

      return {
        ...prev,
        accumulatedActiveSeconds: newAccumulatedSeconds,
        status: "paused",
        startedAtSeconds: null,
        endsAtSeconds: null,
      };
    });
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
        timerDurationSeconds: defaultPhaseDuration,
        accumulatedActiveSeconds: 0,
        breakExtended: false,
        startedAtSeconds: null,
        endsAtSeconds: null,
      };
    });
  };

  const onFocusComplete = () => {
    setTimerSession((prev) => {
      const newCompletedRounds = prev.currentRoundNumber + 1;
      const isLongBreakNext = newCompletedRounds % 4 === 0;

      // Return next timer phase with "ready"
      return {
        ...prev,
        currentRoundNumber: newCompletedRounds,
        phase: isLongBreakNext ? "longBreak" : "shortBreak",
        status: "ready",
        timerDurationSeconds: isLongBreakNext
          ? longBreakPhaseDuration
          : shortBreakPhaseDuration,
        accumulatedActiveSeconds: 0,
        breakExtended: false,
        startedAtSeconds: null,
        endsAtSeconds: null,
      };
    });
  };

  const onAddBreakTime = () => {
    const dateNowSeconds = Math.floor(Date.now() / 1000);
    setNowSeconds(dateNowSeconds);
    setTimerSession((prev) => {
      const newDuration = prev.timerDurationSeconds + breakExtensionDuration;

      // Calculate new accumulatedActiveSeconds on adding break time while timer running
      if (prev.status === "running") {
        if (!prev.startedAtSeconds) {
          return prev;
        }

        const currentAccumulatedSeconds =
          dateNowSeconds - prev.startedAtSeconds;

        const newAccumulatedSeconds =
          prev.accumulatedActiveSeconds + currentAccumulatedSeconds;
        const remainingDuration = newDuration - newAccumulatedSeconds;
        const newEndsAt = dateNowSeconds + remainingDuration;

        // updating startedAt to reconcile timer
        return {
          ...prev,
          startedAtSeconds: dateNowSeconds,
          accumulatedActiveSeconds: newAccumulatedSeconds,
          breakExtended: true,
          timerDurationSeconds: newDuration,
          endsAtSeconds: newEndsAt,
        };
      }

      // When timer is already paused, the accumulated active seconds dont need to be recalculated, since that is handled by the pause handler
      return {
        ...prev,
        breakExtended: true,
        timerDurationSeconds: newDuration,
      };
    });
  };

  const onBreakEnd = () => {
    const dateNowSeconds = Math.floor(Date.now() / 1000);
    setNowSeconds(dateNowSeconds);
    setTimerSession((prev) => {
      // Get accumulated seconds based on timer phase
      const accumulatedSeconds =
        prev.status === "running" && prev.startedAtSeconds
          ? dateNowSeconds -
            prev.startedAtSeconds +
            prev.accumulatedActiveSeconds
          : prev.accumulatedActiveSeconds;

      const newAccumulatedSeconds = Math.min(
        prev.timerDurationSeconds,
        accumulatedSeconds,
      );

      return {
        ...prev,
        status: "completed",
        accumulatedActiveSeconds: newAccumulatedSeconds,
        breakExtended: false,
        startedAtSeconds: null,
        endsAtSeconds: null,
      };
    });
  };

  const onNewSessionRound = () => {
    const dateNowSeconds = Math.floor(Date.now() / 1000);
    setNowSeconds(dateNowSeconds);
    setTimerSession((prev) => {
      const newSessionEndsAt = dateNowSeconds + focusPhaseDuration;

      return {
        ...prev,
        phase: "focus",
        status: "running",
        timerDurationSeconds: focusPhaseDuration,
        accumulatedActiveSeconds: 0,
        breakExtended: false,
        sessionActive: true,
        startedAtSeconds: dateNowSeconds,
        endsAtSeconds: newSessionEndsAt,
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

  const getEffectiveElapsedSeconds = (
    timerSession: TimerSession,
    dateNowSeconds: number,
  ): number => {
    const {
      status,
      startedAtSeconds,
      timerDurationSeconds,
      accumulatedActiveSeconds,
    } = timerSession;

    if (startedAtSeconds && nowSeconds < startedAtSeconds) {
      return Math.min(timerDurationSeconds, accumulatedActiveSeconds);
    }

    if (status === "running") {
      if (!startedAtSeconds) return accumulatedActiveSeconds;
      return Math.min(
        timerDurationSeconds,
        Math.max(
          dateNowSeconds - startedAtSeconds + accumulatedActiveSeconds,
          0,
        ),
      );
    }

    return Math.min(timerDurationSeconds, accumulatedActiveSeconds);
  };

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
              timerSession={timerSession}
              elapsedSeconds={getEffectiveElapsedSeconds(
                timerSession,
                nowSeconds,
              )}
            />

            <TimerControls
              timerSession={timerSession}
              buttonText={timerButtonText}
              onRunTimerPhase={runTimerPhase}
              onPauseTimerPhase={pauseTimerPhase}
              onTimerReset={onTimerReset}
              onAddBreakTime={onAddBreakTime}
              onBreakComplete={onBreakEnd}
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
