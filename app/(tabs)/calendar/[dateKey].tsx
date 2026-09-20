import { getLocalDateFromDateKey } from "@/components/Calendar/calendar.helpers";
import DaySessionSplit from "@/components/Calendar/DaySessionSplit";
import DaySummaryGoal from "@/components/Calendar/DaySummaryGoal";
import DayTrackingMetricsSummary from "@/components/Calendar/DayTrackingMetricsSummary";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { theme } from "@/constants/theme";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { usePomodoroContext } from "@/providers/PomodoroProvider";
import { createEmptyDailyTracking } from "@/state/tracking.helpers";
import { validateDateKeyFormat } from "@/state/tracking.validation";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { SymbolView } from "expo-symbols";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { colors, spacing } = theme;

export default function DayTracking() {
  const { state } = usePomodoroContext();
  const { dailyGoalSeconds } = useAppSettings();
  const { dateKey } = useLocalSearchParams<{ dateKey: string }>();
  const tabBarHeight = useBottomTabBarHeight();

  if (!validateDateKeyFormat(dateKey)) return <Redirect href="/calendar" />;

  const dailyTracking =
    state.trackingHistory[dateKey] ?? createEmptyDailyTracking(dateKey);

  const formattedDate = getLocalDateFromDateKey(dateKey).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.mainContainer,
          { paddingBottom: tabBarHeight + spacing.md },
        ]}
      >
        <View style={styles.contentColumn}>
          <View style={styles.screenHeader}>
            <AnimatedPressable
              accessibilityLabel="Back to calendar"
              accessibilityRole="button"
              containerStyle={styles.backButtonContainer}
              hitSlop={8}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
            >
              <SymbolView
                name={{
                  ios: "chevron.left",
                  android: "arrow_back",
                  web: "arrow_back",
                }}
                size={20}
                tintColor={colors.textPrimary}
              />
            </AnimatedPressable>

            <ScreenHeader title="Day Summary" subtitle={formattedDate} />
          </View>

          <DaySummaryGoal
            focusSeconds={dailyTracking.focusSeconds}
            dailyGoalSeconds={dailyGoalSeconds}
          />

          <DayTrackingMetricsSummary dailyTracking={dailyTracking} />

          <DaySessionSplit dailyTracking={dailyTracking} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  contentColumn: {
    width: "100%",
    maxWidth: 320,
    gap: spacing.lg,
  },
  screenHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  backButtonContainer: {
    marginTop: spacing["3xl"],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPressed: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.focusPressed,
  },
});
