import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ImageBackground,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useFavoritesBoards} from '../../boards/hooks/useFavorites';
import type {BoardItem} from '../../../components/BoardList';
import BackButton from '../../../components/BackButton';

const {width, height} = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

const LIST_HORIZONTAL_PADDING = width * 0.06;
const CARD_GAP = 16;
const CARD_WIDTH = (width - LIST_HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
const FALLBACK_IMAGE = require('../../../assets/images/bannerBg.png');

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

  const sanitizeUrl = (input?: string | null) => {
    if (!input) {
      return null;
    }
    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    }
    const isAbsolute = /^https?:\/\//i.test(trimmed);
    if (isAbsolute) {
      try {
        return encodeURI(trimmed);
      } catch {
        return trimmed;
      }
    }
    const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `https://adryd-backend-production.up.railway.app${normalizedPath}`;
  };

  const resolveImageSource = (item: BoardItem) => {
    const asRemoteSource = (maybeUrl?: string | null) => {
      const sanitized = sanitizeUrl(maybeUrl);
      return sanitized ? {uri: sanitized} : null;
    };

    if (item.image) {
      if (typeof item.image === 'string') {
        const remote = asRemoteSource(item.image);
        if (remote) {
          return remote;
        }
      } else {
        return item.image;
      }
    }

    if (item.image_url) {
      const remote = asRemoteSource(item.image_url);
      if (remote) {
        return remote;
      }
    }

    if (Array.isArray(item.media)) {
      for (const mediaItem of item.media) {
        if (typeof mediaItem === 'string') {
          const remote = asRemoteSource(mediaItem);
          if (remote) {
            return remote;
          }
        } else if (mediaItem && typeof mediaItem === 'object') {
          const remote = asRemoteSource((mediaItem as any)?.url ?? null);
          if (remote) {
            return remote;
          }
        }
      }
    }

    return FALLBACK_IMAGE;
  };

  const formatSizeTag = (sizeStr?: string) => {
    if (!sizeStr || sizeStr.trim() === '') {
      return 'Size 2ft by 4ft';
    }

    const normalized = sizeStr.trim();
    if (normalized.toLowerCase().includes('size')) {
      return normalized;
    }

    if (normalized.includes('ft') || normalized.includes('by')) {
      return `Size ${normalized}`;
    }

    const parts = normalized.split('x');
    if (parts.length === 2) {
      const widthVal = parseInt(parts[0], 10);
      const heightVal = parseInt(parts[1], 10);
      if (!isNaN(widthVal) && !isNaN(heightVal)) {
        if (widthVal > 20 || heightVal > 20) {
          const widthFt = Math.round(widthVal / 12);
          const heightFt = Math.round(heightVal / 12);
          return `Size ${widthFt}ft by ${heightFt}ft`;
        }
        return `Size ${widthVal}ft by ${heightVal}ft`;
      }
    }

    return `Size ${normalized}`;
  };

  const handleFavouritePress = (item: BoardItem) => {
    navigation.navigate('SingleBoardDetail', {item});
  };

  const renderFavouriteCard = ({
    item,
    index,
  }: {
    item: BoardItem;
    index: number;
  }) => {
    const imageSource = resolveImageSource(item);
    const rawRating =
      typeof item.rating === 'string'
        ? parseFloat(item.rating)
        : typeof item.rating === 'number'
        ? item.rating
        : 0;
    const ratingValue = Number.isFinite(rawRating) ? rawRating : 0;
    const reviewCount = item.reviewCount || 0;
    const category =
      item.category || (item as any).category_name || 'Static';
    const sizeTag = formatSizeTag(item.size);
    const location =
      item.location && item.location !== 'Unknown Location'
        ? item.location
        : undefined;
    const distance =
      item.distance && item.distance !== '1.6 km' ? item.distance : undefined;

    const labels: string[] = [];
    if (item.labels && Array.isArray(item.labels) && item.labels.length > 0) {
      labels.push(...item.labels);
    } else {
      if ((item as any).isSpecial || (item as any).special) {
        labels.push('Special');
      }
      const discountValue =
        item.discount !== undefined && item.discount !== null
          ? String(item.discount)
          : undefined;
      if (discountValue) {
        const discountText = discountValue.includes('%')
          ? discountValue
          : `${discountValue}% Less`;
        labels.push(discountText);
      }
    }

    const isRightColumn = (index + 1) % 2 === 0;

    return (
      <TouchableOpacity
        style={[styles.card, !isRightColumn && styles.cardSpacing]}
        onPress={() => handleFavouritePress(item)}
        activeOpacity={0.9}>
        <ImageBackground
          source={imageSource}
          style={styles.cardImage}
          imageStyle={styles.cardImageBorder}>
          <View style={styles.favoriteBadge}>
            <Ionicons name="heart" size={17} color="#FFFFFF" />
          </View>
          {labels.length > 0 && (
            <View style={styles.labelsContainer}>
              {labels.map((label, labelIndex) => (
                <View key={labelIndex} style={styles.labelTag}>
                  <Text style={styles.labelText} numberOfLines={1}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ImageBackground>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title || 'Untitled Board'}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingValue}>{ratingValue.toFixed(1)}</Text>
            <Ionicons
              name="star"
              size={12}
              color="#FFB800"
              style={styles.ratingIcon}
            />
            {reviewCount > 0 && (
              <Text style={styles.reviewCount}>{`(${reviewCount})`}</Text>
            )}
          </View>

          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>
                {category}
              </Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>
                {sizeTag}
              </Text>
            </View>
            {distance ? (
              <View style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>
                  {distance}
                </Text>
              </View>
            ) : null}
            {location ? (
              <View style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return(
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Favorite</Text>
          <View style={styles.headerSpacer} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading favourites...</Text>
          </View>
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
          <FlatList
            data={favourites}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            renderItem={renderFavouriteCard}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={wp(15)} color="#C539A5" />
            <Text style={styles.emptyTitle}>No Favourites Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start adding boards to your favourites to see them here
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LIST_HORIZONTAL_PADDING,
    paddingTop: hp(5),
    paddingBottom: hp(1.8),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E9E9EF',
  },
  headerTitle: {
    fontSize: width * 0.055,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: 0.2,
  },
  headerSpacer: {
    width: wp(10),
    height: wp(10),
  },
  listContent: {
    paddingHorizontal: LIST_HORIZONTAL_PADDING,
    paddingBottom: hp(8),
    paddingTop: hp(1),
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    marginBottom: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0F0F5',
    overflow: 'hidden',
    shadowColor: '#1F2937',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardSpacing: {
    marginRight: CARD_GAP,
  },
  cardImage: {
    width: '100%',
    height: 140,
    justifyContent: 'flex-start',
  },
  cardImageBorder: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F054A6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F054A6',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  labelsContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
  },
  labelTag: {
    backgroundColor: '#FF7DC5',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cardBody: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  ratingIcon: {
    marginLeft: 6,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 11,
    color: '#6B7280',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 0,
  },
  tag: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
    flexShrink: 0,
  },
  tagText: {
    fontSize: 9,
    color: '#595959',
    fontWeight: '400',
    maxWidth: CARD_WIDTH * 0.85,
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
