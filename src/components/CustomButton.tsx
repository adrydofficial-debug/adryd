// src/components/CustomButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width} = require('react-native').Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: string[];
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  buttonStyle,
  textStyle,
  gradientColors,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: wp(3),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingVertical: wp(2.5),
        paddingHorizontal: wp(6),
        minHeight: wp(10),
      },
      medium: {
        paddingVertical: wp(3),
        paddingHorizontal: wp(8),
        minHeight: wp(12),
      },
      large: {
        paddingVertical: wp(4),
        paddingHorizontal: wp(10),
        minHeight: wp(14),
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: '#C539A5',
      },
      secondary: {
        backgroundColor: '#6c757d',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#C539A5',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(disabled && {
        backgroundColor: '#ccc',
        borderColor: '#ccc',
      }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeTextStyles: Record<string, TextStyle> = {
      small: {
        fontSize: wp(3.5),
      },
      medium: {
        fontSize: wp(4),
      },
      large: {
        fontSize: wp(4.5),
      },
    };

    const variantTextStyles: Record<string, TextStyle> = {
      primary: {
        color: '#fff',
      },
      secondary: {
        color: '#fff',
      },
      outline: {
        color: '#C539A5',
      },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...(disabled && {
        color: '#999',
      }),
    };
  };

  const renderButton = () => {
    const buttonProps = {
      style: [getButtonStyle(), buttonStyle],
      onPress: disabled || loading ? undefined : onPress,
      disabled: disabled || loading,
      activeOpacity: 0.8,
    };

    if (variant === 'primary' && !disabled && !loading) {
      return (
        <LinearGradient
          colors={gradientColors || ['#C539A5', '#C539A5']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={[getButtonStyle(), buttonStyle]}>
          <TouchableOpacity {...buttonProps} style={undefined}>
            {loading && (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{marginRight: wp(2)}}
              />
            )}
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          </TouchableOpacity>
        </LinearGradient>
      );
    }

    return (
      <TouchableOpacity {...buttonProps}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' ? '#C539A5' : '#fff'}
            style={{marginRight: wp(2)}}
          />
        )}
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return renderButton();
};

export default CustomButton;
