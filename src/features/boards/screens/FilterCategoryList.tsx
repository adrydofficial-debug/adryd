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
import { useSearchBoards } from '../hooks/useSearchBoards';
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
    console.log('🕐 Debounce effect triggered with searchQuery:', searchQuery);
    const timer = setTimeout(() => {
      console.log('⏰ Setting debouncedSearchQuery to:', searchQuery);
      setDebouncedSearchQuery(searchQuery);
    }, 300); // Reduced to 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: boardFiltersData,
    isLoading: isFiltersLoading,
    error: filtersError,
    refetch: refetchBoardFilters,
  } = useBoardFilters();

  // Use search hook with exact API structure you specified
  const {
    data: searchBoardsData,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearchBoards,
  } = useSearchBoards({
    slug: selectedTab?.slug || 'digital-advertising', // Default slug
    search: debouncedSearchQuery || undefined,
    min_price: 100, // Default min price
    max_price: 1000, // Default max price
    page: 1,
    limit: 10,
  });
  const {
    data: filteredBoardsData,
    isLoading: isFilteredLoading,
    error: filteredError,
    refetch: refetchFilteredBoards,
  } = useFilteredBoards({
    page: 1,
    limit: 10,
    slug: selectedTab?.slug,
  });
  const tabs: Tab[] = React.useMemo(() => {
    if (!boardFiltersData?.filters) return [];
    return boardFiltersData.filters.map((f: any) => ({
      label: f.name,
      slug: f.slug,
    }));
  }, [boardFiltersData]);
  React.useEffect(() => {
    if (tabs.length === 0 || selectedTab) return;
    const matchingTab = slug ? tabs.find(tab => tab.slug === slug) : null;
    setSelectedTab(matchingTab || tabs[0]);
  }, [tabs, slug, selectedTab]);
  React.useEffect(() => {
    if (debouncedSearchQuery && selectedTab) {
      console.log('Search query changed, refetching search results:', debouncedSearchQuery);
      refetchSearchBoards();
    }
  }, [debouncedSearchQuery, selectedTab, refetchSearchBoards]);
  const getFilteredData = (): BoardItem[] => {
    if (!selectedTab) return [];
    if (debouncedSearchQuery) {
      if (searchBoardsData?.boards && Array.isArray(searchBoardsData.boards) && searchBoardsData.boards.length > 0) {
        console.log('✅ Using search results for query:', debouncedSearchQuery, 'Count:', searchBoardsData.boards.length);
        return searchBoardsData.boards.map(convertBoardToBoardItem);
      } else {
        console.log('❌ No search results found for query:', debouncedSearchQuery);
        // Show filtered boards as fallback when search returns no results
        if (filteredBoardsData?.boards && Array.isArray(filteredBoardsData.boards)) {
          console.log('🔄 Falling back to filtered boards data');
          return filteredBoardsData.boards.map(convertBoardToBoardItem);
        }
      }
    }
    if (filteredBoardsData?.boards && Array.isArray(filteredBoardsData.boards)) {
      console.log('📋 Using filtered boards data (no search)');
      return filteredBoardsData.boards.map(convertBoardToBoardItem);
    }
    return [];
  };
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
      rating: board.rating ?? 0,
    };
  };
  const data = getFilteredData();
  const isLoading = isSearchLoading || isFilteredLoading || isFiltersLoading;
  const error = searchError || filteredError || filtersError;
  const handleDetailPress = (item: BoardItem) => {
    navigation.navigate('SingleBoardDetail', { item });
  };
  const handleTabPress = (tab: Tab) => {
    setSelectedTab(tab);
    refetchFilteredBoards();
    refetchSearchBoards();
  };
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
        <View style={styles.mainView}>
           <BachButton />
        {renderSearchAndTabs()}
        </View>
       
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
        <View style={{ padding: 0, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>
            {debouncedSearchQuery 
              ? `No results found for "${debouncedSearchQuery}"` 
              : 'No listings found'
            }
          </Text>
          {debouncedSearchQuery && (
            <Text style={{ fontSize: 14, color: '#999' }}>
              Try a different search term
            </Text>
          )}
        </View>
      ) : (
        <BoardList
          data={data}
          onPressDetail={handleDetailPress}
          // heading={selectedTab?.label || 'Boards'}
          // subHeading={`${data.length} boards found`}
          navigation={navigation}
          numColumns={2}
        />
      )}
       <NoInternet />
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
          {isSearchLoading && debouncedSearchQuery && (
            <ActivityIndicator size="small" color="#C538A5" style={styles.searchLoading} />
          )}
          {searchQuery.length > 0 && !isSearchLoading && (
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
  container: { flex: 1, backgroundColor: '#fff' ,paddingBottom:250},
  header: {
    width,
    // reduce header height so BoardList sits closer to BoardTabs
    height: height * 0.24,
    // paddingTop: height * 0.04,
    // paddingHorizontal: width * 0.05,
    // marginBottom: 35,
  },
  mainView: {
    paddingHorizontal: width * 0.04,
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
  searchLoading: { marginRight: 8 },
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
  boardSection: {
    // reduce the top margin so tabs are closer to the list below
    marginTop: height * 0.01,
    // marginBottom: 10,
    marginLeft: -10, // Adjusted to account for 15px padding
  },
});

export default FilterCategoryList;
