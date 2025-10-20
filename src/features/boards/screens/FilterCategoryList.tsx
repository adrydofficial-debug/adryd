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
import BoardTabs, { Tab } from '../components/BoardTabs';
import { useBoardFilters } from '../hooks/useBoardFilters';
import { useFilteredBoards } from '../hooks/useFilteredBoards';
import { useAuthStore } from '../../../store/authStore';
import BachButton from '../../../components/BackButton';
import BoardList from '../../../components/BoardList';
// TypeScript interfaces - using BoardList's BoardItem interface
import { BoardItem } from '../../../components/BoardList';

interface FilterCategoryListProps {
  route: {
    params: {
      categoryId?: string;
      categoryName?: string;
      selectedTab?: string;
      filter?: string;
      tabType?: string;
    };
  };
  navigation: any;
}
const { width, height } = Dimensions.get('window');

// BoardList component handles card dimensions

const FilterCategoryList: React.FC<FilterCategoryListProps> = ({ route, navigation }) => {
  const { categoryId, categoryName, selectedTab: initialTab, filter, tabType } = route.params || {};
  console.log('FilterCategoryList - Route params:', { categoryId, categoryName, initialTab, filter, tabType });
  
  const [selectedTab, setSelectedTab] = useState<Tab | null>(
    initialTab ? { id: initialTab, type: tabType || 'all', label: initialTab } : null
  );
  const [coords, setCoords] = useState<{latitude: number; longitude: number} | null>(null);
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

  // Use the same hook as HomeScreen for tabs
  const {
    data: boardFiltersData,
    isLoading: isFiltersLoading,
    error: filtersError,
    refetch: refetchBoardFilters,
  } = useBoardFilters();

  // Map search terms to category slugs
  const getCategorySlugFromSearch = (searchTerm: string): string | undefined => {
    if (!searchTerm) return undefined;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Map common search terms to category slugs
    const searchToCategoryMap: { [key: string]: string } = {
      'wallpaper': 'wall-panels',
      'wall panel': 'wall-panels',
      'wall panels': 'wall-panels',
      'billboard': 'billboards',
      'billboards': 'billboards',
      'bus shelter': 'bus-shelter-ads',
      'bus shelter ads': 'bus-shelter-ads',
      'mopi': 'mopi-boards-(backlit)',
      'backlit': 'mopi-boards-(backlit)',
      'pole sign': 'pole-signs',
      'pole signs': 'pole-signs',
      'banner': 'banners',
      'banners': 'banners',
      'poster': 'posters',
      'posters': 'posters',
      'flyer': 'flyers',
      'flyers': 'flyers',
      'digital': 'digital-pole-signs',
      'digital pole': 'digital-pole-signs',
    };
    
    return searchToCategoryMap[searchLower] || undefined;
  };

  // Get category slug from search query
  const categorySlug = getCategorySlugFromSearch(debouncedSearchQuery);
  
  // Map category slug back to tab information
  const getTabFromCategorySlug = (slug: string): Tab | null => {
    if (!slug || !boardFiltersData?.groups) return null;
    
    for (const group of boardFiltersData.groups) {
      if (group.categories) {
        for (const category of group.categories) {
          // Use any type since the actual API response has slug property
          if ((category as any).slug === slug) {
            return {
              id: `category-${category.id}`,
              type: 'category',
              label: category.name,
            };
          }
        }
      }
    }
    return null;
  };
  
  // Debug logging
  React.useEffect(() => {
    console.log('FilterCategoryList - Search Debug:', {
      searchQuery,
      debouncedSearchQuery,
      categorySlug,
      filter: filter || 'see_all',
      finalFilter: categorySlug ? 'category' : (filter || 'see_all'),
      selectedTab,
    });
  }, [searchQuery, debouncedSearchQuery, categorySlug, filter, selectedTab]);

  // Use filtered boards API for specific tab data
  const {
    data: filteredBoardsData,
    isLoading: isFilteredLoading,
    error: filteredError,
    refetch: refetchFilteredBoards,
  } = useFilteredBoards({
    filter: categorySlug ? 'category' : (filter || 'see_all'),
    page: 1,
    limit: 10,
    search: categorySlug ? undefined : (debouncedSearchQuery || undefined),
    category_slug: categorySlug,
  });

  // Dynamic tabs from API data (same as HomeScreen)
  const tabs: Tab[] = [
    { id: 'see-all', type: 'all', label: 'See All' },
    { id: 'recommend', type: 'recommend', label: 'Recommend' },
    { id: 'near', type: 'near', label: 'Near' },
    ...(boardFiltersData?.groups?.flatMap((group: any) => [
      { id: `group-${group.id}`, type: 'group', label: group.name },
      ...(group.categories?.map((cat: any) => ({
        id: `category-${cat.id}`,
        type: 'category',
        label: cat.name,
      })) || []),
    ]) || []),
  ];

  // Initialize selectedTab when tabs are loaded
  React.useEffect(() => {
    if (tabs.length > 0) {
      // Find the tab that matches the initialTab or default to 'See All'
      const defaultTab = tabs.find(tab => tab.label === initialTab) || tabs[0];
      console.log('FilterCategoryList - Setting selectedTab:', defaultTab);
      console.log('FilterCategoryList - Current selectedTab:', selectedTab);
      
      // Only set if we don't have a selectedTab or if the current one doesn't match
      if (!selectedTab || selectedTab.id !== defaultTab.id) {
        setSelectedTab(defaultTab);
      }
    }
  }, [tabs, initialTab]);

  // Removed excessive logging to prevent console spam

  // Fallback: ensure we always have a selectedTab
  React.useEffect(() => {
    if (tabs.length > 0 && !selectedTab) {
      setSelectedTab(tabs[0]);
    }
  }, [tabs, selectedTab]);

  // Auto-select tab when search matches a category
  React.useEffect(() => {
    if (categorySlug && debouncedSearchQuery && tabs.length > 0) {
      const matchingTab = getTabFromCategorySlug(categorySlug);
      if (matchingTab && (!selectedTab || selectedTab.id !== matchingTab.id)) {
        setSelectedTab(matchingTab);
      }
    } else if (!debouncedSearchQuery && selectedTab && selectedTab.type === 'category' && tabs.length > 0) {
      // Reset to default tab when search is cleared
      const defaultTab = tabs.find(tab => tab.type === 'all') || tabs[0];
      if (defaultTab) {
        setSelectedTab(defaultTab);
      }
    }
  }, [categorySlug, debouncedSearchQuery, selectedTab, tabs, boardFiltersData]);

  // Removed excessive logging to prevent console spam

  // Refetch data when filter or search changes
  React.useEffect(() => {
    if (filter && filter !== 'seeAll') {
      refetchFilteredBoards();
    }
  }, [filter, refetchFilteredBoards]);

  // Refetch data when search query changes
  React.useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      refetchFilteredBoards();
    }
  }, [debouncedSearchQuery, refetchFilteredBoards]);

  // Get data based on selected tab - use fetchFilteredBoards API
  const getFilteredData = (): BoardItem[] => {
    if (!selectedTab) {
      return [];
    }

    // Primary data source: fetchFilteredBoards API
    if (filteredBoardsData?.boards && Array.isArray(filteredBoardsData.boards) && filteredBoardsData.boards.length > 0) {
      const mappedData = filteredBoardsData.boards.map(convertBoardToBoardItem);
      return mappedData;
    }

    // Fallback to boardFiltersData if fetchFilteredBoards is not working
    if (boardFiltersData) {
      let fallbackData: any[] = [];
      
      switch (selectedTab.label) {
        case 'Recommend':
          fallbackData = boardFiltersData.recommended || [];
          break;
        case 'Near':
          fallbackData = boardFiltersData.nearest || [];
          break;
        case 'See All':
        default:
          fallbackData = boardFiltersData.seeAll || [];
          break;
      }
      
      const mappedFallbackData = fallbackData.map(convertBoardToBoardItem);
      return mappedFallbackData;
    }

    // Show empty state if no API data yet
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
      size: board.width && board.height ? `${board.width}x${board.height}` : '12x8',
      price: parseFloat(board.price) || 0,
      currency: board.currency || 'USD',
      image_url: board.image_url || null,
      rating: board.rating ?? 0,
    };
  };

  const data = getFilteredData();
  const isLoading = isFilteredLoading || isFiltersLoading; // Include both loading states
  const error = filteredError || filtersError; // Include both error states
  
  const handleDetailPress = (item: BoardItem) => {
    navigation.navigate('SingleBoardDetail', { item });
  };

  // Handle tab press
  const handleTabPress = (tab: Tab) => {
    console.log('FilterCategoryList - Tab pressed:', tab);
    setSelectedTab(tab);
    
    // Map tab types to correct API filter values
    let filterValue = 'see_all'; // default
    switch (tab.type) {
      case 'recommend':
        filterValue = 'recommended';
        break;
      case 'near':
        filterValue = 'nearest';
        break;
      case 'group':
        filterValue = 'group';
        break;
      case 'category':
        filterValue = 'category';
        break;
      case 'all':
      default:
        filterValue = 'see_all';
        break;
    }
    
    console.log('FilterCategoryList - New filter parameter:', filterValue);
    
    // Navigate with new filter parameter
    navigation.navigate('FilterCategoryList', {
      selectedTab: tab.label,
      categoryId: tab.id,
      categoryName: tab.label,
      filter: filterValue,
      tabType: tab.type,
    });
    
    // Refetch data with new filter
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
          <BachButton/>
          {renderSearchAndTabs()}
        </LinearGradient>
        <View style={{ padding: 20 }}>
       
        </View>
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
        <BachButton/>
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
        <Text style={{ padding: 20 }}>
          {searchQuery && categorySlug ? 
            `No ${selectedTab?.label || 'listings'} found` :
            (searchQuery 
              ? `No listings found for "${searchQuery}"` 
              : `No listings found for ${categoryName || categoryId || 'this category'}`
            )
          }
        </Text>
      ) : (
        <BoardList
          data={data}
          onPressDetail={handleDetailPress}
          heading={searchQuery && categorySlug ? 
            `${selectedTab?.label || 'Search Results'}` : 
            (searchQuery ? 
              `Search Results for "${searchQuery}"` : 
              (selectedTab?.label || 'Boards')
            )
          }
          subHeading={`${data.length} boards found`}
          navigation={navigation}
          numColumns={2}
        />
      )}
    </View>
  );
  // Helper: search + BoardTabs
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