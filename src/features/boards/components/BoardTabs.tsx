// src/components/BoardTabs.tsx
import React, {useRef, useState} from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const {width, height} = Dimensions.get('window');

// 🔹 Tab interface
export interface Tab {
  id: string | number;
  type: string;
  label: string;
}

// 🔹 Props interface
interface BoardTabsProps {
  tabs?: Tab[];
  selectedTab?: Tab | null;
  onTabPress: (tab: Tab) => void;
}

const BoardTabs: React.FC<BoardTabsProps> = ({
  tabs = [],
  selectedTab,
  onTabPress,
}) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Debug selectedTab prop
  console.log('BoardTabs - received selectedTab:', selectedTab);
  console.log('BoardTabs - received tabs:', tabs.map(t => ({ id: t.id, label: t.label })));

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setScrollOffset(offsetX);
  };

  return (
    <View style={styles.boardTabsWrapper}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.boardTabs,
          {paddingLeft: scrollOffset > 0 ? 0 : 20},
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {tabs.map(tab => {
          const isActive = selectedTab?.id === tab.id;
          console.log(`BoardTabs - Tab: ${tab.label}, ID: ${tab.id}, Selected: ${selectedTab?.id}, IsActive: ${isActive}`);
          return (
            <TouchableOpacity
              key={`${tab.type}-${tab.id}`} // ✅ stable key
              style={isActive ? styles.tabActive : styles.tab}
              onPress={() => onTabPress(tab)} // ✅ pass full tab object
            >
              <Text style={isActive ? styles.tabTextActive : styles.tabText}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  boardTabsWrapper: {marginBottom: height * 0.02},
  boardTabs: {flexDirection: 'row', alignItems: 'center'},
  tab: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    marginRight: width * 0.03,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth:1,
    borderColor:'#E5E7EB'
  },
  tabActive: {
    backgroundColor: '#C539A5',
    borderRadius: 20,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    marginRight: width * 0.03,
    shadowColor: '#C539A5',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: width * 0.035,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    fontSize: width * 0.035,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 3,
  },
});

export default BoardTabs;
