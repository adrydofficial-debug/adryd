// src/features/auth/LoginScreen.tsx
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik, FormikHelpers } from 'formik';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
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
import * as Yup from 'yup';
import CustomInput from '../../../components/CustomInput';
import Loader from '../../../components/Loader';
import NoInternet from '../../../components/NoInternet';
import PrimaryButton from '../../../components/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { AuthStackParamList } from '../AuthNavigator';
import { useLogin } from '../hooks/useAuth';
import { LoginCredentials } from '../types';

const { width, height } = Dimensions.get('window');
const wp = (p: number) => (width * p) / 100;
const hp = (p: number) => (height * p) / 100;

// ✅ Yup validation - will be created inside component to access translations

const LoginScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const loginMutation = useLogin();
  const setUser = useAuthStore(s => s.setUser);
  const { t } = useTranslation('auth');

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  // ✅ Yup validation schema
  const loginValidationSchema = Yup.object().shape({
    phoneNumber: Yup.string()
      .required(t('login.errors.phoneNumber'))
      .matches(/^\+92[0-9]{10}$/, t('login.errors.phoneNumber')),
    password: Yup.string().required(t('login.errors.password')),
  });

  const handleFocus = (field: string) => setFocusedField(field);
  const handleBlur = (field: string, formikBlur: (f: string) => void) => {
    setFocusedField(null);
    formikBlur(field);
  };

  const handlePhoneNumberChange = (
    text: string,
    setFieldValue: (f: string, v: any) => void,
  ) => {
    if (apiError) setApiError(null);
    const cleaned = text.replace(/[^0-9+]/g, '');
    if (!cleaned.startsWith('+92')) {
      setFieldValue('phoneNumber', '+92');
      return;
    }
    if (cleaned.length <= 13) setFieldValue('phoneNumber', cleaned);
  };

  const handlePasswordChange = (
    text: string,
    handleChange: (value: string) => void,
  ) => {
    if (apiError) setApiError(null);
    handleChange(text);
  };

  const handleLogin = async (
    values: LoginCredentials,
    {
      validateForm,
      setTouched,
      setFieldTouched,
    }: FormikHelpers<LoginCredentials>,
  ) => {
    setApiError(null);
    // Mark both fields as touched to trigger validation display
    setFieldTouched('phoneNumber', true);
    setFieldTouched('password', true);
    setTouched({ phoneNumber: true, password: true });
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) return;

    loginMutation.mutate(
      {
        phone: values.phoneNumber,
        password: values.password,
      },
      {
        onSuccess: user => {
          if (user) {
            setUser(user);
            console.log('✅ Login success:', user);
          }
        },
        onError: (error: any) => {
          console.log('❌ Login failed:', error);
          setApiError(error?.message || 'Login failed');
        },
      },
    );
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
          <View style={styles.mainContainer}>
            <View style={styles.header}>
              {/* <TouchableOpacity onPress={() => setDrawerVisible(true)} activeOpacity={0.7}> */}
              <Text style={styles.title}>{t('login.title')}</Text>
              {/* </TouchableOpacity> */}
              <Text style={styles.subtitle}>
                {t('login.subtitle')}
              </Text>
            </View>
            <Formik<LoginCredentials>
              initialValues={{
                phoneNumber: '+923359857379',
                password: 'Taimoor12@',
              }}
              validationSchema={loginValidationSchema}
              onSubmit={handleLogin}
            >
              {({
                handleChange,
                handleBlur: formikBlur,
                handleSubmit,
                values,
                errors,
                touched,
                setFieldValue,
              }) => (
                <>
                  {/* Phone input */}
                  <CustomInput
                    label={t('login.phoneNumber')}
                    placeholder="3XXXXXXXXX"
                    isPhoneNumber={true}
                    value={values.phoneNumber}
                    onChangeText={text =>
                      handlePhoneNumberChange(text, setFieldValue)
                    }
                    onBlur={() => handleBlur('phoneNumber', formikBlur)}
                    onFocus={() => handleFocus('phoneNumber')}
                    focused={focusedField === 'phoneNumber'}
                    error={
                      (touched.phoneNumber &&
                        (errors.phoneNumber !== undefined ||
                          !values.phoneNumber ||
                          values.phoneNumber === '+92' ||
                          values.phoneNumber.length < 13)) ||
                      apiError
                    }
                    errorMessage={
                      touched.phoneNumber &&
                      (errors.phoneNumber ||
                        !values.phoneNumber ||
                        values.phoneNumber === '+92' ||
                        values.phoneNumber.length < 13)
                        ? t('login.errors.phoneNumber')
                        : undefined
                    }
                    showErrorText={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />

                  {/* Password input */}
                  <CustomInput
                    ref={passwordRef}
                    label={t('login.password')}
                    placeholder="********"
                    isPassword={true}
                    value={values.password}
                    onChangeText={text =>
                      handlePasswordChange(text, handleChange('password'))
                    }
                    onBlur={() => handleBlur('password', formikBlur)}
                    onFocus={() => handleFocus('password')}
                    focused={focusedField === 'password'}
                    error={
                      (touched.password &&
                        (errors.password !== undefined ||
                          !values.password ||
                          values.password.trim() === '')) ||
                      apiError
                    }
                    errorMessage={
                      (touched.password &&
                        (errors.password ||
                          !values.password ||
                          values.password.trim() === '')) ||
                      apiError
                        ? t('login.errors.password')
                        : undefined
                    }
                    returnKeyType="done"
                  />

                  {/* Forgot password */}
                  <TouchableOpacity
                    style={styles.forgotPasswordContainer}
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={styles.forgotPasswordText}>
                      {t('login.forgotPassword')}
                    </Text>
                  </TouchableOpacity>

                  {/* Login button */}
                  <PrimaryButton
                    title={t('login.cta')}
                    onPress={handleSubmit}
                    loading={loginMutation.isPending}
                    buttonStyle={{
                      alignSelf: 'center',
                      width: 161,
                      height: 50,
                    }}
                  />
                  {/* Loading indicator */}
                  {loginMutation.isPending && <Loader />}
                </>
              )}
            </Formik>

            <View style={styles.grayLine} />

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('login.noAccount')} </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterScreen')}
              >
                <Text style={styles.registerLink}>{t('login.register')}</Text>
              </TouchableOpacity>
            </View>
          </View>
      </KeyboardAvoidingView>

      <NoInternet />
    </LinearGradient>
  );
};

// 🔹 Styles
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
  registerLink: {
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

export default LoginScreen;
