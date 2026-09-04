import { getEffectiveElapsedSeconds } from "@/utils/timer";
import { TimerPhase, TimerSession, TimerStatus } from "../constants/types";

export const ACTION_LABELS = {
  startOrResumePhase: "START_OR_RESUME_PHASE",
  pausePhase: "PAUSE_PHASE",
  completeFocus: "FOCUS_COMPLETE",
  extendBreak: "EXTEND_BREAK",
  endBreak: "END_BREAK",
  newSessionRound: "NEW_SESSION_ROUND",
  endSession: "END_SESSION",
  resetTimer: "RESET_TIMER",
} as const;

type ActionLabel = (typeof ACTION_LABELS)[keyof typeof ACTION_LABELS];

export type ReducerAction =
  | { type: typeof ACTION_LABELS.startOrResumePhase; nowSeconds: number }
  | { type: typeof ACTION_LABELS.pausePhase; nowSeconds: number }
  | { type: typeof ACTION_LABELS.extendBreak; nowSeconds: number }
  | { type: typeof ACTION_LABELS.endBreak; nowSeconds: number }
  | { type: typeof ACTION_LABELS.newSessionRound; nowSeconds: number }
  | { type: typeof ACTION_LABELS.endSession; nowSeconds: number }
  | { type: typeof ACTION_LABELS.completeFocus } // No nowSeconds needed
  | { type: typeof ACTION_LABELS.resetTimer; nowSeconds: number };

type reducerActionValidValues = {
  allowedStatuses: TimerStatus[];
  allowedPhases: TimerPhase[] | null;
};

const reducerActionsAllowedValuesMap: Map<
  ActionLabel,
  reducerActionValidValues
> = new Map([
  [
    ACTION_LABELS.startOrResumePhase,
    {
      allowedStatuses: ["ready", "paused"],
      allowedPhases: null,
    },
  ],
  [
    ACTION_LABELS.pausePhase,
    {
      allowedStatuses: ["running"],
      allowedPhases: null,
    },
  ],
  [
    ACTION_LABELS.completeFocus,
    {
      allowedStatuses: ["running"],
      allowedPhases: ["focus"],
    },
  ],
  [
    ACTION_LABELS.extendBreak,
    {
      allowedStatuses: ["running", "paused"],
      allowedPhases: ["shortBreak", "longBreak"],
    },
  ],
  [
    ACTION_LABELS.endBreak,
    {
      allowedStatuses: ["running", "paused"],
      allowedPhases: ["shortBreak", "longBreak"],
    },
  ],
  [
    ACTION_LABELS.newSessionRound,
    {
      allowedStatuses: ["completed"],
      allowedPhases: ["shortBreak", "longBreak"],
    },
  ],
  [
    ACTION_LABELS.endSession,
    {
      allowedStatuses: ["running", "paused", "completed", "ready"],
      allowedPhases: ["focus", "shortBreak", "longBreak"],
    },
  ],
  [
    ACTION_LABELS.resetTimer,
    {
      allowedStatuses: ["running", "paused"],
      allowedPhases: ["focus", "shortBreak", "longBreak"],
    },
  ],
]);

export const validateTimerStatus = (timerSession: TimerSession) => {
  const {
    startedAtSeconds,
    endsAtSeconds,
    status,
    accumulatedActiveSeconds,
    timerDurationSeconds,
  } = timerSession;

  const hasNeither = startedAtSeconds === null && endsAtSeconds === null;
  const hasBoth = startedAtSeconds !== null && endsAtSeconds !== null;

  const isAccumulatedSecondsValid =
    accumulatedActiveSeconds >= 0 &&
    accumulatedActiveSeconds <= timerDurationSeconds;

  if (timerDurationSeconds <= 0) return false;

  switch (status) {
    case "ready": {
      if (!hasNeither || accumulatedActiveSeconds !== 0) {
        return false;
      } else return true;
    }

    case "running": {
      if (
        !hasBoth ||
        endsAtSeconds < startedAtSeconds ||
        !isAccumulatedSecondsValid
      ) {
        return false;
      } else return true;
    }

    case "paused": {
      if (
        !hasNeither ||
        !isAccumulatedSecondsValid ||
        timerSession.accumulatedActiveSeconds > timerDurationSeconds
      ) {
        return false;
      } else return true;
    }

    case "completed": {
      if (!hasNeither || !isAccumulatedSecondsValid) {
        return false;
      } else return true;
    }

    default:
      return false;
  }
};

export const validateReducerAction = (
  timerSession: TimerSession,
  actionLabel: ActionLabel,
) => {
  const allowedValues = reducerActionsAllowedValuesMap.get(actionLabel);

  if (!allowedValues) return false;

  const { allowedPhases, allowedStatuses } = allowedValues;

  const { phase, status } = timerSession;

  if (allowedStatuses.includes(status)) {
    return !allowedPhases ? true : allowedPhases.includes(phase);
  }

  return false;
};

export const getReconciledElapsedSeconds = (
  timerSession: TimerSession,
  nowSeconds: number,
) => {
  const newAccumulated =
    timerSession.status === "running" && timerSession.startedAtSeconds
      ? getEffectiveElapsedSeconds(timerSession, nowSeconds)
      : timerSession.accumulatedActiveSeconds;

  return Math.min(newAccumulated, timerSession.timerDurationSeconds);
};
