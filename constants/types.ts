import { focusPhaseDuration } from "./timer.constants";

export type TimerPhase = "focus" | "break";

export type TimerStatus = "ready" | "running" | "paused" | "completed";

export type TimerSession = {
  currentRoundNumber: number;
  phase: TimerPhase;
  status: TimerStatus;
  timerDuration: number;
  elapsedSeconds: number;
  sessionActive: boolean;
};

export const DEFAULT_TIMER_SESSION: TimerSession = {
  currentRoundNumber: 0,
  phase: "focus",
  status: "ready",
  timerDuration: focusPhaseDuration,
  elapsedSeconds: 0,
  sessionActive: true,
};
