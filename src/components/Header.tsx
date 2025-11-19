import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type HeaderProps = {
  title: string;
  onBackPress?: () => void;
  onRightPress?: () => void;
  rightIcon?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  showBackButton?: boolean;
  showRightIcon?: boolean;
};

const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  onRightPress,
  rightIcon = 'help-circle-outline',
  containerStyle,
  titleStyle,
  showBackButton = true,
  showRightIcon = true,
}) => {
  const shouldShowBack = showBackButton && !!onBackPress;
  const shouldShowRight = showRightIcon && !!onRightPress;
  return (
    <View style={[styles.container, containerStyle]}>
      {shouldShowBack ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBackPress}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#111" />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
      <Text style={[styles.title, titleStyle]} numberOfLines={1}>
        {title}
      </Text>
      {shouldShowRight ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onRightPress}
          activeOpacity={0.8}
        >
          <Ionicons name={rightIcon} size={20} color="#5F5F5F" />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
    marginRight: 15,
  },
  iconPlaceholder: {
    width: 36,
    height: 36,
    marginRight: 15,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 12,
  },
});

export default Header;

