import { POMODORO_INITIAL_STATE, TimerSession } from "@/constants/types";
import { useTimerNotificationSync } from "@/hooks/useTimerNotificationSync";
import {
  cancelTimerCompletionNotification,
  scheduleTimerCompletionNotification,
} from "@/services/timerNotifications";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { renderHook } from "@testing-library/react-native";

jest.mock("@/services/timerNotifications");

describe("useTimerNotificationSync hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(1_000_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("schedules the notification when timer is running with valid endsAtSeconds", () => {
    const testTimerSession: TimerSession = {
      ...POMODORO_INITIAL_STATE.timerSession,
      status: "running",
      startedAtSeconds: 1_000_000,
      sessionActive: true,
      endsAtSeconds: 1_010,
    };

    renderHook(() => useTimerNotificationSync(testTimerSession));

    expect(scheduleTimerCompletionNotification).toHaveBeenCalledTimes(1);

    expect(scheduleTimerCompletionNotification).toHaveBeenCalledWith(
      testTimerSession.endsAtSeconds,
      testTimerSession.phase,
    );
  });

  it("cancels the notification on timer pause", () => {
    const testTimerSession: TimerSession = {
      ...POMODORO_INITIAL_STATE.timerSession,
      status: "paused",
      startedAtSeconds: null,
      sessionActive: false,
      endsAtSeconds: null,
    };

    renderHook(() => useTimerNotificationSync(testTimerSession));

    expect(cancelTimerCompletionNotification).toHaveBeenCalledTimes(1);
  });

  it("cancels the notification on timer reset", () => {
    const testTimerSession: TimerSession = {
      ...POMODORO_INITIAL_STATE.timerSession,
      status: "ready",
      startedAtSeconds: null,
      sessionActive: false,
      endsAtSeconds: null,
    };

    renderHook(() => useTimerNotificationSync(testTimerSession));

    expect(cancelTimerCompletionNotification).toHaveBeenCalledTimes(1);
  });

  it("cancels the notification on timer phase completion", () => {
    const testTimerSession: TimerSession = {
      ...POMODORO_INITIAL_STATE.timerSession,
      status: "completed",
      startedAtSeconds: null,
      sessionActive: false,
      endsAtSeconds: null,
    };

    renderHook(() => useTimerNotificationSync(testTimerSession));

    expect(cancelTimerCompletionNotification).toHaveBeenCalledTimes(1);
  });

  it("cancels the notification on timer status ready", () => {
    const testTimerSession: TimerSession = {
      ...POMODORO_INITIAL_STATE.timerSession,
    };

    renderHook(() => useTimerNotificationSync(testTimerSession));

    expect(cancelTimerCompletionNotification).toHaveBeenCalledTimes(1);
  });

  // TODO Accumulated seconds does not trigger notification schedule
  // TODO Service rejection does not create unhandled promise
});
