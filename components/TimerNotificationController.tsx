import { useTimerNotificationSync } from "@/hooks/useTimerNotificationSync";
import { usePomodoroContext } from "@/providers/PomodoroProvider";

// This components purpose is to get PomodoroContext, since we cant
// call the hook without it and we need the notification behaviour
// to be consistent throughtout the app - that is why the component
// doesnt return anything

export default function TimerNotificationController() {
  const { state } = usePomodoroContext();

  useTimerNotificationSync(state.timerSession);

  return null;
}
