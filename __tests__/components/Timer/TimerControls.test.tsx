import TimerControls from "@/components/Timer/TimerControls";
import { DEFAULT_TIMER_SESSION, TimerSession } from "@/constants/types";
import { fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, jest } from "@jest/globals";

const createProps = (timerSession: TimerSession, buttonText: string) => ({
  timerSession,
  buttonText,
  onRunTimerPhase: jest.fn(),
  onPauseTimerPhase: jest.fn(),
  onTimerReset: jest.fn(),
  onAddBreakTime: jest.fn(),
  onBreakComplete: jest.fn(),
  onNewSessionRound: jest.fn(),
  onEndSession: jest.fn(),
});

describe("TimerControls", () => {
  it("shows only the start action for a ready phase", async () => {
    const props = createProps(DEFAULT_TIMER_SESSION, "Start Focus");
    const screen = await render(<TimerControls {...props} />);

    await fireEvent.press(screen.getByRole("button", { name: "Start Focus" }));

    expect(props.onRunTimerPhase).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Reset Timer")).toBeNull();
  });

  it("shows running focus controls and dispatches pause, reset and end", async () => {
    const props = createProps(
      {
        ...DEFAULT_TIMER_SESSION,
        status: "running",
        sessionActive: true,
        startedAtSeconds: 1_000,
        endsAtSeconds: 2_500,
      },
      "Pause Focus",
    );
    const screen = await render(<TimerControls {...props} />);

    await fireEvent.press(screen.getByRole("button", { name: "Pause Focus" }));
    await fireEvent.press(screen.getByRole("button", { name: "Reset timer" }));
    await fireEvent.press(screen.getByRole("button", { name: "End Session" }));

    expect(props.onPauseTimerPhase).toHaveBeenCalledTimes(1);
    expect(props.onTimerReset).toHaveBeenCalledTimes(1);
    expect(props.onEndSession).toHaveBeenCalledTimes(1);
  });

  it("resumes a paused phase", async () => {
    const props = createProps(
      {
        ...DEFAULT_TIMER_SESSION,
        status: "paused",
        sessionActive: true,
        accumulatedActiveSeconds: 300,
      },
      "Resume Focus",
    );
    const screen = await render(<TimerControls {...props} />);

    await fireEvent.press(screen.getByRole("button", { name: "Resume Focus" }));

    expect(props.onRunTimerPhase).toHaveBeenCalledTimes(1);
  });

  it("shows completed-round actions", async () => {
    const props = createProps(
      {
        ...DEFAULT_TIMER_SESSION,
        phase: "shortBreak",
        status: "completed",
        currentRoundNumber: 1,
        sessionActive: true,
      },
      "Start Break",
    );
    const screen = await render(<TimerControls {...props} />);

    await fireEvent.press(screen.getByRole("button", { name: "Start round 2" }));

    expect(screen.getByText("Round 1 complete. Ready for another?")).toBeTruthy();
    expect(props.onNewSessionRound).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Reset Timer")).toBeNull();
  });
});
