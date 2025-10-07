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
import CustomInput from '../../../components/CustomInput';
import OTPModal from '../../../components/OTPModal';
import { supabase } from '../../../services/supabase';
import { useRegister, useVerifyOtp } from '../hooks/useAuth';

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
  const registerMutation = useRegister();
  const verifyOtpMutation = useVerifyOtp();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [, setPasswordValidation] = useState<PasswordValidation>({
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

  const handleRegister = (values: RegisterFormValues) => {
    setApiError(false);
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
          navigation.navigate('Home'); // redirect after success
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={wp(6)} color="#000" />
          </TouchableOpacity>

          <View style={styles.mainContainer}>
            <Text style={styles.title}>Register</Text>
            <Text style={styles.subtitle}>
              Create an <Text style={styles.highlight}>Account</Text> to access
              all features of <Text style={styles.highlight}>Adryd</Text>.
            </Text>

            <Formik
              initialValues={{
                username: 'Han Lee',
                password: '6AJ$kk3m8',
                companyName: 'Facility',
                phoneNumber: '+923236102030',
              }}
              validationSchema={validationSchema}
              onSubmit={handleRegister}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                setFieldValue,
              }) => (
                <>
                  <CustomInput
                    label="Username"
                    placeholder="Enter Username"
                    value={values.username}
                    onChangeText={handleChange('username')}
                    onBlur={handleBlur('username')}
                    focused={focusedField === 'username'}
                    onFocus={() => setFocusedField('username')}
                    error={apiError}
                  />

                  <CustomInput
                    label="Company Name"
                    placeholder="Enter Company Name"
                    value={values.companyName}
                    onChangeText={handleChange('companyName')}
                    onBlur={handleBlur('companyName')}
                    focused={focusedField === 'companyName'}
                    onFocus={() => setFocusedField('companyName')}
                    error={apiError}
                  />

                  <CustomInput
                    label="Phone Number"
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

                  {/* Password */}
                  <View style={styles.passwordContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={[
                          styles.passwordInput,
                          errors.password &&
                            touched.password &&
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
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      isLoading && styles.disabledButton,
                    ]}
                    onPress={handleSubmit as any}
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
                        {isLoading ? 'Registering...' : 'Register'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </Formik>

            <View style={styles.grayLine} />
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('LoginScreen')}
              >
                <Text style={styles.loginLink}> Login</Text>
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
  },
  inputError: { borderColor: '#ff4444' },
  eyeIconContainer: { position: 'absolute', right: wp(4) },
  errorText: { color: '#ff4444', fontSize: wp(3.5), marginTop: hp(0.5) },
});

export default RegisterScreen;
