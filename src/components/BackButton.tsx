import React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
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

const BackButton: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleBackPress = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // If we can't go back, navigate to the main BottomTab screen
        navigation.navigate('BottomTab' as never);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: Try to navigate to the main screen
      try {
        navigation.navigate('BottomTab' as never);
      } catch (fallbackError) {
        console.error('Fallback navigation error:', fallbackError);
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.backButton}
      onPress={handleBackPress}
    >
      <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
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
