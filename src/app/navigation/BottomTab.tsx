import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import {
  PinkHomeIcon,
  GrayHomeIcon,
  GrayActiveIcon,
  PinkActiveIcon,
  AddIcon,
  PinkMsgIcon,
  GrayMsgIcon,
  PinkProfileIcon,
  GrayProfileIcon,
  HeartIcon,
  FavoriteIcon,
  Images,
} from '../../assets/images';
import HomeScreen from '../../features/boards/screens/HomeScreen';
import CompaignStatus from '../../features/advertisments/screens/CompaignStatus';
import FavouritesScreen from '../../features/favourites/screens/FavouritesScreen';
import UpdateProfile from '../../features/profile/screens/UpdateProfile';
import { useDrawerStore } from '../../store/drawerStore';
const { width, height } = Dimensions.get('window');
type TabName = 'Home' | 'Boards' | 'Add' | 'Chat' | 'Profile';
interface BottomTabProps {
}
const BottomTab: React.FC<BottomTabProps> = () => {
  const navigation = useNavigation();
  const route = useRoute() as any;
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const isDrawerVisible = useDrawerStore(s => s.isVisible);

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
        break;
      case 'Boards':
        break;
      case 'Add':
        navigation.navigate('SearchLocation' as never, { autoSelectSeeAll: true } as never);
        setActiveTab('Home');
        break;
      case 'Chat':
        break;
      case 'Profile':
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
        return <CompaignStatus navigation={navigation} />; 
      case 'Add':
        return <HomeScreen navigation={navigation} />; 
      case 'Chat':
        return <FavouritesScreen navigation={navigation} />; 
      case 'Profile':
        return <CompaignStatus navigation={navigation} />;
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  const tabs = [
    { name: 'Home', icon: GrayHomeIcon, activeIcon: PinkHomeIcon },
    { name: 'Boards', icon: GrayActiveIcon, activeIcon: PinkActiveIcon },
    { name: 'Add', icon: AddIcon, isFAB: true },
    { name: 'Chat', icon: HeartIcon, activeIcon: FavoriteIcon },
    { name: 'Profile', icon: GrayProfileIcon, activeIcon: PinkProfileIcon },
  ];

  const renderTab = (tab: any, index: number) => {
    const isActive = activeTab === tab.name;
    const isFAB = tab.isFAB;
    const IconComponent = isActive ? tab.activeIcon : tab.icon;
    // Check if it's an image source (number) or SVG component (function)
    const isImageSource = typeof IconComponent === 'number' || (typeof IconComponent !== 'function' && IconComponent !== null && IconComponent !== undefined);

    if (isFAB) {
      return (
        <TouchableOpacity
          key={tab.name}
          style={styles.fabButton}
          onPress={() => handleTabPress(tab.name)}
          activeOpacity={0.8}
        >
          <Image 
            source={Images.addPlaceholder} 
            style={styles.addIconImage}
            resizeMode="contain"
          />
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
        {isImageSource ? (
          <Image 
            source={IconComponent} 
            style={styles.tabIconImage}
            resizeMode="contain"
          />
        ) : (
          <IconComponent width={20} height={20} />
        )}
      </TouchableOpacity>
    );
  };

  const renderCurvedBar = () => {
    const centerX = width / 2;
  const fabRadius = 35;
  const barHeight = 88;
  const curveDepth = 28;
  const sideGap = 20;
    const r = fabRadius + sideGap;
    const leftStart = centerX - r;
    const rightEnd = centerX + r;
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
      {!isDrawerVisible && (
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
        {renderTab(tabs[2], 2)}
        </View>
      )}
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
    height: 88,
    zIndex: 1000,
    overflow: 'visible',
    elevation: 40,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 35,
  },
  curvedBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 35,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 35,
    borderColor: '#E5E7EB',
    borderWidth: 1,
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
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 35,
    elevation: 35,
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
    gap: 40,
  },
  rightTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: -20,
    zIndex: 0,
    gap: 40,
  },
  centerSpace: {
    width: 70,
    height: 90,
  },
  tabButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabButton: {
    position: 'absolute',
    bottom: 67,
    left: width / 2 - 35,
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
    elevation: 99999,
    zIndex: 99999,
  },
  addIconImage: {
    width: 20,
    height: 20,
  },
  tabIconImage: {
    width: 20,
    height: 20,
  },
});

export default BottomTab;
