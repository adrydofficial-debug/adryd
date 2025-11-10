// src/features/boards/HomeScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  default as LinearGradient,
  default as LinearGradientLib,
} from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import PinkLocation from '../../../assets/images/PinkkLocation.svg';
import BoardList from '../../../components/BoardList';
import DrawerComponent from '../../../components/DrawerComponent';
import { useAuthStore } from '../../../store/authStore';
// import { useBoardUnavailableTimes } from '../hooks/useBoardUnavailableTimes';
import { useProfile } from '../../profile/hooks/useProfile';
import NoInternet from '../../../components/NoInternet';
import { useTranslation } from 'react-i18next';
import LocationButton from '../../locations/components/LocationButton';
import BoardTabs, { Tab } from '../components/BoardTabs';
import { useBoardFilters } from '../hooks/useBoardFilters';

import i18n from '../../../i18n';
// import { useFocusEffect } from '@react-navigation/native';

type Props = {
  navigation: any;
};

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation('boards');
  const [selectedTab, setSelectedTab] = useState<Tab | null>({
    label: 'See All',
    slug: 'see-all',
  });

  // Get user data from authStore and profile data
   
  const { user } = useAuthStore();
  const { data: profile } = useProfile();
  // Determine avatar URL
  const avatarUrl = (
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    ''
  )
    .toString()
    .trim();
  const looksLikeUrl = /^(https?:\/\/|file:\/\/|content:\/\/)/i.test(avatarUrl);
  const hasBadToken = /null|undefined/i.test(avatarUrl);
  const isValidAvatarUrl = avatarUrl.length > 0 && looksLikeUrl && !hasBadToken;

  // Get display name for initial
  const displayName = (
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'U'
  )
    .toString()
    .trim();

  const initial = displayName.charAt(0).toUpperCase() || 'U';
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    // Reset error whenever source URL changes
    setAvatarError(false);
  }, [avatarUrl]);



  // Debug: verify avatar/initial state once per render (comment out if noisy)
  try {
    // Only log when values change significantly
    // console.log('[Home] avatarUrl:', avatarUrl, 'valid:', isValidAvatarUrl, 'displayName:', displayName, 'initial:', initial);
  } catch {}
  // Banner state
  const [currentBannerIndex, setCurrentBannerIndex] = useState<number>(0);

  // Filter dropdown state
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] =
    useState<boolean>(false);

  // Drawer state
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  
  // Language change tracking for forced re-render
  const [languageKey, setLanguageKey] = useState(0);
  
  useEffect(() => {
    const handleLangChange = () => {
      setLanguageKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, []);

  // Banner images
  const bannerImages = [
    require('../../../assets/images/BannerOne.png'),
    require('../../../assets/images/BannerTwo.png'),
  ];

  // Auto-slide banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(prevIndex => (prevIndex + 1) % bannerImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  // Open drawer
  const handleProfilePress = () => {
    setDrawerVisible(true);
  };

  // Close drawer
  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  // Data hooks - Only use fetchBoardFilters
  const {
    data: boardFiltersData,
    isLoading: isBoardFiltersLoading,
    error: boardFiltersError,
    refetch: refetchBoardFilters,
  } = useBoardFilters();

  useEffect(() => {
    if (boardFiltersData) {
      console.log('[HomeScreen] Filters count:', boardFiltersData.filters?.length ?? 0);
      console.log('[HomeScreen] Groups count:', boardFiltersData.groups?.length ?? 0);
      boardFiltersData.groups?.forEach(group => {
        console.log(
          `[HomeScreen] Group "${group.name}" categories:`,
          group.categories?.map(cat => `${cat.name} (${cat.boards?.length ?? 0})`),
        );
      });
    }
    if (boardFiltersError) {
      console.error('[HomeScreen] Failed to load board filters:', boardFiltersError);
    }
  }, [boardFiltersData, boardFiltersError]);

  // Fetch unavailable times for board_id 1
  // COMMENTED OUT - Debugging boards data display issue
  // const {
  //   data: unavailableTimesData,
  //   isLoading: isUnavailableTimesLoading,
  //   error: unavailableTimesError,
  // } = useBoardUnavailableTimes(1);

  // Log unavailable times data when fetched
  // COMMENTED OUT - Debugging boards data display issue
  // useEffect(() => {
  //   if (unavailableTimesData) {
  //     console.log('📅 Board Unavailable Times:', unavailableTimesData);
  //   }
  //   if (unavailableTimesError) {
  //     console.error('❌ Error fetching unavailable times:', unavailableTimesError);
  //   }
  // }, [unavailableTimesData, unavailableTimesError]);

  // Removed auto-refetch on screen focus to avoid repeated API calls.
  // If you need manual refresh, call `refetchBoardFilters()` explicitly (e.g., pull-to-refresh or a Retry button).

  // Dynamic tabs from API data - memoized
  const tabs: Tab[] = useMemo(() => {
    if (!boardFiltersData?.filters) return [];
    return boardFiltersData.filters.map(f => ({
      label: f.name, // some API filters might use name
      slug: f.slug,
    }));
  }, [boardFiltersData]);

  // Removed excessive logging to prevent console spam
  // Handle tab press
  const handleTabPress = (tab: Tab) => {
    setSelectedTab(tab);

    navigation.navigate('FilterCategoryList', {
      slug: tab.slug,
    });
  };

  const handleDetailPress = (item: any) => {
    navigation.navigate('SingleBoardDetail', { item });
  };

  // Convert Board to BoardItem format
  const convertBoardToBoardItem = (board: any) => {
    const locationName =
      typeof board.location === 'string'
        ? board.location
        : board.location?.name ||
          [
            board.location?.city?.name,
            board.location?.province?.name,
            board.location?.country?.name,
          ]
            .filter(Boolean)
            .join(', ') ||
          'Unknown Location';

    const priceValue =
      typeof board.price === 'number'
        ? board.price
        : board.price
        ? parseFloat(board.price)
        : 0;

    const imageUrl =
      board.image_url ||
      board.image ||
      (Array.isArray(board.media) && board.media.length > 0
        ? board.media[0]?.url
        : null);

    return {
      id: board.id?.toString() || 'unknown',
      title: board.title || 'Untitled Board',
      description: board.description || '',
      location: locationName,
      distance: '1.6 km',
      size:
        board.width && board.height ? `${board.width}x${board.height}` : '12x8',
      price: priceValue || 0,
      currency: board.currency || 'PKR',
      image_url: imageUrl,
      image: imageUrl,
      rating: board.avg_rating ?? board.rating ?? 0,
    };
  };

  const isLoading = isBoardFiltersLoading;
  const hasError = boardFiltersError;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFF4FD" barStyle="dark-content" />
      {isFilterDropdownOpen && (
        <TouchableOpacity
          style={styles.dropdownOverlay}
          onPress={() => setIsFilterDropdownOpen(false)}
          activeOpacity={1}
        />
      )}
      <LinearGradient
        colors={['#C539A5', '#fffdffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        {/* Profile */}
        <View style={styles.profileRow}>
          <TouchableOpacity onPress={handleProfilePress}>
            <Image
              source={{
                uri:
                  profile?.avatar_url ||
                  user?.user_metadata?.avatar_url ||
                  'https://randomuser.me/api/portraits/men/1.jpg',
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View style={{ marginRight: 25,marginLeft:6 }}>
            <Text style={styles.greeting}>{t('greetingHi')}</Text>
            <Text style={styles.name}>
              {profile?.full_name ||
                user?.user_metadata?.full_name ||
                user?.user_metadata?.name ||
                user?.user_metadata?.username ||
                user?.email?.split('@')[0] ||
                'User'}
              !
            </Text>
          </View>
          <View style={styles.locationRow}>
            <TouchableOpacity
              style={styles.locationBtnCustom}
              onPress={() => navigation.navigate('SearchLocation' as never)}
            >
              <PinkLocation
                width={width * 0.03}
                height={width * 0.03}
                style={{ marginRight: width * 0.011 }}
              />
              <Text style={styles.locationBtnText}>Lahore Gulberg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => navigation.navigate('SearchLocation' as never)}
            >
              <Image
                source={require('../../../assets/images/Search.png')}
                style={styles.FilterIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bellBtn}>
              <Image
                style={styles.bellIcon}
                source={require('../../../assets/images/PinkBell.png')}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={bannerImages[currentBannerIndex]}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>

      <View style={styles.boardSection}>
        <Text style={styles.boardTitle}>{t('findBoard')}</Text>
        <BoardTabs
          tabs={tabs}
          selectedTab={selectedTab}
          onTabPress={handleTabPress}
        />
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: '#fff', marginBottom: 10, marginTop: -height * 0.03 }}
      >
        {isLoading ? (
          [...Array(3)].map((_, idx) => (
            <ShimmerPlaceholder
              key={idx}
              LinearGradient={LinearGradientLib}
              style={{
                height: 150,
                borderRadius: 12,
                marginBottom: 16,
                marginHorizontal: 20,
              }}
            />
          ))
        ) : hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {t('errorLoadingBoards')}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                refetchBoardFilters();
              }}
            >
              <Text style={styles.retryButtonText}>{t('retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Show See All boards first */}
            {/* {boardFiltersData?.seeAll && boardFiltersData.seeAll.length > 0 && (
              <BoardList
                data={boardFiltersData.seeAll.map(convertBoardToBoardItem)}
                onPressDetail={handleDetailPress}
                heading="All Boards"
                navigation={navigation}
              />
            )} */}

            {/* Show Recommended boards */}
      {boardFiltersData?.recommended &&
              boardFiltersData.recommended.length > 0 && (
                <BoardList
                  data={boardFiltersData.recommended.map(
                    convertBoardToBoardItem,
                  )}
                  onPressDetail={handleDetailPress}
                  heading={t('recommended')}
                  navigation={navigation}
                />
              )}


            {/* Show Nearest boards */}
            {boardFiltersData?.nearest &&
              boardFiltersData.nearest.length > 0 && (
                <BoardList
                  data={boardFiltersData.nearest.map(convertBoardToBoardItem)}
                  onPressDetail={handleDetailPress}
                  heading={t('nearestBoards')}
                  navigation={navigation}
                />
              )}

            {/* Show boards grouped by categories (categories shown only once) */}
            {(() => {
              // Group all categories from all groups
              const categoryMap = new Map();

              boardFiltersData?.groups?.forEach((group: any) => {
                group.categories?.forEach((category: any) => {
                  if (category.boards && category.boards.length > 0) {
                    if (!categoryMap.has(category.id)) {
                      categoryMap.set(category.id, {
                        ...category,
                        groups: [],
                      });
                    }
                    categoryMap.get(category.id).groups.push({
                      id: group.id,
                      name: group.name,
                      description: group.description,
                      boards: category.boards,
                    });
                  }
                });
              });

              return Array.from(categoryMap.values()).map((category: any) => (
                <View key={category.id}>
                  {/* Category header - shown only once */}
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryTitle}>{category.name}</Text>
                    <TouchableOpacity onPress={() => {
                      // Handle see all for this category
                      console.log('See all for category:', category.name);
                    }}>
                      <Text style={styles.seeAllText}>{t('seeAll')}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Groups within this category */}
                  {category.groups.map((group: any) => (
                    <BoardList
                      key={`${category.slug}-${group.slug}`}
                      data={group.boards.map(convertBoardToBoardItem)}
                      onPressDetail={handleDetailPress}
                      heading={group.name}
                      navigation={navigation}
                    />
                  ))}
                </View>
              ));
            })()}
          </>
        )}
      </ScrollView>

      {/* Drawer Component */}
      <DrawerComponent visible={drawerVisible} onClose={handleCloseDrawer} />
       <NoInternet />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    width,
    height: height * 0.31,
    paddingTop: height * 0.04,
    paddingHorizontal: width * 0.05,
    // marginBottom: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 0,
    
  },
  avatar: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: width * 0.065,
    borderWidth: 1,
    borderColor: '#fff',
   
  },
  greeting: { fontSize: 12, color: '#fff', fontWeight: '400' },
  name: { fontSize: 15, color: '#fff', fontWeight: 'bold', marginTop: -5 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: width * -0.001,
  },
  locationBtnCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.008,
    marginRight: width * 0.01,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationBtnText: {
    color: '#595959',
    fontWeight: '400',
    fontSize: 12,
    marginRight: width * 0.01,
  },
  bellBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    marginRight: width * 0.01,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: width * 0.09,
    height: width * 0.09,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  bellIcon: {
    width: width * 0.05,
    height: width * 0.047,
    resizeMode: 'contain',
  },
  FilterIcon: {
    width: width * 0.04,
    height: width * 0.04,
    resizeMode: 'contain',
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
  searchIcon: {
    width: width * 0.06,
    height: width * 0.06,
    marginRight: width * 0.02,
    tintColor: '#D9D9D9',
  },
  searchInput: {
    flex: 1,
    fontSize: width * 0.04,
    color: '#333',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.02,
  },
  filterBtn: {
    marginLeft: width * 0.02,
    borderRadius: 20,
    padding: width * 0.02,
  },
  filterIcon: { width: width * 0.06, height: width * 0.06 },
  bannerContainer: {
    width: width * 0.9,
    height: height * 0.18,
    borderRadius: 15,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardSection: { 
    // marginTop: height * 0.001, 
    marginHorizontal: width * 0.01,
    marginLeft: -10, // Adjusted to account for 15px padding
  },
  boardTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15, // Reduced from 0.015 to 0.005
    paddingHorizontal: 20,
    marginTop: -25,

  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#C539A5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  filterDropdown: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    minWidth: 260,
  },
  dropdownHeaderAllBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  dropdownHeaderAll: { color: '#C539A5', fontSize: 16, fontWeight: '700' },
  dropdownSectionTitle: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
    marginHorizontal: 12,
  },
  dropdownBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280',
    marginRight: 10,
  },
  bulletText: { fontSize: 14, color: '#374151' },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: { fontSize: 14, color: '#333', fontWeight: '500' },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  groupHeader: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#C539A5',
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C539A5',
    marginBottom: 5,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 15,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0f0e0fff',
    fontWeight: '600',
  },
});
export default HomeScreen;
