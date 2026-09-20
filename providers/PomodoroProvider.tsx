import {
  POMODORO_STATE_STORAGE_KEY,
  POMODORO_TRACKING_STORAGE_KEY,
} from "@/constants/storage.constants";
import { theme } from "@/constants/theme";
import {
  POMODORO_INITIAL_STATE,
  PomodoroState,
} from "@/constants/types";
import { reducer } from "@/state/pomodoroReducer";
import {
  createPersistedPomodoroState,
  parsePersistedPomodoroState,
} from "@/state/pomodoro.persistence";
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
    const loadPomodoroState = async () => {
      try {
        const [storedPomodoroState, legacyStoredTracking] = await Promise.all([
          getStorageByKey(POMODORO_STATE_STORAGE_KEY),
          getStorageByKey(POMODORO_TRACKING_STORAGE_KEY),
        ]);

        const persistedState = parsePersistedPomodoroState(storedPomodoroState);

        if (persistedState) {
          dispatch({
            type: ACTION_LABELS.hydratePomodoroState,
            state: persistedState,
          });
          return;
        }

        if (!validateTrackingHistory(legacyStoredTracking)) return;

        dispatch({
          type: ACTION_LABELS.hydrateTrackingHistory,
          trackingHistory: legacyStoredTracking,
        });
      } finally {
        setIsHydrated(true);
      }
    };

    loadPomodoroState();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    storeData(
      POMODORO_STATE_STORAGE_KEY,
      createPersistedPomodoroState(state),
    );
  }, [state, isHydrated]);

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
