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

  return (
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.goBack()}
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
    marginTop: height * 0.05, // 5% of screen height
  },
});

export default BackButton;
