import React, { useState, useEffect, useCallback } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  I18nManager,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import BackButton from '../../../components/BackButton';
import CustomInput from '../../../components/CustomInput';
import PasswordRequirements from '../../../components/PasswordRequirements';
import PrimaryButton from '../../../components/PrimaryButton';
import NoInternet from '../../../components/NoInternet';
import Header from '../../../components/Header';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

const ChangePassword: React.FC = () => {
  const navigation = useNavigation();
  const { t, i18n: i18nInstance } = useTranslation('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [isEmptyError, setIsEmptyError] = useState(false);
  const [apiErrorBorder, setApiErrorBorder] = useState(false);
  
  // Track current language to force re-renders
  const [currentLanguage, setCurrentLanguage] = useState(i18nInstance.language);
  // Track RTL state to force layout re-render
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);
  // Language change tracking for forced re-render
  const [languageKey, setLanguageKey] = useState(0);

  // Listen for language changes and force re-render
  useEffect(() => {
    const handleLanguageChange = (lang: string) => {
      setCurrentLanguage(lang);
      const rtlLangs = new Set<string>(['ar', 'ur', 'he', 'fa']);
      const shouldBeRTL = rtlLangs.has(lang);
      setIsRTL(shouldBeRTL);
      setLanguageKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    const lang = i18nInstance.language;
    setCurrentLanguage(lang);
    const rtlLangs = new Set<string>(['ar', 'ur', 'he', 'fa']);
    setIsRTL(rtlLangs.has(lang));
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18nInstance.language]);
  
  // Update language key when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const lang = i18nInstance.language;
      setCurrentLanguage(lang);
      const rtlLangs = new Set<string>(['ar', 'ur', 'he', 'fa']);
      setIsRTL(rtlLangs.has(lang));
      setLanguageKey(prev => prev + 1);
      return () => {};
    }, [i18nInstance.language])
  );

  const handleFocus = (field: string) => setFocusedField(field);

  const handleCurrentPasswordChange = (text: string) => {
    if (isEmptyError) setIsEmptyError(false);
    if (apiErrorBorder) setApiErrorBorder(false);
    if (apiError) setApiError('');
    setCurrentPassword(text);
  };

  const handleNewPasswordChange = (text: string) => {
    if (isEmptyError) setIsEmptyError(false);
    if (apiErrorBorder) setApiErrorBorder(false);
    if (apiError) setApiError('');
    setNewPassword(text);
  };

  const handleConfirmPasswordChange = (text: string) => {
    if (isEmptyError) setIsEmptyError(false);
    if (apiErrorBorder) setApiErrorBorder(false);
    if (apiError) setApiError('');
    setConfirmPassword(text);
  };

  const handleSave = () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setIsEmptyError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setApiError(t('changePassword.errorMatch'));
      setApiErrorBorder(true);
      return;
    }

    if (newPassword.length < 8) {
      setApiError(t('changePassword.errorMin'));
      setApiErrorBorder(true);
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setApiError(t('changePassword.errorUppercase'));
      setApiErrorBorder(true);
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setApiError(t('changePassword.errorLowercase'));
      setApiErrorBorder(true);
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setApiError(t('changePassword.errorNumber'));
      setApiErrorBorder(true);
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(t('changePassword.successTitle'), t('changePassword.successMessage'), [
        { text: t('changePassword.ok'), onPress: () => navigation.goBack() }
      ]);
    }, 2000);
  };

  const handleForgotPassword = () => {
    // Navigate to ForgotPassword screen
    // Note: This may require navigation to AuthStack if not accessible from AppStack
    Alert.alert(
      t('changePassword.forgotPassword', { lng: currentLanguage }),
      'Please log out and use the forgot password option from the login screen.',
      [{ text: 'OK' }]
    );
  };

  return (
    <LinearGradient
      colors={['#F9FAFB', '#F9FAFB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            {/* Back Button - Top Left */}
            <BackButton iconColor="#000" />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title} key={`title-${languageKey}-${currentLanguage}`}>
                {t('changePassword.title', { lng: currentLanguage })}
              </Text>
              <Text style={styles.subtitle} key={`subtitle-${languageKey}-${currentLanguage}`}>
                {t('changePassword.subtitle', { lng: currentLanguage })}
              </Text>
            </View>
           
            {/* Current Password Input */}
            <CustomInput
              label={t('changePassword.current', { lng: currentLanguage })}
              placeholder="••••••••"
              isPassword={true}
              value={currentPassword}
              onChangeText={handleCurrentPasswordChange}
              onBlur={() => setFocusedField(null)}
              onFocus={() => handleFocus('currentPassword')}
              focused={focusedField === 'currentPassword'}
              error={isEmptyError || apiErrorBorder}
              showErrorText={false}
              containerStyle={styles.inputContainer}
            />

            {/* New Password Input */}
            <View>
              <CustomInput
                label={t('changePassword.new', { lng: currentLanguage })}
                placeholder="••••••••"
                isPassword={true}
                value={newPassword}
                onChangeText={handleNewPasswordChange}
                onBlur={() => setFocusedField(null)}
                onFocus={() => handleFocus('newPassword')}
                focused={focusedField === 'newPassword'}
                error={isEmptyError || apiErrorBorder}
                showErrorText={false}
                containerStyle={styles.inputContainer}
              />
              {focusedField === 'newPassword' && (
                <PasswordRequirements 
                  password={newPassword} 
                  namespace="changePassword"
                  translationNamespace="profile"
                />
              )}
            </View>

            {/* Confirm Password Input */}
            <CustomInput
              label={t('changePassword.confirm', { lng: currentLanguage })}
              placeholder="••••••••"
              isPassword={true}
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              onBlur={() => setFocusedField(null)}
              onFocus={() => handleFocus('confirmPassword')}
              focused={focusedField === 'confirmPassword'}
              error={isEmptyError || apiErrorBorder}
              showErrorText={false}
              containerStyle={styles.inputContainer}
            />


            {/* Error Message */}
            {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

            {/* Submit Button */}
            <PrimaryButton
              title={isLoading ? t('changePassword.changing', { lng: currentLanguage }) : t('changePassword.save', { lng: currentLanguage })}
              onPress={handleSave}
              loading={isLoading}
              buttonStyle={{ alignSelf: 'center', width: 161, height: 50 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <NoInternet />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  keyboardAvoidingView: { 
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(25),
    minHeight: height + hp(10),
  },
  mainContainer: { 
    paddingHorizontal: 30,
  },
  header: {
    marginTop: hp(7),
    marginBottom: hp(4.5),
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#B32687',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: hp(2.2),
    textAlign: 'left',
  },
  inputContainer: { 
    marginBottom: hp(2),
  },
  errorText: {
    color: '#E61215',
    fontSize: 10,
    marginTop: 5,
    marginLeft: wp(1),
    textAlign: 'left',
  },
});

export default ChangePassword;