import { useFocusEffect } from '@react-navigation/native';
import { Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import * as Yup from 'yup';
import PasswordRequirements from '../../../components/PasswordRequirements';
import BackButton from '../../../components/BackButton';
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import OTPModal from '../../../components/OTPModal';
import i18n from '../../../i18n';
import { supabase } from '../../../services/supabase';
import { useRegister, useVerifyOtp } from '../hooks/useAuth';
import BackButton from '../../../components/BackButton';
import NoInternet from '../../../components/NoInternet';
import CustomButton from '../../../components/CustomButton';
import PrimaryButton from '../../../components/PrimaryButton';
import Loader from '../../../components/Loader';

// ----------------------
// Helpers
// ----------------------
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

// ----------------------
// Types
// ----------------------
interface RegisterFormValues {
  username: string;
  password: string;
  phoneNumber: string;
}

interface RegisterScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: Record<string, any>) => void;
  };
}

interface PasswordValidation {
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

// Validation schema will be created inside component to access translations

// ----------------------
// Component
// ----------------------
const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { t, i18n: i18nInstance } = useTranslation('auth');
  const registerMutation = useRegister();

  // Validation schema with translated error messages
  const validationSchema = React.useMemo(() => {
    const currentLang = i18nInstance.language;
    return Yup.object().shape({
      username: Yup.string().required(t('register.errors.username', { lng: currentLang }) || 'Username is required'),
      password: Yup.string()
        .required(t('register.errors.password', { lng: currentLang }) || 'Password is required')
        .min(8, t('register.errors.password', { lng: currentLang }) || 'Password must be at least 8 characters')
        .matches(/[A-Z]/, t('register.errors.password', { lng: currentLang }) || 'Password must contain uppercase')
        .matches(/[a-z]/, t('register.errors.password', { lng: currentLang }) || 'Password must contain lowercase')
        .matches(/[0-9]/, t('register.errors.password', { lng: currentLang }) || 'Password must contain number'),
      phoneNumber: Yup.string()
        .matches(/^\+92\d{10}$/, t('register.errors.phoneNumber', { lng: currentLang }) || 'Invalid phone number')
        .required(t('register.errors.phoneNumber', { lng: currentLang }) || 'Phone number is required'),
    });
  }, [t, i18nInstance.language]);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [apiError, setApiError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [, setPasswordValidation] = useState<PasswordValidation>({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

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
    }, [i18nInstance.language]),
  );

