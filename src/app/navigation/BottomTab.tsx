import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface BottomTabProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

const BottomTab: React.FC<BottomTabProps> = ({ activeTab, onTabPress }) => {
  const tabs = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'Boards', icon: 'list-outline', activeIcon: 'list' },
    { name: 'Add', icon: 'add', activeIcon: 'add', isFAB: true },
    { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  const renderTab = (tab: any, index: number) => {
    const isActive = activeTab === tab.name;
    const isFAB = tab.isFAB;

    if (isFAB) {
      return (
        <TouchableOpacity
          key={tab.name}
          style={styles.fabButton}
          onPress={() => onTabPress(tab.name)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isActive ? tab.activeIcon : tab.icon}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={tab.name}
        style={styles.tabButton}
        onPress={() => onTabPress(tab.name)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isActive ? tab.activeIcon : tab.icon}
          size={22}
          color={isActive ? '#C539A5' : '#9CA3AF'}
        />
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
    <View style={styles.container}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    height: 90,
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
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
    bottom: 30,
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
