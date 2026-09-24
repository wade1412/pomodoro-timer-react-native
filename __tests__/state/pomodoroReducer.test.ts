import { SETTINGS_DURATIONS } from "@/constants/settings.constants";
import {
  POMODORO_INITIAL_STATE,
  PomodoroState,
  TimerPhase,
} from "@/constants/types";
import { reducer } from "@/state/pomodoroReducer";
import { ACTION_LABELS } from "@/state/reducer.helpers";
import { getLocalDateKey } from "@/state/tracking.helpers";
import { describe, expect, it } from "@jest/globals";

const startedAtSeconds = 1_000;
const nowSeconds = 1_300;
const passedSeconds = nowSeconds - startedAtSeconds;
const dateKey = getLocalDateKey(nowSeconds);

const createRunningState = ({
  phase = "focus",
  durationSeconds = SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds,
  accumulatedActiveSeconds = 0,
  focusSeconds = 0,
  breakSeconds = 0,
}: {
  phase?: TimerPhase;
  durationSeconds?: number;
  accumulatedActiveSeconds?: number;
  focusSeconds?: number;
  breakSeconds?: number;
} = {}): PomodoroState => ({
  timerSession: {
    ...POMODORO_INITIAL_STATE.timerSession,
    phase,
    status: "running",
    timerDurationSeconds: durationSeconds,
    accumulatedActiveSeconds,
    sessionActive: true,
    startedAtSeconds,
    endsAtSeconds:
      startedAtSeconds + durationSeconds - accumulatedActiveSeconds,
  },
  trackingHistory:
    focusSeconds > 0 || breakSeconds > 0
      ? {
          [dateKey]: {
            dateKey,
            completedRounds: 0,
            focusSeconds,
            breakSeconds,
            updatedAtSeconds: startedAtSeconds,
          },
        }
      : {},
});

