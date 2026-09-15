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
import {
  validateAppSettings,
  validateDailyGoalSeconds,
  validateFocusDurationSeconds,
  validateLongBreakDurationSeconds,
  migrateAppSettings,
  validateShortBreakDurationSeconds,
} from "./appSettings.helpers";
import {
  AppSettingsContextValue,
  DEFAULT_APP_SETTINGS,
} from "./appSettings.types";
import { getStorageByKey, storeData } from "./asyncStorage.helpers";

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(
  undefined,
);

const { colors } = theme;

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState(DEFAULT_APP_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loadAppSettings = async () => {
      try {
        const storedSettings = await getStorageByKey(APP_SETTINGS_STORAGE_KEY);

        if (storedSettings === null) return;

        const migratedSettings = migrateAppSettings(storedSettings);
        if (!migratedSettings) return;

        setSettings(migratedSettings);
      } finally {
        setIsHydrated(true);
      }
    };

    loadAppSettings();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!settings || !validateAppSettings(settings)) {
      storeData(APP_SETTINGS_STORAGE_KEY, DEFAULT_APP_SETTINGS);
      return;
    }

    storeData(APP_SETTINGS_STORAGE_KEY, settings);
  }, [settings, isHydrated]);

  const updateDailyGoalSeconds = (seconds: number) => {
    if (!validateDailyGoalSeconds(seconds)) return false;

    setSettings((prev) => ({ ...prev, dailyGoalSeconds: seconds }));
    return true;
  };

  const updateFocusDurationSeconds = (seconds: number) => {
    if (!validateFocusDurationSeconds(seconds)) return false;

    setSettings((prev) => ({ ...prev, focusDurationSeconds: seconds }));
    return true;
  };

  const updateShortBreakDurationSeconds = (seconds: number) => {
    if (!validateShortBreakDurationSeconds(seconds)) return false;

    setSettings((prev) => ({ ...prev, shortBreakDurationSeconds: seconds }));
    return true;
  };

  const updateLongBreakDurationSeconds = (seconds: number) => {
    if (!validateLongBreakDurationSeconds(seconds)) return false;

    setSettings((prev) => ({ ...prev, longBreakDurationSeconds: seconds }));
    return true;
  };

  if (!isHydrated) return <View style={styles.container} />;

  return (
    <AppSettingsContext.Provider
      value={{
        dailyGoalSeconds: settings.dailyGoalSeconds,
        focusDurationSeconds: settings.focusDurationSeconds,
        longBreakDurationSeconds: settings.longBreakDurationSeconds,
        shortBreakDurationSeconds: settings.shortBreakDurationSeconds,
        updateDailyGoalSeconds,
        updateFocusDurationSeconds,
        updateLongBreakDurationSeconds,
        updateShortBreakDurationSeconds,
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
