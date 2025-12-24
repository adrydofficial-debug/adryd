// src/features/payment/screens/OTPScreen.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';
import Header from '../../../components/Header';
import PrimaryButton from '../../../components/PrimaryButton';
import { verifyOTP } from '../services/paymentService';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type OTPScreenRouteProp = RouteProp<AppStackParamList, 'OTPScreen'>;

const OTP_LENGTH = 6;

const OTPScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OTPScreenRouteProp>();
  const { transactionId, phoneNumber, walletType, amount } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleBackPress = () => {
    Alert.alert(
      'Cancel Verification',
      'Are you sure you want to cancel? Your payment will not be completed.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length > 1) {
      // Handle paste
      const pastedOtp = numericValue.slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      // Focus last filled input or last input
      const lastIndex = Math.min(index + pastedOtp.length - 1, OTP_LENGTH - 1);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    // Auto focus next input
    if (numericValue && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP through our backend API
  const handleVerifyOTP = useCallback(async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== OTP_LENGTH) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // Call our backend API - NOT PayFast directly
      const response = await verifyOTP({
        transactionId,
        otp: otpString,
      });

      if (response.success) {
        navigation.replace('PaymentResultScreen', {
          status: 'success',
          transactionId,
          amount,
          orderId: response.orderId,
        });
      } else {
        Alert.alert('Verification Failed', response.message || 'Invalid OTP. Please try again.');
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Verification failed. Please try again.';
      Alert.alert('Error', errorMessage);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [otp, transactionId, amount, navigation]);

  const handleResendOTP = useCallback(async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(60);
    setOtp(Array(OTP_LENGTH).fill(''));

    // TODO: Call resend OTP API when backend supports it
    Alert.alert('OTP Sent', 'A new OTP has been sent to your phone number');
    inputRefs.current[0]?.focus();
  }, [canResend]);

  const maskedPhone = phoneNumber.replace(/(\+92)(\d{3})(\d+)(\d{2})/, '$1$2****$4');
  const otpComplete = otp.every((digit) => digit !== '');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="Verify OTP"
        onBackPress={handleBackPress}
        showRightIcon={false}
      />

      <View style={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We have sent a 6-digit OTP to{'\n'}
            <Text style={styles.phoneText}>{maskedPhone}</Text>
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={index === 0 ? OTP_LENGTH : 1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Resend Timer */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend OTP in <Text style={styles.timerValue}>{resendTimer}s</Text>
            </Text>
          )}
        </View>

        {/* Verify Button */}
        <PrimaryButton
          title={loading ? 'Verifying...' : 'Verify & Pay'}
          onPress={handleVerifyOTP}
          loading={loading}
          disabled={loading || !otpComplete}
          buttonStyle={styles.verifyButton}
          textStyle={styles.verifyButtonText}
        />

        {/* Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Payment Amount</Text>
          <Text style={styles.amountValue}>Rs. {amount.toLocaleString()}</Text>
        </View>

        {/* Test Mode Hint */}
        <View style={styles.testHint}>
          <Text style={styles.testHintText}>
            Test Mode: Use OTP "123456"
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: wp(5),
    marginBottom: hp(4),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: 14,
    color: '#70737D',
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneText: {
    fontWeight: '600',
    color: '#18181B',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(3),
    paddingHorizontal: wp(2),
  },
  otpInput: {
    width: wp(12),
    height: wp(14),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#18181B',
  },
  otpInputFilled: {
    borderColor: '#C539A5',
    backgroundColor: '#FDF4FB',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: hp(4),
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C539A5',
  },
  timerText: {
    fontSize: 14,
    color: '#70737D',
  },
  timerValue: {
    fontWeight: '600',
    color: '#18181B',
  },
  verifyButton: {
    width: '100%',
    height: hp(6.5),
    borderRadius: 12,
    alignSelf: 'center',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountContainer: {
    marginTop: hp(4),
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#70737D',
    marginBottom: hp(0.5),
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C539A5',
  },
  testHint: {
    marginTop: hp(3),
    alignItems: 'center',
    padding: wp(3),
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
  },
  testHintText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
});