  // ----------------------
  // Handlers
  // ----------------------
  const validatePassword = (password: string) => {
    const validation = {
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password),
    };
    setPasswordValidation(validation);
  };

  const handlePhoneChange = (text: string, setFieldValue: any) => {
    setApiError(false);
    const cleaned = text.replace(/[^0-9+]/g, '');
    if (!cleaned.startsWith('+92')) {
      setFieldValue('phoneNumber', '+92');
      return;
    }
    if (cleaned.length <= 13) setFieldValue('phoneNumber', cleaned);
  };

  const handleRegister = async (
    values: RegisterFormValues,
    formikHelpers: any,
  ) => {
    setValidationAttempted(true);
    setApiError(false);

    // Validate all fields
    const errors = await formikHelpers.validateForm();

    // If there are validation errors, don't proceed
    if (Object.keys(errors).length > 0) {
      formikHelpers.setTouched({
        username: true,
        phoneNumber: true,
        password: true,
      });
      return;
    }

    // All fields are valid, proceed with registration
    setIsLoading(true);

    const payload = {
      fullName: values.username,
      phone: values.phoneNumber,
      password: values.password,
    };

    registerMutation.mutate(payload, {
      onSuccess: () => {
        setIsLoading(false);
        setPhone(values.phoneNumber);
        setShowOtpModal(true); // show OTP modal instead of navigating away
      },
      onError: err => {
        console.warn('Register error:', err);
        setIsLoading(false);

        let message = 'Something went wrong.';

        if (
          typeof err?.message === 'string' &&
          err.message.includes('identities is empty')
        ) {
          message = 'This phone number is already registered but not verified.';
        }

        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: message,
          position: 'bottom',
        });
      },
    });
  };

    const handleVerifyOtp = async (otp: string) => {
    try {
      // Verify OTP but don't set user yet - we'll do that after terms agreement
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });
      
      if (error) {
        console.warn('OTP verify error:', error);
        return;
      }

      // OTP verified successfully, now show Terms and Conditions
      setShowOtpModal(false);
      
      // Store the user temporarily - we'll set it in store after terms agreement
      const verifiedUser = data.user;
      
      // Navigate to Terms and Conditions first, then to BottomTab after agreement
      (navigation as any).navigate('TermsAndConditions', {
        fromAuth: true,
        navigateTo: 'BottomTab',
        user: verifiedUser, // Pass user so Terms screen can set it after agreement
      });
    } catch (err) {
      console.warn('OTP verify error:', err);
    }
  };

  const handleResendOtp = async () => {
    try {
      await supabase.auth.signInWithOtp({ phone });
    } catch (error) {
      console.warn('Resend OTP error:', error);
    }
  };

  // ----------------------
  // JSX
  // ----------------------
  return (
    <LinearGradient colors={['#F8F8F8', '#F8F8F8']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <BackButton />
          <View
            style={styles.mainContainer}
            key={`main-${isRTL}-${languageKey}`}
          >
            <Text
              style={styles.title}
              key={`title-${languageKey}-${currentLanguage}`}
            >
              {t('register.title', { lng: currentLanguage })}
            </Text>
            <Text
              style={styles.subtitle}
              key={`subtitle-${languageKey}-${currentLanguage}`}
            >
              {t('register.subtitle.start', { lng: currentLanguage })}{' '}
              <Text style={styles.highlight}>
                {t('register.subtitle.highlight1', { lng: currentLanguage })}
              </Text>{' '}
              {t('register.subtitle.middle', { lng: currentLanguage })}{' '}
              <Text style={styles.highlight}>
                {t('register.subtitle.highlight2', { lng: currentLanguage })}
              </Text>
              {t('register.subtitle.end', { lng: currentLanguage })}
            </Text>

            <Formik
              initialValues={{
                username: '',
                password: '',
                phoneNumber: '+92',
              }}
              validationSchema={validationSchema}
              onSubmit={(values, formikHelpers) => {
                handleRegister(values, formikHelpers);
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                setFieldValue,
              }) => {
                // Helper to determine if field should show pink border
                const shouldShowError = (
                  fieldName: keyof RegisterFormValues,
                ) => {
                  if (!validationAttempted && !touched[fieldName]) return false;
                  const isEmpty =
                    !values[fieldName] || values[fieldName].trim() === '';
                  const hasValidationError =
                    touched[fieldName] && errors[fieldName];
                  return isEmpty || hasValidationError;
                };

                return (
                  <>
                    <CustomInput
                      label={t('Full Name', { lng: currentLanguage })}
                      placeholder={t('Name', { lng: currentLanguage })}
                      value={values.username}
                      onChangeText={handleChange('username')}
                      onBlur={handleBlur('username')}
                      focused={focusedField === 'username'}
                      onFocus={() => setFocusedField('username')}
                      error={shouldShowError('username') || apiError}
                      showErrorText={false}
                    />

                    <CustomInput
                      label={t('login.phoneNumber', { lng: currentLanguage })}
                      placeholder="3XXXXXXXXX"
                      isPhoneNumber={true}
                      value={values.phoneNumber}
                      onChangeText={text =>
                        handlePhoneChange(text, setFieldValue)
                      }
                      onBlur={handleBlur('phoneNumber')}
                      onFocus={() => setFocusedField('phoneNumber')}
                      focused={focusedField === 'phoneNumber'}
                      error={shouldShowError('phoneNumber') || apiError}
                      errorMessage={
                        shouldShowError('phoneNumber')
                          ? t('register.errors.phoneNumber', { lng: currentLanguage })
                          : undefined
                      }
                      showErrorText={false}
                    />

                                        {/* Password */}
                    <View>
                      <CustomInput
                        label={t('register.password', { lng: currentLanguage })}
                        placeholder={t('register.password', {
                          lng: currentLanguage,
                        })}
                        isPassword={true}
                        value={values.password}
                        onChangeText={text => {
                          handleChange('password')(text);
                          validatePassword(text);
                        }}
                        onBlur={handleBlur('password')}
                        onFocus={() => setFocusedField('password')}
                        focused={focusedField === 'password'}
                        error={shouldShowError('password') || (errors.password && touched.password)}
                        errorMessage={
                          shouldShowError('password')
                            ? t('register.errors.password', { lng: currentLanguage })
                            : undefined
                        }
                      />
                      {focusedField === 'password' && (
                        <PasswordRequirements password={values.password} namespace="register" />
                      )}
                    </View>

                    <PrimaryButton
                      title={isLoading ? t('register.registering', { lng: currentLanguage }) : t('register.cta', { lng: currentLanguage })}
                      onPress={handleSubmit}
                      loading={isLoading}
                      buttonStyle={{ alignSelf: 'center', width: 161, height: 50, marginTop: hp(2) }}
                    />
                    {(isLoading || registerMutation.isPending) && <Loader />}
                  </>
                );
              }}
            </Formik>

            <View style={styles.grayLine} />
            <View
              style={[
                styles.footer,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Text
                style={styles.footerText}
                key={`footer-${languageKey}-${currentLanguage}`}
              >
                {t('register.already', { lng: currentLanguage })}{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('LoginScreen')}
              >
                <Text
                  style={styles.loginLink}
                  key={`login-link-${languageKey}-${currentLanguage}`}
                >
                  {' '}
                  {t('login.title', { lng: currentLanguage })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Modal */}
      <OTPModal
        visible={showOtpModal}
        phoneNumber={phone}
        onClose={() => setShowOtpModal(false)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />
      <NoInternet />
    </LinearGradient>
  );
};

// ----------------------
// Styles
// ----------------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(20),
    minHeight: height + hp(10),
  },
  mainContainer: { paddingHorizontal: 20 },
  backButton: {
    backgroundColor: '#fff',
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(5),
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#C539A5',
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '400',
    marginBottom: hp(4.5),
    lineHeight: hp(2.2),
  },
  highlight: { color: '#C539A5', fontWeight: 'bold' },
  disabledButton: { opacity: 0.7 },
  buttonContent: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: wp(4), fontWeight: 'bold' },
  loader: { marginRight: wp(2) },
  grayLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: 220,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: hp(4),
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: hp(3) },
  footerText: { color: '#444', fontSize: 12 },
  loginLink: {
    color: '#C539A5',
    fontSize: 12,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  passwordContainer: { marginBottom: hp(2) },
  inputLabel: { fontSize: 14, color: '#595959', marginBottom: 8 },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#e2d1d1',
    borderRadius: wp(3),
    height: hp(6),
    flex: 1,
    fontSize: 12,
    backgroundColor: '#fff',
    color: '#000',
    // padding will be set dynamically based on RTL/LTR
  },
  inputError: { borderColor: '#C539A5', borderWidth: 0.6 },
  eyeIconContainer: {
    position: 'absolute',
    padding: wp(2),
    zIndex: 1,
    // right/left will be set dynamically based on RTL/LTR
  },
  errorText: { color: '#ff4444', fontSize: wp(3.5), marginTop: hp(0.5) },
});

export default RegisterScreen;
