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
import BoardList, { BoardItem } from '../../../components/BoardList';
import NoInternet from '../../../components/NoInternet';
import { useAuthStore } from '../../../store/authStore';
import BoardTabs, { Tab } from '../components/BoardTabs';
import { useBoardFilters } from '../hooks/useBoardFilters';
import { useFilteredBoards } from '../hooks/useFilteredBoards';
import { Images } from '../../../assets/images';

const { width, height } = Dimensions.get('window');

const FilterCategoryList: React.FC<any> = ({ route, navigation }) => {
  const { slug } = route.params || {};
  const { user } = useAuthStore();

  const [selectedTab, setSelectedTab] = useState<Tab | null>(null);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [cityId, setCityId] = useState<number | null>(null);
  const [locationIds, setLocationIds] = useState<number[]>([]);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      pos => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      error => console.log('Location error:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: boardFiltersData, isLoading: isFiltersLoading } =
    useBoardFilters();

  const tabs: Tab[] = React.useMemo(() => {
    if (!boardFiltersData?.filters) return [];
    return boardFiltersData.filters.map((f: any) => ({
      label: f.name,
      slug: f.slug,
    }));
  }, [boardFiltersData]);

  useEffect(() => {
    if (tabs.length === 0 || selectedTab) return;
    const matchingTab = slug ? tabs.find(tab => tab.slug === slug) : null;
    setSelectedTab(matchingTab || tabs[0]);
  }, [tabs, slug, selectedTab]);

  const {
    data: filteredBoardsData,
    isLoading: isFilteredLoading,
    refetch: refetchFilteredBoards,
  } = useFilteredBoards({
    page: 1,
    limit: 10,
    slug: selectedTab?.slug ? [selectedTab.slug] : undefined,
    city_id: cityId || undefined,
    location_id: locationIds.length ? locationIds : undefined,
    search: debouncedSearchQuery || undefined,
    lat: coords?.latitude,
    lng: coords?.longitude,
    min_price: 100,
    max_price: 1000,
  });

  const getFilteredData = (): BoardItem[] => {
    if (!filteredBoardsData?.boards) return [];
    return filteredBoardsData.boards.map(convertBoardToBoardItem);
  };

  const convertBoardToBoardItem = (board: any): BoardItem => {
    const primaryMediaUrl =
      Array.isArray(board.media) && board.media.length > 0
        ? board.media[0]?.url
        : null;
    const imageUrl = board.image_url || board.image || primaryMediaUrl;

    const priceValue =
      typeof board.price === 'number'
        ? board.price
        : board.price
        ? parseFloat(board.price)
        : 0;

    return {
      id: board.id?.toString() || 'unknown',
      title: board.title || 'Untitled Board',
      description: board.description || '',
      location:
        typeof board.location === 'string'
          ? board.location
          : board.location?.name || 'Unknown Location',
      distance: '1.6 km',
      size:
        board.width && board.height ? `${board.width}x${board.height}` : '12x8',
      price: priceValue || 0,
      currency: board.currency || 'USD',
      image_url: imageUrl || null,
      image: imageUrl || undefined,
      rating: board.avg_rating ?? board.rating ?? 0,
      media: Array.isArray(board.media) ? board.media : [],
    };
  };

  const data = getFilteredData();
  const isLoading = isFilteredLoading || isFiltersLoading;

  const handleDetailPress = (item: BoardItem) =>
    navigation.navigate('SingleBoardDetail', { item });
  const handleTabPress = (tab: Tab) => {
    setSelectedTab(tab);
    refetchFilteredBoards();
  };

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
      ) : data.length === 0 ? (
        <Text style={{ padding: 20 }}>No listings found</Text>
      ) : (
        <BoardList
          data={data}
          onPressDetail={handleDetailPress}
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
          <Image source={Images.search} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {isFilteredLoading && debouncedSearchQuery && (
            <ActivityIndicator
              size="small"
              color="#C538A5"
              style={styles.searchLoading}
            />
          )}
          {searchQuery.length > 0 && !isFilteredLoading && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.filterBtn}>
            <Image source={Images.filterIllustration} style={styles.filterIcon} />
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
  container: { flex: 1, backgroundColor: '#fff', paddingBottom: 250 },
  header: { width, height: height * 0.24 },
  mainView: { paddingHorizontal: width * 0.04 },
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
  clearBtnText: { fontSize: 14, color: '#666', fontWeight: 'bold' },
  filterBtn: { marginLeft: 10 },
  filterIcon: { width: 20, height: 20 },
  boardSection: { marginTop: height * 0.01, marginLeft: -10 },
});

export default FilterCategoryList;
