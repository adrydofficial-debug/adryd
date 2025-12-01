// src/features/boards/HomeScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Images } from '../../../assets/images';
import HomeSplash from '../../../assets/images/HomeSplash.svg';
import BoardList from '../../../components/BoardList';
import DrawerComponent from '../../../components/DrawerComponent';
import NoInternet from '../../../components/NoInternet';
import { useAuthStore } from '../../../store/authStore';
import { useDrawerStore } from '../../../store/drawerStore';
import { useProfile } from '../../profile/hooks/useProfile';
import type { Tab } from '../components/BoardTabs';
import ProfileRow from '../components/ProfileRow';
import { useBoardFilters } from '../hooks/useBoardFilters';

type Props = {
  navigation: any;
};

const { width, height } = Dimensions.get('window');
const RIGHT_ACTIONS_WIDTH = width * 0.38;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation('boards');
  // Styling state - set to true to show active state (with badge), false for default state
  const [hasUnreadNotifications] = useState(true);
  const [, setSelectedTab] = useState<Tab | null>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    const checkPopup = async () => {
      const seen = await AsyncStorage.getItem('welcome_popup_shown');
      if (!seen) {
        setShowWelcomePopup(true);
      }
    };
    checkPopup();
  }, []);

  const closePopup = async () => {
    setShowWelcomePopup(false);
    await AsyncStorage.setItem('welcome_popup_shown', 'true');
  };

  const { user } = useAuthStore();
  const { data: profile } = useProfile();

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

  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  const [currentBannerIndex, setCurrentBannerIndex] = useState<number>(0);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] =
    useState<boolean>(false);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [selectedCity] = useState<string>('Bahawalpur');

  const bannerImages = [Images.bannerOne, Images.homeBanner];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(prevIndex => (prevIndex + 1) % bannerImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  useFocusEffect(
    useCallback(() => {
      setSelectedTab(null);
    }, []),
  );

  const setReopenDrawerCallback = useDrawerStore(
    s => s.setReopenDrawerCallback,
  );
  const navigatedFromDrawer = useDrawerStore(s => s.navigatedFromDrawer);
  const setNavigatedFromDrawer = useDrawerStore(s => s.setNavigatedFromDrawer);

  const handleProfilePress = async () => {
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  // Set the reopen drawer callback in the store
  React.useEffect(() => {
    setReopenDrawerCallback(() => {
      setDrawerVisible(true);
    });
    return () => {
      setReopenDrawerCallback(null);
    };
  }, [setReopenDrawerCallback]);

  useFocusEffect(
    React.useCallback(() => {
      if (navigatedFromDrawer) {
        setNavigatedFromDrawer(false);
        setDrawerVisible(true);
      }
    }, [navigatedFromDrawer, setNavigatedFromDrawer]),
  );

  const {
    data: boardFiltersData,
    isLoading: isBoardFiltersLoading,
    error: boardFiltersError,
    refetch: refetchBoardFilters,
  } = useBoardFilters();

  const handleDetailPress = (item: any) => {
    navigation.navigate('SingleBoardDetail', { item });
  };

  const convertBoardToBoardItem = (
    board: any,
    isRecommended: boolean = false,
  ) => {
    const labels: string[] = [];

    if (board.is_special || board.special || board.isSpecial) {
      labels.push('Special');
    }

    if (typeof board.discount_percentage === 'number') {
      labels.push(`${board.discount_percentage}% Less`);
    } else if (board.discount != null) {
      const discountValue = board.discount.toString().trim();
      if (discountValue.length > 0) {
        labels.push(
          discountValue.includes('%')
            ? discountValue
            : `${discountValue}% Less`,
        );
      }
    }

    let locationString = 'Unknown Location';
    if (board.location) {
      if (typeof board.location === 'string') {
        locationString = board.location;
      } else if (
        typeof board.location === 'object' &&
        board.location !== null
      ) {
        const loc = board.location;
        locationString =
          loc.name ||
          (typeof loc.city === 'string' ? loc.city : loc.city?.name || '') ||
          (typeof loc.province === 'string'
            ? loc.province
            : loc.province?.name || '') ||
          (loc.city && loc.province
            ? `${
                typeof loc.city === 'string' ? loc.city : loc.city?.name || ''
              }, ${
                typeof loc.province === 'string'
                  ? loc.province
                  : loc.province?.name || ''
              }`.trim()
            : 'Unknown Location') ||
          'Unknown Location';
      }
    }

    const priceNumber =
      typeof board.price === 'number'
        ? board.price
        : board.price
        ? Number(board.price) || 0
        : 0;
    const primaryMediaUrl =
      Array.isArray(board.media) && board.media.length > 0
        ? board.media[0]?.url
        : null;
    const imageUrl = board.image_url || board.image || primaryMediaUrl;

    return {
      id: board.id?.toString() || 'unknown',
      title: board.title || board.name || 'Untitled Board',
      description: board.description || '',
      location: locationString,
      distance: '1.6 km',
      size:
        board.width && board.height ? `${board.width}x${board.height}` : '12x8',
      price: priceNumber || 0,
      currency: board.currency || 'USD',
      image_url: imageUrl,
      image: imageUrl,
      rating: board.rating ?? board.avg_rating ?? 0,
      reviewCount:
        board.review_count || board.totalRatings || board.reviewCount || 112,
      category: board.category?.name || board.category_name || 'Static',
      isRecommended,
      labels: labels.length > 0 ? labels : undefined,
      discount:
        typeof board.discount_percentage === 'number'
          ? `${board.discount_percentage}% Less`
          : board.discount,
      width: board.width,
      height: board.height,
      media: Array.isArray(board.media) ? board.media : [],
    };
  };

  const specialBoards = Array.isArray((boardFiltersData as any)?.special)
    ? ((boardFiltersData as any)?.special as any[])
    : [];

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
        colors={['#F8F8F8', '#F8F8F8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.fixedHeader}
      >
        <ProfileRow
          profile={profile}
          user={user}
          avatarUrl={avatarUrl}
          isValidAvatarUrl={isValidAvatarUrl}
          selectedCity={selectedCity}
          hasUnreadNotifications={hasUnreadNotifications}
          t={t}
          onProfileClick={handleProfilePress}
          onLocationClick={() =>
            navigation.navigate('SearchLocation', {
              city: selectedCity,
              openLocationModal: true,
            })
          }
          onSearchClick={() =>
            navigation.navigate('SearchLocation', {
              city: selectedCity,
              openFilters: true,
            })
          }
          onNotificationsClick={() => navigation.navigate('Notifications')}
        />
      </LinearGradient>
      {showWelcomePopup && (
        <View style={styles.popupOverlay}>
          <View style={styles.popupContainer}>
            {/* Cancel Button */}
            <TouchableOpacity style={styles.closeBtn} onPress={closePopup}>
              <Ionicons name="close-outline" size={18} color="#fff" />
            </TouchableOpacity>

            {/* SVG Popup Image */}
            <HomeSplash width="100%" height="100%" />
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.bannerContainer}>
          <Image
            source={bannerImages[currentBannerIndex]}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </View>

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
            <Text style={styles.errorText}>{t('errorLoadingBoards')}</Text>
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
            {boardFiltersData?.recommended &&
              boardFiltersData.recommended.length > 0 && (
                <BoardList
                  data={boardFiltersData.recommended.map(board =>
                    convertBoardToBoardItem(board, true),
                  )}
                  onPressDetail={handleDetailPress}
                  heading={t('recommended')}
                  navigation={navigation}
                />
              )}

            {boardFiltersData?.nearest &&
              boardFiltersData.nearest.length > 0 && (
                <BoardList
                  data={boardFiltersData.nearest.map(board =>
                    convertBoardToBoardItem(board),
                  )}
                  onPressDetail={handleDetailPress}
                  heading={t('nearestBoards')}
                  navigation={navigation}
                />
              )}

            {specialBoards.length > 0 && (
              <BoardList
                data={specialBoards.map((board: any) =>
                  convertBoardToBoardItem(board),
                )}
                onPressDetail={handleDetailPress}
                heading="Special"
                navigation={navigation}
              />
            )}

            {(() => {
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
                  {category.groups.map((group: any) => (
                    <BoardList
                      key={`category-${category.id}-group-${group.id}`}
                      data={group.boards.map((board: any) =>
                        convertBoardToBoardItem(board),
                      )}
                      onPressDetail={handleDetailPress}
                      heading={category.name}
                      navigation={navigation}
                    />
                  ))}
                </View>
              ));
            })()}
          </>
        )}
      </ScrollView>

      <DrawerComponent visible={drawerVisible} onClose={handleCloseDrawer} />
      <NoInternet />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  scroll: { flex: 1, backgroundColor: '#F8F8F8' },
  scrollContent: { paddingTop: 0, paddingBottom: 120 },
  fixedHeader: {
    width,
    paddingTop: height * 0.04,
    paddingHorizontal: width * 0.05,
    paddingBottom: 10,
    writingDirection: 'ltr',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 0,
    marginBottom: -8,
    writingDirection: 'ltr',
    flexShrink: 0,
    minHeight: width * 0.13,
    backgroundColor: '#F8F8F8',
  },
  avatar: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: width * 0.085,
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  nameWrap: { flex: 1, paddingHorizontal: 6, minWidth: 0 },
  greeting: { fontSize: 12, color: '#222', fontWeight: '400' },
  name: { fontSize: 15, color: '#222', fontWeight: 'bold', marginTop: -5 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: width * -0.001,
    writingDirection: 'ltr',
    justifyContent: 'flex-end',
    flexShrink: 0,
    width: RIGHT_ACTIONS_WIDTH,
  },
  locationBtnCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: width * 0.03,
    paddingVertical: 6,
    marginRight: width * 0.01,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 32,
    width: 104,
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FDE7FB7D',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  popupContainer: {
    position: 'absolute',
    top: height * 0.3,
    left: width * 0.055,
    width: width * 0.9,
    height: height * 0.45,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: height * 0.007,
    right: width * 0.42,
    zIndex: 10,
    backgroundColor: '#C539A5',
    width: width * 0.067,
    height: width * 0.067,
    borderRadius: width * 0.034,
    justifyContent: 'center',
    alignItems: 'center',
  },

  locationBtnText: {
    color: '#595959',
    fontWeight: '400',
    fontSize: 12,
    marginRight: width * 0.01,
    flex: 1,
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
    position: 'relative',
  },
  bellBtnActive: {
    borderColor: '#C539A5',
  },
  bellIcon: {
    width: width * 0.05,
    height: width * 0.047,
    resizeMode: 'contain',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C539A5',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  FilterIcon: {
    width: width * 0.04,
    height: width * 0.04,
    resizeMode: 'contain',
  },
  bannerContainer: {
    width: width * 0.9,
    height: height * 0.18,
    borderRadius: 15,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#F8F8F8',
    // marginBottom: 10,
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
    marginHorizontal: width * 0.01,
    marginLeft: -10,
    marginBottom: -16,
    marginTop: 15,
  },
  boardTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 30,
    paddingHorizontal: 20,
    marginLeft: 20,
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
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});

export default HomeScreen;
