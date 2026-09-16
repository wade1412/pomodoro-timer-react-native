import { POMODORO_INITIAL_STATE, PomodoroState } from "@/constants/types";
import { reducer } from "@/state/pomodoroReducer";
import { ReducerAction } from "@/state/reducer.helpers";
import {
  ActionDispatch,
  createContext,
  ReactNode,
  useContext,
  useReducer,
} from "react";
import { useAppSettings } from "./AppSettingsProvider";

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
