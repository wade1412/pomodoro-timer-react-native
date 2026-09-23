import * as Notifications from "expo-notifications";
import {
  requestNotificationPermission,
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

jest.mock("expo-notifications");

const getPermissionsAsync = jest.mocked(Notifications.getPermissionsAsync);
const requestPermissionsAsync = jest.mocked(
  Notifications.requestPermissionsAsync,
);
const scheduleNotificationAsync = jest.mocked(
  Notifications.scheduleNotificationAsync,
);

describe("timer notifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(1_000_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("waits for notification permission when it has not been granted", async () => {
    getPermissionsAsync.mockResolvedValue({ status: "undetermined" } as never);
    requestPermissionsAsync.mockResolvedValue({ status: "granted" } as never);

    await expect(requestNotificationPermission()).resolves.toBe(true);
    expect(requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it("schedules a notification for a future end timestamp", async () => {
    scheduleNotificationAsync.mockResolvedValue("activeTimerCompletion");

    await expect(
      scheduleTimerCompletionNotification(1_010, "focus"),
    ).resolves.toBe(true);

    expect(scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: "activeTimerCompletion",
        trigger: {
          type: "date",
          date: new Date(1_010_000),
        },
      }),
    );
  });

  it("does not ask iOS to schedule a past or nearly elapsed trigger", async () => {
    await expect(
      scheduleTimerCompletionNotification(1_001, "focus"),
    ).resolves.toBe(false);

    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
