import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomInput from '../../../components/CustomInput';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../AuthNavigator';
import { useResetPassword } from '../hooks/useAuth';
import BackButton from '../../../components/BackButton';
import NoInternet from '../../../components/NoInternet';
import { Images } from '../../../assets/images';
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

type ResetPassProps = NativeStackScreenProps<AuthStackParamList, 'ResetPass'>;

const ResetPass: React.FC<ResetPassProps> = ({ navigation, route }) => {
  const { t } = useTranslation('auth');
  const resetPassword = useResetPassword();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-300));
  const [apiError, setApiError] = useState<string>('');
  const [isEmptyError, setIsEmptyError] = useState(false);
  const [apiErrorBorder, setApiErrorBorder] = useState(false);

  const phoneNumber = route?.params?.phoneNumber;
  const otp = route?.params?.otp;

  const handleFocus = (field: string) => setFocusedField(field);

  const handlePasswordChange = (text: string) => {
    if (isEmptyError) setIsEmptyError(false);
    if (apiErrorBorder) setApiErrorBorder(false);
    if (apiError) setApiError('');
    setPassword(text);
  };

  const handleConfirmPasswordChange = (text: string) => {
    if (isEmptyError) setIsEmptyError(false);
    if (apiErrorBorder) setApiErrorBorder(false);
    if (apiError) setApiError('');
    setConfirmPassword(text);
  };

  const showSuccessPopup = () => {
    setShowSuccessModal(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      hideSuccessPopup();
      navigation.navigate('LoginScreen');
    }, 2500);
  };

  const hideSuccessPopup = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowSuccessModal(false));
  };

  const handleSubmit = () => {
    if (!password.trim() || !confirmPassword.trim()) {
      setIsEmptyError(true);
      return;
    }

    if (password !== confirmPassword) {
      setApiError('Passwords do not match.');
      setApiErrorBorder(true);
      return;
    }

    if (!phoneNumber || !otp) {
      Alert.alert(
        'Error',
        'Missing required information. Please retry the forgot password process.',
      );
      return;
    }

    resetPassword.mutate(
      { phone: phoneNumber, otp, newPassword: password },
      {
        onSuccess: () => {
          showSuccessPopup();
        },
        onError: (err: any) => {
          const message =
            err?.message || 'Failed to reset password. Please try again.';
          setApiError(message);
          setApiErrorBorder(true);
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
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContainer}>
            {/* Back Button */}
           <BackButton/>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{t('reset.title')}</Text>
              <Text style={styles.subtitle}>
                {t('reset.subtitle')}
              </Text>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <CustomInput
                label={t('reset.newPassword')}
                placeholder="Enter new password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={handlePasswordChange}
                onBlur={() => setFocusedField(null)}
                onFocus={() => handleFocus('password')}
                focused={focusedField === 'password'}
                error={isEmptyError || apiErrorBorder}
                showErrorText={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={wp(5)}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <CustomInput
                label={t('reset.confirmPassword')}
                placeholder="Confirm password"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                onBlur={() => setFocusedField(null)}
                onFocus={() => handleFocus('confirmPassword')}
                focused={focusedField === 'confirmPassword'}
                error={isEmptyError || apiErrorBorder}
                showErrorText={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye' : 'eye-off'}
                  size={wp(5)}
                  color="#6a5f5fff"
                />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                resetPassword.isPending && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={resetPassword.isPending}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {resetPassword.isPending && (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    style={styles.loader}
                  />
                )}
                <Text style={styles.buttonText}>
                  {resetPassword.isPending ? t('reset.resetting') : t('reset.cta')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={hideSuccessPopup}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.successContent}>
            <Image
              source={Images.thankTick}
              style={styles.thankTickImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>
       <NoInternet />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(25),
    minHeight: height + hp(10),
  },
  mainContainer: { paddingHorizontal: 30 },
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
  inputContainer: { position: 'relative' },
  eyeIcon: {
    position: 'absolute',
    right: wp(2),
    top: wp(10),
    padding: wp(1),
    zIndex: 1,
  },
  errorText: {
    color: '#E63946',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 13,
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
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankTickImage: {
    width: wp(60),
    height: wp(60),
  },
});

export default ResetPass;
