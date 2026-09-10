import {
  DEFAULT_DAILY_GOAL_SECONDS,
  MAX_DAILY_GOAL_SECONDS,
  MIN_DAILY_GOAL_SECONDS,
} from "@/constants/goal.constants";
import { createContext, ReactNode, useContext, useState } from "react";

type AppSettingsContextValue = {
  dailyGoalSeconds: number;
  updateDailyGoalSeconds: (minutes: number) => boolean;
};

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(
  undefined,
);

const validateDailyGoalSeconds = (seconds: number) => {
  if (!Number.isFinite(seconds)) return false;
  if (!Number.isInteger(seconds)) return false;
  if (seconds < MIN_DAILY_GOAL_SECONDS || seconds > MAX_DAILY_GOAL_SECONDS)
    return false;

  return true;
};

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [dailyGoalSeconds, setDailyGoalSeconds] = useState(
    DEFAULT_DAILY_GOAL_SECONDS,
  );

  const updateDailyGoalSeconds = (seconds: number) => {
    if (!validateDailyGoalSeconds(seconds)) return false;
    setDailyGoalSeconds(seconds);
    return true;
  };

  return (
    <AppSettingsContext.Provider
      value={{
        dailyGoalSeconds,
        updateDailyGoalSeconds: updateDailyGoalSeconds,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);

  if (!context) {
    throw new Error(
      "useAppSettings must be used within an AppSettingsProvider",
    );
  }

  return context;
};
