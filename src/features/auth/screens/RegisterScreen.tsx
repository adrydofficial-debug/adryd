import {Formik} from 'formik';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
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
import {useRegister} from '../hooks/useAuth';
import {RegisterRequest} from '../types';

// ----------------------
// Helpers
// ----------------------
const {width, height} = Dimensions.get('window');
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
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain one uppercase, one lowercase, one number, and one special character',
    )
    .required('Password is required'),
});

// ----------------------
// Component
// ----------------------
const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  const registerMutation = useRegister();
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [userDataForVerify, setUserDataForVerify] =
    useState<RegisterFormValues | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidation>({
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
    return validation;
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
    if (apiError) setApiError(false);
  };

  const handlePhoneNumberChange = (
    text: string,
    setFieldValue: (field: string, value: string) => void,
  ) => {
    if (apiError) setApiError(false);
    const cleaned = text.replace(/[^0-9+]/g, '');
    if (!cleaned.startsWith('+92')) {
      setFieldValue('phoneNumber', '+92');
      return;
    }
    if (cleaned.length <= 13) {
      setFieldValue('phoneNumber', cleaned);
    }
  };

  const handlePasswordChange = (
    text: string,
    handleChange: (value: string) => void,
  ) => {
    if (apiError) setApiError(false);
    handleChange(text);
  };

  const handleRegister = (values: RegisterFormValues) => {
    setApiError(false);
    setFocusedField(null);

    const isUsernameEmpty = !values.username?.trim();
    const isCompanyNameEmpty = !values.companyName?.trim();
    const isPhoneNumberEmpty = values.phoneNumber === '+92';
    const isPasswordEmpty = !values.password?.trim();

    if (
      isUsernameEmpty ||
      isCompanyNameEmpty ||
      isPhoneNumberEmpty ||
      isPasswordEmpty
    ) {
      setApiError(true);
      return;
    }

    setIsLoading(true);

    // Preserve full payload like JS version
    const payload: RegisterRequest = {
      name: values.username,
      phoneNumber: values.phoneNumber,
      password: values.password,
    };

    registerMutation.mutate(payload, {
      onSuccess: () => {
        setIsLoading(false);
        setUserDataForVerify(values);
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          navigation.navigate('VerificationCode', values);
        }, 1800);
      },
      onError: err => {
        console.warn('Registration error:', err);
        setIsLoading(false);
        setApiError(true);
      },
    });
  };

  // ----------------------
  // JSX
  // ----------------------
  return (
    <LinearGradient
      colors={['#FFF4FD', '#fef3f9']}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(6)} color="#000" />
          </TouchableOpacity>

          <View style={styles.mainContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Register</Text>
              <Text style={styles.subtitle}>
                Create an <Text style={styles.highlight}>Account</Text> to
                access all the features of{' '}
                <Text style={styles.highlight}>Adryd.</Text>
              </Text>
            </View>

            <Formik
              initialValues={{
                username: '',
                password: '',
                companyName: '',
                phoneNumber: '+92',
              }}
              validationSchema={validationSchema}
              onSubmit={handleRegister}>
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
                    onBlur={() => {
                      setFocusedField(null);
                      handleBlur('username');
                    }}
                    onFocus={() => handleFocus('username')}
                    focused={focusedField === 'username'}
                    error={apiError}
                    showErrorText={false}
                  />

                  <CustomInput
                    label="Company Name"
                    placeholder="Enter Company Name"
                    value={values.companyName}
                    onChangeText={handleChange('companyName')}
                    onBlur={() => {
                      setFocusedField(null);
                      handleBlur('companyName');
                    }}
                    onFocus={() => handleFocus('companyName')}
                    focused={focusedField === 'companyName'}
                    error={apiError}
                    showErrorText={false}
                  />

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
                    error={apiError}
                    showErrorText={false}
                  />

                  {/* Password Input */}
                  <View style={styles.passwordContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
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
                        placeholder="Enter Password"
                        secureTextEntry={!showPassword}
                        value={values.password}
                        onChangeText={text => {
                          handlePasswordChange(text, handleChange('password'));
                          validatePassword(text);
                        }}
                        onBlur={() => {
                          setFocusedField(null);
                          handleBlur('password');
                        }}
                        onFocus={() => handleFocus('password')}
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity
                        style={styles.eyeIconContainer}
                        onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                          name={showPassword ? 'eye' : 'eye-off'}
                          size={wp(5)}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Password Rules */}
                    {values.password.length > 0 && (
                      <View style={styles.passwordValidationContainer}>
                        {[
                          {
                            key: 'hasUppercase',
                            label: 'One uppercase letter (A-Z)',
                          },
                          {
                            key: 'hasLowercase',
                            label: 'One lowercase letter (a-z)',
                          },
                          {key: 'hasNumber', label: 'One number (0-9)'},
                          {
                            key: 'hasSpecial',
                            label: 'One special character (@$!%*?&)',
                          },
                        ].map(({key, label}) => {
                          const valid =
                            passwordValidation[key as keyof PasswordValidation];
                          return (
                            <View style={styles.validationItem} key={key}>
                              <Ionicons
                                name={
                                  valid ? 'checkmark-circle' : 'close-circle'
                                }
                                size={wp(4)}
                                color={valid ? '#4CAF50' : '#ff4444'}
                              />
                              <Text
                                style={[
                                  styles.validationText,
                                  {
                                    color: valid ? '#4CAF50' : '#ff4444',
                                  },
                                ]}>
                                {label}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    )}

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
                    activeOpacity={0.8}>
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
                onPress={() => navigation.navigate('LoginScreen')}>
                <Text style={styles.loginLink}> Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIcon}>
              <Ionicons name="checkmark-circle" size={wp(15)} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>OTP Sent</Text>
            <Text style={styles.modalMessage}>
              We sent an OTP to {userDataForVerify?.phoneNumber}. Enter it on
              the next screen to finish registration.
            </Text>
            <View style={styles.modalCountdown}>
              <Text style={styles.modalCountdownText}>Redirecting…</Text>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  keyboardAvoidingView: {flex: 1},
  scrollView: {flex: 1},
  mainContainer: {paddingHorizontal: 30},
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(35),
    minHeight: height + hp(20),
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
  header: {marginTop: hp(2), marginBottom: hp(3)},
  title: {
    fontSize: 26,
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
  highlight: {color: '#C539A5', fontWeight: 'bold'},
  registerButton: {
    marginTop: hp(2),
    backgroundColor: '#C539A5',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: wp(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  loader: {
    marginRight: wp(2),
  },
  grayLine: {
    height: 1,
    backgroundColor: '#e2d1d1',
    marginTop: hp(3),
    marginBottom: hp(0),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(3),
    marginBottom: hp(5),
  },
  footerText: {fontSize: wp(3.8), color: '#444'},
  loginLink: {
    fontSize: wp(3.8),
    color: '#C539A5',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    backgroundColor: '#fff5f5',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  errorIcon: {alignItems: 'center', marginBottom: hp(1)},
  errorTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: hp(1),
  },
  errorMessage: {
    fontSize: wp(3.8),
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: hp(2),
  },
  retryButton: {
    backgroundColor: '#ff4444',
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(6),
    borderRadius: wp(2),
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: wp(3.8),
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: wp(4),
    padding: wp(6),
    marginHorizontal: wp(8),
    alignItems: 'center',
    elevation: 5,
  },
  modalIcon: {marginBottom: hp(2)},
  modalTitle: {
    fontSize: wp(5.5),
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: hp(1.5),
  },
  modalMessage: {
    fontSize: wp(4),
    color: '#666',
    textAlign: 'center',
    lineHeight: wp(5.5),
    marginBottom: hp(2),
  },
  modalCountdown: {
    backgroundColor: '#4CAF50',
    borderRadius: wp(2),
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
  },
  modalCountdownText: {
    color: '#fff',
    fontSize: wp(3.8),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  passwordContainer: {marginBottom: hp(2)},
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
  inputError: {borderColor: '#ff4444'},
  passwordInputFocused: {
    borderColor: '#C539A5',
    borderWidth: 2,
  },
  passwordValidationContainer: {
    marginTop: hp(1),
    padding: wp(3),
    backgroundColor: '#f8f9fa',
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  validationText: {
    fontSize: wp(3.5),
    marginLeft: wp(2),
    fontWeight: '500',
  },
  errorText: {
    color: '#ff4444',
    fontSize: wp(3.5),
    marginTop: hp(0.5),
    marginLeft: wp(1),
  },
});

export default RegisterScreen;
