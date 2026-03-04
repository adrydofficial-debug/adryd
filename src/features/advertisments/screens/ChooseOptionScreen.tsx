import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';
import BackButton from '../../../components/BackButton';
import PrimaryButton from '../../../components/PrimaryButton';
import i18n from '../../../i18n';
import { useCampaignFlowStore } from '../../../store/campaignFlowStore';
import { useCompanies } from '../../companies/hooks/useCompanies';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

// Base dimensions for responsive scaling
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Responsive scaling functions
const scaleWidth = (size: number) => (width / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (height / BASE_HEIGHT) * size;

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const ChooseOptionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const boardData = route?.params?.boardData;

  const selectedBoard = useCampaignFlowStore(s => s.selectedBoard);
  const setSelectedChoice = useCampaignFlowStore(s => s.setSelectedChoice);
  const setCompaniesList = useCampaignFlowStore(s => s.setCompaniesList);
  const resetCampaignFlow = useCampaignFlowStore(s => s.resetCampaignFlow);

  const { data: companies, isLoading: isLoadingCompanies } = useCompanies();

  React.useEffect(() => {
    if (companies) {
      setCompaniesList(companies);
    }
  }, [companies, setCompaniesList]);

  React.useEffect(() => {
    console.log('ChooseOptionScreen - Received boardData:', boardData);
    console.log('ChooseOptionScreen - Store selectedBoard:', selectedBoard);
    if (!boardData && !selectedBoard) {
      console.warn(
        'ChooseOptionScreen - No boardData received in route params or store',
      );
    }
  }, [boardData, selectedBoard]);

  React.useEffect(() => {
    console.log('ChooseOptionScreen - Companies:', companies);
    console.log(
      'ChooseOptionScreen - Companies count:',
      companies?.length || 0,
    );
  }, [companies]);

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

  const handleIndividualPress = () => {
    setSelectedChoice('individual');

    const board = boardData || selectedBoard;
    navigation.navigate('AdvertismentCreateScreen', {
      flow: 'individual',
      boardData: board,
    } as never);
  };

  const handleBusinessPress = () => {
    setSelectedChoice('business');

    const board = boardData || selectedBoard;

    if (companies && companies.length > 0) {
      console.log(
        'ChooseOptionScreen - User has companies, navigating to CompanyListScreen',
      );
      navigation.navigate('CompanyListScreen', {
        isSelectable: true,
        boardData: board,
      } as never);
    } else {
      console.log(
        'ChooseOptionScreen - No companies found, navigating to CreateCompanyScreen',
      );
      navigation.navigate('CreateCompanyScreen', {
        flow: 'business',
        boardData: board,
      } as never);
    }
  };

  return (
    <SafeAreaView style={styles.container} key={languageKey}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <BackButton />
      </View>

      {/* Main Content - Two Buttons */}
      <View style={styles.content}>
        {isLoadingCompanies ? (
          <ActivityIndicator size="large" color="#C539A5" />
        ) : (
          <>
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
          </>
        )}
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
