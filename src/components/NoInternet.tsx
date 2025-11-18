import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import AndroidOpenSettings from 'react-native-android-open-settings';
import { Images } from "../assets/images";

interface NoInternetProps {
  // Optional: Allow parent to control if component should be rendered at all
  enabled?: boolean;
}

const NoInternet: React.FC<NoInternetProps> = ({ enabled = true }) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(false);

  // Monitor internet connectivity
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsConnected(connected ?? true);
      
      // Show modal if no internet, hide if connected
      if (!connected) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    });

    // Check initial state
    NetInfo.fetch().then(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsConnected(connected ?? true);
      if (!connected) {
        setVisible(true);
      }
    });

    return () => unsubscribe();
  }, [enabled]);

  const handleRetry = () => {
    NetInfo.fetch().then(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsConnected(connected ?? true);
      if (connected) {
        setVisible(false);
      } else {
        // If still no internet, open device settings
        openSettings();
      }
    });
  };

  const openSettings = () => {
    if (Platform.OS === 'android') {
      // Use the library to open WiFi settings directly
      AndroidOpenSettings.wifiSettings();
    } else {
      // iOS: Open Settings app
      Linking.openSettings();
    }
  };

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
            source={Images.noInternet}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.title}>No internet</Text>
          <Text style={styles.subtitle}>
            Please check your internet connection
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleRetry}
          >
            <Text style={styles.buttonText}>Allow</Text>
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
    marginTop: 6,
  },
  subtitle: {
    fontSize: 12,
    color: "#000000",
    textAlign: "center" as "center",
   
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
    marginTop:6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700" as "700",
    fontSize: 14,
  },
});
export default NoInternet;