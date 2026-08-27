import { theme } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

const VerticalDivider = () => {
  return <View style={styles.divider} />;
};

const styles = StyleSheet.create({
  divider: {
    width: 1,
    height: "90%",
    alignSelf: "center",
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.sm,
  },
});

export default VerticalDivider;
