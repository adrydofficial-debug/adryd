import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Check } from "lucide-react-native";
const { width } = Dimensions.get("window");
interface ProgressBarProps {
  currentStep: number; // from 1 to 5
}
const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  // Calculate fill levels based on screen
  const getLineWidth = (lineIndex: number) => {
    if (currentStep === 1) return 0;
    if (currentStep === 2 && lineIndex === 0) return 11.45;
    if (currentStep === 3 && lineIndex === 0) return 80;
    if (currentStep === 4 && lineIndex === 0) return 80;
    if (currentStep === 4 && lineIndex === 1) return 31.81;
    if (currentStep === 5) return 80;
    return 0;
  };
  const getCircleActive = (index: number) => {
    if (currentStep === 1) return false;
    if (currentStep === 2 && index === 0) return true;
    if (currentStep >= 3 && index <= 1) return true;
    if (currentStep === 5) return true;
    return false;
  };
  return (
    <View style={styles.container}>
      {[0, 1, 2].map((i) => (
        <React.Fragment key={i}>
          <View style={[styles.circle, getCircleActive(i) && styles.activeCircle]}>
            {getCircleActive(i) && <Check size={14} color="#fff" />}
          </View>
          {i < 2 && (
            <View style={styles.lineContainer}>
              <View style={styles.lineBackground} />
              <View
                style={[
                  styles.lineFill,
                  { width: getLineWidth(i) },
                ]}
              />
            </View>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9.23,
    borderWidth: 0.37,
    borderColor: "#E5E7EB",
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  activeCircle: {
    backgroundColor: "#C539A5",
    borderColor: "#C539A5",
  },
  lineContainer: {
    width: 76,
    height: 5,
    justifyContent: "center",
    marginHorizontal: 3,
  },
  lineBackground: {
    width: "100%",
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 31,
    position: "absolute",
  },
  lineFill: {
    height: 5,
    backgroundColor: "#C539A5",
    borderRadius: 31,
  },
});
export default ProgressBar;