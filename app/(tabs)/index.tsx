import DailyGoalCard from "@/components/GoalProgressBar/DailyGoalCard";
import CircularTimer from "@/components/Timer/CircularTimer";
import TimerControls from "@/components/Timer/TimerControls";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { layout, theme } from "@/constants/theme";
import { useNowSeconds } from "@/hooks/useNowSeconds";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { usePomodoroContext } from "@/providers/PomodoroProvider";
import { requestNotificationPermission } from "@/services/timerNotifications";
import { ACTION_LABELS } from "@/state/reducer.helpers";
import { getLocalDateKey } from "@/state/tracking.helpers";
import { getEffectiveElapsedSeconds } from "@/utils/timer";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { spacing } = theme;
const { contentColumn, screen } = layout;
const buttonsMaxWidth = 424;

export default function FocusScreen() {
  const {
    dailyGoalSeconds,
    focusDurationSeconds,
    shortBreakDurationSeconds,
    longBreakDurationSeconds,
  } = useAppSettings();
  const { state, dispatch } = usePomodoroContext();
  const { nowSeconds, refreshNow } = useNowSeconds(
    state.timerSession.status === "running" ? 250 : 30_000,
  );

  const getConfiguredPhaseDuration = () => {
    if (state.timerSession.phase === "focus") return focusDurationSeconds;
    if (state.timerSession.phase === "longBreak")
      return longBreakDurationSeconds;
    return shortBreakDurationSeconds;
  };

  const formattedDate = new Date(nowSeconds * 1000).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    },
  );

  // ----- Timer Handlers -----
  const runTimerPhase = async () => {
    // Request permission for notifications
    if (state.timerSession.status === "ready") {
      try {
        await requestNotificationPermission();
      } catch (error) {
        console.error("Notification permission request failed: ", error);
      }
    }

    // Get a fresh timestamp after the permission dialog closes
    const dateNowSeconds = refreshNow();

    dispatch({
      type: ACTION_LABELS.startOrResumePhase,
      nowSeconds: dateNowSeconds,
      phaseDurationSeconds: getConfiguredPhaseDuration(),
    });
  };

  const pauseTimerPhase = () => {
    const dateNowSeconds = refreshNow();

    dispatch({ type: ACTION_LABELS.pausePhase, nowSeconds: dateNowSeconds });
  };

  const onTimerReset = () => {
    const dateNowSeconds = refreshNow();

    dispatch({
      type: ACTION_LABELS.resetTimer,
      nowSeconds: dateNowSeconds,
      phaseDurationSeconds: getConfiguredPhaseDuration(),
    });
  };

  const onAddBreakTime = () => {
    const dateNowSeconds = refreshNow();

    dispatch({ type: ACTION_LABELS.extendBreak, nowSeconds: dateNowSeconds });
  };

  const onBreakEnd = () => {
    const dateNowSeconds = refreshNow();

    dispatch({ type: ACTION_LABELS.endBreak, nowSeconds: dateNowSeconds });
  };

  const onNewSessionRound = () => {
    const dateNowSeconds = refreshNow();

    dispatch({
      type: ACTION_LABELS.newSessionRound,
      nowSeconds: dateNowSeconds,
      focusDurationSeconds,
    });
  };

  const onEndSession = () => {
    const dateNowSeconds = refreshNow();
    dispatch({
      type: ACTION_LABELS.endSession,
      nowSeconds: dateNowSeconds,
      focusDurationSeconds,
    });
  };

  const timerButtonText = [
    state.timerSession.status === "ready"
      ? "Start"
      : state.timerSession.status === "paused"
        ? "Resume"
        : "Pause",
    state.timerSession.phase === "focus" ? "Focus" : "Break",
  ].join(" ");

  const effectiveElapsedSeconds = getEffectiveElapsedSeconds(
    state.timerSession,
    nowSeconds,
  );

  const tabBarHeight = useBottomTabBarHeight();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={screen}>
      <ScrollView
        style={styles.mainContainer}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: tabBarHeight + spacing.sm,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={contentColumn}>
          {/* Header */}
          <View style={styles.headerSection}>
            <ScreenHeader title="Focus" subtitle={formattedDate} />

            {/* Tracking Area */}
            <DailyGoalCard
              state={state}
              elapsedSeconds={effectiveElapsedSeconds}
              dailyGoalSeconds={dailyGoalSeconds}
              dateKey={getLocalDateKey(nowSeconds)}
            />
          </View>

          {/* Timer Area */}
          <View style={styles.timerAndActionsContainer}>
            <View style={styles.timerSlot}>
              <CircularTimer
                timerSession={state.timerSession}
                elapsedSeconds={effectiveElapsedSeconds}
              />
            </View>

            <View style={styles.controlsSlot}>
              <TimerControls
                timerSession={state.timerSession}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  headerSection: {
    gap: spacing.xs,
  },
  timerAndActionsContainer: {
    flex: 1,
    minHeight: 0,
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  timerSlot: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  controlsSlot: {
    width: "100%",
    minHeight: 180,
    justifyContent: "flex-start",
    maxWidth: buttonsMaxWidth,
  },
});
