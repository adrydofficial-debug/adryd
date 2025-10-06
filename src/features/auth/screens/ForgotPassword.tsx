// src/features/auth/screens/ForgotPassword.tsx
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik, FormikHelpers } from 'formik';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { useForgotPassword } from '../hooks/useAuth';
import { ForgotPasswordRequest } from '../types';

// ---------- Layout helpers ----------
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

// ---------- Validation ----------
const validationSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .min(13, 'Phone number must be at least 10 digits')
    .matches(/^\+92[0-9]{10}$/, 'Phone number must be in format +92XXXXXXXXXX'),
});

// ---------- Component ----------
const ForgotPassword: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const forgotPassword = useForgotPassword();
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [apiError, setApiError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isEmptyError, setIsEmptyError] = useState(false);
  const [apiErrorBorder, setApiErrorBorder] = useState(false);

  // ---------- Input Handling ----------
  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handlePhoneNumberChange = (
    text: string,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    if (isEmptyError) setIsEmptyError(false);
    if (apiError) setApiError('');
    if (apiErrorBorder) setApiErrorBorder(false);

    const cleaned = text.replace(/[^0-9+]/g, '');
    if (!cleaned.startsWith('+92')) {
      setFieldValue('phoneNumber', '+92');
      return;
    }
    if (cleaned.length <= 13) {
      setFieldValue('phoneNumber', cleaned);
    }
  };

  // ---------- Submit ----------
  const handleSubmit = (
    values: ForgotPasswordRequest,
    { setSubmitting }: FormikHelpers<ForgotPasswordRequest>,
  ) => {
    setApiError('');
    setIsEmptyError(false);
    setApiErrorBorder(false);
    setFocusedField(null);

    const isPhoneNumberEmpty =
      !values.phoneNumber ||
      values.phoneNumber === '+92' ||
      values.phoneNumber.length < 13;

    if (isPhoneNumberEmpty) {
      setIsEmptyError(true);
      return;
    }

    forgotPassword.mutate(
      { phoneNumber: values.phoneNumber },
      {
        onSuccess: () => {
          setSubmitting(false);
          setPhoneNumber(values.phoneNumber);
          setShowOTPModal(true);
        },
        onError: (err: any) => {
          setSubmitting(false);
          console.warn('Forgot Password error:', err);
          const errorMessage =
            err?.response?.data?.message ||
            err?.message ||
            'Failed to send reset instructions. Please try again.';
          setApiError(errorMessage);
          setApiErrorBorder(true);
        },
      },
    );
  };

  const handleOTPVerify = (otp: string) => {
    setShowOTPModal(false);
    navigation.navigate('ResetPass', { phoneNumber, otp });
  };

  const handleResendOTP = async (): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      forgotPassword.mutate(
        { phoneNumber },
        {
          onSuccess: () => resolve(),
          onError: err => reject(err),
        },
      );
    });
  };

  // ---------- Render ----------
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={wp(6)} color="#000" />
          </TouchableOpacity>

          <View style={styles.mainContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your phone number (Without +92) and we'll send you an OTP
                on WhatsApp to reset your password.
              </Text>
            </View>

            <Formik<ForgotPasswordRequest>
              initialValues={{ phoneNumber: '+92' }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                handleBlur,
                handleSubmit: formikHandleSubmit,
                values,
                isSubmitting,
                setFieldValue,
              }) => (
                <>
                  <CustomInput
                    label="Phone Number"
                    placeholder="3XXXXXXXXX"
                    keyboardType="phone-pad"
                    value={values.phoneNumber}
                    onChangeText={text =>
                      handlePhoneNumberChange(text, setFieldValue)
                    }
                    onBlur={() => {
                      setFocusedField(null);
                      handleBlur('phoneNumber');
                    }}
                    onFocus={() => handleFocus('phoneNumber')}
                    focused={focusedField === 'phoneNumber'}
                    error={isEmptyError || apiErrorBorder}
                    showErrorText={false}
                  />

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (isSubmitting || forgotPassword.isPending) &&
                        styles.disabledButton,
                    ]}
                    onPress={formikHandleSubmit as any}
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
                          : 'Submit'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </Formik>

            {/* Footer */}
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
