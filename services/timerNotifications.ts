import { TimerPhase } from "@/constants/types";
import { isNonNegativeSafeInteger } from "@/utils/validation.general";
import * as Notifications from "expo-notifications";

const TIMER_COMPLETION_NOTIFICATION_ID = "activeTimerCompletion";

export const IDENTIFIERS = {
  focusComplete: "focusComplete",
  breakComplete: "breakComplete",
  startBreak: "startBreak",
  startNewRound: "startNewRound",
  endSession: "endSession",
  timerPhaseCompleted: "timerPhaseCompleted",
};

export const requestNotificationPermission = async (): Promise<boolean> => {
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

export const registerTimerNotificationCategories = async (): Promise<void> => {
  await Notifications.setNotificationCategoryAsync(IDENTIFIERS.focusComplete, [
    {
      identifier: IDENTIFIERS.startBreak,
      buttonTitle: "Start break",
      options: { opensAppToForeground: true },
    },
    {
      identifier: IDENTIFIERS.endSession,
      buttonTitle: "End session",
      options: { opensAppToForeground: true },
    },
  ]);

  await Notifications.setNotificationCategoryAsync(IDENTIFIERS.breakComplete, [
    {
      identifier: IDENTIFIERS.startNewRound,
      buttonTitle: "Start new focus round",
      options: { opensAppToForeground: true },
    },
    {
      identifier: IDENTIFIERS.endSession,
      buttonTitle: "End session",
      options: { opensAppToForeground: true },
    },
  ]);
};

export const scheduleTimerCompletionNotification = async (
  nowSeconds: number,
  endsAtSeconds: number,
  timerPhase: TimerPhase,
): Promise<void> => {
  if (
    !isNonNegativeSafeInteger(endsAtSeconds) ||
    !isNonNegativeSafeInteger(nowSeconds) ||
    endsAtSeconds <= nowSeconds
  )
    return;

  const endingDate = new Date(endsAtSeconds * 1000);

  const categoryIdentifier =
    timerPhase === "focus"
      ? IDENTIFIERS.focusComplete
      : IDENTIFIERS.breakComplete;
  const formattedPhase = timerPhase === "focus" ? "Focus" : "Break";

  await Notifications.scheduleNotificationAsync({
    identifier: TIMER_COMPLETION_NOTIFICATION_ID,
    content: {
      title: `${formattedPhase} phase has ended ⏰`,
      body:
        timerPhase === "focus"
          ? "Time to take a break!"
          : "Ready for a new focus round?",
      categoryIdentifier: categoryIdentifier,
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
    },
  });
};

export const cancelTimerCompletionNotification = async (): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(
    TIMER_COMPLETION_NOTIFICATION_ID,
  );
};
