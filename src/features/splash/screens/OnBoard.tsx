
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
    title: "Discover Outdoor Spaces place your ads",
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
    text: "Get instant status updates, confirmations, and changes so you always know exactly where your campaign stands and what’s happening on the ground.",
    image: require("../../../assets/images/OnBoardThree.png")
  },
];


interface OnboardProps {
  onComplete?: () => void;
}

const Onboard: React.FC<OnboardProps> = ({ onComplete }) => {

  const [screen, setScreen] = useState<number>(0);

  const animateAndGo = (next: number) => {
  setScreen(next);
};

  return (
    <View style={styles.container}>
      {/* ⭐ Animated Circle */}
      <View style={{ flex: 2 }}>




        {/* ⭐ Image Section */}
        <View style={styles.imageBox}>
          <Image
            source={SCREENS[screen].image}
            style={styles.image}
          />
        </View>
      </View>

      {/* ⭐ Text Content */}

      <View style={{ flex: 1.2, justifyContent: "center", paddingHorizontal: width * 0.05, backgroundColor:"#F8F8F8",  }}>
        <View style={{position:"absolute", top:30, alignSelf:"center"}}>
       
        <Text style={[styles.title, { fontSize: 18, fontWeight: "600",  }]}>
          {SCREENS[screen].title}
        </Text>

        <Text style={[styles.text, { fontSize: 13, lineHeight: height * 0.02 , fontWeight:"300"}]}>
          {SCREENS[screen].text}
        </Text>
        </View>
       
    

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
          <View style={{ width: 38 }} /> // Placeholder for spacing
        )}

        {/* Center Get Started / Finish button */}
        <TouchableOpacity
          style={styles.mainBtn}
          onPress={() => (screen === 2 ? onComplete?.() : animateAndGo(screen + 1))}
        >
          <Text style={{ fontWeight: "500", fontSize: width * 0.04, color: "#F8F8F8" }}>
            {screen === 2 ? "Get Started" : "Get Started"}
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
          <View style={{ width: 38 }} /> // Placeholder for spacing
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
    height: "100%",
    resizeMode: "cover",

  },


  title: {
    fontWeight: "600",
    textAlign: "center",

  },

  text: {
    marginTop: height * 0.01,
    textAlign: "center",
    fontWeight: "300",
  },

  row: {
    marginTop: height * 0.09,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: width * 0.05,
  },

  arrow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  mainBtn: {
    width: width * 0.5,
    height: height * 0.06,
    borderRadius: 12,
    backgroundColor: "#C539A5",
    justifyContent: "center",
    alignItems: "center",
  

  }
});
