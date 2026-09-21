import {
  getDateInfo,
  getMonthlyTracking,
} from "@/components/Calendar/calendar.helpers";
import CalendarDayPicker from "@/components/Calendar/CalendarDayPicker";
import MonthSummary from "@/components/Calendar/MonthSummary";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { layout, theme } from "@/constants/theme";
import { useNowSeconds } from "@/hooks/useNowSeconds";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { usePomodoroContext } from "@/providers/PomodoroProvider";
import { getLocalDateKey } from "@/state/tracking.helpers";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, typography, spacing } = theme;
const { contentColumn, screen } = layout;

const goalHintArray = [
  colors.goalProgressColors.under25,
  colors.goalProgressColors.from25To50,
  colors.goalProgressColors.from50To99,
  colors.goalProgressColors.reached,
];

export default function CalendarScreen() {
  const { state } = usePomodoroContext();
  const { dailyGoalSeconds } = useAppSettings();
  const { trackingHistory } = state;
  const { nowSeconds } = useNowSeconds();

  const todayDateInfo = getDateInfo(new Date(nowSeconds * 1000));
  const todayDateKey = getLocalDateKey(nowSeconds);

  const tabBarHeight = useBottomTabBarHeight();

  const monthlyTracking = getMonthlyTracking(
    trackingHistory,
    todayDateInfo.year,
    todayDateInfo.month,
  );

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={screen}>
      <ScrollView
        contentContainerStyle={[
          styles.mainContainer,
          { paddingBottom: tabBarHeight + spacing.md },
        ]}
      >
        <View style={contentColumn}>
          <View style={styles.headerSection}>
            <ScreenHeader title="Calendar" subtitle={todayDateInfo.label} />

            <View style={styles.calendarHintContainer}>
              <Text style={styles.calendarHintText}>LESS</Text>

              {goalHintArray.map((color) => (
                <View
                  key={color}
                  style={[styles.calendarHintColor, { backgroundColor: color }]}
                ></View>
              ))}

              <Text style={styles.calendarHintText}>MORE</Text>
            </View>
          </View>

          <CalendarDayPicker
            todayDateKey={todayDateKey}
            dateInfo={todayDateInfo}
            dailyGoalSeconds={dailyGoalSeconds}
            trackingHistory={trackingHistory}
          />

          <MonthSummary monthlyTracking={monthlyTracking} />

          <Text style={styles.textHint}>Tap a day to see details</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  headerSection: {
    gap: spacing.xs,
  },
  calendarHintContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: spacing.sm,
  },
  calendarHintText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  calendarHintColor: {
    aspectRatio: 1,
    width: "5%",
    maxWidth: 20,
    gap: spacing.xs,
    borderRadius: 2,
  },
  textHint: {
    marginTop: spacing.lg,
    textAlign: "center",
    marginHorizontal: "auto",
    color: colors.textMuted,
  },
});
