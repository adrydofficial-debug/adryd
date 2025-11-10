import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';

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

interface OptionCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradientColors: string[];
  onPress: () => void;
}

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

  const handleCreateNewCompany = () => {
    navigation.navigate('CreateCompanyScreen' as never);
  };

  const handleSelectPreviousCompany = () => {
    navigation.navigate('PreviousCompanyScreen' as never);
  };



  return (
    <SafeAreaView style={styles.container} key={languageKey}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}>
          <Ionicons
            name="chevron-back"
            size={scaleFont(24)}
            color="#000000"
          />
        </TouchableOpacity>
        
      
    
      </View>

  <View style={styles.headerSpacer} />
        <View style={styles.headerTitleContainer}>
            <Text>individual </Text>
              <Text>business</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },
  backButton: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(20),
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent:"center"
  },
  headerTitle: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: '#000000',
    marginBottom: scaleHeight(4),
  },
  headerSubtitle: {
    fontSize: scaleFont(14),
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
  },
  headerSpacer: {
    width: scaleWidth(40),
  },
  content: {
    flex: 1,
  

  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  optionsContainer: {
    marginTop: hp(2),
  },
  optionCard: {
    marginBottom: hp(2),
    borderRadius: scaleWidth(16),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  firstCard: {
    marginTop: 0,
  },
  lastCard: {
    marginBottom: hp(3),
  },
  gradient: {
    padding: wp(5),
    minHeight: scaleHeight(120),
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: scaleWidth(60),
    height: scaleWidth(60),
    borderRadius: scaleWidth(30),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(4),
  },
  textContainer: {
    flex: 1,
    marginRight: wp(2),
  },
  optionTitle: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: '#FFFFFF',
    // marginBottom: scaleHeight(6),
  },
  optionSubtitle: {
    fontSize: scaleFont(14),
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: scaleFont(20),
  },
  chevronContainer: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    marginTop: hp(2),
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF4FD',
    borderRadius: scaleWidth(12),
    padding: wp(4),
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: scaleFont(14),
    fontWeight: '400',
    color: '#666666',
    marginLeft: wp(3),
    lineHeight: scaleFont(20),
  },
});

export default ChooseOptionScreen;
