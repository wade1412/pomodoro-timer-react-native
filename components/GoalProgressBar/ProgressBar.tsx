import { theme } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

const { colors, spacing, radius } = theme;

export default function ProgressBar() {
  return (
    <View style={styles.progressBar}>
      <View style={styles.progressBarFill}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Progress Bar
  progressBar: {
    height: spacing.xs,
    backgroundColor: colors.progressTrack,
    borderRadius: radius.round,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    width: "25%",
    backgroundColor: colors.focus,
  },
});
