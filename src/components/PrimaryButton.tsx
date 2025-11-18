import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  buttonStyle,
  textStyle,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      minHeight: 50,
      width: 161.5,
      borderRadius: 12,
      padding: 5,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };


    const backgroundColor = isPressed && !disabled && !loading ? '#F5F5F5' : '#C539A5';
    const borderWidth = isPressed && !disabled && !loading ? 1 : 0;
    const borderColor = isPressed && !disabled && !loading ? '#FFFFFF' : 'transparent';

    return {
      ...baseStyle,
      backgroundColor: disabled ? '#CCCCCC' : backgroundColor,
      borderWidth: disabled ? 0 : borderWidth,
      borderColor: disabled ? 'transparent' : borderColor,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontFamily: 'Inter',
      fontWeight: '500',
      fontSize: 14,
      lineHeight: 17.41,
      letterSpacing: 0,
      textAlign: 'center',
      textTransform: 'capitalize',
    };

    const color = isPressed && !disabled && !loading ? '#E5E7EB' : '#FFFFFF';

    return {
      ...baseTextStyle,
      color: disabled ? '#999999' : color,
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), buttonStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      <View style={styles.buttonContent}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={isPressed && !disabled && !loading ? '#E5E7EB' : '#FFFFFF'}
            style={styles.loader}
          />
        )}
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 22,
    minWidth: 75,
    padding:5,
    gap: 10,
    paddingHorizontal: 0,
  },
  loader: {
    marginRight: 10,
  },
});

export default PrimaryButton;

