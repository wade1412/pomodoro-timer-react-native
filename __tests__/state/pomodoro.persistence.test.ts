import { POMODORO_INITIAL_STATE, PomodoroState } from "@/constants/types";
import {
  createPersistedPomodoroState,
  parsePersistedPomodoroState,
  validatePersistedTimerSession,
} from "@/state/pomodoro.persistence";
import { describe, expect, it } from "@jest/globals";

const runningState: PomodoroState = {
  ...POMODORO_INITIAL_STATE,
  timerSession: {
    ...POMODORO_INITIAL_STATE.timerSession,
    status: "running",
    sessionActive: true,
    startedAtSeconds: 1_000,
    endsAtSeconds: 2_500,
  },
};

describe("pomodoro persistence", () => {
  it("round-trips a valid running timer session", () => {
    const persistedState = createPersistedPomodoroState(runningState);

    expect(parsePersistedPomodoroState(persistedState)).toEqual(runningState);
  });

  it("rejects a running timer without timestamps", () => {
    expect(
      validatePersistedTimerSession({
        ...runningState.timerSession,
        startedAtSeconds: null,
        endsAtSeconds: null,
      }),
    ).toBe(false);
  });

  it("rejects an unsupported persistence version", () => {
    expect(
      parsePersistedPomodoroState({
        ...createPersistedPomodoroState(runningState),
        version: 2,
      }),
    ).toBeNull();
  });

  it("rejects a document with invalid tracking history", () => {
    expect(
      parsePersistedPomodoroState({
        ...createPersistedPomodoroState(runningState),
        trackingHistory: {
          "2026-09-20": {
            dateKey: "2026-09-20",
            completedRounds: 0,
            focusSeconds: -1,
            breakSeconds: 0,
            updatedAtSeconds: 1_000,
          },
        },
      }),
    ).toBeNull();
  });
});
