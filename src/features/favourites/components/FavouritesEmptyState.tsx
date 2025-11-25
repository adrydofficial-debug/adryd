import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
} from 'react-native';
import PrimaryButton from '../../../components/PrimaryButton';
import BackButton from '../../../components/BackButton';
import { Images } from '../../../assets/images';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

interface FavouritesEmptyStateProps {
  onFindFavorites: () => void;
}

const FavouritesEmptyState: React.FC<FavouritesEmptyStateProps> = ({
  onFindFavorites,
}) => {
  // Animation values for two cards
  // Card 1 starts in front (big), Card 2 starts in back (small)
  const fadeAnim1 = useRef(new Animated.Value(1)).current;
  const fadeAnim2 = useRef(new Animated.Value(0.5)).current;
  
  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(0.8)).current;
  
  const translateYAnim1 = useRef(new Animated.Value(0)).current;
  const translateYAnim2 = useRef(new Animated.Value(40)).current;
  
  const translateXAnim1 = useRef(new Animated.Value(0)).current;
  const translateXAnim2 = useRef(new Animated.Value(20)).current;
  
  const rotateAnim1 = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(3)).current;

  const cartImages: ImageSourcePropType[] = [
    Images.cart1,
    Images.cart2,
  ];

  useEffect(() => {
    const createAnimationSequence = () => {
      // Animation: Card 1 (front) ↔ Card 2 (front) - continuous loop
      const sequence = Animated.sequence([
        // Step 1: Card 1 moves to back, Card 2 comes to front
        Animated.parallel([
          // Card 1: front → back
          Animated.timing(fadeAnim1, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim1, {
            toValue: 0.8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim1, {
            toValue: 40,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim1, {
            toValue: 20,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim1, {
            toValue: 3,
            duration: 1500,
            useNativeDriver: true,
          }),
          // Card 2: back → front
          Animated.timing(fadeAnim2, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim2, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim2, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim2, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim2, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2000), // Hold for 2s

        // Step 2: Card 2 moves to back, Card 1 comes to front (back to start)
        Animated.parallel([
          // Card 2: front → back
          Animated.timing(fadeAnim2, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim2, {
            toValue: 0.8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim2, {
            toValue: 40,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim2, {
            toValue: 20,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim2, {
            toValue: 3,
            duration: 1500,
            useNativeDriver: true,
          }),
          // Card 1: back → front
          Animated.timing(fadeAnim1, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim1, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim1, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim1, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim1, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2000), // Hold for 2s
      ]);

      Animated.loop(sequence).start();
    };

    createAnimationSequence();
  }, []);

  const getRotation = (rotateValue: Animated.Value) => {
    return rotateValue.interpolate({
      inputRange: [0, 3],
      outputRange: ['0deg', '3deg'],
    });
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
   
        <BackButton  />
    

      {/* Animation Cards Container */}
      <View style={styles.animationContainer}>
        {/* Card 2 - Back card */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: fadeAnim2,
              zIndex: 1,
              transform: [
                { scale: scaleAnim2 },
                { translateY: translateYAnim2 },
                { translateX: translateXAnim2 },
                { rotate: getRotation(rotateAnim2) },
              ],
            },
          ]}>
          <Image
            source={cartImages[1]}
            style={styles.animationCard}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Card 1 - Front card */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: fadeAnim1,
              zIndex: 2,
              transform: [
                { scale: scaleAnim1 },
                { translateY: translateYAnim1 },
                { translateX: translateXAnim1 },
                { rotate: getRotation(rotateAnim1) },
              ],
            },
          ]}>
          <Image
            source={cartImages[0]}
            style={styles.animationCard}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Discover Boards You'll Love</Text>
        <Text style={styles.subtitle}>
          Discover boardsto start saving {'\n'} inspiration in one place.
        </Text>
      </View>

      {/* Find Favorites Button */}
      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="Find Your Favorites"
          onPress={onFindFavorites}
          buttonStyle={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: hp(27),
    paddingBottom: hp(0),
  },
  animationContainer: {
    width: wp(75),
    height: hp(24),
    alignSelf: 'center',
    marginBottom: hp(-5),
    marginTop: hp(3),
    position: 'relative',
  },
  cardWrapper: {
    position: 'absolute',
    width: wp(65),
    height: hp(15),
    top: 0,
    left: wp(5),
  },
  animationCard: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: hp(2),
    paddingHorizontal: wp(8),
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#70737D',
    // marginBottom: hp(1),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#70737D',
    textAlign: 'center',
    lineHeight: wp(4),
    paddingHorizontal: wp(1),
    letterSpacing: 0.1,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
  },
  button: {
    minWidth: 100,
  },
});

export default FavouritesEmptyState;

