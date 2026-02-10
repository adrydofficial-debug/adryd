import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";

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
  const insets = useSafeAreaInsets();

  //  Fade Animation
  const opacity = useRef(new Animated.Value(1)).current;

  const animateAndGo = (next: number) => {
    // Fade out current screen
    Animated.timing(opacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setScreen(next);

      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    });
  };

  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      const swipeThreshold = 50; 
      const velocityThreshold = 500; 

      if (
        (translationX < -swipeThreshold || velocityX < -velocityThreshold) &&
        screen < 2
      ) {
        animateAndGo(screen + 1);
      }
      else if (
        (translationX > swipeThreshold || velocityX > velocityThreshold) &&
        screen > 0
      ) {
        animateAndGo(screen - 1);
      }
    });


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={swipeGesture}>
        <View style={styles.container}>
        <View style={{ flex: 2 }}>

        {/* Image Section with Fade */}
        <Animated.View style={{ opacity }}>
          <Image
            source={SCREENS[screen].image}
            style={styles.image}
          />
        </Animated.View>

        <LinearGradient
          colors={['transparent', 'rgba(248, 248, 248, 0)', 'rgba(248, 248, 248, 0.5)', '#F8F8F8']}
          locations={[0, 0.2, 0.4, 1]}
          style={styles.gradientOverlay}
          pointerEvents="none"
        />
      </View>

      {/*  Text Content */}
      <View
        style={{
          flex: 1.2,
          justifyContent: "center",
          paddingHorizontal: width * 0.05,
          backgroundColor: "#F8F8F8",
          paddingTop: 20,
          paddingBottom: 20,
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
            top: 5,
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
        <Animated.View style={[styles.contentContainer, { opacity }]}>
          <Text style={styles.title}>
            {SCREENS[screen].title}
          </Text>

          <Text style={styles.text}>
            {SCREENS[screen].text}
          </Text>
        </Animated.View>

        {/*  Fixed Bottom Controls */}
        <View
          style={[
            styles.bottomControlsContainer,
            {
              bottom: height * 0.12 + (Platform.OS === 'ios' ? insets.bottom : 0),
            }
          ]}
        >
          {/* Get Started Button */}
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
        </View>

        {/* Terms and Conditions Text */}
        <View
          style={[
            styles.termsContainer,
            {
              bottom: Platform.OS === 'ios' ? Math.max(insets.bottom + 10, 20) : 20,
            }
          ]}
        >
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>
      </View>
      </GestureDetector>
    </GestureHandlerRootView>
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
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.25, 
  },
  contentContainer: {
    position: "absolute",
    top: 35,
    alignSelf: "center",
    width: width * 0.8, 
    paddingHorizontal: width * 0.05,
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: "600",
    textAlign: "center",
    fontSize: 18,
    color: "#18181B",
  },
  text: {
    marginTop: height * 0.02,
    textAlign: "center",
    fontFamily: 'Inter',
    fontWeight: "300",
    fontSize: 13,
    color: "#18181B",
    lineHeight: height * 0.02,
  },
  mainBtn: {
    width: width * 0.5,
    height: height * 0.06,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomControlsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.06,
  },
  termsContainer: {
    position: "absolute",
    left: 100,
    right: 0,
    width: width * 0.5, 
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: width * 0.05, 
  },
  termsText: {
    fontFamily: 'Inter',
    fontSize: 10, 
    color: "#18181B", 
    textAlign: "center",
    fontWeight: "300", 
    lineHeight: 15, 
    letterSpacing: 0,
  }
});
