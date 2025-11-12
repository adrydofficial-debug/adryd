import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Images } from '../assets/images';

const { width, height } = Dimensions.get('window');
const DESIGN_WIDTH = 390;
const DESIGN_HEIGHT = 844;
const BORDER_RADIUS = 30;

interface SplashScreenProps {
  onComplete?: () => void;
  shouldWaitForLoading?: boolean;
}

interface SplashPage {
  id: number;
  type: 'logo' | 'slogan' | 'welcome';
  image?: any;
  text?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, shouldWaitForLoading = false }) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const splashPages: SplashPage[] = [
    // {
    //   id: 1,
    //   type: 'logo',
    //   image: Images.adrydLogo,
    // },
    {
      id: 1,
      type: 'slogan',
      image: Images.facebookCover1,
      text: 'مطلب کچھ بھی',
    },
    // {
    //   id: 3,
    //   type: 'welcome',
    //   image: Images.facebookCover2,
    //   text: 'Welcome',
    // },
    // {
    //   id: 4,
    //   type: 'welcome',
    //   image: Images.facebookCover3,
    //   text: 'Welcome',
    // },
    // {
    //   id: 5,
    //   type: 'welcome',
    //   image: Images.facebookCover4,
    //   text: 'Welcome',
    // },
  ];

  useEffect(() => {
    if (currentIndex < splashPages.length - 1) {
      // 800ms delay before navigating to next screen
      const timer = setTimeout(() => {
        const nextIndex = currentIndex + 1;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }, 800); // Figma: 800ms delay

      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        if (!shouldWaitForLoading) {
          onComplete?.();
        }
      }, 800); 

      return () => clearTimeout(timer);
    }
  }, [currentIndex, onComplete, shouldWaitForLoading]);

  useEffect(() => {
    if (currentIndex === splashPages.length - 1 && !shouldWaitForLoading) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [shouldWaitForLoading, currentIndex, onComplete]);

  const renderItem = ({ item, index }: { item: SplashPage; index: number }) => {
    const isLogo = item.type === 'logo';
    const isSlogan = item.type === 'slogan';
    const isWelcome = item.type === 'welcome';

    return (
      <View style={styles.pageContainer}>
        {isLogo ? (
          <LinearGradient
            colors={['#A3348A', '#C343A4', '#5E194B']}
            style={styles.gradientContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.logoContainer}>
              <Image
                source={item.image}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </LinearGradient>
        ) : (
          <>
            <View style={styles.whiteTopSection}>
              {isSlogan && (
                <Text style={styles.urduText}>{item.text}</Text>
              )}
              {isWelcome && (
                <Text style={styles.welcomeText}>{item.text}</Text>
              )}
            </View>
            <LinearGradient
              colors={['#FFFFFF', '#FFFFFF', '#FFFFFF']}
              style={styles.purpleBottomSection}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <Image
                source={item.image}
                style={styles.cityscapeImage}
                resizeMode="cover"
              />
            </LinearGradient>
          </>
        )}
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#A3348A" />
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={splashPages}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setCurrentIndex(newIndex);
          }}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  pageContainer: {
    width,
    height,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  gradientContainer: {
    flex: 1,
    borderRadius: BORDER_RADIUS,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: width * 0.6,
    height: height * 0.25,
  },
  whiteTopSection: {
    flex: 0.6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingHorizontal: width * 0.1,
  },
  purpleBottomSection: {
    flex: 0.4,
    overflow: 'hidden',
    borderRadius: 0,
  },
  cityscapeImage: {
    width: '100%',
    height: '100%',
  },
  urduText: {
    fontSize: width * 0.11,
    fontWeight: 'bold',
    color: '#5E194B', 
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
    }),
  },
  welcomeText: {
    fontSize: width * 0.13,
    fontWeight: '600',
    color: '#5E194B', 
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
});

export default SplashScreen;

