import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import BackButton from '../../../components/BackButton';
import PrimaryButton from '../../../components/PrimaryButton';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

// Base dimensions for responsive scaling
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Responsive scaling functions
const scaleWidth = (size: number) => (width / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (height / BASE_HEIGHT) * size;
const scaleFont = (size: number) => (width / BASE_WIDTH) * size;

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const ChooseOptionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t, i18n: i18nInstance } = useTranslation();
  const [languageKey, setLanguageKey] = React.useState(0);

  React.useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleIndividualPress = () => {
    // Navigate to individual flow
  navigation.navigate('AdvertismentCreateScreen', { flow: 'individual' } as never);
  };

  const handleBusinessPress = () => {
    // Navigate to business flow
  navigation.navigate('CreateCompanyScreen', { flow: 'business' } as never);
  };

  return (
    <SafeAreaView style={styles.container} key={languageKey}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <BackButton/>
      </View>

      {/* Main Content - Two Buttons */}
      <View style={styles.content}>
        <PrimaryButton
          title="Individual"
          onPress={handleIndividualPress}
          buttonStyle={styles.optionButton}
          textStyle={styles.buttonText}
        />

        <PrimaryButton
          title="Business"
          onPress={handleBusinessPress}
          buttonStyle={styles.optionButton}
          textStyle={styles.buttonText}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(1),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
    paddingVertical: hp(4),
  },
  optionButton: {
    width: '60%',
    maxWidth: scaleWidth(280),
    minHeight: scaleHeight(60),
    borderRadius: 16,
    marginBottom: hp(3),
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ChooseOptionScreen;
