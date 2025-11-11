// src/components/CustomInput.tsx
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

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
  // 🔹 Forward Enter-related props
  returnKeyType?: TextInputProps['returnKeyType'];
  blurOnSubmit?: boolean;
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
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
  placeholderTextColor = '#aaa',
  containerStyle,
  inputStyle,
  labelStyle,
  error,
  focused = false,
  showErrorText = true,
  returnKeyType,
  blurOnSubmit,
  onSubmitEditing,
}, ref) => {
  const isPhoneInput =
    keyboardType === 'phone-pad' && value && value.startsWith('+92');

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      {isPhoneInput ? (
        <View
          style={[
            styles.phoneInputWrapper,
            error ? styles.phoneInputWrapperError : undefined,
            focused && !error ? styles.phoneInputWrapperFocused : undefined,
          ]}
        >
          <Text
            style={[styles.phonePrefix, focused && styles.phonePrefixFocused]}
          >
            +92
          </Text>
          <TextInput
            ref={ref}
            placeholder={placeholder}
            value={value.replace('+92', '')}
            onChangeText={text => {
              const cleaned = text.replace(/[^0-9]/g, '');
              if (cleaned.length <= 10) {
                onChangeText(`+92${cleaned}`);
              }
            }}
            onBlur={onBlur}
            onFocus={onFocus}
            style={[styles.phoneInput, inputStyle]}
            keyboardType={keyboardType}
            placeholderTextColor={placeholderTextColor}
            returnKeyType={returnKeyType}
            blurOnSubmit={blurOnSubmit}
            onSubmitEditing={onSubmitEditing}
          />
        </View>
      ) : (
        <TextInput
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          onFocus={onFocus}
          style={[
            styles.input,
            inputStyle,
            error ? styles.inputError : undefined,
            focused ? styles.inputFocused : undefined,
          ]}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          placeholderTextColor={placeholderTextColor}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          onSubmitEditing={onSubmitEditing}
        />
      )}

      {error && showErrorText && typeof error === 'string' && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: hp(0.1),
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: '#595959',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: hp(6),
    backgroundColor: '#fff',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#e2d1d1',
    color: '#000',
    marginBottom: hp(1),
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2d1d1',
    borderRadius: wp(3),
    backgroundColor: '#fff',
    height: hp(6),
    marginBottom: hp(1),
  },
  phonePrefix: {
    fontSize: 12,
    color: '#999',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRightWidth: 1,
    borderRightColor: '#e2d1d1',
  },
  phonePrefixFocused: {
    color: '#000',
  },
  phoneInput: {
    flex: 1,
    fontSize: 12,
    color: '#000',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 1.5,
  },
  inputFocused: {
    borderColor: '#c539a5ff',
    borderWidth: 0.5,
  },
  phoneInputWrapperError: {
    borderColor: '#ff4444',
    borderWidth: 1.5,
  },
  phoneInputWrapperFocused: {
    borderColor: '#C539A5',
    borderWidth: 0.7,
  },
  errorText: {
    color: '#ff4444',
    fontSize: wp(3.2),
    marginTop: hp(0.12),
    marginBottom: hp(0.2),
  },
});

export default CustomInput;
