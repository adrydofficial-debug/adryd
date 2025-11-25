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

interface CompanyEmptyStateProps {
  onCreateCompany: () => void;
}

const CompanyEmptyState: React.FC<CompanyEmptyStateProps> = ({
  onCreateCompany,
}) => {

  // Animation values for each card
  // Card positions: Front (top-left), Middle, Back (bottom-right)
  // Increased spacing to add gaps between cards
  const fadeAnim1 = useRef(new Animated.Value(1)).current;
  const fadeAnim2 = useRef(new Animated.Value(0.5)).current;
  const fadeAnim3 = useRef(new Animated.Value(0.25)).current;
  
  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(0.9)).current;
  const scaleAnim3 = useRef(new Animated.Value(0.8)).current;
  
  // Increased translateY values to create visible gaps between cards
  const translateYAnim1 = useRef(new Animated.Value(0)).current;
  const translateYAnim2 = useRef(new Animated.Value(60)).current;
  const translateYAnim3 = useRef(new Animated.Value(120)).current;
  
  // Increased translateX values for horizontal spacing
  const translateXAnim1 = useRef(new Animated.Value(0)).current;
  const translateXAnim2 = useRef(new Animated.Value(20)).current;
  const translateXAnim3 = useRef(new Animated.Value(40)).current;
  
  const rotateAnim1 = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(2)).current;
  const rotateAnim3 = useRef(new Animated.Value(4)).current;

  const animationCards: ImageSourcePropType[] = [
    Images.animationCard1,
    Images.animationCard2,
    Images.animationCard3,
  ];

  useEffect(() => {
    const createAnimationSequence = () => {
      // 3-Step Animation: Cards cycle from front (top-left) to back (bottom-right)
      const sequence = Animated.sequence([
        // Step 1: Card 1 (front) → Card 2 (front)
        Animated.parallel([
          // Card 1: front → back
          Animated.timing(fadeAnim1, {
            toValue: 0.25,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim1, {
            toValue: 0.8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim1, {
            toValue: 120,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim1, {
            toValue: 40,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim1, {
            toValue: 4,
            duration: 1500,
            useNativeDriver: true,
          }),
          // Card 2: middle → front
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
          // Card 3: back → middle
          Animated.timing(fadeAnim3, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim3, {
            toValue: 0.9,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim3, {
            toValue: 60,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim3, {
            toValue: 20,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim3, {
            toValue: 2,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2000),

        // Step 2: Card 2 (front) → Card 3 (front)
        Animated.parallel([
          // Card 2: front → back
          Animated.timing(fadeAnim2, {
            toValue: 0.25,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim2, {
            toValue: 0.8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim2, {
            toValue: 120,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim2, {
            toValue: 40,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim2, {
            toValue: 4,
            duration: 1500,
            useNativeDriver: true,
          }),
          // Card 3: middle → front
          Animated.timing(fadeAnim3, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim3, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim3, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim3, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim3, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          // Card 1: back → middle
          Animated.timing(fadeAnim1, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim1, {
            toValue: 0.9,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim1, {
            toValue: 60,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim1, {
            toValue: 20,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim1, {
            toValue: 2,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2000),

        // Step 3: Card 3 (front) → Card 1 (front) - back to start
        Animated.parallel([
          // Card 3: front → back
          Animated.timing(fadeAnim3, {
            toValue: 0.25,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim3, {
            toValue: 0.8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim3, {
            toValue: 120,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim3, {
            toValue: 40,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim3, {
            toValue: 4,
            duration: 1500,
            useNativeDriver: true,
          }),
          // Card 1: middle → front
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
          // Card 2: back → middle
          Animated.timing(fadeAnim2, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim2, {
            toValue: 0.9,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim2, {
            toValue: 60,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim2, {
            toValue: 20,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim2, {
            toValue: 2,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2000),
      ]);

      Animated.loop(sequence).start();
    };

    createAnimationSequence();
  }, []);

  const getRotation = (rotateValue: Animated.Value) => {
    return rotateValue.interpolate({
      inputRange: [0, 4],
      outputRange: ['0deg', '4deg'],
    });
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <BackButton style={styles.backButtonOverride} />

      {/* Centered Content Container */}
      <View style={styles.centeredContent}>
        {/* Animation Cards Container */}
        <View style={styles.animationContainer}>
          {/* Card 3 - Back (bottom-right) */}
          <Animated.View
            style={[
              styles.cardWrapper,
              {
                opacity: fadeAnim3,
                zIndex: 1,
                transform: [
                  { scale: scaleAnim3 },
                  { translateY: translateYAnim3 },
                  { translateX: translateXAnim3 },
                  { rotate: getRotation(rotateAnim3) },
                ],
              },
            ]}>
            <Image
              source={animationCards[2]}
              style={styles.animationCard}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Card 2 - Middle */}
          <Animated.View
            style={[
              styles.cardWrapper,
              {
                opacity: fadeAnim2,
                zIndex: 2,
                transform: [
                  { scale: scaleAnim2 },
                  { translateY: translateYAnim2 },
                  { translateX: translateXAnim2 },
                  { rotate: getRotation(rotateAnim2) },
                ],
              },
            ]}>
            <Image
              source={animationCards[1]}
              style={styles.animationCard}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Card 1 - Front (top-left) */}
          <Animated.View
            style={[
              styles.cardWrapper,
              {
                opacity: fadeAnim1,
                zIndex: 3,
                transform: [
                  { scale: scaleAnim1 },
                  { translateY: translateYAnim1 },
                  { translateX: translateXAnim1 },
                  { rotate: getRotation(rotateAnim1) },
                ],
              },
            ]}>
            <Image
              source={animationCards[0]}
              style={styles.animationCard}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Create Your Company</Text>
          <Text style={styles.subtitle}>
            Add your company details to get started{'\n'}and manage your boards with ease.
          </Text>
        </View>

        {/* Create Company Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Let's Create Company"
            onPress={onCreateCompany}
            buttonStyle={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(8),
    paddingBottom: hp(8),
  },
  animationContainer: {
    width: wp(75),
    height: hp(22),
    alignSelf: 'center',
    marginBottom: hp(3),
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
    marginBottom: hp(3),
    paddingHorizontal: wp(8),
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#70737D',
    marginBottom: hp(1),
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
    minWidth: 180,
    // padding: 5,
  },
  backButtonOverride: {
    top: 0,
  },
});

export default CompanyEmptyState;
