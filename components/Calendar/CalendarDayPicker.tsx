import { theme } from "@/constants/theme";
import { DateKey, TrackingHistory } from "@/constants/types";
import { getDateKeyFromDay } from "@/state/tracking.helpers";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import AnimatedPressable from "../ui/AnimatedPressable";
import {
  createMonthGrid,
  getCalendarCellBackgroundColor,
  weekdaysUINames,
} from "./calendar.helpers";
import { DateInfo } from "./calendar.types";

const { colors, spacing, radius, typography } = theme;

const calendarMaxWidth = 424;

interface CalendarDayPickerProps {
  todayDateKey: DateKey;
  dateInfo: DateInfo;
  trackingHistory: TrackingHistory;
  dailyGoalSeconds: number;
}

export default function CalendarDayPicker({
  todayDateKey,
  dateInfo,
  trackingHistory,
  dailyGoalSeconds,
}: CalendarDayPickerProps) {
  const router = useRouter();
  const calendarGrid = createMonthGrid(dateInfo.year, dateInfo.month);
  const calendarRows = Object.keys(calendarGrid);

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        {weekdaysUINames.map((name, index) => (
          <Text key={index} style={styles.calendarDayName}>
            {name}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGridContainer}>
        {calendarRows.map((row, index) => (
          <View key={`${row}-${index}`} style={styles.calendarRow}>
            {calendarGrid[row].map((day, index) => {
              const backgroundColor = getCalendarCellBackgroundColor(
                day,
                dateInfo,
                trackingHistory,
                dailyGoalSeconds,
              );
              const isEmptyDay = day.trim() === "";
              const isToday =
                getDateKeyFromDay(
                  dateInfo.year,
                  dateInfo.month,
                  Number(day),
                ) === todayDateKey;
              const dateKey = isEmptyDay
                ? null
                : getDateKeyFromDay(dateInfo.year, dateInfo.month, Number(day));
              const hasDetails = dateKey
                ? Boolean(trackingHistory[dateKey])
                : false;
              const accessibilityLabel = dateKey
                ? new Date(
                    dateInfo.year,
                    dateInfo.month,
                    Number(day),
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : undefined;

              return isEmptyDay ? (
                <View
                  style={styles.calendarDayButton}
                  key={`${day}-${row}-${index}`}
                />
              ) : (
                <AnimatedPressable
                  key={`${day}-${index}`}
                  accessibilityHint={
                    hasDetails
                      ? "Opens tracked focus details"
                      : "Opens an empty day summary"
                  }
                  accessibilityLabel={accessibilityLabel}
                  accessibilityRole="button"
                  hitSlop={4}
                  onPress={() => {
                    if (!dateKey) return;

                    router.push({
                      pathname: "/calendar/[dateKey]",
                      params: { dateKey },
                    });
                  }}
                  containerStyle={styles.calendarDayContainer}
                  style={({ pressed }) => [
                    styles.calendarDayButton,
                    { backgroundColor },
                    pressed && styles.calendarDayPressed,
                    isToday && {
                      borderWidth: 2,
                      borderColor: colors.focusSoft,
                    },
                  ]}
                >
                  <Text style={[styles.calendarDayText]}>{day}</Text>
                </AnimatedPressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    flexDirection: "column",
    width: "100%",
    gap: spacing.md,
    marginTop: spacing.xs,
    alignItems: "center",
  },
  calendarHeader: {
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "space-around",
    maxWidth: calendarMaxWidth,
    width: "100%",
  },
  calendarDayName: {
    ...typography.caption,
    fontWeight: 400,
    color: colors.textMuted,
    flex: 1,
    width: "14%",
    textAlign: "center",
  },
  calendarGridContainer: {
    width: "100%",
    flexDirection: "column",
    gap: spacing.xs,
    flexWrap: "wrap",
    maxWidth: calendarMaxWidth,
  },
  calendarRow: {
    flexDirection: "row",
    flex: 1,
    width: "100%",
    gap: spacing.xs,
  },
  calendarDayContainer: {
    maxWidth: "14%",
    flex: 1,
    aspectRatio: 1,
  },
  calendarDayButton: {
    flex: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDayPressed: {
    borderWidth: 1,
    borderColor: colors.focusPressed,
  },
  calendarDayText: {
    ...typography.button,
    letterSpacing: 1,
    fontWeight: "400",
    color: colors.textPrimary,
  },
});
