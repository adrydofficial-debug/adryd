import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

interface BottomTabProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

const BottomTabSimple: React.FC<BottomTabProps> = ({ activeTab, onTabPress }) => {
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

  return (
    <View style={styles.container}>
      {/* Main Navigation Bar */}
      <View style={styles.navigationBar}>
        {/* Left side tabs */}
        <View style={styles.leftTabs}>
          {tabs.slice(0, 2).map((tab, index) => renderTab(tab, index))}
        </View>

        {/* Center FAB space with notch effect */}
        <View style={styles.centerSpace}>
          <View style={styles.notch} />
        </View>

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
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    zIndex: 1000,
  },
  navigationBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
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
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  notch: {
    width: 40,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -10,
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

export default BottomTabSimple;
