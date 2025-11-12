import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Modal,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView from 'react-native-maps';
import { useRateBoard } from '../hooks/useRateBoard';
import { useAuthStore } from '../../../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
// Image assets (placeholder)
const placeholder = require('../../../assets/images/bannerBg.png');
import Upload from '../../../assets/images/Upload.svg';
import Location from '../../../assets/images/location-pinkSVG.svg';
// import Line from '../../assets/icons/line.svg';
import BackButton from '../../../components/BackButton';
import NoInternet from '../../../components/NoInternet';
import { useTranslation } from 'react-i18next';
import { useFavoriteStatus, useToggleFavorite } from '../hooks/useFavorites';
// Removed typed RootStack import to avoid cross-module typing dependency

// Using untyped navigation to avoid cross-module type coupling issues

interface BillboardData {
  title: string;
  location: string;
  subLocation: string;
  size: string;
  about: string;
  rating: string;
  imagesList: any[]; // five images (main + 4 thumbs)
}

interface RatingBreakdownItem {
  label: string;
  count: number;
}

interface Review {
  id: string;
  name: string;
  comment: string;
  rating: number;
  date: string;
}

interface InfoItem {
  key: string;
  label: string;
  value: string;
  multiline?: boolean;
}

const { width, height } = Dimensions.get('window');

// Default billboard data fallback
const billboardData: BillboardData = {
  title: 'Billboard Campaign Ad',
  location: 'Lahore Gulberg',
  subLocation: 'Near 16 Km',
  size: '2ft x 4ft',
  about:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  rating: '4.5',
  imagesList: [placeholder], // Only use placeholder as fallback
};

const defaultRatingBreakdown: RatingBreakdownItem[] = [
  { label: '5', count: 1234 },
  { label: '4', count: 642 },
  { label: '3', count: 302 },
  { label: '2', count: 88 },
  { label: '1', count: 41 },
];

const defaultReviews: Review[] = [
  {
    id: '1',
    name: 'Muhammad Umair',
    comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vehicula orci ut lorem molestie.',
    rating: 5,
    date: '2 days ago',
  },
  {
    id: '2',
    name: 'Ayesha Khan',
    comment: 'Great visibility and footfall. Consectetur adipiscing elit sed do eiusmod tempor.',
    rating: 4,
    date: '1 week ago',
  },
  {
    id: '3',
    name: 'Hamza Tariq',
    comment: 'Solid placement though traffic can be dense at peak hours.',
    rating: 4,
    date: '3 weeks ago',
  },
];

// Function to render star icons based on rating
const renderStars = (rating: string | number, size = 11, color = '#FBBC05') => {
  const stars = [];
  const parsed = typeof rating === 'string' ? parseFloat(rating) : rating;
  const safeRating = Number.isFinite(parsed) ? parsed : 0;
  const fullStars = Math.floor(safeRating);
  const halfStar = safeRating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Ionicons key={`full-${i}`} name="star" size={size} color={color} />);
  }
  if (halfStar) {
    stars.push(<Ionicons key="half" name="star-half" size={size} color={color} />);
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={size} color={color} />);
  }

  return stars;
};

