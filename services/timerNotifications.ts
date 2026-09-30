import { TimerPhase } from "@/constants/types";
import { isNonNegativeSafeInteger } from "@/utils/validation.general";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const TIMER_COMPLETION_NOTIFICATION_ID = "activeTimerCompletion";
const MIN_SCHEDULING_LEAD_TIME_MS = 1_000;

const TIMER_NOTIFICATION_CHANNEL_ID = "timer";

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === "web") {
    return false;
  }

  await configureTimerNotificationChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  return true;
};

export const configureTimerNotificationChannel = async () => {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(
    TIMER_NOTIFICATION_CHANNEL_ID,
    {
      name: "Timer alerts",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    },
  );
};

export const scheduleTimerCompletionNotification = async (
  endsAtSeconds: number,
  timerPhase: TimerPhase,
): Promise<boolean> => {
  if (Platform.OS === "web") {
    return false;
  }

  if (!isNonNegativeSafeInteger(endsAtSeconds)) return false;

  const endingTimeMs = endsAtSeconds * 1_000;

  // iOS rejects date triggers that become current or past before the native
  // scheduling request is processed
  if (endingTimeMs <= Date.now() + MIN_SCHEDULING_LEAD_TIME_MS) return false;

  const endingDate = new Date(endingTimeMs);

  const formattedPhase = timerPhase === "focus" ? "Focus" : "Break";

  await Notifications.scheduleNotificationAsync({
    identifier: TIMER_COMPLETION_NOTIFICATION_ID,
    content: {
      title: `${formattedPhase} phase has ended ⏰`,
      body:
        timerPhase === "focus"
          ? "Time to take a break!"
          : "Ready for a new focus round?",
      data: {
        type: "timerPhaseCompleted",
        completedPhase: timerPhase,
        endsAtSeconds,
      },
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: endingDate,
      ...(Platform.OS === "android" && {
        channelId: TIMER_NOTIFICATION_CHANNEL_ID,
      }),
    },
  });

  return true;
};

export const cancelTimerCompletionNotification = async (): Promise<void> => {
  if (Platform.OS === "web") {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(
    TIMER_COMPLETION_NOTIFICATION_ID,
  );
};
