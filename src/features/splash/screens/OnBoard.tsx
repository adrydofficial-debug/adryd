import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Image
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");

//  3-screen data
const SCREENS = [
  {
    title: "Discover Outdoor \n Spaces place your ads",
    text: "Browse a wide network of verified billboards and digital screens, all organized in one simple place to help you find the perfect spot for your campaign.",
    image: require("../../../assets/images/OnBoardOne.png")
  },
  {
    title: "Plan and Schedule with Ease",
    text: "Create bookings through a smooth, fully digital process that removes the back-and-forth and lets you secure your placements in just a few steps.",
    image: require("../../../assets/images/OnBoardTwo.png")
  },
  {
    title: "Stay Updated in Real Time",
    text: "Get instant status updates, confirmations, and changes so you always know exactly where your campaign stands and what’s happening on the  ground.",
    image: require("../../../assets/images/OnBoardThree.png")
  },
];

interface OnboardProps {
  onComplete?: () => void;
}

const Onboard: React.FC<OnboardProps> = ({ onComplete }) => {
  const [screen, setScreen] = useState<number>(0);

  //  Fade Animation
  const opacity = useRef(new Animated.Value(1)).current;

  const animateAndGo = (next: number) => {
    // Fade out current screen
    Animated.timing(opacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Switch screen AFTER fade out
      setScreen(next);

      // Fade in new screen
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    });
  };


  return (
    <View style={styles.container}>
      <View style={{ flex: 2 }}>

        {/* Image Section with Fade */}
        <Animated.View style={{ opacity }}>
          <Image
            source={SCREENS[screen].image}
            style={styles.image}
          />
        </Animated.View>
      </View>

      {/*  Text Content */}
      <View
        style={{
          flex: 1.2,
          justifyContent: "center",
          paddingHorizontal: width * 0.05,
          backgroundColor: "#F8F8F8",
        }}
      >
        {/* Pagination Dots */}
        <View
          style={{
            width: width * 0.12,
            height: height * 0.008,
            flexDirection: "row",
            justifyContent: "space-between",
            alignSelf: "center",
            position: "absolute",
            top:10,
          }}
        >
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                width: width * 0.017,
                height: width * 0.017,
                borderRadius: width * 0.017,
                backgroundColor: screen === i ? "#C539A5" : "#E5E7EB",
              }}
            />
          ))}
        </View>

        {/* Title + Text with Fade */}
        <Animated.View style={{ position: "absolute", top: 35, alignSelf: "center", opacity }}>
          <Text style={styles.title}>
            {SCREENS[screen].title}
          </Text>

          <Text style={styles.text}>
            {SCREENS[screen].text}
          </Text>
        </Animated.View>

        {/*  Fixed Bottom Controls */}
        <View
          style={{
            position: "absolute",
            bottom: height * 0.08,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: width * 0.06,
          }}
        >
          {/* Back button */}
          {screen > 0 ? (
            <TouchableOpacity
              style={[styles.arrow, { width: 38, height: 38 }]}
              onPress={() => animateAndGo(screen - 1)}
            >
              <Ionicons name="chevron-back-outline" size={15} color="#000" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 38 }} />
          )}

          {/* Center Button */}
          <TouchableOpacity
            disabled={screen !== 2}
            style={[
              styles.mainBtn,
              { backgroundColor: screen === 2 ? "#C539A5" : "#E5E7EB" }
            ]}
            onPress={() => screen === 2 && onComplete?.()}
          >
            <Text
              style={{
                fontWeight: "500",
                fontSize: width * 0.04,
                color: screen === 2 ? "#FFFFFF" : "#00000033"
              }}
            >
              Get Started
            </Text>
          </TouchableOpacity>

          {/* Forward button */}
          {screen < 2 ? (
            <TouchableOpacity
              style={[styles.arrow, { width: 38, height: 38 }]}
              onPress={() => animateAndGo(screen + 1)}
            >
              <Ionicons name="chevron-forward-outline" size={15} color="#000" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 38 }} />
          )}
        </View>
      </View>
    </View>
  );
};

export default Onboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  image: {
    width: "100%",
    height: height * 0.75,
    resizeMode: "cover",
    position: "absolute",
    top: 0,
  },
  title: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 18,
    color: "#18181B",
  },
  text: {
    marginTop: height * 0.02,
    textAlign: "center",
    fontWeight: "300",
    fontSize: 13,
    color: "#18181B",
     lineHeight: height * 0.02,
  },
  arrow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  mainBtn: {
    width: width * 0.5,
    height: height * 0.06,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  }
});
