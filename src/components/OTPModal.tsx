import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ---------- Props ----------
interface OTPModalProps {
  visible: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  onResend: () => Promise<void>;
  phoneNumber: string;
}

// ---------- Layout ----------
const { width, height } = Dimensions.get('window');

// ---------- Component ----------
const OTPModal: React.FC<OTPModalProps> = ({
  visible,
  onClose,
  onVerify,
  onResend,
  phoneNumber,
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<TextInput[]>([]);
  const autoVerifyTriggered = useRef(false);

  useEffect(() => {
    if (visible) {
      setOtp(['', '', '', '', '', '']);
      setIsLoading(false);
      setIsResending(false);
      setErrorMessage('');
      setResendCooldown(60); // 60 seconds cooldown
      setFocusedIndex(null);
      autoVerifyTriggered.current = false;
    }
  }, [visible]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0 && visible) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown, visible]);

  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === 6 && !isLoading && !errorMessage && visible && !autoVerifyTriggered.current) {
      autoVerifyTriggered.current = true;
      const timer = setTimeout(() => {
        handleVerify();
      }, 100);
      return () => clearTimeout(timer);
    }
    if (otpString.length < 6) {
      autoVerifyTriggered.current = false;
    }
  }, [otp, isLoading, errorMessage, visible]);

  const handleOtpChange = (value: string, index: number) => {
    if (errorMessage) setErrorMessage('');

    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      autoVerifyTriggered.current = false; 

      const lastFilledIndex = pastedOtp.length - 1;
      if (lastFilledIndex < 5) {
        inputRefs.current[lastFilledIndex + 1]?.focus();
      } else {
        Keyboard.dismiss();
        if (pastedOtp.length === 6) {
          setTimeout(() => {
            if (!autoVerifyTriggered.current && !isLoading) {
              autoVerifyTriggered.current = true;
              handleVerify();
            }
          }, 150);
        }
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join('');

    if (otpToVerify.length !== 6 || otp.some(digit => digit === '')) {
      setErrorMessage('Please fill all fields completely');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await onVerify(otpToVerify);
    } catch (error) {
      console.error('OTP verification error:', error);
      let message = 'Invalid or expired code. Please try again.';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        message = (error as any).message;
      }
      setErrorMessage(message);
      setIsLoading(false);
      autoVerifyTriggered.current = false; 
      
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) {
      return;
    }

    setIsResending(true);
    setErrorMessage('');
    
    try {
      await onResend();
      setResendCooldown(60); // Reset cooldown after successful resend
      setOtp(['', '', '', '', '', '']); // Clear OTP fields
      autoVerifyTriggered.current = false; // Reset auto-verify flag
      // Focus first input after resend
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      let message = 'Failed to resend OTP. Please try again.';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        message = (error as any).message;
      }
      setErrorMessage(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>OTP</Text>
            <Text style={styles.subtitle}>
     Your OTP code is on its way to your WhatsApp, please enter it here.
            </Text>
          </View>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  inputRefs.current[index] = ref as TextInput;
                }}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : styles.otpInputEmpty,
                  errorMessage ? styles.otpInputError : null,
                  !digit && focusedIndex === index && !errorMessage ? styles.otpInputFocused : null,
                ]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                textAlign="center"
                placeholder=""
                placeholderTextColor="transparent"
                selectionColor={Platform.OS === 'ios' ? '#000' : undefined}
                cursorColor={Platform.OS === 'android' ? '#000' : undefined}
              />
            ))}
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Resend OTP Button */}
          <TouchableOpacity
            style={[
              styles.resendButton,
              (resendCooldown > 0 || isResending) && styles.resendButtonDisabled,
            ]}
            onPress={handleResend}
            disabled={resendCooldown > 0 || isResending}
            activeOpacity={0.7}
          >
            <Text style={{fontSize:11,fontWeight:"400"}}>Didn’t get your code?</Text>
            <Text style={styles.resendButtonText}>
            
              {isResending
                ? 'Sending...'
                : resendCooldown > 0
                ? `Resend (${resendCooldown}s)`
                : 'Resend '}
            </Text>
          </TouchableOpacity>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              isLoading && styles.verifyButtonDisabled,
            ]}
            onPress={() => handleVerify()}
            disabled={isLoading || otp.join('').length !== 6}
            activeOpacity={0.8}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </Text>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: width * 0.05,
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.04,
    width: '100%',
    maxWidth: width * 0.9,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: { alignItems: 'center', marginBottom: height * 0.03 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#C12C9F',
    marginBottom: height * 0.01,
  },
  subtitle: {
    fontSize: 13,
    color: '#18181B',
    textAlign: 'center',
    lineHeight: width * 0.04,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.01,
    paddingHorizontal: width * 0.02,
    paddingVertical: width * 0.01,
    marginHorizontal: width * 0.01,
  },
  otpInput: {
    width: width * 0.1,
    height: width * 0.1,
    borderWidth: 1,
    borderRadius: width * 0.02,
    textAlign: 'center',
    fontSize: width * 0.03,
    fontWeight: 'bold',
    marginHorizontal: width * 0.01,
    paddingVertical: 0,
    paddingHorizontal: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
    color: '#000',
  },
  otpInputEmpty: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E5E5E5',
    color: '#000',
  },
  otpInputFilled: {
    backgroundColor: '#F2BCE9',
    borderColor: '#C539A5',
    color: '#000',
    justifyContent:"center",
    alignItems:"center",
  },
  otpInputFocused: {
    borderColor: '#000',
    borderWidth: 1,
  },
  otpInputError: {
    borderColor: '#E63946',
    backgroundColor: 'white',
    borderWidth: 1,
    color: '#000',
  },
  verifyButton: {
    backgroundColor: '#C539A5',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.15,
    borderRadius: width * 0.03,
    alignItems: 'center',
    width: '100%',
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: height * 0.01,
    right: width * 0.03,
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.04,
    // backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: width * 0.06,
    color: '#666',
    fontWeight: '400',
    textAlign: 'center',
    bottom: 2,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: width * 0.035,
    textAlign: 'center',
    marginTop: height * 0.01,
    marginBottom: height * 0.01,
  },
  resendButton: {
    // marginTop: height * 0.02,
    marginBottom: height * 0.02,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection:'row',
    gap:3,
  },
  resendButtonDisabled: {
    // opacity: 0.5,
  },
  resendButtonText: {
    color: '#C539a5',
    fontSize: 12,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
});

export default OTPModal;
