import { POMODORO_TRACKING_STORAGE_KEY } from "@/constants/storage.constants";
import { theme } from "@/constants/theme";
import {
  POMODORO_INITIAL_STATE,
  PomodoroState,
} from "@/constants/types";
import { reducer } from "@/state/pomodoroReducer";
import { ACTION_LABELS, ReducerAction } from "@/state/reducer.helpers";
import { validateTrackingHistory } from "@/state/tracking.validation";
import {
  ActionDispatch,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import { useAppSettings } from "./AppSettingsProvider";
import { getStorageByKey, storeData } from "./asyncStorage.helpers";

const { colors } = theme;

type PomodoroContextValue = {
  state: PomodoroState;
  dispatch: ActionDispatch<[action: ReducerAction]>;
};

const PomodoroContext = createContext<PomodoroContextValue | undefined>(
  undefined,
);

export const PomodoroProvider = ({ children }: { children: ReactNode }) => {
  const { focusDurationSeconds } = useAppSettings();
  const [state, dispatch] = useReducer(
    reducer,
    POMODORO_INITIAL_STATE,
    (initialState) => ({
      ...initialState,
      timerSession: {
        ...initialState.timerSession,
        timerDurationSeconds: focusDurationSeconds,
      },
    }),
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loadPomodoroTracking = async () => {
      try {
        const storedTracking = await getStorageByKey(
          POMODORO_TRACKING_STORAGE_KEY,
        );

        if (!validateTrackingHistory(storedTracking)) return;

        dispatch({
          type: ACTION_LABELS.hydrateTrackingHistory,
          trackingHistory: storedTracking,
        });
      } finally {
        setIsHydrated(true);
      }
    };

    loadPomodoroTracking();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    storeData(POMODORO_TRACKING_STORAGE_KEY, state.trackingHistory);
  }, [state.trackingHistory, isHydrated]);

  if (!isHydrated) return <View style={styles.container} />;

  return (
    <PomodoroContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoroContext = () => {
  const context = useContext(PomodoroContext);

  if (!context) {
    throw new Error("usePomodoroContext must be used within PomodoroProvider");
  }

  return context;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
