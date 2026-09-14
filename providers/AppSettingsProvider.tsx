import {
  DEFAULT_DAILY_GOAL_SECONDS,
  MAX_DAILY_GOAL_SECONDS,
  MIN_DAILY_GOAL_SECONDS,
} from "@/constants/goal.constants";
import { APP_SETTINGS_STORAGE_KEY } from "@/constants/storage.constants";
import { theme } from "@/constants/theme";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import { getStorageByKey, storeData } from "./asyncStorage.helpers";

type AppSettings = {
  dailyGoalSeconds: number;
};

const DEFAULT_APP_SETTINGS: AppSettings = {
  dailyGoalSeconds: DEFAULT_DAILY_GOAL_SECONDS,
};

type AppSettingsContextValue = {
  dailyGoalSeconds: number;
  updateDailyGoalSeconds: (seconds: number) => boolean;
};

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(
  undefined,
);

const { colors } = theme;

const validateAppSettings = (value: unknown): value is AppSettings => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const settings = value as Record<string, unknown>;

  if (typeof settings.dailyGoalSeconds !== "number") {
    return false;
  }
  if (!validateDailyGoalSeconds(settings.dailyGoalSeconds)) return false;

  return true;
};

const validateDailyGoalSeconds = (seconds: number) => {
  if (!Number.isFinite(seconds)) return false;
  if (!Number.isInteger(seconds)) return false;
  if (seconds < MIN_DAILY_GOAL_SECONDS || seconds > MAX_DAILY_GOAL_SECONDS)
    return false;

  return true;
};

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState(DEFAULT_APP_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loadAppSettings = async () => {
      try {
        const storedSettings = await getStorageByKey(
          APP_SETTINGS_STORAGE_KEY,
        );

        if (storedSettings === null) return;

        if (!validateAppSettings(storedSettings)) return;

        setSettings(storedSettings);
      } finally {
        setIsHydrated(true);
      }
    };

    loadAppSettings();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    validateAppSettings(settings)
      ? storeData(APP_SETTINGS_STORAGE_KEY, settings)
      : storeData(APP_SETTINGS_STORAGE_KEY, DEFAULT_APP_SETTINGS);
  }, [settings, isHydrated]);

  const updateDailyGoalSeconds = (seconds: number) => {
    if (!validateDailyGoalSeconds(seconds)) return false;
    setSettings((prev) => ({ ...prev, dailyGoalSeconds: seconds }));
    return true;
  };

  if (!isHydrated) return <View style={styles.container} />;

  return (
    <AppSettingsContext.Provider
      value={{
        dailyGoalSeconds: settings.dailyGoalSeconds,
        updateDailyGoalSeconds,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
