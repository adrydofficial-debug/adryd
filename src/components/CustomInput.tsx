// src/components/CustomInput.tsx
import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

interface CustomInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: TextInputProps['onBlur'];
  onFocus?: TextInputProps['onFocus'];
  secureTextEntry?: boolean;
  keyboardType?:
    | 'default'
    | 'numeric'
    | 'email-address'
    | 'phone-pad'
    | 'ascii-capable'
    | 'numbers-and-punctuation'
    | 'url'
    | 'number-pad'
    | 'name-phone-pad'
    | 'decimal-pad'
    | 'twitter'
    | 'web-search'
    | 'visible-password';
  placeholderTextColor?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;

  /** ✅ allow null safely */
  error?: string | boolean | null;

  focused?: boolean;
  showErrorText?: boolean;
  errorMessage?: string;
  // 🔹 Forward Enter-related props
  returnKeyType?: TextInputProps['returnKeyType'];
  blurOnSubmit?: boolean;
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  // Phone number props
  isPhoneNumber?: boolean;
  phonePrefix?: string;
  // Password props
  isPassword?: boolean;
  showPasswordToggle?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  // Disabled prop
  disabled?: boolean;
  editable?: boolean;
}

const CustomInput = React.forwardRef<TextInput, CustomInputProps>(({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  onFocus,
  secureTextEntry = false,
  keyboardType = 'default',
  placeholderTextColor = '#70737D',
  containerStyle,
  inputStyle,
  labelStyle,
  error,
  focused = false,
  showErrorText = false,
  errorMessage,
  returnKeyType,
  blurOnSubmit,
  onSubmitEditing,
  isPhoneNumber = false,
  phonePrefix = '+92',
  isPassword = false,
  showPasswordToggle = true,
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  editable = true,
}, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine if this is a phone input
  const isPhoneInput = isPhoneNumber || (keyboardType === 'phone-pad' && (value?.startsWith('+92') || value?.startsWith('+')));

  // Determine if this is a password input
  const shouldShowPasswordToggle = isPassword && showPasswordToggle;
  const actualSecureTextEntry = isPassword ? !isPasswordVisible : secureTextEntry;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Format phone number
  const formatPhoneNumber = (text: string) => {
    if (!isPhoneInput) return text;
    
    // Remove all non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    
    // If it starts with country code, extract it
    if (cleaned.startsWith(phonePrefix.replace('+', ''))) {
      const number = cleaned.substring(phonePrefix.replace('+', '').length);
      if (number.length <= 10) {
        return `${phonePrefix}${number}`;
      }
      return value; // Don't update if exceeds limit
    }
    
    // If it doesn't start with country code, add it
    if (cleaned.length <= 10) {
      return `${phonePrefix}${cleaned}`;
    }
    
    return value; // Don't update if exceeds limit
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    onChangeText(formatted);
  };

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      {isPhoneInput ? (
        <View
          style={[
            styles.phoneInputWrapper,
            error ? styles.phoneInputWrapperError : undefined,
            error ? styles.phoneInputWrapperWithError : undefined,
            (isFocused || focused) && !error && !disabled ? styles.phoneInputWrapperFocused : undefined,
            disabled && styles.phoneInputWrapperDisabled,
          ]}
        >
          <Text
            style={[
              styles.phonePrefix,
              (isFocused || focused) && !disabled && styles.phonePrefixFocused,
              disabled && styles.phonePrefixDisabled,
            ]}
          >
            {phonePrefix}
          </Text>
          <TextInput
            ref={ref}
            placeholder={placeholder}
            value={value?.replace(phonePrefix, '') || ''}
            onChangeText={handlePhoneChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            style={[
              styles.phoneInput,
              (isFocused || focused) && !disabled ? styles.phoneInputFocused : styles.phoneInputUnfocused,
              disabled && styles.phoneInputDisabled,
              inputStyle
            ]}
            keyboardType="phone-pad"
            placeholderTextColor={placeholderTextColor}
            returnKeyType={returnKeyType}
            blurOnSubmit={blurOnSubmit}
            onSubmitEditing={onSubmitEditing}
            editable={!disabled && editable}
          />
        </View>
      ) : (
        <View style={styles.inputWrapper}>
          <TextInput
            ref={ref}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            onBlur={handleBlur}
            onFocus={handleFocus}
            style={[
              styles.input,
              shouldShowPasswordToggle && styles.inputWithToggle,
              inputStyle,
              error ? styles.inputError : undefined,
              error ? styles.inputWithError : undefined,
              (isFocused || focused) && !disabled ? styles.inputFocused : styles.inputUnfocused,
              disabled && styles.inputDisabled,
              multiline && styles.inputMultiline,
            ]}
            secureTextEntry={actualSecureTextEntry}
            keyboardType={keyboardType}
            placeholderTextColor={placeholderTextColor}
            returnKeyType={returnKeyType}
            blurOnSubmit={blurOnSubmit}
            onSubmitEditing={onSubmitEditing}
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlignVertical={multiline ? 'top' : 'center'}
            editable={!disabled && editable}
          />
          {shouldShowPasswordToggle && (
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={togglePasswordVisibility}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {error && (
        <>
          {showErrorText && typeof error === 'string' && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: '#18181B',
    marginBottom: 5,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: "100%",
    height: hp(7),
    backgroundColor: '#fff',
    borderRadius: wp(4),
    paddingHorizontal: wp(4),
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: hp(1),
  },
  inputWithError: {
    marginBottom: 0,
  },
  inputWithToggle: {
    paddingRight: wp(12), // Make room for password toggle icon
  },
  inputMultiline: {
    height: 'auto',
    minHeight: hp(6),
    paddingTop: hp(1.5),
    paddingBottom: hp(1.5),
  },
  passwordToggle: {
    position: 'absolute',
    right: wp(4),
    top: hp(1.5),
    padding: wp(1),
    zIndex: 1,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: wp(4),
    backgroundColor: '#fff',
    height: hp(7),
    marginBottom: hp(1),
  },
  phoneInputWrapperWithError: {
    marginBottom: 0,
  },
  phonePrefix: {
    fontSize: 12,
    color: '#70737D',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  
  },
  phonePrefixFocused: {
    color: '#70737D',
  
  },
  phoneInput: {
    flex: 1,
    fontSize: 12,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  phoneInputFocused: {
    color: '#18181B',
  },
  phoneInputUnfocused: {
    color: '#70737D',
  },
  inputError: {
    borderColor: '#E61215',
    borderWidth: 0.5,
  },
  inputFocused: {
    borderColor: '#18181B',
    borderWidth: 0.5,
    color: '#18181B',
  },
  inputUnfocused: {
    color: '#70737D',
  },
  phoneInputWrapperError: {
    borderColor: '#E61215',
    borderWidth: 0.5,
  },
  phoneInputWrapperFocused: {
    borderColor: '#18181B',
    borderWidth: 0.5,
  },
  phoneInputWrapperDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E5E7EB',
  },
  phonePrefixDisabled: {
    color: '#999',
  },
  phoneInputDisabled: {
    color: '#999',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#999',
    borderColor: '#E5E7EB',
  },
  errorText: {
    color: '#E61215',
    fontSize: 10,
    marginTop: 5,
    marginLeft: wp(1),
  },
});

export default CustomInput;
