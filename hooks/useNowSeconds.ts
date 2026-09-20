import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

export const getNowSeconds = () => Math.floor(Date.now() / 1000);

export const useNowSeconds = (refreshIntervalMs = 30_000) => {
  const [nowSeconds, setNowSeconds] = useState(getNowSeconds);

  const refreshNow = useCallback(() => {
    const nextNowSeconds = getNowSeconds();
    setNowSeconds(nextNowSeconds);
    return nextNowSeconds;
  }, []);

  useEffect(() => {
    refreshNow();

    const interval = setInterval(refreshNow, refreshIntervalMs);
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (nextAppState === "active") refreshNow();
      },
    );

    return () => {
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, [refreshIntervalMs, refreshNow]);

  return { nowSeconds, refreshNow };
};
