import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  StatusBar,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../../../components/PrimaryButton';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';
import MapView from 'react-native-maps';
import { useRateBoard } from '../hooks/useRateBoard';
import { useBoardRatings } from '../hooks/useBoardRatings';
import { useAuthStore } from '../../../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import {
  Images,
  UploadIcon,
  HeartIcon,
} from '../../../assets/images';
// Image assets (placeholder)
const placeholder = Images.bannerBg;
// import Line from '../../assets/icons/line.svg';
import BackButton from '../../../components/BackButton';
import NoInternet from '../../../components/NoInternet';
import { useTranslation } from 'react-i18next';
import { useFavoriteStatus, useToggleFavorite } from '../hooks/useFavorites';
import { useCampaignFlowStore } from '../../../store/campaignFlowStore';
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
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute();
  const routeItem = (route.params as { item: any })?.item || null;

  const [item, setItem] = useState<any>(routeItem);

  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();
  
  const setSelectedBoard = useCampaignFlowStore(s => s.setSelectedBoard);
  const selectedCompany = useCampaignFlowStore(s => s.selectedCompany);
  const selectedChoice = useCampaignFlowStore(s => s.selectedChoice);

  const rawBoardId = Number(item?.id);
  const boardId = Number.isFinite(rawBoardId) && rawBoardId > 0 ? rawBoardId : undefined;

  useEffect(() => {
    if (routeItem) {
      setItem(routeItem);
    }
  }, [routeItem]);

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

  // Fetch board ratings
  const {
    data: fetchedRatings,
    refetch: refetchRatings,
  } = useBoardRatings(boardId || 0, 1, 100);

  useFocusEffect(
    useCallback(() => {
      if (boardId) {
        console.log('SingleBoardDetail - Screen focused, refetching ratings for board:', boardId);
        refetchRatings();
      }
    }, [boardId, refetchRatings])
  );

  useEffect(() => {
    if (!item) return;

    if (fetchedRatings && Array.isArray(fetchedRatings)) {
      console.log('SingleBoardDetail - Merging fetched ratings:', fetchedRatings.length);
      setItem((prevItem: any) => {
        if (!prevItem) return prevItem;

        if (fetchedRatings.length > 0) {
          const transformedRatings = fetchedRatings.map((rating: any) => ({
            id: rating.id,
            user_id: rating.user?.id,
            board_id: prevItem.id,
            rating: rating.stars || rating.rating || 0,
            comment: rating.comment || '',
            created_at: rating.createdAt || rating.created_at || new Date().toISOString(),
            user: {
              id: rating.user?.id,
              full_name: rating.user?.name || rating.user?.full_name || 'Anonymous',
              avatar_url: rating.user?.avatar || rating.user?.avatar_url || null,
            },
          }));

          const mergedRatings = transformedRatings;

          const totalRatings = mergedRatings.length;
          const sumRatings = mergedRatings.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
          const newAvgRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

          return {
            ...prevItem,
            ratings: mergedRatings,
            avg_rating: newAvgRating,
            total_ratings: totalRatings,
          };
        } else {
          // If no ratings found, ensure ratings array is empty
          return {
            ...prevItem,
            ratings: [],
            avg_rating: 0,
            total_ratings: 0,
          };
        }
      });
    }
  }, [fetchedRatings]);

  // Debug log to help troubleshoot
  console.log('SingleBoardDetail - route.params:', route.params);
  console.log('SingleBoardDetail - item:', item);
  console.log('SingleBoardDetail - fetchedRatings:', fetchedRatings?.length || 0);

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
      const ratingValue = typeof (item as any)?.avg_rating === 'number'
        ? (item as any).avg_rating
        : (item.rating ?? 0);
      const locationName = typeof (item as any)?.location === 'object'
        ? ((item as any).location?.name || 'Lahore Gulberg')
        : (item.location || 'Lahore Gulberg');

      return {
        title: item.title || 'Billboard Campaign Ad',
        location: locationName,
        subLocation: item.distance || 'Near 16 Km',
        size: item.size || '2ft x 4ft',
        about: item.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        rating: ratingValue.toString(),
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
    // Use avg_rating from API if available, otherwise fallback to rating
    const newRating = typeof (item as any)?.avg_rating === 'number'
      ? (item as any).avg_rating.toString()
      : (item?.rating ?? 0).toString();
    setBillboard(prev => ({
      ...prev,
      rating: newRating,
    }));
  }, [(item as any)?.avg_rating, item?.rating]);

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
    return ['Recommended', 'New', 'Special', '20% Less',];
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

  // Calculate rating breakdown from actual ratings array
  const ratingBreakdown = useMemo<RatingBreakdownItem[]>(() => {
    if (Array.isArray((item as any)?.ratings) && (item as any).ratings.length > 0) {
      const counts = [0, 0, 0, 0, 0]; // [5-star, 4-star, 3-star, 2-star, 1-star]
      (item as any).ratings.forEach((rating: any) => {
        const starLevel = Number(rating?.rating) || 0;
        if (starLevel >= 1 && starLevel <= 5) {
          counts[5 - starLevel] += 1; // 5-star is index 0, 1-star is index 4
        }
      });

      return counts.map((count, index) => ({
        label: `${5 - index}`,
        count: count,
      }));
    }

    // Fallback to rating_breakdown if available
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

  const totalReviews = useMemo(() => {
    // Use total_ratings from API if available
    if (typeof (item as any)?.total_ratings === 'number') {
      return (item as any).total_ratings;
    }
    // Otherwise calculate from ratings array
    if (Array.isArray((item as any)?.ratings)) {
      return (item as any).ratings.length;
    }
    // Fallback to calculating from breakdown
    return ratingBreakdown.reduce((sum, entry) => sum + entry.count, 0);
  }, [item, ratingBreakdown]);

  const averageRating = useMemo(() => {
    // Use avg_rating from API if available
    if (typeof (item as any)?.avg_rating === 'number') {
      return (item as any).avg_rating;
    }
    // Fallback to calculating from ratings array
    if (Array.isArray((item as any)?.ratings) && (item as any).ratings.length > 0) {
      const sum = (item as any).ratings.reduce((acc: number, rating: any) => {
        return acc + (Number(rating?.rating) || 0);
      }, 0);
      return sum / (item as any).ratings.length;
    }
    // Fallback to billboard.rating
    const parsedRating = parseFloat(billboard.rating);
    return Number.isFinite(parsedRating) ? parsedRating : 0;
  }, [item, billboard.rating]);

  const reviews = useMemo<Review[]>(() => {
    // Always use ratings array from API (this is the correct field name from the API response)
    if (Array.isArray((item as any)?.ratings)) {
      if ((item as any).ratings.length > 0) {
        // Sort by created_at descending (most recent first)
        const sortedRatings = [...(item as any).ratings].sort((a: any, b: any) => {
          const dateA = a?.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b?.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA; // Descending order (newest first)
        });

        return sortedRatings.map((rating: any, index: number) => ({
          id: rating?.id?.toString() ?? `rating-${index}`,
          name: rating?.user?.full_name || rating?.user_name || 'Anonymous',
          comment: rating?.comment || '',
          rating: Number(rating?.rating) || 0,
          date: formatDateLabel(rating?.created_at),
        }));
      }
      // Return empty array if ratings array exists but is empty
      return [];
    }

    // Fallback to reviews if ratings not available (for backward compatibility)
    if (Array.isArray((item as any)?.reviews) && (item as any).reviews.length > 0) {
      return (item as any).reviews.map((review: any, index: number) => ({
        id: review?.id?.toString() ?? `review-${index}`,
        name: review?.user_name || review?.user?.name || 'Anonymous',
        comment: review?.comment || '',
        rating: Number(review?.rating) || 0,
        date: formatDateLabel(review?.created_at),
      }));
    }

    // Return empty array instead of defaultReviews to ensure dynamic behavior
    return [];
  }, [item]);

  const infoItems = useMemo<InfoItem[]>(() => {
    const resolve = (value: string | number | null | undefined, fallback: string) =>
      value !== undefined && value !== null && String(value).trim().length > 0
        ? String(value).trim()
        : fallback;

    // Handle nested category object from API
    const categoryName = typeof (item as any)?.category === 'object'
      ? ((item as any).category?.name || null)
      : ((item as any)?.category_name ?? (item as any)?.category ?? (item as any)?.board_category);
    const resolvedCategory = resolve(
      categoryName,
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

      // Refetch ratings to get the updated list from server
      console.log('SingleBoardDetail - Rating submitted, refetching ratings...');
      await refetchRatings();

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
       <View style={{width: '100%', justifyContent: "center", alignItems: "center"}}>
            <Text style={[styles.ratingTitle, {textAlign: 'center', width: '100%',fontSize: 18}]}>Rate this Static Wall Panels</Text>
          </View>
      <Text style={styles.ratingHint}>Rate this Backer and tell others what you think</Text>

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

      <View style={styles.commentRow}>
        <TextInput
          placeholder="Write a comment"
          placeholderTextColor="#9CA3AF"
          value={ratingComment}
          onChangeText={setRatingComment}
          multiline={true}
          numberOfLines={3}
          style={styles.commentInput}
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
                <BackButton  />
                <View style={styles.heroActions}>
                  <TouchableOpacity style={styles.actionIcon}>
                  <Ionicons name="share-social-outline" size={20} color="#70737D" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionIcon, isFavorite && styles.favoriteActionIcon]}
                    onPress={handleToggleFavorite}
                    activeOpacity={0.85}
                    disabled={!canToggleFavorite || isFavoritePending}
                  >
                 
                      <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={22}
                        color={isFavorite ? '#C539A5' : '#70737D'}
                      />
                    
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

            <TouchableOpacity style={styles.ratingLabel} activeOpacity={0.85}>
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

                {index !== infoItems.length - 0 && <View style={styles.infoDivider} />}


              </React.Fragment>
            ))}

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

          <PrimaryButton
            title={t('letsConnect')}
            onPress={() => {
              console.log('Let\'s Connect pressed with boardData:', item);
              console.log('Current flow state:', { selectedCompany, selectedChoice });
              
              try {
                setSelectedBoard(item);
                
                if (selectedCompany && selectedChoice === 'business') {
                  console.log('Company already selected, navigating directly to campaign form');
                  const companyId = typeof selectedCompany.id === 'string' 
                    ? parseInt(selectedCompany.id) 
                    : selectedCompany.id;
                  
                  navigation.navigate('AdvertismentCreateScreen', { 
                    flow: 'business',
                    companyId: companyId,
                    boardData: item 
                  });
                } else {
                  console.log('No company selected, navigating to ChooseOptionScreen');
                  navigation.navigate('ChooseOptionScreen', { boardData: item });
                }
              } catch (error) {
                console.error('Navigation error:', error);
                Alert.alert('Error', 'Failed to navigate. Please try again.');
              }
            }}
            buttonStyle={{
              width: 250,
              height: 50,
              borderRadius: 12,
              alignSelf: "center",
              marginBottom: 12
            }}
            textStyle={{
              fontSize: 14,
              fontWeight: "500",
              color: "#F8F8F8"
            }}
          />

         

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
                  {review.comment ? (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  ) : null}
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

