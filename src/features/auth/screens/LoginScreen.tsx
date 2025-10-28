// src/features/auth/LoginScreen.tsx
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Yup from 'yup';
import CustomInput from '../../../components/CustomInput';
import DrawerComponent from '../../../components/DrawerComponent';
import NoInternet from '../../../components/NoInternet';
import { useAuthStore } from '../../../store/authStore';
import { AuthStackParamList } from '../AuthNavigator';
import { useLogin } from '../hooks/useAuth';
import { LoginCredentials } from '../types';

const { width, height } = Dimensions.get('window');
const wp = (p: number) => (width * p) / 100;
const hp = (p: number) => (height * p) / 100;

// ✅ Yup validation
const loginValidationSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\+92[0-9]{10}$/, 'Enter a valid Pakistani phone number'),
  password: Yup.string().required('Password is required'),
});

const LoginScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const loginMutation = useLogin();
  const setUser = useAuthStore(s => s.setUser);

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

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
    { validateForm, setTouched }: FormikHelpers<LoginCredentials>,
  ) => {
    setApiError(null);
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setDrawerVisible(true)} activeOpacity={0.7}>
                <Text style={styles.title}>Login</Text>
              </TouchableOpacity>
              <Text style={styles.subtitle}>
                Login now and turn your{' '}
                <Text style={styles.highlight}>ideas</Text> into reality.
              </Text>
            </View>

            <Formik<LoginCredentials>
              initialValues={{
                phoneNumber: '+923236102030',
                password: '6AJ$kk3m8',
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
                    label="Phone Number"
                    placeholder="3XXXXXXXXX"
                    keyboardType="phone-pad"
                    value={values.phoneNumber}
                    onChangeText={text =>
                      handlePhoneNumberChange(text, setFieldValue)
                    }
                    onBlur={() => handleBlur('phoneNumber', formikBlur)}
                    onFocus={() => handleFocus('phoneNumber')}
                    focused={focusedField === 'phoneNumber'}
                    error={
                      (touched.phoneNumber && errors.phoneNumber) || apiError
                    }
                    showErrorText={false}
                  />

                  {/* Password input */}
                  <View style={styles.passwordContainer}>
                    <Text style={styles.inputLabel}>Your Password</Text>
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={[
                          styles.passwordInput,
                          (touched.password && errors.password) || apiError
                            ? styles.inputError
                            : undefined,
                          focusedField === 'password'
                            ? styles.passwordInputFocused
                            : undefined,
                        ]}
                        placeholder="********"
                        secureTextEntry={!showPassword}
                        value={values.password}
                        onChangeText={text =>
                          handlePasswordChange(text, handleChange('password'))
                        }
                        onBlur={() => handleBlur('password', formikBlur)}
                        onFocus={() => handleFocus('password')}
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

                  {/* Forgot password */}
                  <TouchableOpacity
                    style={styles.forgotPasswordContainer}
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={styles.forgotPasswordText}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>

                  {/* Login button */}
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      loginMutation.isPending && styles.disabledButton,
                    ]}
                    onPress={() => handleSubmit()}
                    disabled={loginMutation.isPending}
                    activeOpacity={0.8}
                  >
                    <View style={styles.buttonContent}>
                      {loginMutation.isPending && (
                        <ActivityIndicator
                          size="small"
                          color="#fff"
                          style={styles.loader}
                        />
                      )}
                      <Text style={styles.buttonText}>
                        {loginMutation.isPending ? 'Logging in...' : 'Login'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </Formik>

            <View style={styles.grayLine} />

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterScreen')}
              >
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <DrawerComponent visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
      <NoInternet />
    </LinearGradient>
  );
};

// 🔹 Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  mainContainer: { paddingHorizontal: 30 },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(25),
    minHeight: height + hp(10),
  },
  header: { marginTop: hp(15), marginBottom: hp(4) },
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
  highlight: { color: '#C539A5', fontWeight: '900' },
  forgotPasswordContainer: { alignItems: 'flex-end', marginBottom: hp(2) },
  forgotPasswordText: {
    fontSize: wp(3.5),
    color: '#4F4F4F',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  loginButton: {
    marginBottom: hp(3),
    backgroundColor: '#C539A5',
    borderRadius: wp(3),
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(8),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  disabledButton: { backgroundColor: '#ccc', elevation: 0 },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: { marginRight: wp(2) },
  buttonText: { color: '#fff', fontSize: wp(4.5), fontWeight: 'bold' },
  grayLine: { height: 1, backgroundColor: '#e2d1d1', marginVertical: hp(2) },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(2),
    marginBottom: hp(5),
  },
  footerText: { fontSize: wp(3.8), color: '#444' },
  registerLink: {
    fontSize: wp(3.8),
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
