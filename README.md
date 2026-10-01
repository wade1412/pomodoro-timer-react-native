# Focus Timer

Focus Timer is a simple Pomodoro app for iOS built with React Native and Expo.

I made this project to learn more about React Native, reducers, Context API, local storage, notifications, and testing. It is not a copy of an existing app or a production product. I wrote the main timer, reconciliation, and tracking logic myself.

## Features

- Start, pause, and reset a focus timer.
- Move from a focus phase to a short or long break.
- Add extra time to a break.
- Keep the active timer after the app is closed.
- Restore the correct timer state when the app is opened again.
- Send a local notification when a phase ends.
- Track focus time, break time, and completed rounds.
- Set a custom daily focus goal.
- View daily and monthly statistics in a calendar.
- Change the focus, short break, and long break durations.

## Tech stack

- React Native
- Expo SDK 57
- Expo Router
- TypeScript
- React Context and `useReducer`
- AsyncStorage
- Expo Notifications
- React Native Reanimated
- Jest and React Native Testing Library

## Main decisions

### Timestamp-based timer

The timer does not decrease a value in state every second. Instead, it stores the start time and the exact time when the current phase should end.

The remaining time is calculated from the current real time. This prevents the timer from drifting or stopping when the app goes into the background, closes, or JavaScript does not run for a while.

### Reconciliation

The timer state is saved in AsyncStorage. When the app starts, it loads the saved state and compares it with the current time and current settings.

If a phase should already be finished, the app completes it and tracks the time the user spent in that phase. If the user changes the duration of an active phase, the timer state is also updated to match the new setting.

This logic lives at the provider/controller level instead of inside the timer screen. Because of that, it works while the timer, calendar, or settings screen is open.

### Tracking

Statistics are stored separately for each local date using the `YYYY-MM-DD` format.

Time is added to the history when the current active segment is recorded. This happens on pause, reset, phase completion, session completion, or reconciliation. Time that has already been saved is not added again.

#### Tracking across midnight

An active segment is currently **not split between two days**.

All unsaved time is assigned to the local date of the event that records the segment. For example:

- A focus phase starts at 23:50.
- It ends at 00:15.
- All 25 minutes are assigned to the new day.

A completed round is also assigned to the day when the focus phase was completed.

If the user pauses the timer before midnight, the time before that pause is already recorded on the previous day. After the timer is resumed, the new segment is recorded separately using the same rule.

This is an intentional simplification for this project. It keeps tracking predictable and avoids adding date-splitting logic to the reducer. If more accurate daily statistics are needed later, a segment can be split at the local midnight boundary.

### Notifications

When the timer starts, the app schedules one local notification for the end of the phase. The scheduled notification is cancelled after a pause, reset, or phase completion.

The notification only tells the user that the timer has ended. React state is updated separately by the lifecycle controller, so the business logic does not depend on the user opening or pressing the notification.

### Local storage

The app stores:

- The current timer session.
- Tracking history.
- Phase duration settings.
- The daily focus goal.

The saved timer state has a version and is validated before it is used. There is also a fallback for tracking history saved in the older format.

## Project structure

```text
app/          Expo Router screens and navigation
components/   UI components and controller components
providers/    Global state, hydration, and local storage
state/        Reducer, tracking, persistence, and validation
hooks/        Time updates and notification synchronization
services/     Local notification API
constants/    Types, theme, and constants
utils/        Small shared functions
__tests__/    Unit and integration tests
```

## Running the project

You need Node.js, npm, and an environment that can run Expo apps.

1. Install the dependencies:

```bash
npm install
```

2. Start Expo:

```bash
npm start
```

3. Open the app on a physical device or start the iOS Simulator:

```bash
npm run ios
```

The iOS Simulator requires macOS and Xcode. This project was mainly developed and tested for iOS. Some Android configuration is included, but Android was not the main target platform.

You can also run it in your browser on Windows

```bash
npm start
```

Use ExpoGo on your iPhone to test it using the Windows system, however make sure the expo versions match

```bash
npx expo start --go --clear
```

## Checking the project

Run the tests:

```bash
npm test
```

Run ESLint:

```bash
npm run lint
```

Check TypeScript:

```bash
npx tsc --noEmit
```

The test suite covers the reducer, tracking, persistence, provider hydration, reconciliation, timer controls, and local notification synchronization.

## Project status

The main features are complete. The app can be used as a finished learning project and as an example of a timer that continues to work across background state, app restarts, and settings changes.

Possible improvements for the future:

- Split tracking precisely across midnight.
- Fully test and support Android.
- Add more accessibility and real-device UI testing.
- Add statistics for longer periods.
- Prepare the app for an App Store release.
