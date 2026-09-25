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
import { renderHook, waitFor } from "@testing-library/react-native";

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
      endsAtSeconds: 1_001_500,
    };

    renderHook(() => useTimerNotificationSync(testTimerSession));

    // Test function execution and arguments
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
  it("does not schedule notification on accumulated seconds change", () => {
    const initialSession: TimerSession = {
      ...POMODORO_INITIAL_STATE.timerSession,
      status: "running",
      startedAtSeconds: 1_000_000,
      sessionActive: true,
      endsAtSeconds: 1_001_500,
      accumulatedActiveSeconds: 0,
    };

    const { rerender } = renderHook(
      (session: TimerSession) => useTimerNotificationSync(session),
      { initialProps: initialSession },
    );

    expect(scheduleTimerCompletionNotification).toHaveBeenCalledTimes(1);

    rerender({
      ...initialSession,
      accumulatedActiveSeconds: 15,
    });

    expect(scheduleTimerCompletionNotification).toHaveBeenCalledTimes(1);
  });

  it("handles scheduleTimerCompletionNotification rejection without creating unhandled promises", async () => {
    // Error sim
    const mockError = new Error("Native notification error");
    (
      scheduleTimerCompletionNotification as jest.MockedFunction<
        typeof scheduleTimerCompletionNotification
      >
    ).mockRejectedValueOnce(mockError);

    // Console spy to intercept console error and test catch
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const testTimerSession: TimerSession = {
      ...POMODORO_INITIAL_STATE.timerSession,
      status: "running",
      startedAtSeconds: 1_000_000,
      sessionActive: true,
      endsAtSeconds: 1_001_500,
    };

    renderHook(() => useTimerNotificationSync(testTimerSession));

    // waiting for async code from useEffect
    await waitFor(() => {
      expect(scheduleTimerCompletionNotification).toHaveBeenCalledWith(
        testTimerSession.endsAtSeconds,
        testTimerSession.phase,
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Timer notification sync failed: ",
        mockError,
      );
    });

    consoleSpy.mockRestore();
  });
});
