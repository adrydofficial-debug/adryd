import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import Header from '../../../components/Header';


const TermsPrivacyOptions: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation('profile');
  
  const handleBackPress = () => {
    navigation.goBack();
  };


  const options = [
    {
      id: 'terms',
      label: t('termsPrivacyOptions.terms'),
      icon: 'document-text-outline',
      target: 'TermsAndConditions',
    },
    {
      id: 'privacy',
      label: t('termsPrivacyOptions.privacy'),
      icon: 'shield-checkmark-outline',
      target: 'PrivacyPolicy',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
  <Header
  title={t('termsPrivacyOptions.title')}
  onBackPress={handleBackPress}   // same back function
  showRightIcon={false}           // because you had an empty right spacer
/>


      <View style={styles.card}>
        {options.map(option => (
          <React.Fragment key={option.id}>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => (navigation as any).navigate(option.target)}
              activeOpacity={0.85}
            >
              <View style={styles.optionLeft}>
                <Ionicons name={option.icon} size={18} color="#6B7280" />
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.fullDivider} />
          </React.Fragment>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    // backgroundColor: '#FFFFFF',
    // borderRadius: 14,
   
    // borderColor: '#E5E7EB',
    // overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  
  },
  fullDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  optionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
   
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
   
  },
  optionLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
});

export default TermsPrivacyOptions;

