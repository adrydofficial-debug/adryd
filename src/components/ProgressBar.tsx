import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Check } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface ProgressBarProps {
  currentStep: number; // from 1 to 3
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const isStepActive = (stepIndex: number) => {
    return currentStep > stepIndex + 1;
  };

  const shouldShowCheckmark = (stepIndex: number) => {
    return currentStep > stepIndex + 1;
  };

  const getLineFillWidth = (lineIndex: number) => {
    if (lineIndex === 0) {
      if (currentStep === 2) return 50; 
      if (currentStep >= 3) return 100; 
      return 0; 
    } else if (lineIndex === 1) {
      if (currentStep === 3) return 50; 
      if (currentStep > 3) return 100; // Fully filled when step 3 is completed
      return 0; // Not filled when on step 1 or 2
    }
    return 0;
  };

  return (
    <View style={styles.container}>
      {[0, 1, 2].map((stepIndex) => (
        <React.Fragment key={stepIndex}>
          <View
            style={[
              styles.circle,
              isStepActive(stepIndex) && styles.activeCircle,
            ]}
          >
            <View
              style={[
                styles.innerCircle,
                isStepActive(stepIndex) && styles.activeInnerCircle,
              ]}
            >
              {shouldShowCheckmark(stepIndex) && (
                <Check size={10} color="#FFFFFF" strokeWidth={3} />
              )}
            </View>
          </View>
          {stepIndex < 2 && (
            <View style={styles.lineContainer}>
              <View style={styles.lineBackground} />
              <View
                style={[
                  styles.lineFill,
                  { width: `${getLineFillWidth(stepIndex)}%` },
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
    width: 18.46,
    height: 18.46,
    borderRadius: 9.23,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  activeCircle: {
    borderColor: "#C539A5",
  },
  innerCircle: {
    width: 12.46,
    height: 12.46,
    borderRadius: 6.23,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  activeInnerCircle: {
    backgroundColor: "#C539A5",
  },
  lineContainer: {
    width: 76,
    height: 5,
    justifyContent: "center",
    marginLeft: 7.39,
    marginRight: 7.39,
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