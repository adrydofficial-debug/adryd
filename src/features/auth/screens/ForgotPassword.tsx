// src/features/auth/screens/ForgotPassword.tsx

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik, FormikHelpers } from 'formik';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Yup from 'yup';
import CustomInput from '../../../components/CustomInput';
import OTPModal from '../../../components/OTPModal';
import { AuthStackParamList } from '../AuthNavigator';
import {
  useForgotPassword,
  useLogin,
  useResetPassword,
} from '../hooks/useAuth';
import BackButton from '../../../components/BackButton';
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

// ---------- Validation ----------
const validationSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\+92[0-9]{10}$/, 'Phone number must be in format +92XXXXXXXXXX'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

// ---------- Component ----------
const ForgotPassword: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const forgotPassword = useForgotPassword(); // sends OTP
  const resetPassword = useResetPassword(); // verifies OTP + updates password
  const login = useLogin(); // Logs in with new password

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // ---------- Submit ----------
  const handleSubmit = (
    values: {
      phoneNumber: string;
      newPassword: string;
      confirmPassword: string;
    },
    { setSubmitting }: FormikHelpers<any>,
  ) => {
    forgotPassword.mutate(
      { phone: values.phoneNumber },
      {
        onSuccess: () => {
          setSubmitting(false);
          setPhoneNumber(values.phoneNumber);
          setNewPassword(values.newPassword);
          setShowOTPModal(true);
        },
        onError: (err: any) => {
          setSubmitting(false);
          console.warn('Forgot Password error:', err);
          Alert.alert(
            'Error',
            err?.response?.data?.message ||
              err?.message ||
              'Failed to send OTP. Please try again.',
          );
        },
      },
    );
  };

  // ---------- OTP Verify ----------
  const handleOTPVerify = async (otp: string) => {
    try {
      await resetPassword.mutateAsync({
        phone: phoneNumber,
        otp,
        newPassword,
      });

      // ✅ Automatically log the user in after reset
      await login.mutateAsync({ phone: phoneNumber, password: newPassword });

      setShowOTPModal(false);
      Alert.alert('Success', 'Your password has been reset!');
      // ❌ No need to navigate; App.tsx will pick up new session and reroute
    } catch (error) {
      console.warn('Reset Password error:', error);
      Alert.alert('Error', 'Invalid or expired OTP. Please try again.');
    }
  };

  const handleResendOTP = async (): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      forgotPassword.mutate(
        { phone: phoneNumber },
        {
          onSuccess: () => resolve(),
          onError: err => reject(err),
        },
      );
    });
  };

  return (
    <LinearGradient
      colors={['#FFF4FD', '#fef3f9']}
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

          <View style={styles.mainContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your phone number and new password. We'll send you an OTP
                on WhatsApp to confirm the reset.
              </Text>
            </View>

            <Formik
              initialValues={{
                phoneNumber: '+923236102030',
                newPassword: '6AJ$kk3m9',
                confirmPassword: '6AJ$kk3m9',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit: formikSubmit,
                values,
                errors,
                touched,
                isSubmitting,
              }) => (
                <>
                  <CustomInput
                    label="Phone Number"
                    placeholder="+923XXXXXXXXX"
                    keyboardType="phone-pad"
                    value={values.phoneNumber}
                    onChangeText={handleChange('phoneNumber')}
                    onBlur={() => handleBlur('phoneNumber')}
                    onFocus={() => setFocusedField('phoneNumber')}
                    focused={focusedField === 'phoneNumber'}
                    error={
                      touched.phoneNumber && errors.phoneNumber
                        ? errors.phoneNumber
                        : undefined
                    }
                  />

                  <CustomInput
                    label="New Password"
                    placeholder="Enter new password"
                    secureTextEntry
                    value={values.newPassword}
                    onChangeText={handleChange('newPassword')}
                    onBlur={() => handleBlur('newPassword')}
                    onFocus={() => setFocusedField('newPassword')}
                    focused={focusedField === 'newPassword'}
                    error={
                      touched.newPassword && errors.newPassword
                        ? errors.newPassword
                        : undefined
                    }
                  />

                  <CustomInput
                    label="Confirm Password"
                    placeholder="Re-enter new password"
                    secureTextEntry
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={() => handleBlur('confirmPassword')}
                    onFocus={() => setFocusedField('confirmPassword')}
                    focused={focusedField === 'confirmPassword'}
                    error={
                      touched.confirmPassword && errors.confirmPassword
                        ? errors.confirmPassword
                        : undefined
                    }
                  />

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (isSubmitting || forgotPassword.isPending) &&
                        styles.disabledButton,
                    ]}
                    onPress={formikSubmit as any}
                    disabled={isSubmitting || forgotPassword.isPending}
                    activeOpacity={0.8}
                  >
                    <View style={styles.buttonContent}>
                      {(isSubmitting || forgotPassword.isPending) && (
                        <ActivityIndicator
                          size="small"
                          color="#fff"
                          style={styles.loader}
                        />
                      )}
                      <Text style={styles.buttonText}>
                        {isSubmitting || forgotPassword.isPending
                          ? 'Sending...'
                          : 'Continue'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </Formik>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Remember your password? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('LoginScreen')}
              >
                <Text style={styles.loginLink}>Login</Text>
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
    </LinearGradient>
  );
};

// ---------- Styles ----------
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
  backButton: {
    backgroundColor: '#fff',
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(5),
    marginBottom: hp(2),
  },
  header: { marginTop: hp(5), marginBottom: hp(4) },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#C539A5',
    marginBottom: hp(0.1),
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#444',
    lineHeight: hp(2.2),
  },
  submitButton: {
    marginTop: hp(3),
    marginBottom: hp(4),
    backgroundColor: '#C539A5',
    borderRadius: wp(3),
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(8),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
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
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(4),
    marginBottom: hp(5),
  },
  footerText: { fontSize: wp(3.8), color: '#444' },
  loginLink: {
    fontSize: wp(3.8),
    color: '#C539A5',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default ForgotPassword;
