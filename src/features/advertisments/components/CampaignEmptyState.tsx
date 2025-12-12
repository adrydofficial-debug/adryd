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
import { Images } from '../../../assets/images';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

interface CampaignEmptyStateProps {
  onCreateCampaign: () => void;
}

const CampaignEmptyState: React.FC<CampaignEmptyStateProps> = ({
  onCreateCampaign,
}) => {
  const fadeAnim1 = useRef(new Animated.Value(1)).current;
  const fadeAnim2 = useRef(new Animated.Value(0.5)).current;
  const fadeAnim3 = useRef(new Animated.Value(0.25)).current;

  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(0.9)).current;
  const scaleAnim3 = useRef(new Animated.Value(0.8)).current;

  const translateYAnim1 = useRef(new Animated.Value(0)).current;
  const translateYAnim2 = useRef(new Animated.Value(60)).current;
  const translateYAnim3 = useRef(new Animated.Value(120)).current;

  const translateXAnim1 = useRef(new Animated.Value(0)).current;
  const translateXAnim2 = useRef(new Animated.Value(20)).current;
  const translateXAnim3 = useRef(new Animated.Value(40)).current;

  const rotateAnim1 = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(2)).current;
  const rotateAnim3 = useRef(new Animated.Value(4)).current;

  const animationCards: ImageSourcePropType[] = [
    Images.campaignEmptyState,
    Images.campaignEmptyState1,
    Images.campaignEmptyState2,
  ];

  useEffect(() => {
    const createAnimationSequence = () => {
      const sequence = Animated.sequence([
        Animated.parallel([
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
        Animated.parallel([
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
        Animated.parallel([
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

  const getRotation = (rotateValue: Animated.Value) =>
    rotateValue.interpolate({
      inputRange: [0, 4],
      outputRange: ['0deg', '4deg'],
    });

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
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

      <View style={styles.textContainer}>
        <Text style={styles.title}>Ready to Start Your Journey</Text>
        <Text style={styles.subtitle}>
        Start your first campaign to view insights,{'\n'} results,
         and performance here.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="Create Campaign"
          onPress={onCreateCampaign}
          buttonStyle={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: hp(1),
    paddingBottom: hp(12),
    backgroundColor: '#F5F5F5',
  },
  animationContainer: {
    width: wp(75),
    height: hp(24),
    alignSelf: 'center',
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
    paddingHorizontal: wp(8),
    marginBottom: hp(2),
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#70737D',
    marginBottom: hp(0.5),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#70737D',
    textAlign: 'center',
    lineHeight: wp(4),
    letterSpacing: 0.1,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  button: {
    minWidth: 150,
  },
});

export default CampaignEmptyState;