// Calculate status bar height for top padding
const statusBarHeight = StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 24);
const heroTopBarPaddingTop = statusBarHeight + 10;

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
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  heroImageWrapper: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,  
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
    paddingTop: heroTopBarPaddingTop,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    position:"absolute",
    top:22,
    right:22,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  favoriteActionIcon: {
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  thumbnailTray: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 5,
    alignItems: 'center',
  },
  thumbnailStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 2,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 8,
    overflow: 'hidden',
  },
  thumbnailButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 3,
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
    marginBottom: 10,
  },
  detailTitleBlock: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    color: '#18181B',
    fontSize: 20,
    fontWeight: '600',
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
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  ratingIcon: {
    marginRight: 6,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#18181B",
  },
  ratingLabelValue: {
    fontSize: 10,
    color: '#333333',
  },
  ratingLabelMeta: {
    marginLeft: 6,
    fontSize: 10,
    color: '#70737D',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -8,
  },
  tagChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: '#F2BCE9',
    marginRight: 6,
    marginBottom: 6,
    minWidth: 37,
    alignItems: 'center',
  },
  tagChipHighlighted: {
    backgroundColor: '#C539A5',
    borderRadius: 5,
  },
  ratingSubTitle: {
    fontSize: 10,
    fontWeight: "400",
    color: "#70737D",
  },
  tagText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#C539A5',
  },
  tagTextLight: {
    color: '#F8F8F8',
  },
  infoRow: {
    alignItems: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#70737D',
    letterSpacing: 0.4,
  },
  infoValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '400',
    color: '#18181B',
  },
  infoValueMultiline: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 15,
    color: '#18181B',
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 5,
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
    marginTop: 20,
    borderRadius: 16.76,
    overflow: 'hidden',
    borderWidth: 1.3,
    borderColor: '#E5E7EB',
  },
  map: {
    width: 310,
    height: 156,
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
    marginTop: 10,
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
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
    alignSelf: "center",
  },
  ratingStarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 10,
  },
  ratingStarButton: {
    padding: 6,
  },
  ratingHint: {
    fontSize: 12,
    fontWeight:"400",
    marginBottom: 10,
    color: '#70737D',
    alignSelf:"center",
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 15,
    padding: 4,
  },
  commentInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 14,
    minHeight: 48,
    maxHeight: 120,
    color: '#111827',
    textAlignVertical: 'top',
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginRight: 8,


  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
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
    color: '#18181B',
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


