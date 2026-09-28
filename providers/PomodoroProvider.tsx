import { SETTINGS_DURATIONS } from "@/constants/settings.constants";
import {
  POMODORO_STATE_STORAGE_KEY,
  POMODORO_TRACKING_STORAGE_KEY,
} from "@/constants/storage.constants";
import { theme } from "@/constants/theme";
import { POMODORO_INITIAL_STATE, PomodoroState } from "@/constants/types";
import { getNowSeconds } from "@/hooks/useNowSeconds";
import {
  createPersistedPomodoroState,
  parsePersistedPomodoroState,
} from "@/state/pomodoro.persistence";
import { reducer } from "@/state/pomodoroReducer";
import { ACTION_LABELS, ReducerAction } from "@/state/reducer.helpers";
import { validateTrackingHistory } from "@/state/tracking.validation";
import { getEffectiveElapsedSeconds } from "@/utils/timer";
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
  // ------- Context and States --------
  // Get phases duration from app settings context
  const {
    focusDurationSeconds,
    shortBreakDurationSeconds,
    longBreakDurationSeconds,
  } = useAppSettings();
  // Initialize state and dispatch from reducer
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

  // Hydration state for syncing settings from storage
  const [isHydrated, setIsHydrated] = useState(false);

  // ------- Storage Handlers --------
  // Load saved data from AsyncStorage on component render
  useEffect(() => {
    const loadPomodoroState = async () => {
      try {
        // Await from async storage
        const [storedPomodoroState, legacyStoredTracking] = await Promise.all([
          getStorageByKey(POMODORO_STATE_STORAGE_KEY),
          getStorageByKey(POMODORO_TRACKING_STORAGE_KEY),
        ]);

        // Validation and parsing
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
      } catch (error) {
        console.log(error);
      } finally {
        setIsHydrated(true);
      }
    };

    loadPomodoroState();
  }, []);

  // Save data on state change, after it was hydrated
  useEffect(() => {
    if (!isHydrated) return;

    storeData(POMODORO_STATE_STORAGE_KEY, createPersistedPomodoroState(state));
  }, [state, isHydrated]);

  // ------- Reconciliation Handler --------
  // Reconcile timer duration to the set settings on settings change
  const { timerSession } = state;
  useEffect(() => {
    if (!isHydrated) return;

    const isFocusPhase = timerSession.phase === "focus";

    const baseDuration = isFocusPhase
      ? focusDurationSeconds
      : timerSession.phase === "shortBreak"
        ? shortBreakDurationSeconds
        : longBreakDurationSeconds;

    // Add break extension duration to the new timer duration if it was already extended
    const newTimerDuration = timerSession.breakExtended
      ? baseDuration + SETTINGS_DURATIONS.defaultDurations.breakExtensionSeconds
      : baseDuration;

    // Return early if duration did not change
    if (newTimerDuration === timerSession.timerDurationSeconds) {
      return;
    }

    // For running or paused timer: check if the new timer duration has been already reached or not
    if (timerSession.status === "running" || timerSession.status === "paused") {
      // Complete phase if elapsed seconds exceed new timer duration
      // - for cases where user had 20 minutes in the timer phase, but
      // changed the phase duration to 15 min
      const nowSeconds = getNowSeconds();
      const elapsedSeconds = getEffectiveElapsedSeconds(
        timerSession,
        nowSeconds,
      );

      if (elapsedSeconds >= newTimerDuration) {
        if (isFocusPhase) {
          dispatch({
            type: ACTION_LABELS.completeFocus,
            nowSeconds,
            shortBreakDurationSeconds,
            longBreakDurationSeconds,
          });
        } else {
          dispatch({
            type: ACTION_LABELS.endBreak,
            nowSeconds: nowSeconds,
          });
        }
        return;
      }

      // Update endsAtSeconds with newTimerDuration if running and null if paused
      return dispatch({
        type: ACTION_LABELS.reconcileTimerSessionToSettings,
        timerSession: {
          ...timerSession,
          timerDurationSeconds: newTimerDuration,
          endsAtSeconds:
            timerSession.status === "running"
              ? nowSeconds + newTimerDuration - elapsedSeconds
              : null,
        },
      });
    }

    return dispatch({
      type: ACTION_LABELS.reconcileTimerSessionToSettings,
      timerSession: {
        ...timerSession,
        timerDurationSeconds: newTimerDuration,
      },
    });
  }, [
    isHydrated,
    focusDurationSeconds,
    shortBreakDurationSeconds,
    longBreakDurationSeconds,
    timerSession,
  ]);

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
