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
  ActivityIndicator,
  Alert,
  I18nManager,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import CustomInput from '../../../components/CustomInput';
import NoInternet  from '../../../components/NoInternet';
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

const ChangePassword: React.FC = () => {
  const navigation = useNavigation();
  const { t, i18n: i18nInstance } = useTranslation('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      // Update RTL state based on language
      const rtlLangs = new Set<string>(['ar', 'ur', 'he', 'fa']);
      const shouldBeRTL = rtlLangs.has(lang);
      setIsRTL(shouldBeRTL);
      setLanguageKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    // Set initial language and RTL state
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

  const handleBackPress = () => {
    navigation.goBack();
  };

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

    if (newPassword.length < 6) {
      setApiError(t('changePassword.errorMin'));
      setApiErrorBorder(true);
      return;
    }

    setIsLoading(true);
    
    // TODO: Implement actual password change API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(t('changePassword.successTitle'), t('changePassword.successMessage'), [
        { text: t('changePassword.ok'), onPress: () => navigation.goBack() }
      ]);
    }, 2000);
  };

  return (
    <View style={styles.container} key={`container-${isRTL}-${languageKey}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            {/* Header */}
            <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                style={[styles.backButton, isRTL && { marginRight: 0, marginLeft: wp(4) }]}
                onPress={handleBackPress}
              >
                <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={wp(6)} color="#000" />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <Text style={[styles.title, { textAlign: 'center' }]} key={`title-${languageKey}-${currentLanguage}`}>{t('changePassword.title', { lng: currentLanguage })}</Text>
                <Text style={[styles.subtitle, { textAlign: 'center' }]} key={`subtitle-${languageKey}-${currentLanguage}`}>
                  {t('changePassword.subtitle', { lng: currentLanguage })}
                </Text>
              </View>
              {/* right spacer to perfectly center the title */}
              <View style={styles.headerSpacer} />
            </View>
           
            {/* Current Password Input */}
            <View style={styles.inputContainer}>
              <CustomInput
                label={t('changePassword.current', { lng: currentLanguage })}
                placeholder={t('changePassword.currentPlaceholder', { lng: currentLanguage })}
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={handleCurrentPasswordChange}
                onBlur={() => setFocusedField(null)}
                onFocus={() => handleFocus('currentPassword')}
                focused={focusedField === 'currentPassword'}
                error={isEmptyError || apiErrorBorder}
                showErrorText={false}
              />
              <TouchableOpacity
                style={[
                  styles.eyeIcon,
                  isRTL ? { right: undefined, left: wp(7) } : { left: undefined, right: wp(7) }
                ]}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye' : 'eye-off'}
                  size={wp(5)}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <CustomInput
                label={t('changePassword.new', { lng: currentLanguage })}
                placeholder={t('changePassword.newPlaceholder', { lng: currentLanguage })}
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={handleNewPasswordChange}
                onBlur={() => setFocusedField(null)}
                onFocus={() => handleFocus('newPassword')}
                focused={focusedField === 'newPassword'}
                error={isEmptyError || apiErrorBorder}
                showErrorText={false}
              />
              <TouchableOpacity
                style={[
                  styles.eyeIcon,
                  isRTL ? { right: undefined, left: wp(7) } : { left: undefined, right: wp(7) }
                ]}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons
                  name={showNewPassword ? 'eye' : 'eye-off'}
                  size={wp(5)}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <CustomInput
                label={t('changePassword.confirm', { lng: currentLanguage })}
                placeholder={t('changePassword.confirmPlaceholder', { lng: currentLanguage })}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                onBlur={() => setFocusedField(null)}
                onFocus={() => handleFocus('confirmPassword')}
                focused={focusedField === 'confirmPassword'}
                error={isEmptyError || apiErrorBorder}
                showErrorText={false}
              />
              <TouchableOpacity
                style={[
                  styles.eyeIcon,
                  isRTL ? { right: undefined, left: wp(7) } : { left: undefined, right: wp(7) }
                ]}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye' : 'eye-off'}
                  size={wp(5)}
                  color="#6a5f5fff"
                />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

            {/* Submit Button */}
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  {isLoading && (
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                      style={styles.loader}
                    />
                  )}
                  <Text style={styles.buttonText} key={`button-${languageKey}-${currentLanguage}`}>
                    {isLoading ? t('changePassword.changing', { lng: currentLanguage }) : t('changePassword.save', { lng: currentLanguage })}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(5),
    minHeight: height,
  },
  mainContainer: { 
    flex: 1,
    paddingTop: hp(3),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(4),
  },
  backButton: {
    backgroundColor: '#ffffff',
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
    borderWidth:1,
    borderColor:"#E5E7EB"
  },
  headerContent: {
    flex: 1,
    paddingTop: hp(1),
    
  },
  headerSpacer: {
    width: wp(12),
    height: wp(12),
  },
  title: {
    fontSize: scaleFont(20),
    fontWeight: '600',
    color: '#000000',
    marginBottom: hp(1),
    textAlign:"center"
  },
  subtitle: {
    fontSize: scaleFont(12),
    fontWeight: '400',
    color: '#666666',
    lineHeight: scaleFont(14),
      textAlign:"center",
    // paddingHorizontal:wp(3)
  },
  inputContainer: { 
    position: 'relative',
    marginBottom: hp(3),
    paddingHorizontal:wp(6),
  },
  eyeIcon: {
    position: 'absolute',
    top: scaleHeight(35),
    padding: scaleWidth(8),
    zIndex: 1,
    // right/left will be set dynamically based on RTL/LTR
  },
  errorText: {
    color: '#E63946',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 13,
  },
  buttonWrapper: {
    paddingHorizontal: wp(6),
  },
  submitButton: {
    marginTop: hp(2),
    backgroundColor: '#C539A5',
    borderRadius: scaleWidth(12),
    paddingVertical: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    width: '100%',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: { marginRight: wp(2) },
  buttonText: {
    color: '#fff',
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
});

export default ChangePassword;
