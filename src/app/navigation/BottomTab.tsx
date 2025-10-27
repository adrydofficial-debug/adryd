import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';

// Import SVG files directly
import HomeIcon from '../../assets/images/pinkHome.svg';
import GrayHomeIcon from '../../assets/images/grayHome.svg';
import GrayActive from '../../assets/images/grayActive.svg';
import PinkGray from '../../assets/images/pinkActive.svg';
import BoardsIcon from '../../assets/images/Companys.svg';
import AddIcon from '../../assets/images/add.svg';
import ChatIcon from '../../assets/images/Chat.svg';
import GrayChatIcon from '../../assets/images/grayNotify.svg';
import PinkMsg from '../../assets/images/PinkMsg.svg';
import GrayMsg from '../../assets/images/GrayMsg.svg';
import ProfileIcon from '../../assets/images/pinkProfile.svg';
import GrayProfileIcon from '../../assets/images/grayProfile.svg';
import HomeScreen from '../../features/boards/screens/HomeScreen';
import CompaignScreen from '../../features/advertisments/screens/CompaignScreen';
import FavouritesScreen from '../../features/favourites/screens/FavouritesScreen';
import UpdateProfile from '../../features/profile/screens/UpdateProfile';

const { width, height } = Dimensions.get('window');

type TabName = 'Home' | 'Boards' | 'Add' | 'Chat' | 'Profile';

interface BottomTabProps {
  // Remove activeTab and onTabPress since we'll manage state internally
}


const BottomTab: React.FC<BottomTabProps> = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabName>('Home');

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName as TabName);
    
    // Only navigate to external screens for specific actions, not for tab switching
    switch (tabName) {
      case 'Home':
        // Home is already the default, no action needed
        break;
      case 'Boards':
        // Just switch to boards tab, don't navigate
        break;
      case 'Add':
        // Navigate to advertisement creation (this should navigate)
        navigation.navigate('CreateCompanyScreen' as never);
        // Reset to Home tab after navigation
        setActiveTab('Home');
        break;
      case 'Chat':
        // Just switch to chat tab, don't navigate
        break;
      case 'Profile':
        // Just switch to profile tab, don't navigate
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
        return <HomeScreen navigation={navigation} />; // You can create a dedicated BoardsScreen later
      case 'Add':
        return <HomeScreen navigation={navigation} />; // This will navigate to AdvertismentCreateScreen
      case 'Chat':
        return <FavouritesScreen navigation={navigation} />; // Using FavouritesScreen as placeholder
      case 'Profile':
        return <CompaignScreen navigation={navigation} />;
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  const tabs = [
    { name: 'Home', icon: GrayHomeIcon, activeIcon: HomeIcon },
    { name: 'Boards', icon: GrayActive, activeIcon: PinkGray },
    { name: 'Add', icon: AddIcon, isFAB: true },
    { name: 'Chat', icon: GrayMsg, activeIcon: PinkMsg },
    { name: 'Profile', icon: GrayProfileIcon, activeIcon: ProfileIcon },
  ];

  const renderTab = (tab: any, index: number) => {
    const isActive = activeTab === tab.name;
    const isFAB = tab.isFAB;
    const IconComponent = isActive ? tab.activeIcon : tab.icon;

    if (isFAB) {
      return (
        <TouchableOpacity
          key={tab.name}
          style={styles.fabButton}
          onPress={() => handleTabPress(tab.name)}
          activeOpacity={0.8}
        >
          <IconComponent width={24} height={24} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={tab.name}
        style={styles.tabButton}
        onPress={() => handleTabPress(tab.name)}
        activeOpacity={0.7}
      >
        <IconComponent width={22} height={22} />
      </TouchableOpacity>
    );
  };

  const renderCurvedBar = () => {
    const centerX = width / 2;
    const fabRadius = 30;
    const barHeight = 60;
    const curveDepth = 15;
    
    const path = `
      M 0 ${barHeight}
      L 0 25
      Q 0 0 25 0
      L ${centerX - fabRadius - 10} 0
      Q ${centerX - fabRadius} 0 ${centerX - fabRadius} 10
      Q ${centerX} ${curveDepth} ${centerX + fabRadius} 10
      Q ${centerX + fabRadius + 10} 0 ${centerX + fabRadius + 10} 0
      L ${width - 25} 0
      Q ${width} 0 ${width} 25
      L ${width} ${barHeight}
      Z
    `;

    return (
      <Svg width={width} height={barHeight} style={styles.curvedBar}>
        <Path d={path} fill="#FFFFFF" />
      </Svg>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {/* Main Content */}
      <View style={styles.content}>
        {renderActiveScreen()}
      </View>
      
      {/* Bottom Tab Navigation */}
      <View style={styles.bottomTabContainer}>
        {/* Curved Navigation Bar Background */}
        {renderCurvedBar()}
        
        {/* Navigation Content */}
        <View style={styles.navigationContent}>
          {/* Left side tabs */}
          <View style={styles.leftTabs}>
            {tabs.slice(0, 2).map((tab, index) => renderTab(tab, index))}
          </View>

          {/* Center FAB space */}
          <View style={styles.centerSpace} />

          {/* Right side tabs */}
          <View style={styles.rightTabs}>
            {tabs.slice(3).map((tab, index) => renderTab(tab, index + 3))}
          </View>
        </View>

        {/* Floating Action Button */}
        {renderTab(tabs[2], 2)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingBottom: 0, // Space for bottom tab
  },
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    zIndex: 1000,
  
  },
  curvedBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    
  },
  navigationContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  leftTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  rightTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  centerSpace: {
    width: 60,
    height: 60,
    // This creates the space for the FAB
  },
  tabButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  fabButton: {
    position: 'absolute',
    bottom: 25,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C539A5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C539A5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default BottomTab;
