// src/app/navigation/MainScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomTab from './BottomTab';
import HomeScreen from '../../features/boards/screens/HomeScreen';
import FavouritesScreen from '../../features/favourites/screens/FavouritesScreen';
import UpdateProfile from '../../features/profile/screens/UpdateProfile';
const { width, height } = Dimensions.get('window');
type TabName = 'Home' | 'Boards' | 'Add' | 'Chat' | 'Profile';

const MainScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabName>('Home');

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName as TabName);
    
    switch (tabName) {
      case 'Home':
        // Home is already the default, no action needed
        break;
      case 'Boards':
        // Navigate to boards/filter screen
        navigation.navigate('FilterCategoryList' as never);
        break;
      case 'Add':
        // Navigate to advertisement creation
        navigation.navigate('AdvertismentCreateScreen' as never);
        break;
      case 'Chat':
        // Navigate to chat screen (if exists)
        // navigation.navigate('ChatScreen' as never);
        break;
      case 'Profile':
        // Navigate to profile screen
        navigation.navigate('UpdateProfile' as never);
        break;
      default:
        break;
    }
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen navigation={navigation} />;
      case 'Boards':
        return <HomeScreen navigation={navigation} />; // Fallback to HomeScreen
      case 'Add':
        return <HomeScreen navigation={navigation} />; // Fallback to HomeScreen
      case 'Chat':
        return <HomeScreen navigation={navigation} />; // Fallback to HomeScreen
      case 'Profile':
        return <UpdateProfile navigation={navigation} />;
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        {renderActiveScreen()}
      </View>
      
      {/* Bottom Tab Navigation */}
      <BottomTab activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingBottom: 90, // Space for bottom tab
  },
});

export default MainScreen;
