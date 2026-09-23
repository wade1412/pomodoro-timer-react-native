import { registerTimerNotificationCategories } from "@/services/timerNotifications";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

type UseNotificationObserverOptions = {
  onResponse: (
    response: Notifications.NotificationResponse,
  ) => void | Promise<void>;
};

// Handler
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export const useNotificationObserver = ({
  onResponse,
}: UseNotificationObserverOptions) => {
  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    let isDisposed = false;

    const initializeNotifications = async () => {
      try {
        // Register Categories
        await registerTimerNotificationCategories();

        // Get initial response
        const initialResponse = Notifications.getLastNotificationResponse();
        // Return early if cold start or hook unmounted
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
