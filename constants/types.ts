import { focusPhaseDuration } from "./timer.constants";

export type TimerPhase = "focus" | "shortBreak" | "longBreak";

export type TimerStatus = "ready" | "running" | "paused" | "completed";

export type TimerSession = {
  currentRoundNumber: number;
  phase: TimerPhase;
  status: TimerStatus;
  timerDurationSeconds: number;
  accumulatedActiveSeconds: number;
  breakExtended: boolean;
  sessionActive: boolean;
  startedAtSeconds: null | number;
  endsAtSeconds: null | number;
};

export type DateKey = string;

export type DailyTracking = {
  dateKey: DateKey;
  completedRounds: number;
  focusSeconds: number;
  breakSeconds: number;
  updatedAtSeconds: number;
};

export type TrackingHistory = Record<DateKey, DailyTracking>;

export type TrackingDelta = {
  completedRounds: number;
  focusSeconds: number;
  breakSeconds: number;
};

export type PomodoroState = {
  timerSession: TimerSession;
  trackingHistory: TrackingHistory;
};

export const DEFAULT_TIMER_SESSION: TimerSession = {
  currentRoundNumber: 0,
  phase: "focus",
  status: "ready",
  timerDurationSeconds: focusPhaseDuration,
  accumulatedActiveSeconds: 0,
  breakExtended: false,
  sessionActive: false,
  startedAtSeconds: null,
  endsAtSeconds: null,
};

export const DEFAULT_TRACKING_HISTORY: TrackingHistory = {};

export const POMODORO_INITIAL_STATE: PomodoroState = {
  timerSession: DEFAULT_TIMER_SESSION,
  trackingHistory: DEFAULT_TRACKING_HISTORY,
};
