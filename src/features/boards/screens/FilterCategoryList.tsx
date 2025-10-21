// src/features/boards/screens/FilterCategoryList.tsx
import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BachButton from '../../../components/BackButton';
import BoardList from '../../../components/BoardList';
import { useAuthStore } from '../../../store/authStore';
import BoardTabs, { Tab } from '../components/BoardTabs';
import { useBoardFilters } from '../hooks/useBoardFilters';
import { useFilteredBoards } from '../hooks/useFilteredBoards';
// TypeScript interfaces - using BoardList's BoardItem interface
import { BoardItem } from '../../../components/BoardList';

interface FilterCategoryListProps {
  route: {
    params: {
      slug?: string;
    };
  };
  navigation: any;
}
const { width, height } = Dimensions.get('window');

// BoardList component handles card dimensions

const FilterCategoryList: React.FC<FilterCategoryListProps> = ({
  route,
  navigation,
}) => {
  const { slug } = route.params || {};

  const [selectedTab, setSelectedTab] = useState<Tab | null>(null);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const { user } = useAuthStore();

  useEffect(() => {
    Geolocation.getCurrentPosition(
      pos => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      error => {
        console.log('Location error:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: boardFiltersData,
    isLoading: isFiltersLoading,
    error: filtersError,
    refetch: refetchBoardFilters,
  } = useBoardFilters();

  // Map search terms to category slugs
  const getCategorySlugFromSearch = (
    searchTerm: string,
  ): string | undefined => {
    if (!searchTerm) return undefined;

    const searchLower = searchTerm.toLowerCase();

    const searchToCategoryMap: { [key: string]: string } = {
      wallpaper: 'wall-panels',
      'wall panel': 'wall-panels',
      'wall panels': 'wall-panels',
      billboard: 'billboards',
      billboards: 'billboards',
      'bus shelter': 'bus-shelter-ads',
      'bus shelter ads': 'bus-shelter-ads',
      mopi: 'mopi-boards-(backlit)',
      backlit: 'mopi-boards-(backlit)',
      'pole sign': 'pole-signs',
      'pole signs': 'pole-signs',
      banner: 'banners',
      banners: 'banners',
      poster: 'posters',
      posters: 'posters',
      flyer: 'flyers',
      flyers: 'flyers',
      digital: 'digital-pole-signs',
      'digital pole': 'digital-pole-signs',
    };

    return searchToCategoryMap[searchLower] || undefined;
  };

  const categorySlug = getCategorySlugFromSearch(debouncedSearchQuery);

  const {
    data: filteredBoardsData,
    isLoading: isFilteredLoading,
    error: filteredError,
    refetch: refetchFilteredBoards,
  } = useFilteredBoards({
    page: 1,
    limit: 10,
    search: categorySlug ? undefined : debouncedSearchQuery || undefined,
    slug: selectedTab?.slug, // ✅ dynamic based on selected tab
  });

  const tabs: Tab[] = React.useMemo(() => {
    if (!boardFiltersData?.filters) return [];
    return boardFiltersData.filters.map((f: any) => ({
      label: f.name,
      slug: f.slug,
    }));
  }, [boardFiltersData]);

  // **Selected tab initialization based on slug**
  React.useEffect(() => {
    if (tabs.length === 0 || selectedTab) return;

    // Try to match slug from route params
    const matchingTab = slug ? tabs.find(tab => tab.slug === slug) : null;
    setSelectedTab(matchingTab || tabs[0]);
  }, [tabs, slug, selectedTab]);

  // Rest of your code remains unchanged...
  // (Search effects, getFilteredData, renderSearchAndTabs, handleTabPress, JSX)

  // ...continue with the rest of the original code
  // Get data based on selected tab - use fetchFilteredBoards API
  const getFilteredData = (): BoardItem[] => {
    if (!selectedTab) return [];

    // Only use API data
    if (
      filteredBoardsData?.boards &&
      Array.isArray(filteredBoardsData.boards)
    ) {
      return filteredBoardsData.boards.map(convertBoardToBoardItem);
    }

    // If API hasn't returned anything yet or returned empty, show empty state
    return [];
  };

  // Convert Board to BoardItem format (same as HomeScreen)
  const convertBoardToBoardItem = (board: any) => {
    return {
      id: board.id?.toString() || 'unknown',
      title: board.title || 'Untitled Board',
      description: board.description || '',
      location: board.location || 'Unknown Location',
      distance: '1.6 km', // Default distance
      size:
        board.width && board.height ? `${board.width}x${board.height}` : '12x8',
      price: parseFloat(board.price) || 0,
      currency: board.currency || 'USD',
      image_url: board.image_url || null,
    };
  };

  const data = getFilteredData();
  const isLoading = isFilteredLoading || isFiltersLoading;
  const error = filteredError || filtersError;

  const handleDetailPress = (item: BoardItem) => {
    navigation.navigate('CampaignDetail', { item });
  };

  const handleTabPress = (tab: Tab) => {
    setSelectedTab(tab);
    refetchFilteredBoards();
  };

  // "Locating..." placeholder for Near
  if (selectedTab?.label === 'Near' && !coords && user) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#FFF4FD" barStyle="dark-content" />
        <LinearGradient
          colors={['#C539A5', '#FFF4FD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.header}
        >
          <BachButton />
          {renderSearchAndTabs()}
        </LinearGradient>
        <View style={{ padding: 20 }}></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFF4FD" barStyle="dark-content" />
      <LinearGradient
        colors={['#C539A5', '#FFF4FD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <BachButton />
        {renderSearchAndTabs()}
      </LinearGradient>
      {!user ? (
        <Text style={{ padding: 20 }}>Please login to view listings</Text>
      ) : isLoading ? (
        <ActivityIndicator
          size="large"
          color="#C539A5"
          style={{ marginTop: 20 }}
        />
      ) : error ? (
        <Text style={{ padding: 20 }}>
          Error: {error.message || 'Something went wrong'}
        </Text>
      ) : data.length === 0 ? (
        <Text style={{ padding: 20 }}>No listings found</Text>
      ) : (
        <BoardList
          data={data}
          onPressDetail={handleDetailPress}
          heading={selectedTab?.label || 'Boards'}
          subHeading={`${data.length} boards found`}
          navigation={navigation}
          numColumns={2}
        />
      )}
    </View>
  );

  function renderSearchAndTabs() {
    return (
      <>
        <View style={styles.searchRow}>
          <Image
            source={require('../../../assets/images/Search.png')}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.filterBtn}>
            <Image
              source={require('../../../assets/images/fillterrr.png')}
              style={styles.filterIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.boardSection}>
          <BoardTabs
            tabs={tabs}
            selectedTab={selectedTab}
            onTabPress={handleTabPress}
          />
        </View>
      </>
    );
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    width,
    height: height * 0.28,
    paddingTop: height * 0.04,
    paddingHorizontal: width * 0.05,
    marginBottom: 35,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.02,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: { width: 20, height: 20, marginRight: 8, tintColor: '#C539A5' },
  searchInput: { flex: 1, fontSize: 16 },
  clearBtn: {
    marginLeft: 8,
    marginRight: 4,
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  filterBtn: { marginLeft: 10 },
  filterIcon: { width: 20, height: 20 },
  boardSection: { marginTop: height * 0.02, marginBottom: 10 },
});

export default FilterCategoryList;
