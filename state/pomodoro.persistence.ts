import {
  PomodoroState,
  TimerPhase,
  TimerSession,
  TimerStatus,
} from "@/constants/types";
import {
  isNonNegativeSafeInteger,
  isNullableTimestamp,
} from "@/utils/validation.general";
import { validateTimerStatus } from "./reducer.helpers";
import { validateTrackingHistory } from "./tracking.validation";

const POMODORO_STATE_VERSION = 1;
const TIMER_PHASES: TimerPhase[] = ["focus", "shortBreak", "longBreak"];
const TIMER_STATUSES: TimerStatus[] = [
  "ready",
  "running",
  "paused",
  "completed",
];

type PersistedPomodoroState = {
  version: typeof POMODORO_STATE_VERSION;
  timerSession: TimerSession;
  trackingHistory: PomodoroState["trackingHistory"];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const validatePersistedTimerSession = (
  value: unknown,
): value is TimerSession => {
  if (!isRecord(value)) return false;

  if (
    !TIMER_PHASES.includes(value.phase as TimerPhase) ||
    !TIMER_STATUSES.includes(value.status as TimerStatus) ||
    !isNonNegativeSafeInteger(value.currentRoundNumber) ||
    !isNonNegativeSafeInteger(value.timerDurationSeconds) ||
    value.timerDurationSeconds === 0 ||
    !isNonNegativeSafeInteger(value.accumulatedActiveSeconds) ||
    typeof value.breakExtended !== "boolean" ||
    typeof value.sessionActive !== "boolean" ||
    !isNullableTimestamp(value.startedAtSeconds) ||
    !isNullableTimestamp(value.endsAtSeconds)
  ) {
    return false;
  }

  const timerSession = value as TimerSession;

  if (!validateTimerStatus(timerSession)) return false;
  if (timerSession.phase === "focus" && timerSession.breakExtended)
    return false;

  if (!timerSession.sessionActive) {
    return (
      timerSession.phase === "focus" &&
      timerSession.status === "ready" &&
      timerSession.currentRoundNumber === 0
    );
  }

  return true;
};

export const createPersistedPomodoroState = (
  state: PomodoroState,
): PersistedPomodoroState => ({
  version: POMODORO_STATE_VERSION,
  timerSession: state.timerSession,
  trackingHistory: state.trackingHistory,
});

export const parsePersistedPomodoroState = (
  value: unknown,
): PomodoroState | null => {
  if (!isRecord(value) || value.version !== POMODORO_STATE_VERSION) {
    return null;
  }

  if (
    !validatePersistedTimerSession(value.timerSession) ||
    !validateTrackingHistory(value.trackingHistory)
  ) {
    return null;
  }

  return {
    timerSession: value.timerSession,
    trackingHistory: value.trackingHistory,
  };
};
