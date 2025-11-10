import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Modal,
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
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (visible) {
      setOtp(['', '', '', '', '', '']);
      setIsLoading(false);
      setErrorMessage('');
    }
  }, [visible]);

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

      const lastFilledIndex = pastedOtp.length - 1;
      if (lastFilledIndex < 5) {
        inputRefs.current[lastFilledIndex + 1]?.focus();
      } else {
        Keyboard.dismiss();
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
    }
  };

  //   const handleResend = async () => {
  //     try {
  //       await onResend();
  //       Alert.alert('Success', 'New OTP sent successfully');
  //     } catch (error) {
  //       Alert.alert('Error', 'Failed to resend OTP. Please try again.');
  //     }
  //   };

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
              We have sent an OTP code to your WhatsApp for verification.
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
                ]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                textAlign="center"
                placeholder="-"
                placeholderTextColor="#999"
              />
            ))}
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

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
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#C539A5',
    marginBottom: height * 0.01,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: '#333',
    textAlign: 'center',
    lineHeight: width * 0.05,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.03,
    paddingHorizontal: width * 0.02,
  },
  otpInput: {
    width: width * 0.1,
    height: width * 0.1,
    borderWidth: 1,
    borderRadius: width * 0.02,
    textAlign: 'center',
    fontSize: width * 0.04,
    fontWeight: 'bold',
    marginHorizontal: width * 0.01,
  },
  otpInputEmpty: {
    backgroundColor: 'white',
    borderColor: '#ddd',
    color: '#999',
  },
  otpInputFilled: {
    backgroundColor: '#FFE4F1',
    borderColor: '#FF69B4',
    color: '#FF69B4',
  },
  verifyButton: {
    backgroundColor: '#C12C9F',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.15,
    borderRadius: width * 0.03,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: height * 0.01,
    right: width * 0.03,
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.04,
    backgroundColor: '#ddd',
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
});

export default OTPModal;
