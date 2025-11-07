import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik, FormikHelpers } from 'formik';
import React, { useRef, useState } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import CustomInput from '../../../components/CustomInput';
import OTPModal from '../../../components/OTPModal';
import { AuthStackParamList } from '../AuthNavigator';
import {
  useForgotPassword,
  useLogin,
  useResetPassword,
} from '../hooks/useAuth';
import BackButton from '../../../components/BackButton';
import NoInternet from '../../../components/NoInternet';
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

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

const ForgotPassword: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { t } = useTranslation('auth');

  const forgotPassword = useForgotPassword();
  const resetPassword = useResetPassword();
  const login = useLogin();

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
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
      colors={['#F5F5F5', '#F5F5F5']}
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
              <Text style={styles.title}>{t('forgot.title')}</Text>
              <Text style={styles.subtitle}>
                {t('forgot.subtitle')}
              </Text>
            </View>

            <Formik
              initialValues={{
              phoneNumber: '+923236102030',
                newPassword: '6AJ$kk3m9',
                confirmPassword: '6AJ$kk3m9',
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
            }) => (
                <>
                  <CustomInput
                    label={t('login.phoneNumber')}
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
                    label={t('forgot.newPassword')}
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
                    label={t('forgot.confirmPassword')}
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
                          ? t('forgot.sending')
                          : t('forgot.cta')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
                )
              }}
            </Formik>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('forgot.remember')} </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('LoginScreen')}
              >
                <Text style={styles.loginLink}>{t('login.title')}</Text>
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
});

export default ForgotPassword;
