import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { BlurView } from "@react-native-community/blur";

interface LoaderProps {
  size?: number;
  circleSize?: number;
  color?: string;
  duration?: number;
  top?: number;
  left?: number;
}

const Loader: React.FC<LoaderProps> = ({
  size = 32,
  circleSize = 16,
  color = "#C539A5",
  duration = 1000,
  top = 406,
  left = 150,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: circleSize,
          duration,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [anim, circleSize, duration]);

  return (
    <View style={styles.overlay}>
      <BlurView style={styles.blurBackground} blurType="light" blurAmount={10} />
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
            },
          ]}
        />
      </View>
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  loaderContainer: {
    position: "absolute",
    opacity: 1, // ✅ keep visible
  },
  circleOutlined: {
    position: "absolute",
    borderWidth: 2,
  },
  circleFilled: {
    position: "absolute",
  },
});