describe("pomodoro reducer", () => {
  it("hydrates the complete persisted state", () => {
    const persistedState = createRunningState({ focusSeconds: 300 });

    expect(
      reducer(POMODORO_INITIAL_STATE, {
        type: ACTION_LABELS.hydratePomodoroState,
        state: persistedState,
      }),
    ).toBe(persistedState);
  });

  it("hydrates only tracking history without changing the timer session", () => {
    const runningState = createRunningState();
    const hydratedHistory = {
      "2026-09-18": {
        dateKey: "2026-09-18",
        completedRounds: 2,
        focusSeconds: 3_000,
        breakSeconds: 600,
        updatedAtSeconds: 1_790_024_800,
      },
    };

    const nextState = reducer(runningState, {
      type: ACTION_LABELS.hydrateTrackingHistory,
      trackingHistory: hydratedHistory,
    });

    expect(nextState.trackingHistory).toBe(hydratedHistory);
    expect(nextState.timerSession).toBe(runningState.timerSession);
  });

  it("starts a ready timer with the configured duration", () => {
    const durationSeconds = 40 * 60;
    const state = reducer(POMODORO_INITIAL_STATE, {
      type: ACTION_LABELS.startOrResumePhase,
      nowSeconds,
      phaseDurationSeconds: durationSeconds,
    });

    expect(state.timerSession).toMatchObject({
      status: "running",
      timerDurationSeconds: durationSeconds,
      startedAtSeconds: nowSeconds,
      endsAtSeconds: nowSeconds + durationSeconds,
      sessionActive: true,
    });
    expect(state.trackingHistory).toEqual({});
  });

  it("pauses and tracks only the newly completed running segment", () => {
    const state = createRunningState({
      accumulatedActiveSeconds: 50,
      focusSeconds: 600,
    });
    const nextState = reducer(state, {
      type: ACTION_LABELS.pausePhase,
      nowSeconds,
    });

    expect(nextState.timerSession.accumulatedActiveSeconds).toBe(350);
    expect(nextState.timerSession.status).toBe("paused");
    expect(nextState.trackingHistory[dateKey].focusSeconds).toBe(900);
  });

  it("resumes without changing tracking history", () => {
    const pausedState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        status: "paused",
        accumulatedActiveSeconds: 300,
        sessionActive: true,
      },
    };
    const nextState = reducer(pausedState, {
      type: ACTION_LABELS.startOrResumePhase,
      nowSeconds,
      phaseDurationSeconds:
        SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds,
    });

    expect(nextState.timerSession.endsAtSeconds).toBe(
      nowSeconds + SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds - 300,
    );
    expect(nextState.trackingHistory).toBe(pausedState.trackingHistory);
  });

  it("tracks a running segment when resetting", () => {
    const state = createRunningState();
    const nextState = reducer(state, {
      type: ACTION_LABELS.resetTimer,
      nowSeconds,
      phaseDurationSeconds:
        SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds,
    });

    expect(nextState.trackingHistory[dateKey].focusSeconds).toBe(passedSeconds);
    expect(nextState.timerSession).toMatchObject({
      status: "ready",
      accumulatedActiveSeconds: 0,
      startedAtSeconds: null,
      endsAtSeconds: null,
    });
  });

  it("does not track paused accumulated time twice when resetting", () => {
    const pausedState: PomodoroState = {
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        status: "paused",
        accumulatedActiveSeconds: 300,
        sessionActive: true,
      },
      trackingHistory: {
        [dateKey]: {
          dateKey,
          completedRounds: 0,
          focusSeconds: 300,
          breakSeconds: 0,
          updatedAtSeconds: nowSeconds,
        },
      },
    };
    const nextState = reducer(pausedState, {
      type: ACTION_LABELS.resetTimer,
      nowSeconds,
      phaseDurationSeconds:
        SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds,
    });

    expect(nextState.trackingHistory[dateKey].focusSeconds).toBe(300);
  });

  it("completes focus, tracks its final segment and starts a short break", () => {
    const completionSeconds =
      startedAtSeconds + SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds;
    const completionDateKey = getLocalDateKey(completionSeconds);
    const state = createRunningState();
    const nextState = reducer(state, {
      type: ACTION_LABELS.completeFocus,
      nowSeconds: completionSeconds,
      shortBreakDurationSeconds:
        SETTINGS_DURATIONS.defaultDurations.shortBreakPhaseSeconds,
      longBreakDurationSeconds:
        SETTINGS_DURATIONS.defaultDurations.longBreakPhaseSeconds,
    });

    expect(nextState.trackingHistory[completionDateKey]).toMatchObject({
      focusSeconds: SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds,
      completedRounds: 1,
    });
    expect(nextState.timerSession).toMatchObject({
      currentRoundNumber: 1,
      phase: "shortBreak",
      status: "ready",
      timerDurationSeconds:
        SETTINGS_DURATIONS.defaultDurations.shortBreakPhaseSeconds,
    });
  });

  it("creates a long break after every fourth completed focus", () => {
    const state = createRunningState();
    state.timerSession.currentRoundNumber = 3;
    const completionSeconds =
      startedAtSeconds + SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds;
    const nextState = reducer(state, {
      type: ACTION_LABELS.completeFocus,
      nowSeconds: completionSeconds,
      shortBreakDurationSeconds:
        SETTINGS_DURATIONS.defaultDurations.shortBreakPhaseSeconds,
      longBreakDurationSeconds:
        SETTINGS_DURATIONS.defaultDurations.longBreakPhaseSeconds,
    });

    expect(nextState.timerSession.phase).toBe("longBreak");
    expect(nextState.timerSession.timerDurationSeconds).toBe(
      SETTINGS_DURATIONS.defaultDurations.longBreakPhaseSeconds,
    );
  });

  it("tracks the current break segment before extending it", () => {
    const state = createRunningState({
      phase: "shortBreak",
      durationSeconds:
        SETTINGS_DURATIONS.defaultDurations.shortBreakPhaseSeconds,
    });
    const nextState = reducer(state, {
      type: ACTION_LABELS.extendBreak,
      nowSeconds,
    });

    expect(nextState.trackingHistory[dateKey].breakSeconds).toBe(passedSeconds);
    expect(nextState.timerSession.timerDurationSeconds).toBe(
      SETTINGS_DURATIONS.defaultDurations.shortBreakPhaseSeconds +
        SETTINGS_DURATIONS.defaultDurations.breakExtensionSeconds,
    );
    expect(nextState.timerSession.accumulatedActiveSeconds).toBe(passedSeconds);
    expect(nextState.timerSession.startedAtSeconds).toBe(nowSeconds);
  });

  it("does not extend a break more than once", () => {
    const state = createRunningState({
      phase: "shortBreak",
      durationSeconds:
        SETTINGS_DURATIONS.defaultDurations.shortBreakPhaseSeconds +
        SETTINGS_DURATIONS.defaultDurations.breakExtensionSeconds,
    });
    state.timerSession.breakExtended = true;

    expect(
      reducer(state, {
        type: ACTION_LABELS.extendBreak,
        nowSeconds,
      }),
    ).toBe(state);
  });

  it("ends a running break and tracks its current segment", () => {
    const state = createRunningState({
      phase: "shortBreak",
      durationSeconds:
        SETTINGS_DURATIONS.defaultDurations.shortBreakPhaseSeconds,
    });
    const nextState = reducer(state, {
      type: ACTION_LABELS.endBreak,
      nowSeconds,
    });

    expect(nextState.trackingHistory[dateKey].breakSeconds).toBe(passedSeconds);
    expect(nextState.timerSession.status).toBe("completed");
  });

  it("ends a running session and preserves its tracked segment", () => {
    const state = createRunningState();
    const nextState = reducer(state, {
      type: ACTION_LABELS.endSession,
      nowSeconds,
      focusDurationSeconds:
        SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds,
    });

    expect(nextState.trackingHistory[dateKey].focusSeconds).toBe(passedSeconds);
    expect(nextState.timerSession).toMatchObject({
      phase: "focus",
      status: "ready",
      sessionActive: false,
    });
  });

  it("does not track a completed phase twice when ending the session", () => {
    const completedState: PomodoroState = {
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        phase: "shortBreak",
        status: "completed",
        sessionActive: true,
        accumulatedActiveSeconds:
          SETTINGS_DURATIONS.defaultDurations.shortBreakPhaseSeconds,
      },
      trackingHistory: {
        [dateKey]: {
          dateKey,
          completedRounds: 1,
          focusSeconds: SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds,
          breakSeconds:
            SETTINGS_DURATIONS.defaultDurations.shortBreakPhaseSeconds,
          updatedAtSeconds: nowSeconds,
        },
      },
    };
    const nextState = reducer(completedState, {
      type: ACTION_LABELS.endSession,
      nowSeconds,
      focusDurationSeconds:
        SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds,
    });

    expect(nextState.trackingHistory).toEqual(completedState.trackingHistory);
  });

  it("starts a new round with the configured focus duration", () => {
    const customFocusSeconds = 40 * 60;
    const completedState: PomodoroState = {
      ...POMODORO_INITIAL_STATE,
      timerSession: {
        ...POMODORO_INITIAL_STATE.timerSession,
        phase: "shortBreak",
        status: "completed",
        sessionActive: true,
      },
    };
    const nextState = reducer(completedState, {
      type: ACTION_LABELS.newSessionRound,
      nowSeconds,
      focusDurationSeconds: customFocusSeconds,
    });

    expect(nextState.timerSession.timerDurationSeconds).toBe(
      customFocusSeconds,
    );
    expect(nextState.timerSession.endsAtSeconds).toBe(
      nowSeconds + customFocusSeconds,
    );
  });

  it("caps tracking at the timer phase duration", () => {
    const state = createRunningState();
    const muchLater = startedAtSeconds + 100_000;
    const muchLaterDateKey = getLocalDateKey(muchLater);
    const nextState = reducer(state, {
      type: ACTION_LABELS.endSession,
      nowSeconds: muchLater,
      focusDurationSeconds:
        SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds,
    });

    expect(nextState.trackingHistory[muchLaterDateKey].focusSeconds).toBe(
      SETTINGS_DURATIONS.defaultDurations.focusPhaseSeconds,
    );
  });

  it("returns the same state for an invalid action", () => {
    expect(
      reducer(POMODORO_INITIAL_STATE, {
        type: ACTION_LABELS.endBreak,
        nowSeconds,
      }),
    ).toBe(POMODORO_INITIAL_STATE);
  });
});
