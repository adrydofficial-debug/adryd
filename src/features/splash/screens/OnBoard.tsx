
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Group from "../../../assets/icons/Group.svg";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");

// Circle positions for 3 screens
const positions: number[] = [400, -109, 400];

const Onboard: React.FC = () => {
  const index = useRef<Animated.Value>(new Animated.Value(0)).current;
  const [screen, setScreen] = useState<number>(0); // 0,1,2

  const goTo = (screenNumber: number) => {
    setScreen(screenNumber);
    Animated.timing(index, {
      toValue: screenNumber,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const animatedTop = index.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [positions[0], positions[1], positions[2]],
  });

  const animatedColor = index.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ["#FFFFFF", "#000000", "#FFFFFF"],
  });

  // Responsive dimensions
  const circleSize = width * 1.5;
  const btnWidth = width * 0.5;
  const btnHeight = height * 0.06;
  const arrowSize = width * 0.10;
  const groupWidth = width * 0.9;
  const groupHeight = height * 0.36;

  return (
    <View style={styles.container}>
      {/* Animated Circle */}
      <Animated.View
        style={[
          styles.circle,
          { top: animatedTop, left: -circleSize * 0.17, width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
        ]}
      />

      {/* Image */}
      <View style={{ justifyContent: "center", alignItems: "center", marginTop: height * 0.12 }}>
        <Group width={groupWidth} height={groupHeight} />
      </View>

      {/* Content */}
      <View style={[styles.content, { paddingHorizontal: width * 0.09, top: height * 0.62 }]}>
        <Animated.Text style={[styles.title, { color: animatedColor, fontSize: width * 0.068 }]}>
          The smarter way to place your ads.
        </Animated.Text>

        <Animated.Text style={[styles.text, { color: animatedColor, fontSize: width * 0.035, lineHeight: height * 0.03 }]}>
          The smarter way to place your ads.The smarter way to place your ads.
          The smarter way to place your ads.The smarter way to place your ads.
        </Animated.Text>

        {/* Bottom Row */}
        <View style={[styles.mainrowContainer, { gap: width * 0.05}]}>
          {/* Left Arrow */}
          {screen > 0 && (
            <TouchableOpacity
              style={[styles.arrow, { width: arrowSize, height: arrowSize, borderRadius: arrowSize / 2 }]}
              onPress={() => goTo(screen - 1)}
            >
              <Ionicons name="chevron-back-outline" size={arrowSize * 0.5} color="#000" />
            </TouchableOpacity>
          )}

          {/* Main Button */}
          <View style={[styles.mainBtn, { width: btnWidth, height: btnHeight, borderRadius: btnHeight / 3 }]}>
            <Text style={{ fontWeight: "500", fontSize: width * 0.04 }}>Get Started</Text>
          </View>

          {/* Right Arrow */}
          {screen < 2 && (
            <TouchableOpacity
              style={[styles.arrow, { width: arrowSize, height: arrowSize, borderRadius: arrowSize / 2 }]}
              onPress={() => goTo(screen + 1)}
            >
              <Ionicons name="chevron-forward-outline" size={arrowSize * 0.5} color="#000" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default Onboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  mainrowContainer: {
    position: "absolute",
    bottom: height * 0.03,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    position: "absolute",
    backgroundColor: "#C539A5"
  },
  content: {
    position: "absolute",
    bottom: height * 0.05,
  },
  title: {
    fontWeight: "600",
    textAlign: "center"
  },
  text: {
    marginTop: height * 0.01,
    textAlign: "center",
    fontWeight: "300",
  },
  arrow: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#E5E7EB",
     shadowOpacity:10,
    elevation:20,
  },
  mainBtn: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity:10,
    elevation:20,
  },
});
