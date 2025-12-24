import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Loader from '../../../components/Loader';
import {useFavoritesBoards} from '../../boards/hooks/useFavorites';
import type {BoardItem} from '../../../components/BoardList';
import BoardList from '../../../components/BoardList';
import Header from '../../../components/Header';
import FavouritesEmptyState from '../components/FavouritesEmptyState';

const {width, height} = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

interface FavouritesScreenProps {
  navigation: any;
}

const FavouritesScreen: React.FC<FavouritesScreenProps> = ({navigation}) => {
  const page = 1;
  const limit = 10;
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: favoritesData,
    isLoading,
    error,
    refetch,
  } = useFavoritesBoards(page, limit);

  const convertToBoardItem = (board: any): BoardItem => ({
    id: board.id?.toString() || 'unknown',
    title: board.title || 'Untitled Board',
    description: board.description || '',
    location: board.location || 'Unknown Location',
    distance: '1.6 km',
    size: board.size || '12x8',
    price: board.price || 0,
    currency: board.currency || 'USD',
    image_url: board.image || null,
    rating: board.rating ?? board.avg_rating ?? 0,
    reviewCount: board.review_count || board.totalRatings || 0,
    category: board.category?.name || board.category_name,
    labels: board.labels,
    discount: board.discount,
    media: Array.isArray(board.media) ? board.media : [],
  });

  const favourites = useMemo(
    () => (favoritesData ? favoritesData.map(convertToBoardItem) : []),
    [favoritesData],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Error refreshing favourites:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFavouritePress = (item: BoardItem) => {
    navigation.navigate('SingleBoardDetail', {item});
  };

  const handleFindFavorites = () => {
    // Navigate to home or boards screen to find favorites
    navigation.navigate('BottomTab' as never, { tab: 'Home' } as never);
  };

  return(
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.content}>

        {/* Only show Header when there are favourites or loading/error */}
        {!isLoading && !error && favourites.length > 0 && (
        <Header
           title="Favourites"
           onBackPress={() => navigation.goBack()}
           showBackButton={false}
           showRightIcon={false}
         />
        )}

        {isLoading ? (
          <Loader />
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={wp(15)}
              color="#ff6b6b"
            />
            <Text style={styles.emptyTitle}>Error Loading Favourites</Text>
            <Text style={styles.emptySubtitle}>
              {error instanceof Error ? error.message : 'Something went wrong'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : favourites.length > 0 ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#C538A5"
              />
            }>
            <View style={styles.resultsSection}>
              <BoardList
                data={favourites}
                heading=""
                showSeeAll={false}
                numColumns={2}
                navigation={navigation}
                onPressDetail={handleFavouritePress}
                useWiderCards={true}
                showFavoriteBadge={false}
              />
            </View>
          </ScrollView>
        ) : (
          <FavouritesEmptyState onFindFavorites={handleFindFavorites} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(12),
  },
  resultsSection: {
    paddingBottom: hp(2),
    paddingLeft: wp(1),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  loadingText: {
    fontSize: wp(4),
    color: '#C539A5',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(15),
    paddingHorizontal: wp(10),
  },
  emptyTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#333',
    marginTop: hp(2),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: wp(3.5),
    color: '#666',
    marginTop: hp(1),
    textAlign: 'center',
    lineHeight: wp(5),
  },
  retryButton: {
    backgroundColor: '#C539A5',
    paddingHorizontal: wp(8),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    marginTop: hp(2),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: '600',
  },
});

export default FavouritesScreen;
