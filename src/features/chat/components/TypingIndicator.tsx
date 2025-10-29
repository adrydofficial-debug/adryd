// src/features/chat/components/TypingIndicator.tsx

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export const TypingIndicator: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -10,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={styles.typingContainer}>
      <Animated.View
        style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]}
      />
      <Animated.View
        style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]}
      />
      <Animated.View
        style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C539A5',
    marginHorizontal: 3,
  },
});

