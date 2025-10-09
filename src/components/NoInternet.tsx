import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
const NoInternet: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(true);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Image
            source={require("../assets/images/noIntrnet.png")}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.title}>No internet</Text>
          <Text style={styles.subtitle}>
            Please check your internet connection
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: 351,
    height: 326,
    backgroundColor: "#fff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingTop: 41,
    paddingRight: 86,
    paddingBottom: 41,
    paddingLeft: 86,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  image: {
    width: 123,
    height: 96,
  },
  title: {
    fontSize: 20.33,
    fontWeight: "700" as "700",
    color: "#C12C9F",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 12,
    color: "#000000",
    textAlign: "center" as "center",
    marginVertical: 9,
  },
  button: {
    width: 179,
    height: 48,
    borderRadius: 11.67,
    borderWidth: 1,
    borderColor: "#C12C9F",
    backgroundColor: "#C539A5",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700" as "700",
    fontSize: 14,
  },
});
export default NoInternet;