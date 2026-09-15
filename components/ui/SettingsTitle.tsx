import { theme } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

const { typography, spacing, colors } = theme;

export default function SettingsTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    paddingRight: spacing.md,
    gap: spacing.xs,
  },
  title: {
    ...typography.body,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    fontWeight: 300,
    letterSpacing: 0.75,
    color: colors.textSecondary,
  },
});
