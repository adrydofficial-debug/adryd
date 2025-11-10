import { Formik } from 'formik';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import CustomInput from '../../../components/CustomInput';
import OTPModal from '../../../components/OTPModal';
import { supabase } from '../../../services/supabase';
import { useRegister, useVerifyOtp } from '../hooks/useAuth';
import BackButton from '../../../components/BackButton';
import NoInternet from '../../../components/NoInternet';

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
  companyName: string;
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

// ----------------------
// Validation Schema
// ----------------------
const validationSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  companyName: Yup.string().required('Company name is required'),
  password: Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Must include uppercase, lowercase, number, and special character',
    )
    .required('Password is required'),
  phoneNumber: Yup.string()
    .matches(/^\+92\d{10}$/, 'Invalid phone number')
    .required('Phone number is required'),
});

// ----------------------
// Component
// ----------------------
const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { t } = useTranslation('auth');
  const registerMutation = useRegister();
  const verifyOtpMutation = useVerifyOtp();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
<<<<<<< HEAD
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [, setPasswordValidation] = useState<PasswordValidation>({
=======
const [, setPasswordValidation] = useState<PasswordValidation>({
>>>>>>> 2983cf21b0260d7744ef3fccffd2bdfed49ab495
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

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

  const handleRegister = async (values: RegisterFormValues, formikHelpers: any) => {
    setValidationAttempted(true);
    setApiError(false);

    // Validate all fields
    const errors = await formikHelpers.validateForm();
    
    // If there are validation errors, don't proceed
    if (Object.keys(errors).length > 0) {
      formikHelpers.setTouched({
        username: true,
        companyName: true,
        phoneNumber: true,
        password: true,
      });
      return;
    }

    // All fields are valid, proceed with registration
    setIsLoading(true);

    const payload = {
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
        setApiError(true);
      },
    });
  };

  const handleVerifyOtp = (otp: string) => {
    verifyOtpMutation.mutate(
      { phone, otp },
      {
        onSuccess: () => {
          setShowOtpModal(false);
          navigation.navigate('BottomTab'); // redirect to BottomTab with bottom tabs
        },
        onError: err => {
          console.warn('OTP verify error:', err);
        },
      },
    );
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
    <LinearGradient colors={['#FFF4FD', '#fef3f9']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <BackButton/>
          <View style={styles.mainContainer}>
            <Text style={styles.title}>{t('register.title')}</Text>
            <Text style={styles.subtitle}>
              {t('register.subtitle.start')}{' '}
              <Text style={styles.highlight}>{t('register.subtitle.highlight1')}</Text>{' '}
              {t('register.subtitle.middle')}{' '}
              <Text style={styles.highlight}>{t('register.subtitle.highlight2')}</Text>
              {t('register.subtitle.end')}
            </Text>

            <Formik
              initialValues={{
                username: '',
                password: '',
                companyName: '',
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
<<<<<<< HEAD
                validateForm,
                setTouched,
              }) => {
                // Helper to determine if field should show pink border
                const shouldShowError = (fieldName: keyof RegisterFormValues) => {
                  if (!validationAttempted && !touched[fieldName]) return false;
                  const isEmpty = !values[fieldName] || values[fieldName].trim() === '';
                  const hasValidationError = touched[fieldName] && errors[fieldName];
                  return isEmpty || hasValidationError;
                };
=======
            }) => (
                <>
                  <CustomInput
                    label={t('register.username')}
                    placeholder="Enter Username"
                    value={values.username}
                    onChangeText={handleChange('username')}
                    onBlur={handleBlur('username')}
                    focused={focusedField === 'username'}
                    onFocus={() => setFocusedField('username')}
                    error={apiError}
                  />

                  <CustomInput
                    label={t('register.companyName')}
                    placeholder="Enter Company Name"
                    value={values.companyName}
                    onChangeText={handleChange('companyName')}
                    onBlur={handleBlur('companyName')}
                    focused={focusedField === 'companyName'}
                    onFocus={() => setFocusedField('companyName')}
                    error={apiError}
                  />

                  <CustomInput
                    label={t('login.phoneNumber')}
                    placeholder="3XXXXXXXXX"
                    keyboardType="phone-pad"
                    value={values.phoneNumber}
                    onChangeText={text =>
                      handlePhoneChange(text, setFieldValue)
                    }
                    onBlur={handleBlur('phoneNumber')}
                    onFocus={() => setFocusedField('phoneNumber')}
                    focused={focusedField === 'phoneNumber'}
                    error={!!errors.phoneNumber || apiError}
                  />
>>>>>>> 2983cf21b0260d7744ef3fccffd2bdfed49ab495

                  {/* Password */}
                  <View style={styles.passwordContainer}>
                    <Text style={styles.inputLabel}>{t('register.password')}</Text>
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={[
                          styles.passwordInput,
                          (shouldShowError('password') || (errors.password && touched.password)) &&
                            styles.inputError,
                        ]}
                        placeholder="Enter Password"
                        secureTextEntry={!showPassword}
                        value={values.password}
                        onChangeText={text => {
                          handleChange('password')(text);
                          validatePassword(text);
                        }}
                        onBlur={handleBlur('password')}
                        onFocus={() => setFocusedField('password')}
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity
                        style={styles.eyeIconContainer}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={showPassword ? 'eye' : 'eye-off'}
                          size={wp(5)}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      isLoading && styles.disabledButton,
                    ]}
                    onPress={() => {
                      handleSubmit();
                    }}
                    disabled={isLoading}
                  >
                    <View style={styles.buttonContent}>
                      {isLoading && (
                        <ActivityIndicator
                          size="small"
                          color="#fff"
                          style={styles.loader}
                        />
                      )}
                      <Text style={styles.buttonText}>
                        {isLoading ? t('register.registering') : t('register.cta')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
                )
              }}
            </Formik>

            <View style={styles.grayLine} />
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('register.already')}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('LoginScreen')}
              >
                <Text style={styles.loginLink}> {t('login.title')}</Text>
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
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    marginBottom: hp(3),
    lineHeight: hp(2.2),
  },
  highlight: { color: '#C539A5', fontWeight: 'bold' },
  registerButton: {
    backgroundColor: '#C539A5',
    paddingVertical: hp(1.6),
    borderRadius: wp(3),
    alignItems: 'center',
    marginTop: hp(3),
  },
  disabledButton: { opacity: 0.7 },
  buttonContent: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: wp(4), fontWeight: 'bold' },
  loader: { marginRight: wp(2) },
  grayLine: {
    height: 1,
    backgroundColor: '#e2d1d1',
    marginTop: hp(4),
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: hp(3) },
  footerText: { color: '#444', fontSize: wp(3.8) },
  loginLink: {
    color: '#C539A5',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  passwordContainer: { marginBottom: hp(2) },
  inputLabel: { fontSize: 14, color: '#595959', marginBottom: 8 },
  passwordInputContainer: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#e2d1d1',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    height: hp(6),
    flex: 1,
    fontSize: 12,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputError: { borderColor: '#C539A5', borderWidth: 0.6 },
  eyeIconContainer: { position: 'absolute', right: wp(4) },
  errorText: { color: '#ff4444', fontSize: wp(3.5), marginTop: hp(0.5) },
});

export default RegisterScreen;
