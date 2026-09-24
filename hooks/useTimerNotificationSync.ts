import { TimerSession } from "@/constants/types";
import {
  cancelTimerCompletionNotification,
  scheduleTimerCompletionNotification,
} from "@/services/timerNotifications";
import { useEffect } from "react";

export const useTimerNotificationSync = (timerSession: TimerSession) => {
  const { status, phase, endsAtSeconds } = timerSession;

  useEffect(() => {
    const syncNotification = async () => {
      try {
        // Further validation is handled by the scheduleTimerCompletion,
        // need to check if endsAtSeconds isnt null for TS
        if (status === "running" && endsAtSeconds !== null) {
          await scheduleTimerCompletionNotification(endsAtSeconds, phase);
          return;
        }

        // Cancel notifications if the timer status isnt running
        await cancelTimerCompletionNotification();
      } catch (error) {
        console.error("Timer notification sync failed: ", error);
      }
    };

    void syncNotification();
  }, [status, phase, endsAtSeconds]);
};
