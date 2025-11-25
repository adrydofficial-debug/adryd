import { useFocusEffect } from '@react-navigation/native';
import { Formik, FormikHelpers } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import * as Yup from 'yup';
import CustomInput from '../../../components/CustomInput';
import Loader from '../../../components/Loader';
import NoInternet from '../../../components/NoInternet';
import OTPModal from '../../../components/OTPModal';
import PasswordRequirements from '../../../components/PasswordRequirements';
import PrimaryButton from '../../../components/PrimaryButton';
import i18n from '../../../i18n';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../store/authStore';
import { useForgotPassword, useRegister } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../AuthNavigator';

// ----------------------
// Helpers
// ----------------------
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

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
const RegisterScreen: React.FC = () => {

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { t, i18n: i18nInstance } = useTranslation('auth');
  const registerMutation = useRegister();
  const forgotPassword = useForgotPassword();
  const setUser = useAuthStore(s => s.setUser);

  const [currentStep, setCurrentStep] = useState<'register' | 'password'>(
    'register',
  );

  const registerValidationSchema = React.useMemo(() => {
    const currentLang = i18nInstance.language;
    return Yup.object().shape({
      username: Yup.string().required(
        t('register.errors.username', { lng: currentLang }) ||
        'Username is required',
      ),
      phoneNumber: Yup.string()
        .matches(
          /^\+92\d{10}$/,
          t('register.errors.phoneNumber', { lng: currentLang }) ||
          'Invalid phone number',
        )
        .required(
          t('register.errors.phoneNumber', { lng: currentLang }) ||
          'Phone number is required',
        ),
    });
  }, [t, i18nInstance.language]);

  const passwordValidationSchema = React.useMemo(() => {
    const currentLang = i18nInstance.language;
    return Yup.object().shape({
      password: Yup.string()
        .required(
          t('register.errors.password', { lng: currentLang }) ||
          'Password is required',
        )
        .min(
          8,
          t('register.errors.password', { lng: currentLang }) ||
          'Password must be at least 8 characters',
        )
        .matches(
          /[A-Z]/,
          t('register.errors.password', { lng: currentLang }) ||
          'Password must contain uppercase',
        )
        .matches(
          /[a-z]/,
          t('register.errors.password', { lng: currentLang }) ||
          'Password must contain lowercase',
        )
        .matches(
          /[0-9]/,
          t('register.errors.password', { lng: currentLang }) ||
          'Password must contain number',
        ),
      confirmPassword: Yup.string()
        .oneOf(
          [Yup.ref('password')],
          t('forgot.errors.confirmPassword', { lng: currentLang }) ||
          'Passwords do not match',
        )
        .required(
          t('forgot.errors.confirmPassword', { lng: currentLang }) ||
          'Please confirm your password',
        ),
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

  const handleRegisterSubmit = async (
    values: { username: string; phoneNumber: string },
    formikHelpers: FormikHelpers<any>,
  ) => {
    setValidationAttempted(true);
    setApiError(false);

    const errors = await formikHelpers.validateForm();

    if (Object.keys(errors).length > 0) {
      formikHelpers.setTouched({
        username: true,
        phoneNumber: true,
      });
      formikHelpers.setSubmitting(false);
      return;
    }

    setPhone(values.phoneNumber);

    // Send OTP
    registerMutation.mutate(
      { phone: values.phoneNumber, fullName: values.username },
      {
        onSuccess: () => {
          formikHelpers.setSubmitting(false);
          setShowOtpModal(true);
        },
        onError: (err: any) => {
          formikHelpers.setSubmitting(false);
          console.warn('Send OTP error:', err);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to send OTP. Please try again.',
            position: 'bottom',
          });
        },
      },
    );
  };

  // Handle password step
  const handlePasswordSubmit = async (
    values: { password: string; confirmPassword: string },
    formikHelpers: FormikHelpers<any>,
  ) => {
    setValidationAttempted(true);
    setApiError(false);

    const errors = await formikHelpers.validateForm();

    if (Object.keys(errors).length > 0) {
      formikHelpers.setTouched({
        password: true,
        confirmPassword: true,
      });
      formikHelpers.setSubmitting(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data: currentUser } = await supabase.auth.getUser();

      if (!currentUser?.user) {
        throw new Error('User not found. Please try again.');
      }

      const currentMeta = currentUser.user.user_metadata || {};
      const { error: updatePasswordError } = await supabase.auth.updateUser({
        password: values.password,
        data: { ...currentMeta, has_password: true },
      });

      if (updatePasswordError) {
        throw updatePasswordError;
      }

      // Get updated user
      const { data: updatedUser } = await supabase.auth.getUser();

      setIsLoading(false);

      if (updatedUser?.user) {
        setUser(updatedUser.user);
        (navigation as any).navigate('TermsAndConditions', {
          fromAuth: true,
          navigateTo: 'BottomTab',
          user: updatedUser.user,
        });
      }
    } catch (err: any) {
      console.warn('Set password error:', err);
      setIsLoading(false);
      formikHelpers.setSubmitting(false);

      let message = 'Something went wrong. Please try again.';
      if (err?.message) {
        message = err.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: message,
        position: 'bottom',
      });
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    try {
      // Verify OTP (this logs the user in temporarily)
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        console.warn('OTP verify error:', error);
        throw error;
      }

      setShowOtpModal(false);
      setCurrentStep('password');
      setValidationAttempted(false);
    } catch (err) {
      console.warn('OTP verify error:', err);
      throw err;
    }
  };

  const handleResendOtp = async (): Promise<void> => {
    console.log('🔄 [Register] Resending OTP to:', phone);
    await new Promise<void>((resolve, reject) => {
      forgotPassword.mutate(
        { phone: phone },
        {
          onSuccess: () => {
            console.log('✅ [Register] OTP resent successfully');
            resolve();
          },
          onError: (err: any) => {
            console.error('❌ [Register] Failed to resend OTP:', err);
            reject(err);
          },
        },
      );
    });
  };

  // ----------------------
  // JSX
  // ----------------------
  return (
    <LinearGradient
      colors={['#F8F8F8', '#F8F8F8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.mainContainer}>
          <View style={styles.header}>
            {/* <TouchableOpacity onPress={() => setDrawerVisible(true)} activeOpacity={0.7}> */}
            <Text style={styles.title}>{
              currentStep === 'register'
                ? t('register.title')
                : t('register.createPassword.title'
                )}</Text>
            {/* </TouchableOpacity> */}
            <Text style={styles.subtitle}>
              {currentStep === 'register'
                ? t('register.subtitle')
                : t('register.createPassword.subtitle')}
            </Text>
          </View>

          {currentStep === 'register' ? (
            <Formik
              initialValues={{
                username: '',
                phoneNumber: '+92',
              }}
              validationSchema={registerValidationSchema}
              onSubmit={(values, formikHelpers) => {
                handleRegisterSubmit(values, formikHelpers);
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit: formikSubmit,
                values,
                errors,
                touched,
                setFieldValue,
                isSubmitting,
              }) => {
                const shouldShowError = (
                  fieldName: 'username' | 'phoneNumber',
                ) => {
                  if (!validationAttempted && !touched[fieldName])
                    return false;
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
                          ? t('register.errors.phoneNumber', {
                            lng: currentLanguage,
                          })
                          : undefined
                      }
                      showErrorText={false}
                    />

                    {/* Forgot password */}
                    <TouchableOpacity
                      style={styles.forgotPasswordContainer}
                      onPress={() => { }}
                    >
                      <Text style={styles.forgotPasswordText}>
                        {''}
                      </Text>
                    </TouchableOpacity>
                    <PrimaryButton
                      title={
                        isSubmitting || forgotPassword.isPending
                          ? t('forgot.sending', { lng: currentLanguage }) ||
                          'Sending...'
                          : t('register.cta', { lng: currentLanguage })
                      }
                      onPress={formikSubmit as any}
                      loading={isSubmitting || forgotPassword.isPending}
                      buttonStyle={{
                        alignSelf: 'center',
                        width: 161,
                        height: 50,
                        marginTop: hp(2),
                      }}
                    />
                    {(isSubmitting || forgotPassword.isPending) && <Loader />}
                  </>
                );
              }}
            </Formik>
          ) : (
            <Formik
              initialValues={{
                password: '',
                confirmPassword: '',
              }}
              validationSchema={passwordValidationSchema}
              onSubmit={(values, formikHelpers) => {
                handlePasswordSubmit(values, formikHelpers);
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit: formikSubmit,
                values,
                errors,
                touched,
                isSubmitting,
              }) => {
                const shouldShowError = (
                  fieldName: 'password' | 'confirmPassword',
                ) => {
                  if (!validationAttempted && !touched[fieldName])
                    return false;
                  const isEmpty =
                    !values[fieldName] || values[fieldName].trim() === '';
                  const hasValidationError =
                    touched[fieldName] && errors[fieldName];
                  return isEmpty || hasValidationError;
                };

                return (
                  <>
                    {/* New Password */}
                    <View>
                      <CustomInput
                        label={t('register.password', {
                          lng: currentLanguage,
                        })}
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
                        error={shouldShowError('password')}
                        errorMessage={
                          shouldShowError('password')
                            ? t('register.errors.password', {
                              lng: currentLanguage,
                            })
                            : undefined
                        }
                      />
                      {focusedField === 'password' && (
                        <PasswordRequirements
                          password={values.password}
                          namespace="register"
                        />
                      )}
                    </View>

                    {/* Confirm Password */}
                    <CustomInput
                      label={t('forgot.confirmPassword', {
                        lng: currentLanguage,
                      })}
                      placeholder={t('forgot.confirmPassword', {
                        lng: currentLanguage,
                      })}
                      isPassword={true}
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      onFocus={() => setFocusedField('confirmPassword')}
                      focused={focusedField === 'confirmPassword'}
                      error={shouldShowError('confirmPassword')}
                      errorMessage={
                        shouldShowError('confirmPassword')
                          ? t('forgot.errors.confirmPassword', {
                            lng: currentLanguage,
                          }) || 'Passwords do not match'
                          : undefined
                      }
                    />

                    <PrimaryButton
                      title={
                        isSubmitting ||
                          isLoading ||
                          registerMutation.isPending
                          ? t('register.registering', {
                            lng: currentLanguage,
                          })
                          : t('register.cta', { lng: currentLanguage })
                      }
                      onPress={formikSubmit as any}
                      loading={
                        isSubmitting ||
                        isLoading ||
                        registerMutation.isPending
                      }
                      buttonStyle={{
                        alignSelf: 'center',
                        width: 161,
                        height: 50,
                        marginTop: hp(2),
                      }}
                    />
                    {(isSubmitting ||
                      isLoading ||
                      registerMutation.isPending) && <Loader />}
                  </>
                );
              }}
            </Formik>
          )}

          <View style={styles.grayLine} />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('register.already')} </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('LoginScreen')}
            >
              <Text style={styles.loginLink}>{t('login.title')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* </ScrollView> */}
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
  keyboardAvoidingView: { flex: 1 },
  mainContainer: { paddingHorizontal: 47 },
  header: { marginTop: hp(15), marginBottom: hp(4.5) },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#C539A5',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: hp(2.2),
  },
  highlight: { color: '#C539A5', fontWeight: '900' },
  forgotPasswordContainer: { alignItems: 'flex-end', marginBottom: hp(5) },
  forgotPasswordText: {
    fontSize: 10,
    color: '#4F4F4F',
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
  loader: { marginRight: wp(2) },
  buttonText: { color: '#fff', fontSize: wp(3.1), fontWeight: 'bold' },
  grayLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: hp(4),
    width: 220,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(3),
    marginBottom: hp(5),
  },
  footerText: { fontSize: 12, color: '#18181B' },
  loginLink: {
    fontSize: 12,
    color: '#C539A5',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  passwordContainer: { marginBottom: hp(2) },
  inputLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#595959',
    marginBottom: 8,
  },
  passwordInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#e2d1d1',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    paddingRight: wp(12),
    fontSize: 12,
    color: '#000',
    backgroundColor: '#fff',
    flex: 1,
    height: hp(6),
  },
  eyeIconContainer: {
    position: 'absolute',
    right: wp(4),
    padding: wp(1),
    zIndex: 1,
  },
  inputError: { borderColor: '#ff4444' },
  passwordInputFocused: { borderColor: '#C539A5', borderWidth: 2 },
});

export default RegisterScreen;
