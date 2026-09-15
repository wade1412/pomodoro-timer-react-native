import { useEffect } from "react";
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface AnimatedPressableProps extends Omit<PressableProps, "style"> {
  style?: PressableProps["style"];
  containerStyle?: StyleProp<ViewStyle>;
}

export default function AnimatedPressable({
  style,
  containerStyle,
  children,
  disabled = false,
  onPressIn,
  onPressOut,
  ...restProps
}: AnimatedPressableProps) {
  const pressProgress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = 1 - pressProgress.value * 0.03;
    const opacity = 1 - pressProgress.value * 0.1;
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const handlePressIn = (event: GestureResponderEvent) => {
    if (disabled) return;
    pressProgress.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
      mass: 0.5,
    });
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    if (disabled) return;
    pressProgress.value = withSpring(0, { damping: 12, stiffness: 300 });
    onPressOut?.(event);
  };

  useEffect(() => {
    if (!disabled) return;

    cancelAnimation(pressProgress);
    pressProgress.value = withTiming(0, { duration: 100 });
  }, [disabled, pressProgress]);

  return (
    <Animated.View style={[containerStyle, animatedStyle]}>
      <Pressable
        {...restProps}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
