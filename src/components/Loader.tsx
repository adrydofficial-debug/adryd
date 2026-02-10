import React, { useEffect, useRef } from 'react';
import { Animated, StatusBar, StyleSheet, View } from 'react-native';

interface LoaderProps {
  size?: number;
  circleSize?: number;
  color?: string;
  duration?: number;
}

const Loader: React.FC<LoaderProps> = ({
  circleSize = 20,
  color = '#C539A5',
  duration = 1000,
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
      ]),
    ).start();
  }, [anim, circleSize, duration]);

  return (
    <View style={styles.overlay}>
      <View>
        <Animated.View
          style={[
            styles.circleOutlined,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              borderColor: color,
              transform: [
                {
                  translateX: anim.interpolate({
                    inputRange: [0, circleSize],
                    outputRange: [-circleSize / 2, circleSize / 2], // move around center
                  }),
                },
              ],
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
              transform: [
                {
                  translateX: anim.interpolate({
                    inputRange: [0, circleSize],
                    outputRange: [circleSize / 2, -circleSize / 2], // mirrored
                  }),
                },
              ],
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
    position: 'absolute',
    top: -StatusBar.currentHeight,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loaderContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
  },
  circleOutlined: {
    position: 'absolute',
    borderWidth: 2,
    top: 0,
  },
  circleFilled: {
    position: 'absolute',
    top: 0,
  },
});
