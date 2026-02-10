import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { Images } from '../assets/images';

const { width, height } = Dimensions.get('window');
const screenData = Dimensions.get('screen');
const screenHeight = screenData.height;

interface SplashScreenProps {
  onComplete?: () => void;
  shouldWaitForLoading?: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, shouldWaitForLoading = false }) => {
  useEffect(() => {
    // If we're waiting for loading, don't auto-complete
    if (shouldWaitForLoading) {
      return;
    }

    // Auto-complete splash after 2 seconds
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete, shouldWaitForLoading]);

  return (
    <>
      <StatusBar barStyle="light-content" translucent={true} />
      <View style={styles.container}>
        <Image
          source={Images.logo}
          style={styles.logoImage}
          resizeMode="cover"
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: screenHeight,
    backgroundColor: '#FFFFFF',
    ...StyleSheet.absoluteFillObject,
  },
  logoImage: {
    width: width,
    height: screenHeight,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default SplashScreen;

