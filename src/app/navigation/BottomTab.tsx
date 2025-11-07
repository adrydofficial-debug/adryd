import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
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
import CompaignStatus from '../../features/advertisments/screens/CompaignStatus';
import FavouritesScreen from '../../features/favourites/screens/FavouritesScreen';
import UpdateProfile from '../../features/profile/screens/UpdateProfile';
const { width, height } = Dimensions.get('window');
type TabName = 'Home' | 'Boards' | 'Add' | 'Chat' | 'Profile';
interface BottomTabProps {
  // Remove activeTab and onTabPress since we'll manage state internally
}
const BottomTab: React.FC<BottomTabProps> = () => {
  const navigation = useNavigation();
  const route = useRoute() as any;
  const [activeTab, setActiveTab] = useState<TabName>('Home');

  React.useEffect(() => {
    const desiredTab = route?.params?.tab as TabName | undefined;
    if (desiredTab) {
      setActiveTab(desiredTab);
    }
  }, [route?.params?.tab]);
  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName as TabName);
    switch (tabName) {
      case 'Home':
        // Home is already the default, no action needed
        break;
      case 'Boards':
        // Just switch to boards tab, don't navigate
        break;
      case 'Add':
        // Navigate to PreviousCompanyScreen
        navigation.navigate('PreviousCompanyScreen' as never);
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
        return <CompaignStatus navigation={navigation} />; // You can create a dedicated BoardsScreen later
      case 'Add':
        return <HomeScreen navigation={navigation} />; // This will navigate to AdvertismentCreateScreen
      case 'Chat':
        return <FavouritesScreen navigation={navigation} />; // Using FavouritesScreen as placeholder
      case 'Profile':
        return <CompaignStatus navigation={navigation} />;
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
        <IconComponent width={24} height={24} />
      </TouchableOpacity>
    );
  };

  const renderCurvedBar = () => {
    const centerX = width / 2;
    // match FAB radius to visual FAB size
  const fabRadius = 35;
  const barHeight = 70;
  // how deep the center dip goes (bigger = deeper)
  const curveDepth = 28;
  // small horizontal padding left/right of the rounded cut
  const sideGap = 20;

    // total half-width of the semicircular cut
    const r = fabRadius + sideGap;
    const leftStart = centerX - r;
    const rightEnd = centerX + r;

    // cubic-bezier constant for approximating a circular arc
    const k = 0.5522847498;
    const cpOffset = k * r;

    const path = `
      M 0 ${barHeight}
      L 0 25
      Q 0 0 25 0
      L ${leftStart} 0
      C ${leftStart + cpOffset} 0 ${centerX - cpOffset} ${curveDepth} ${centerX} ${curveDepth}
      C ${centerX + cpOffset} ${curveDepth} ${rightEnd - cpOffset} 0 ${rightEnd} 0
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
    backgroundColor: '#FAF9F6',
  },
  content: {
    flex: 1,
    paddingBottom: 20, 
  },
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1000,
    // allow FAB to overflow outside the container area so it visually sits above
    overflow: 'visible',
    elevation: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  curvedBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  navigationContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  height: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    // lower elevation so FAB (with higher elevation/zIndex) sits visually above
    elevation: 25,
    zIndex: 0,
    backgroundColor: 'transparent',
  },
  leftTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
    marginBottom: -20,
    zIndex: 0,
  },
  rightTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: -20,
    zIndex: 0,
  },
  centerSpace: {
    width: 90,
    height: 90,
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
    // lift the FAB higher so it visually sits above the other icons
    bottom: 50,
    left: width / 2 - 34,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#C539A5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C539A5',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    // ensure FAB sits on top of navigationContent and curved bar
    elevation: 99999,
    zIndex: 99999,
  },
});

export default BottomTab;
