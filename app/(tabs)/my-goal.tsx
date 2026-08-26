import { theme } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

const { colors, typography } = theme;

export default function MyGoalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Goal</Text>
      <View style={styles.separator} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
