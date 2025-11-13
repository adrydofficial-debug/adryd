import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { Images } from '../assets/images';

const { width, height } = Dimensions.get('window');

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
      <StatusBar barStyle="light-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={Images.logo}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: width,
    height: height,
  },
});

export default SplashScreen;

