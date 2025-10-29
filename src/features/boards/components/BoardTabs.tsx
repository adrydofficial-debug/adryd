// src/components/BoardTabs.tsx
import React, { useRef, useState } from 'react';
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

const { width, height } = Dimensions.get('window');

// 🔹 Tab interface
export interface Tab {
  label: string;
  slug?: string;
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

  // Removed debug logging to prevent console spam

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
          { paddingLeft: scrollOffset > 0 ? 0 : 30 }, // Added 15px left padding for some space from start
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {tabs.map(tab => {
          const isActive = selectedTab?.slug === tab.slug;
          const isDraft = tab.slug === 'draft' || tab.label.toLowerCase() === 'draft';
          return (
            <TouchableOpacity
              key={`${tab.slug}`}
              style={[
                isActive ? styles.tabActive : styles.tab,
                isDraft && styles.draftTab
              ]}
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
  boardTabsWrapper: { 
    marginBottom: height * 0.0299,
    marginLeft: -10, // Adjusted to account for 15px padding
  },
  boardTabs: { flexDirection: 'row', alignItems: 'center' },
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabActive: {
    backgroundColor: '#C539A5',
    borderRadius: 20,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    marginRight: width * 0.03,
   
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
  draftTab: {
    backgroundColor: '#F0F9EE',
    borderColor: '#23AF11',
  },
});

export default BoardTabs;
