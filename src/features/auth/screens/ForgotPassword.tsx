import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik, FormikHelpers } from 'formik';
import React, { useState, useEffect, useCallback } from 'react';
import PrimaryButton from '../../../components/PrimaryButton';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  I18nManager,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import CustomInput from '../../../components/CustomInput';
import PasswordRequirements from '../../../components/PasswordRequirements';
import OTPModal from '../../../components/OTPModal';
import { AuthStackParamList } from '../AuthNavigator';
import {
  useForgotPassword,
  useLogin,
  useResetPassword,
} from '../hooks/useAuth';
import BackButton from '../../../components/BackButton';
import NoInternet from '../../../components/NoInternet';
import Loader from '../../../components/Loader';
import i18n from '../../../i18n';
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

// Validation schema will be created inside component to access translations

const ForgotPassword: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { t, i18n: i18nInstance } = useTranslation('auth');

  const forgotPassword = useForgotPassword();
  const resetPassword = useResetPassword();
  const login = useLogin();

  // Validation schema with translated error messages
  const validationSchema = Yup.object().shape({
    phoneNumber: Yup.string()
      .required(t('forgot.errors.phoneNumber'))
      .matches(/^\+92[0-9]{10}$/, t('forgot.errors.phoneNumber')),
    newPassword: Yup.string()
      .required(t('forgot.errors.newPassword'))
      .min(8, t('forgot.errors.newPassword'))
      .matches(/[A-Z]/, t('forgot.errors.newPassword'))
      .matches(/[a-z]/, t('forgot.errors.newPassword'))
      .matches(/[0-9]/, t('forgot.errors.newPassword')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], t('forgot.errors.confirmPassword'))
      .required(t('forgot.errors.confirmPassword')),
  });

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  const handleSubmit = async (
    values: {
      phoneNumber: string;
      newPassword: string;
      confirmPassword: string;
    },
    formikHelpers: FormikHelpers<any>,
  ) => {
    setValidationAttempted(true);

    const errors = await formikHelpers.validateForm();

    if (Object.keys(errors).length > 0) {
      formikHelpers.setTouched({
        phoneNumber: true,
        newPassword: true,
        confirmPassword: true,
      });
      formikHelpers.setSubmitting(false);
      return;
    }

    forgotPassword.mutate(
      { phone: values.phoneNumber },
      {
        onSuccess: () => {
          formikHelpers.setSubmitting(false);
          setPhoneNumber(values.phoneNumber);
          setNewPassword(values.newPassword);
          setShowOTPModal(true);
        },
        onError: (err: any) => {
          formikHelpers.setSubmitting(false);
          console.warn('Forgot Password error:', err);

        },
      },
    );
  };

  const handleOTPVerify = async (otp: string) => {
    try {
      await resetPassword.mutateAsync({
        phone: phoneNumber,
        otp,
        newPassword,
      });

      await login.mutateAsync({ phone: phoneNumber, password: newPassword });

      setShowOTPModal(false);
    } catch (error) {
      console.warn('Reset Password error:', error);
      let message = 'Something went wrong while verifying the OTP. Please try again.';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        message = (error as any).message;
      }
      Alert.alert('OTP Verification Failed', message);
      throw error;
    }
  };

  const handleResendOTP = async (): Promise<void> => {
    console.log('🔄 [ForgotPassword] Resending OTP to:', phoneNumber);
    await new Promise<void>((resolve, reject) => {
      forgotPassword.mutate(
        { phone: phoneNumber },
        {
          onSuccess: () => {
            console.log('✅ [ForgotPassword] OTP resent successfully');
            resolve();
          },
          onError: (err: any) => {
            console.error('❌ [ForgotPassword] Failed to resend OTP:', err);
            reject(err);
          },
        },
      );
    });
  };

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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces
          scrollEventThrottle={16}
        >
          <BackButton/>

          <View style={styles.mainContainer} key={`main-${isRTL}-${languageKey}`}>
            <View style={styles.header}>
              <Text style={styles.title} key={`title-${languageKey}-${currentLanguage}`}>{t('forgot.title', { lng: currentLanguage })}</Text>
              <Text style={styles.subtitle} key={`subtitle-${languageKey}-${currentLanguage}`}>
                {t('forgot.subtitle', { lng: currentLanguage })}
              </Text>
            </View>

            <Formik
              initialValues={{
                phoneNumber: '+92',
                newPassword: '',
                confirmPassword: '',
              }}
              validationSchema={validationSchema}
              onSubmit={(values, formikHelpers) => {
                handleSubmit(values, formikHelpers);
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
                setFieldValue,
              }) => {
                const shouldShowError = (fieldName: 'phoneNumber' | 'newPassword' | 'confirmPassword') => {
                  if (!validationAttempted && !touched[fieldName]) return false;
                  const isEmpty = !values[fieldName] || values[fieldName].trim() === '';
                  const hasValidationError = touched[fieldName] && errors[fieldName];
                  return isEmpty || hasValidationError;
                };

                return (
                  <>
                    <CustomInput
                      label={t('login.phoneNumber', { lng: currentLanguage })}
                      placeholder="3XXXXXXXXX"
                      isPhoneNumber={true}
                      value={values.phoneNumber}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9+]/g, '');
                        if (!cleaned.startsWith('+92')) {
                          setFieldValue('phoneNumber', '+92');
                          return;
                        }
                        if (cleaned.length <= 13) {
                          setFieldValue('phoneNumber', cleaned);
                        }
                      }}
                      onBlur={() => handleBlur('phoneNumber')}
                      onFocus={() => setFocusedField('phoneNumber')}
                      focused={focusedField === 'phoneNumber'}
                      error={shouldShowError('phoneNumber')}
                      errorMessage={
                        shouldShowError('phoneNumber') 
                          ? t('forgot.errors.phoneNumber', { lng: currentLanguage })
                          : undefined
                      }
                      showErrorText={false}
                    />

                    {/* New Password */}
                    <View>
                      <CustomInput
                        label={t('forgot.newPassword', { lng: currentLanguage })}
                        placeholder={t('forgot.newPassword', { lng: currentLanguage })}
                        isPassword={true}
                        value={values.newPassword}
                        onChangeText={handleChange('newPassword')}
                        onBlur={() => handleBlur('newPassword')}
                        onFocus={() => setFocusedField('newPassword')}
                        focused={focusedField === 'newPassword'}
                        error={shouldShowError('newPassword')}
                        errorMessage={
                          shouldShowError('newPassword')
                            ? t('forgot.errors.newPassword', { lng: currentLanguage })
                            : undefined
                        }
                      />
                      {focusedField === 'newPassword' && (
                        <PasswordRequirements password={values.newPassword} namespace="forgot" />
                      )}
                    </View>

                    {/* Confirm Password */}
                    <CustomInput
                      label={t('forgot.confirmPassword', { lng: currentLanguage })}
                      placeholder={t('forgot.confirmPassword', { lng: currentLanguage })}
                      isPassword={true}
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={() => handleBlur('confirmPassword')}
                      onFocus={() => setFocusedField('confirmPassword')}
                      focused={focusedField === 'confirmPassword'}
                      error={shouldShowError('confirmPassword')}
                      errorMessage={
                        shouldShowError('confirmPassword')
                          ? t('forgot.errors.confirmPassword', { lng: currentLanguage })
                          : undefined
                      }
                    />

                    <PrimaryButton
                      title={
                        isSubmitting || forgotPassword.isPending
                          ? t('forgot.sending', { lng: currentLanguage })
                          : t('forgot.cta', { lng: currentLanguage })
                      }
                      onPress={formikSubmit as any}
                      loading={isSubmitting || forgotPassword.isPending}
                      buttonStyle={{ alignSelf: 'center', width: 161, height: 50, marginTop: hp(2) }}
                    />
                    {(isSubmitting || forgotPassword.isPending || resetPassword.isPending || login.isPending) && <Loader />}
                  </>
                )
              }}
            </Formik>
             <View style={styles.grayLine} />

            <View style={[styles.footer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.footerText} key={`footer-${languageKey}-${currentLanguage}`}>{t('forgot.remember', { lng: currentLanguage })} </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('LoginScreen')}
              >
                <Text style={styles.loginLink} key={`login-link-${languageKey}-${currentLanguage}`}>{t('login.title', { lng: currentLanguage })}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <OTPModal
        visible={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerify}
        onResend={handleResendOTP}
        phoneNumber={phoneNumber}
      />
      <NoInternet />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  scrollView: { flex: 1 },
  mainContainer: { paddingHorizontal: 30 },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(25),
    minHeight: height + hp(10),
  },
  header: { marginTop: hp(5), marginBottom: hp(4.5) },
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
  disabledButton: {
    backgroundColor: '#ccc',
    elevation: 0,
  },
  loader: { marginRight: wp(2) },
  buttonText: {
    color: '#fff',
    fontSize: wp(3.1),
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(3),
    marginBottom: hp(5),
  },
  grayLine: { height: 1, backgroundColor: '#E5E7EB',  marginTop: hp(4), width:220, justifyContent:'center', alignSelf:'center', },
  footerText: { fontSize: 12, color: '#18181B' },
  loginLink: {
    fontSize: 12,
    color: '#C539A5',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  passwordContainer: { marginBottom: hp(2) },
  inputLabel: { fontSize: 14, color: '#595959', marginBottom: 8 },
  passwordInputContainer: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
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
});

export default ForgotPassword;
