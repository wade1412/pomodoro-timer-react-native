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
        if (status === "running" && endsAtSeconds !== null) {
          await scheduleTimerCompletionNotification(endsAtSeconds, phase);
          return;
        }

        await cancelTimerCompletionNotification();
      } catch (error) {
        console.error("Timer notification sync failed: ", error);
      }
    };

    void syncNotification();
  }, [status, phase, endsAtSeconds]);

  // endsAt seconds validation are handled by the notif observer
  // return functions to schedule and clean notifs?
};
