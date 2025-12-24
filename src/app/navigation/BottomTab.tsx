import React, { useState, useMemo } from 'react';
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
  Images,
} from '../../assets/images';
import HomeScreen from '../../features/boards/screens/HomeScreen';
import CompaignStatus from '../../features/advertisments/screens/CompaignStatus';
import InboxScreen from '../../features/chat/screens/InboxScreen';
import UpdateProfile from '../../features/profile/screens/UpdateProfile';
import { useDrawerStore } from '../../store/drawerStore';
import { useNotificationsStore } from '../../features/notifications/store/notifications';
const { width, height } = Dimensions.get('window');
type TabName = 'Home' | 'Boards' | 'Add' | 'Chat' | 'Profile';
interface BottomTabProps {
}
const BottomTab: React.FC<BottomTabProps> = () => {
  const navigation = useNavigation<any>();
  const route = useRoute() as any;
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [isHomeLoading, setIsHomeLoading] = useState(false);
  const isDrawerVisible = useDrawerStore(s => s.isVisible);
  const setNavigatedFromDrawer = useDrawerStore(s => s.setNavigatedFromDrawer);
  const reopenDrawerCallback = useDrawerStore(s => s.reopenDrawerCallback);
  const { notifications } = useNotificationsStore();

  // Calculate unread campaign notifications count
  const unreadCampaignNotificationsCount = useMemo(() => {
    return notifications.filter(n => {
      // Check if notification is unread and related to a campaign
      if (n.read) return false;
      // Check if notification has advertisement_id in data
      const hasAdvertisementId = n.data?.advertisement_id || n.data?.advertisementId;
      // Include status_update type notifications or any notification with advertisement_id
      return n.type === 'status_update' || hasAdvertisementId;
    }).length;
  }, [notifications]);

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
        // Open the side drawer when tapping Profile
        setActiveTab('Home');
        setNavigatedFromDrawer(true);
        if (reopenDrawerCallback) {
          reopenDrawerCallback();
        }
        break;
      default:
        break;
    }
  };

  const handleNavigateHome = () => {
    setActiveTab('Home');
    navigation.setParams?.({ tab: 'Home' });
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen navigation={navigation} onLoadingChange={setIsHomeLoading} />;
      case 'Boards':
        return <CompaignStatus navigation={navigation} onBackToHome={handleNavigateHome} />; 
      case 'Add':
        return <HomeScreen navigation={navigation} onLoadingChange={setIsHomeLoading} />; 
      case 'Chat':
        return <InboxScreen />; 
      case 'Profile':
        return <CompaignStatus navigation={navigation} onBackToHome={handleNavigateHome} />;
      default:
        return <HomeScreen navigation={navigation} onLoadingChange={setIsHomeLoading} />;
    }
  };

  const tabs = [
    { name: 'Home', icon: GrayHomeIcon, activeIcon: PinkHomeIcon },
    { name: 'Boards', icon: GrayActiveIcon, activeIcon: PinkActiveIcon },
    { name: 'Add', icon: AddIcon, isFAB: true },
    { name: 'Chat', icon: Images.chat, activeIcon: Images.chat, isImage: true },
    { name: 'Profile', icon: GrayProfileIcon, activeIcon: PinkProfileIcon },
  ];

  const renderTab = (tab: any, index: number) => {
    const isActive = activeTab === tab.name;
    const isFAB = tab.isFAB;
    const IconComponent = isActive ? tab.activeIcon : tab.icon;
    // Check if it's an image source (number) or SVG component (function)
    const isImageSource = typeof IconComponent === 'number' || (typeof IconComponent !== 'function' && IconComponent !== null && IconComponent !== undefined);
    const isImageTab = tab.isImage || false;

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

    // Check if this is the Chat tab and has unread notifications
    const isChatTab = tab.name === 'Chat';
    const showBadge = isChatTab && unreadCampaignNotificationsCount > 0;

    return (
      <TouchableOpacity
        key={tab.name}
        style={styles.tabButton}
        onPress={() => handleTabPress(tab.name)}
        activeOpacity={0.7}
      >
        <View style={styles.tabIconContainer}>
          {isImageSource || isImageTab ? (
            <Image 
              source={IconComponent} 
              style={[
                styles.tabIconImage,
                isImageTab && isActive && styles.chatIconActive,
                isImageTab && !isActive && styles.chatIconInactive,
              ]}
              resizeMode="contain"
            />
          ) : (
            <IconComponent width={20} height={20} />
          )}
          {showBadge && (
            <View style={styles.badgeDot} />
          )}
        </View>
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

  const shouldShowBottomTab = activeTab !== 'Boards' && !(activeTab === 'Home' && isHomeLoading);

  React.useEffect(() => {
    if (activeTab !== 'Home') {
      setIsHomeLoading(false);
    }
  }, [activeTab]);

  return (
    <View style={styles.mainContainer}>
      {/* Main Content */}
      <View style={styles.content}>
        {renderActiveScreen()}
      </View>
      
      {/* Bottom Tab Navigation */}
      {!isDrawerVisible && shouldShowBottomTab && (
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
    backgroundColor: '#FFFFFF',
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
  chatIconActive: {
    tintColor: '#C539A5',
  },
  chatIconInactive: {
    tintColor: '#9CA3AF',
  },
  tabIconContainer: {
    position: 'relative',
    width: 20,
    height: 20,
  },
  badgeDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C539A5',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default BottomTab;
