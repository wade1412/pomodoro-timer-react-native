import { registerTimerNotificationCategories } from "@/services/timerNotifications";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

type UseNotificationObserverOptions = {
  onResponse: (
    response: Notifications.NotificationResponse,
  ) => void | Promise<void>;
};

// Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotificationObserver = ({
  onResponse,
}: UseNotificationObserverOptions) => {
  useEffect(() => {
    let isDisposed = false;

    const initializeNotifications = async () => {
      try {
        await registerTimerNotificationCategories();

        const initialResponse = Notifications.getLastNotificationResponse();

        if (!initialResponse || isDisposed) return;

        try {
          await onResponse(initialResponse);
        } finally {
          Notifications.clearLastNotificationResponse();
        }
      } catch (error) {
        console.error("Notification initialization failed:", error);
      }
    };

    void initializeNotifications();

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) =>
        onResponse(response),
      );

    // Clean up
    return () => {
      isDisposed = true;
      responseSubscription.remove();
    };
  }, [onResponse]);
};
