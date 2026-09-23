import { useTimerNotificationSync } from "@/hooks/useTimerNotificationSync";
import { usePomodoroContext } from "@/providers/PomodoroProvider";

export default function TimerNotificationController() {
  const { state } = usePomodoroContext();

  useTimerNotificationSync(state.timerSession);

  return null;
}
