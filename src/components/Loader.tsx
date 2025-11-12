
import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet, ViewStyle } from "react-native";

interface LoaderProps {
  size?: number; // full container size
  circleSize?: number; // each circle size
  color?: string; // color of border and filled circle
  top?: number;
  left?: number;
  duration?: number; // time to swap positions
}

const Loader: React.FC<LoaderProps> = ({
  size = 32,
  circleSize = 16,
  color = "#C539A5",
  top = 350,
  left = 160,
  duration = 1000,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: circleSize, // swap right
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0, // swap back left
          duration: duration,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [anim, circleSize, duration]);

  return (
    <View style={[styles.loaderContainer, { width: size, height: size, top, left }]}>
      <Animated.View
        style={[
          styles.circleOutlined,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderColor: color,
            left: anim,
            top: (size - circleSize) / 2,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.circleFilled,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: color,
            left: Animated.subtract(circleSize, anim),
            top: (size - circleSize) / 2,
          },
        ]}
      />
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  loaderContainer: {
    position: "absolute",
  },
  circleOutlined: {
    position: "absolute",
    borderWidth: 2,
  },
  circleFilled: {
    position: "absolute",
  },
});
