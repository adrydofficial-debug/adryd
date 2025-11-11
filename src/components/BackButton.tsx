import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Screen width & height
const { width, height } = Dimensions.get('window');

// You can type your navigation stack here if you want strong typing
type RootStackParamList = {
  [key: string]: any;
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface BackButtonProps {
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ style, iconColor = '#000' }) => {
  const navigation = useNavigation<NavigationProp>();

  const handleBackPress = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }
      const parentNav: any = (navigation as any).getParent?.();
      if (parentNav && parentNav.canGoBack?.()) {
        parentNav.goBack();
        return;
      }
      navigation.navigate('BottomTab' as never, { tab: 'Home' } as never);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: Try to navigate to the main screen
      try {
        navigation.navigate('BottomTab' as never, { tab: 'Home' } as never);
      } catch (fallbackError) {
        console.error('Fallback navigation error:', fallbackError);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.backButton, style]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      onPress={handleBackPress}
    >
      <Ionicons name="arrow-back" size={width * 0.06} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: '#fff',
    width: width * 0.10,     // 10% of screen width
    height: width * 0.10,    // keep square shape
    borderRadius: width * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.04, // 5% of screen height
  },
});

export default BackButton;