const SingleBoardDetail: React.FC = () => {
  const { t } = useTranslation('boards');
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = (route.params as { item: any }) || { item: null };
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();

  const rawBoardId = Number(item?.id);
  const boardId = Number.isFinite(rawBoardId) && rawBoardId > 0 ? rawBoardId : undefined;

  const [isFavorite, setIsFavorite] = useState<boolean>(() =>
    typeof item?.is_favorite === 'boolean' ? item.is_favorite : false,
  );

  const {
    data: favoriteStatusData,
    isLoading: isFavoriteLoading,
  } = useFavoriteStatus(boardId);

  const toggleFavoriteMutation = useToggleFavorite(boardId);
  const isFavoritePending = isFavoriteLoading || toggleFavoriteMutation.isPending;
  const canToggleFavorite = typeof boardId === 'number' && boardId > 0;
  
  // Debug log to help troubleshoot
  console.log('SingleBoardDetail - route.params:', route.params);
  console.log('SingleBoardDetail - item:', item);
  
  const extractMediaSources = (board: any) => {
    if (Array.isArray(board?.media) && board.media.length > 0) {
      const sortedMedia = [...board.media].sort((a, b) => {
        const orderA = typeof a?.sort_order === 'number' ? a.sort_order : 0;
        const orderB = typeof b?.sort_order === 'number' ? b.sort_order : 0;
        return orderA - orderB;
      });
      return sortedMedia
        .map(entry => {
          if (typeof entry?.url === 'string' && entry.url.trim().length > 0) {
            return { uri: entry.url };
          }
          return null;
        })
        .filter(Boolean);
    }
    if (Array.isArray(board?.images) && board.images.length > 0) {
      return board.images
        .filter((src: string | undefined) => typeof src === 'string' && src.trim().length > 0)
        .map((src: string) => ({ uri: src.startsWith('http') ? src : `https://adryd-backend-production.up.railway.app${src}` }));
    }
    if (board?.image_url) {
      const url = board.image_url.toString();
      return [
        url.startsWith('http')
          ? { uri: url }
          : { uri: `https://adryd-backend-production.up.railway.app${url}` },
      ];
    }
    if (board?.image) {
      const source = board.image;
      if (typeof source === 'string') {
        return [
          source.startsWith('http')
            ? { uri: source }
            : { uri: `https://adryd-backend-production.up.railway.app${source}` },
        ];
      }
      return [source];
    }
    return [];
  };

  // Initialize billboard data with item from navigation or fallback to default
  const [billboard, setBillboard] = useState<BillboardData>(() => {
    if (item && typeof item === 'object') {
      const mediaSources = extractMediaSources(item);
      return {
        title: item.title || 'Billboard Campaign Ad',
        location: item.location || 'Lahore Gulberg',
        subLocation: item.distance || 'Near 16 Km',
        size: item.size || '2ft x 4ft',
        about: item.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        rating: (item.rating ?? 0).toString(),
        imagesList: mediaSources.length > 0 ? mediaSources : [placeholder],
      };
    }
    return billboardData;
  });
  
  // Main image index (0..4)
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  
  // Rating modal state
  const [isRatingModalVisible, setIsRatingModalVisible] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>('');
  
  // Rating mutation hook
  const rateBoardMutation = useRateBoard(parseInt(item?.id) || 0);
  
  // Debug log for board ID
  console.log('SingleBoardDetail - Board ID:', item?.id, 'Parsed:', parseInt(item?.id) || 0);
  
  // Update rating when item changes (only from API data)
  useEffect(() => {
    const newRating = (item?.rating ?? 0).toString();
    setBillboard(prev => ({
      ...prev,
      rating: newRating,
    }));
  }, [item?.rating]);

  useEffect(() => {
    if (typeof item?.is_favorite === 'boolean') {
      setIsFavorite(item.is_favorite);
    }
  }, [item?.is_favorite]);

  useEffect(() => {
    if (favoriteStatusData && typeof favoriteStatusData.is_favorite === 'boolean') {
      setIsFavorite(favoriteStatusData.is_favorite);
    }
  }, [favoriteStatusData]);

  // Normalize to exactly 5 images (use first five, or pad with placeholders)
  const images = useMemo<ImageSourcePropType[]>(() => {
    // If we have images from the API data, use those
    const mediaSources = extractMediaSources(item);
    if (mediaSources.length > 0) {
      const list = mediaSources.slice(0, 5);
      while (list.length < 5) list.push(placeholder);
      return list;
    }
    
    // Fallback to billboard imagesList
    const base = Array.isArray(billboard.imagesList) ? billboard.imagesList.slice(0, 5) : [];
    const list = [...base];
    while (list.length < 5) list.push(placeholder);
    return list;
  }, [billboard.imagesList, item?.image_url]);

  // Guarded setter to avoid out-of-bounds issues
  const selectImageIndex = (idx: number) => {
    if (Number.isInteger(idx) && idx >= 0 && idx < images.length) {
      setSelectedIndex(idx);
    }
  };

  const highlightTags = useMemo<string[]>(() => {
    if (Array.isArray(item?.categories) && item.categories.length > 0) {
      return item.categories.slice(0, 5);
    }
    return ['Recommended', 'Near', 'Special', '20% Less', 'New'];
  }, [item?.categories]);

  const formatDateLabel = (value?: string) => {
    if (!value) return 'Recently';
    try {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return value;
    } catch {
      return value;
    }
  };

  const ratingBreakdown = useMemo<RatingBreakdownItem[]>(() => {
    if (Array.isArray((item as any)?.rating_breakdown)) {
      return (item as any).rating_breakdown
        .slice(0, 5)
        .map((entry: any, index: number) => ({
          label: `${5 - index}`,
          count: Number(entry?.count) || 0,
        }));
    }
    return defaultRatingBreakdown;
  }, [item]);

  const totalReviews = useMemo(
    () => ratingBreakdown.reduce((sum, entry) => sum + entry.count, 0),
    [ratingBreakdown]
  );

  const averageRating = useMemo(() => {
    const parsedRating = parseFloat(billboard.rating);
    return Number.isFinite(parsedRating) ? parsedRating : 0;
  }, [billboard.rating]);

  const reviews = useMemo<Review[]>(() => {
    if (Array.isArray((item as any)?.reviews) && (item as any).reviews.length > 0) {
      return (item as any).reviews.map((review: any, index: number) => ({
        id: review?.id?.toString() ?? `review-${index}`,
        name: review?.user_name || review?.user?.name || 'Anonymous',
        comment: review?.comment || '',
        rating: Number(review?.rating) || 0,
        date: formatDateLabel(review?.created_at),
      }));
    }
    return defaultReviews;
  }, [item]);

  const infoItems = useMemo<InfoItem[]>(() => {
    const resolve = (value: string | number | null | undefined, fallback: string) =>
      value !== undefined && value !== null && String(value).trim().length > 0
        ? String(value).trim()
        : fallback;

    const resolvedCategory = resolve(
      (item as any)?.category_name ?? (item as any)?.category ?? (item as any)?.board_category,
      t('defaultCategory', { defaultValue: 'Static' })
    );

    const resolvedType = resolve(
      (item as any)?.type ?? (item as any)?.board_type,
      t('defaultType', { defaultValue: 'Billboard' })
    );

    const resolvedArea = resolve(
      (item as any)?.area,
      billboard.subLocation || t('defaultArea', { defaultValue: 'City Center' })
    );

    const resolvedNearby = resolve(
      (item as any)?.distance ?? billboard.subLocation,
      t('defaultNearby', { defaultValue: 'Within city' })
    );

    return [
      {
        key: 'name',
        label: t('nameLabel', { defaultValue: 'Name' }),
        value: resolve(billboard.title, t('defaultName', { defaultValue: 'Billboard' })),
      },
      {
        key: 'size',
        label: t('size'),
        value: resolve(billboard.size, '—'),
      },
      {
        key: 'category',
        label: t('categoryLabel', { defaultValue: 'Category' }),
        value: resolvedCategory,
      },
      {
        key: 'type',
        label: t('typeLabel', { defaultValue: 'Type' }),
        value: resolvedType,
      },
      {
        key: 'location',
        label: t('location'),
        value: resolve(billboard.location, '—'),
      },
      {
        key: 'area',
        label: t('areaLabel', { defaultValue: 'Area' }),
        value: resolvedArea,
      },
      // {
      //   key: 'nearby',
      //   label: t('nearbyLabel', { defaultValue: 'Nearby' }),
      //   value: resolvedNearby,
      // },
      {
        key: 'about',
        label: t('about'),
        value: resolve(billboard.about, t('defaultAbout', { defaultValue: 'No description available.' })),
        multiline: true,
      },
    ];
  }, [billboard.about, billboard.location, billboard.size, billboard.subLocation, billboard.title, item, t]);

  // Rating modal functions
  const openRatingModal = () => {
    setIsRatingModalVisible(true);
  };

  const closeRatingModal = () => {
    setIsRatingModalVisible(false);
    setUserRating(0);
    setRatingComment('');
  };

  const handleStarPress = (rating: number) => {
    setUserRating(rating);
  };

  const handleSubmitRating = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to submit a rating');
      return;
    }

    if (userRating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    console.log('Submitting rating:', {
      boardId: item?.id,
      userId: user.id,
      rating: userRating,
      comment: ratingComment.trim() || undefined,
    });

    try {
      await rateBoardMutation.mutateAsync({
        user_id: user.id,
        rating: userRating,
        comment: ratingComment.trim() || undefined,
      });

      // Update the local rating display immediately
      setBillboard(prev => {
        const updated = {
          ...prev,
          rating: userRating.toString(),
        };
        console.log('SingleBoardDetail - Updated local rating:', updated.rating);
        return updated;
      });

      // Alert.alert('Success', 'Rating submitted successfully!');
      closeRatingModal();
    } catch (error) {
      console.error('Error submitting rating:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        boardId: item?.id,
        userId: user.id,
        rating: userRating,
      });
      Alert.alert('Error', `Failed to submit rating: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleToggleFavorite = async () => {
    if (!canToggleFavorite || isFavoritePending) {
      return;
    }

    if (!user?.id) {
      Alert.alert('Login Required', 'Please log in to manage favorites.');
      return;
    }

    try {
      const result = await toggleFavoriteMutation.mutateAsync();
      if (result && typeof result.is_favorite === 'boolean') {
        setIsFavorite(result.is_favorite);
      } else {
        setIsFavorite(prev => !prev);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Unable to update favorite. Please try again.');
    }
  };

  // Main image is controlled via thumbnail taps only to avoid accidental cycling

  const renderRatingCard = (variant: 'page' | 'modal' = 'page') => (
    <View style={[styles.ratingCard, variant === 'modal' && styles.ratingCardModal]}>
      <Text style={styles.ratingCardTitle}>Rate this Board</Text>
      <Text style={styles.ratingCardSubtitle}>
        Share your experience and help advertisers choose with confidence.
      </Text>

      <View style={styles.ratingStarRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            style={styles.ratingStarButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name={star <= userRating ? 'star' : 'star-outline'}
              size={32}
              color={star <= userRating ? '#FFC107' : '#E5E7EB'}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingHint}>Tap the stars and leave a short comment about your experience.</Text>

      <View style={styles.commentRow}>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment"
          placeholderTextColor="#9CA3AF"
          value={ratingComment}
          onChangeText={setRatingComment}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (userRating === 0 || rateBoardMutation.isPending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSubmitRating}
          disabled={userRating === 0 || rateBoardMutation.isPending}
          activeOpacity={0.9}
        >
          {rateBoardMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.ratingSummaryRow}>
        <View style={styles.ratingSummaryLeft}>
          <Text style={styles.ratingSummaryNumber}>{averageRating.toFixed(1)}</Text>
          <View style={styles.ratingSummaryStars}>{renderStars(averageRating, 16)}</View>
          <Text style={styles.ratingSummaryCaption}>{totalReviews.toLocaleString()} reviews</Text>
        </View>

        <View style={styles.ratingProgressList}>
          {ratingBreakdown.map(entry => {
            const percentage = totalReviews ? (entry.count / totalReviews) * 100 : 0;
            return (
              <View key={`rating-${entry.label}`} style={styles.ratingProgressRow}>
                <Text style={styles.ratingProgressLabel}>{entry.label}</Text>
                <View style={styles.ratingProgressBar}>
                  <View style={[styles.ratingProgressFill, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.ratingProgressCount}>{entry.count}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroImageWrapper}>
            <ImageBackground
              source={images[selectedIndex]}
              style={styles.heroImage}
              imageStyle={styles.heroImageStyle}
            >
              <View style={styles.heroTopBar}>
                <BackButton style={styles.heroBackButton} iconColor="#1F2937" />
                <View style={styles.heroActions}>
                  <TouchableOpacity style={styles.actionIcon}>
                    <Upload width={20} height={20} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionIcon, isFavorite && styles.favoriteActionIcon]}
                    onPress={handleToggleFavorite}
                    activeOpacity={0.85}
                    disabled={!canToggleFavorite || isFavoritePending}
                  >
                    {isFavoritePending ? (
                      <ActivityIndicator size="small" color="#C539A5" />
                    ) : (
                      <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={22}
                        color={isFavorite ? '#C539A5' : '#9CA3AF'}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

            <View style={styles.thumbnailTray}>
              <View style={styles.thumbnailStrip}>
                {images.map((src: ImageSourcePropType, idx: number) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <TouchableOpacity
                      key={`thumb-${idx}`}
                      onPress={() => selectImageIndex(idx)}
                      style={[styles.thumbnailButton, isSelected && styles.thumbnailButtonActive]}
                      activeOpacity={0.85}
                    >
                      <Image source={src} style={styles.thumbnailImage} resizeMode="cover" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            </ImageBackground>
          </View>
        </View>

        <View style={styles.bodyWrapper}>
          <View style={styles.detailHeader}>
            <View style={styles.detailTitleBlock}>
              <Text style={styles.title}>{billboard.title}</Text>
            </View>

            <TouchableOpacity style={styles.ratingLabel}  activeOpacity={0.85}>
              <Ionicons name="star" size={16} color="#FBBF24" style={styles.ratingIcon} />
              <Text style={styles.ratingLabelValue}>{averageRating.toFixed(1)}</Text>
              <Text style={styles.ratingLabelMeta}>({totalReviews.toLocaleString()})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tagRow}>
            {highlightTags.map((tag, index) => {
              const isPrimary = index === 3; // highlight "20% Less"
              return (
                <View
                  key={tag}
                  style={[styles.tagChip, isPrimary && styles.tagChipHighlighted]}
                >
                  <Text style={[styles.tagText, isPrimary && styles.tagTextLight]}>{tag}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.detailCard}>
            {infoItems.map((info, index) => (
              <React.Fragment key={info.key}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{info.label}</Text>
                  <Text style={info.multiline ? styles.infoValueMultiline : styles.infoValue}>
                    {info.value}
                  </Text>
                </View>
                {index !== infoItems.length - 1 && <View style={styles.infoDivider} />}
              </React.Fragment>
            ))}
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>{t('location')}</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => (navigation as any).navigate('CurrentLocation')}
              style={styles.mapCard}
            >
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: 31.582,
                  longitude: 74.329,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation
                showsMyLocationButton={false}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectButtonText}>{t('letsConnect')}</Text>
          </TouchableOpacity>

          {renderRatingCard()}

          <View style={styles.reviewSection}>
            <Text style={styles.sectionHeading}>Recent Reviews</Text>
            {reviews.length === 0 ? (
              <Text style={styles.emptyReviewText}>There are no reviews yet. Be the first to share your feedback.</Text>
            ) : (
              reviews.map(review => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>
                        {review.name ? review.name.charAt(0).toUpperCase() : 'A'}
                      </Text>
                    </View>
                    <View style={styles.reviewMeta}>
                      <Text style={styles.reviewName}>{review.name}</Text>
                      <View style={styles.reviewMetaRow}>
                        <View style={styles.reviewStars}>{renderStars(review.rating, 14)}</View>
                        <Text style={styles.reviewDate}>{review.date}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isRatingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeRatingModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeRatingModal}>
              <Ionicons name="close" size={22} color="#1F2937" />
            </TouchableOpacity>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {renderRatingCard('modal')}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <NoInternet />
    </View>
  );
};

export default SingleBoardDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FB',
  },
  scrollContent: {
    paddingBottom: 36,
  },
  heroSection: {
    width: '100%',
    height: height * 0.43,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  heroImageWrapper: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  heroImage: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  heroImageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  heroBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.6)',
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  favoriteActionIcon: {
    borderColor: '#C539A5',
    backgroundColor: 'rgba(197, 57, 165, 0.12)',
  },
  thumbnailTray: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
    alignItems: 'center',
  },
  thumbnailStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 8,
    overflow: 'hidden',
  },
  thumbnailButton: {
    width: 56,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#FFFFFF',
  },
  thumbnailButtonActive: {
    borderColor: '#C539A5',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  bodyWrapper: {
    marginTop: -44,
    paddingHorizontal: 22,
    paddingTop: 72,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#ECEFF5',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailTitleBlock: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    color: '#C539A5',
    fontSize: 24,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6B7280',
  },
  subLocationText: {
    marginTop: 4,
    fontSize: 14,
    color: '#9CA3AF',
  },
  ratingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F5F5F5',
    borderRadius: 999,
    borderWidth: 1,
  },
  ratingIcon: {
    marginRight: 6,
  },
  ratingLabelValue: {
    fontSize: 16,
    color: '#1F2937',
  },
  ratingLabelMeta: {
    marginLeft: 6,
    fontSize: 12,
    color: '#6B7280',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 18,
    marginRight: -8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F2BCE9',
    marginRight: 8,
    marginBottom: 6,
    minWidth: 90,
    alignItems: 'center',
  },
  tagChipHighlighted: {
    backgroundColor: '#C539A5',
    borderRadius: 999,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C539A5',
    textTransform: 'uppercase',
  },
  tagTextLight: {
    color: '#FDF2F8',
  },
  infoRow: {
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoValueMultiline: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  sectionBlock: {
    marginTop: 26,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  aboutText: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  mapCard: {
    marginTop: 16,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  map: {
    width: '100%',
    height: 180,
  },
  connectButton: {
    marginTop: 28,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#C539A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 22,
    marginTop: 32,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E6E1F4',
  },
  ratingCardModal: {
    marginTop: 0,
    marginBottom: 8,
    borderWidth: 0,
    borderColor: 'transparent',
    elevation: 0,
    shadowColor: 'transparent',
  },
  ratingCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  ratingCardSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
  },
  ratingStarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  ratingStarButton: {
    padding: 6,
  },
  ratingHint: {
    marginTop: 12,
    fontSize: 13,
    color: '#9CA3AF',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 18,
    padding: 4,
  },
  commentInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 64,
    maxHeight: 120,
    color: '#111827',
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#C539A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  ratingSummaryRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  ratingSummaryLeft: {
    alignItems: 'center',
    paddingRight: 24,
  },
  ratingSummaryNumber: {
    fontSize: 46,
    fontWeight: '700',
    color: '#C539A5',
  },
  ratingSummaryStars: {
    flexDirection: 'row',
    marginTop: 4,
  },
  ratingSummaryCaption: {
    marginTop: 6,
    fontSize: 12,
    color: '#9CA3AF',
  },
  ratingProgressList: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingProgressLabel: {
    width: 18,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  ratingProgressBar: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#F3E8FF',
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  ratingProgressFill: {
    height: '100%',
    backgroundColor: '#C539A5',
  },
  ratingProgressCount: {
    width: 48,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  reviewSection: {
    marginBottom: 12,
  },
  emptyReviewText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginTop: 18,
    shadowColor: '#3F3D56',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7C3AED',
  },
  reviewMeta: {
    flex: 1,
    marginLeft: 12,
  },
  reviewName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  reviewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    marginRight: 12,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewComment: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: Math.min(width * 0.92, 420),
    maxHeight: height * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 12,
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 10,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalScrollContent: {
    paddingBottom: 12,
  },
});


