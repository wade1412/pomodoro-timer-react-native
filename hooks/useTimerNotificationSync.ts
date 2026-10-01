import { TimerSession } from "@/constants/types";
import {
  cancelTimerCompletionNotification,
  scheduleTimerCompletionNotification,
} from "@/services/timerNotifications";
import { useEffect, useRef } from "react";

export const useTimerNotificationSync = (timerSession: TimerSession) => {
  const { status, phase, endsAtSeconds } = timerSession;

  const syncQueue = useRef(Promise.resolve());

  useEffect(() => {
    syncQueue.current = syncQueue.current
      .catch(
        // catch first, so the queue wont be rejected and
        // another sync runs regardless
        () => undefined,
      )
      .then(async () => {
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
      });
  }, [status, phase, endsAtSeconds]);
};
