import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  I18nManager,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import i18n from '../i18n';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = 165;
const CARD_WIDTH_WIDER = 185;
const CARD_HEIGHT = 237;

import { Images } from '../assets/images';

const FALLBACK_IMAGE = Images.image;

interface BoardMediaItem {
  url?: string | null;
}

export interface BoardItem {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  distance?: string;
  size?: string;
  price?: number;
  currency?: string;
  image?: any;
  image_url?: string;
  rating?: number | string;
  reviewCount?: number;
  category?: string;
  isRecommended?: boolean;
  labels?: string[]; // Array of labels like "Special", "20% Less", "Recommended", "Near"
  discount?: string; // Discount label like "20% Less"
  isMore?: boolean; // Special flag for "More" card
  media?: Array<BoardMediaItem | string>;
}

interface BoardListProps {
  data?: BoardItem[];
  heading: string;
  subHeading?: string;
  navigation?: any;
  onPressDetail?: (item: BoardItem) => void;
  numColumns?: number;
  showSeeAll?: boolean;
  useWiderCards?: boolean;
  showFavoriteBadge?: boolean;
  scrollEnabled?: boolean;
}

const boardData: BoardItem[] = [
  {
    id: '1',
    title: '',
    location: 'Lahore Gulberg',
    distance: '1.6 km',
    size: '12x8',
    image: Images.bannerBg,
  },
  {
    id: '2',
    title: '',
    location: 'Lahore Gulberg',
    distance: '1.6 km',
    size: '12x8',
    image: Images.bannerBg,
  },
  {
    id: '3',
    title: '',
    location: 'Lahore Gulberg',
    distance: '1.6 km',
    size: '12x8',
    image: Images.bannerBg,
  },
];

const renderStars = (rating: number | string | undefined) => {
  const starColor = '#FFB800';
  const starSize = 12;

  return <Ionicons name="star" size={starSize} color={starColor} />;
};

const BoardList: React.FC<BoardListProps> = ({
  data = boardData,
  heading,
  subHeading,
  navigation,
  onPressDetail,
  numColumns = 1,
  showSeeAll = true,
  useWiderCards = false,
  showFavoriteBadge = false,
  scrollEnabled = true,
}) => {
  // Debug: Log the prop value to verify it's being received
  console.log(
    'BoardList - useWiderCards prop:',
    useWiderCards,
    'heading:',
    heading,
  );
  const { i18n: i18nInstance } = useTranslation();

  // Track current language to force re-renders
  const [currentLanguage, setCurrentLanguage] = useState(i18nInstance.language);
  // Track RTL state to force layout re-render
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);
  // Language change tracking for forced re-render
  const [languageKey, setLanguageKey] = useState(0);

  // Listen for language changes and force re-render
  useEffect(() => {
    const handleLanguageChange = (lang: string) => {
      setCurrentLanguage(lang);
      // Update RTL state based on language
      const rtlLangs = new Set<string>(['ar', 'ur', 'he', 'fa']);
      const shouldBeRTL = rtlLangs.has(lang);
      setIsRTL(shouldBeRTL);
      setLanguageKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    // Set initial language and RTL state
    const lang = i18nInstance.language;
    setCurrentLanguage(lang);
    const rtlLangs = new Set<string>(['ar', 'ur', 'he', 'fa']);
    setIsRTL(rtlLangs.has(lang));
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18nInstance.language]);

  // Update language key when screen comes into focus (if navigation is available)
  useFocusEffect(
    useCallback(() => {
      if (navigation) {
        const lang = i18nInstance.language;
        setCurrentLanguage(lang);
        const rtlLangs = new Set<string>(['ar', 'ur', 'he', 'fa']);
        setIsRTL(rtlLangs.has(lang));
        setLanguageKey(prev => prev + 1);
      }
      return () => {};
    }, [i18nInstance.language, navigation]),
  );

  const handleCardPress = (item: BoardItem) => {
    if (onPressDetail) {
      onPressDetail(item);
    } else if (navigation) {
      navigation.navigate('CategoryScreen', {
        categoryId: item.id,
        categoryName: item.title,
        showAllCategories: false,
      });
    }
  };

  const handleSeeAllPress = () => {
    if (!showSeeAll) {
      return;
    }
    if (navigation) {
      navigation.navigate('CategoryScreen', {
        categoryId: 'all',
        categoryName: heading,
        subHeading: subHeading,
        showAllCategories: false,
      });
    }
  };

  const renderItem = ({ item }: { item: BoardItem }) => {
    // Render "More" card if flag is set
    if (item.isMore) {
      // Determine card width for "More" card
      const moreCardWidth = useWiderCards ? CARD_WIDTH_WIDER : CARD_WIDTH;

      return (
        <TouchableOpacity
          style={[
            styles.card,
            numColumns > 1 && styles.cardGrid,
            styles.moreCard,
            { width: moreCardWidth }, // Always set width based on useWiderCards prop
          ]}
          onPress={() => handleSeeAllPress()}
          activeOpacity={0.9}
        >
          <View style={styles.moreCardContent}>
            <Text style={styles.moreCardText}>More</Text>
          </View>
        </TouchableOpacity>
      );
    }

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

    const asRemoteSource = (maybeUrl?: string | null) => {
      const sanitized = sanitizeUrl(maybeUrl);
      return sanitized ? { uri: sanitized } : null;
    };

    const resolveImageSource = () => {
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

      if (typeof item.image_url === 'string') {
        const remote = asRemoteSource(item.image_url);
        if (remote) {
          return remote;
        }
      }

      if (Array.isArray(item.media) && item.media.length > 0) {
        for (const mediaItem of item.media) {
          if (typeof mediaItem === 'string') {
            const remote = asRemoteSource(mediaItem);
            if (remote) {
              return remote;
            }
          } else if (mediaItem && typeof mediaItem === 'object') {
            const remote = asRemoteSource(mediaItem.url ?? null);
            if (remote) {
              return remote;
            }
          }
        }
      }

      return FALLBACK_IMAGE;
    };

    const imageSource = resolveImageSource();
    const title = item.title || 'Unknown';
    const location = item.location || 'Unknown Location';
    const distance = item.distance || '1.6 km';
    const size = item.size || '';
    const rating =
      typeof item.rating === 'string'
        ? parseFloat(item.rating)
        : item.rating || 0;
    const reviewCount = item.reviewCount || 112; // Default to 112 if not provided
    // Ensure category is always available - check multiple possible sources
    const rawCategory =
      item.category || (item as any).category_name || 'Static';
    const isRecommended = item.isRecommended || false;

    // Normalize category to only show "Static" or "Dynamic"
    const normalizeCategory = (cat: string): string => {
      const normalized = cat.toLowerCase().trim();
      // Map various category names to "Static" or "Dynamic"
      if (normalized.includes('dynamic') || normalized.includes('digital')) {
        return 'Digital';
      }
      if (normalized.includes('static') || normalized.includes('statics')) {
        return 'Static';
      }
      // Default fallback
      return 'Static';
    };
    const category = normalizeCategory(rawCategory);

    // Determine labels to display - prioritize explicit labels, then fallback
    const labels: string[] = [];

    // Start with explicit labels if provided
    if (item.labels && Array.isArray(item.labels) && item.labels.length > 0) {
      labels.push(...item.labels);
    } else {
      // Check for special flag
      if ((item as any).isSpecial || (item as any).special) {
        labels.push('Special');
      }

      // Add discount label if available
      if (item.discount) {
        // Ensure format is "20% Less" or similar
        const discountText = item.discount.includes('%')
          ? item.discount
          : `${item.discount}% Less`;
        labels.push(discountText);
      }
    }

    // Format size for tag - convert to "Size 2ft by 4ft"
    const formatSizeTag = (
      sizeStr: string,
      itemWidth?: number,
      itemHeight?: number,
    ): string => {
      // If we have explicit width/height from the item, use those (assumed to be in feet)
      if (itemWidth && itemHeight) {
        return `Size ${itemWidth}ft by ${itemHeight}ft`;
      }

      if (!sizeStr || sizeStr.trim() === '') {
        // Default size if nothing provided
        return 'Size 2ft by 4ft';
      }

      if (sizeStr.includes('ft') || sizeStr.includes('by')) {
        // Already formatted, just add "Size " prefix if needed
        return sizeStr.toLowerCase().includes('size')
          ? sizeStr
          : `Size ${sizeStr}`;
      }

      // Parse "12x8" or similar format
      const parts = sizeStr.split('x');
      if (parts.length === 2) {
        const width = parseInt(parts[0]);
        const height = parseInt(parts[1]);
        if (!isNaN(width) && !isNaN(height)) {
          // For typical billboard sizes:
          // If values are very large (>20), might be in inches - convert
          // Otherwise treat as feet (common sizes: 2x4, 4x6, 12x8, etc.)
          if (width > 20 || height > 20) {
            // Convert inches to feet (divide by 12)
            const widthFt = Math.round(width / 12);
            const heightFt = Math.round(height / 12);
            return `Size ${widthFt}ft by ${heightFt}ft`;
          } else {
            // Assume already in feet
            return `Size ${width}ft by ${height}ft`;
          }
        }
      }

      // Fallback
      return sizeStr.toLowerCase().includes('size')
        ? sizeStr
        : `Size ${sizeStr}`;
    };

    // Try to get width/height from item if available
    const itemWidth = (item as any).width;
    const itemHeight = (item as any).height;
    const sizeTag = formatSizeTag(size, itemWidth, itemHeight);

    // Determine card width based on useWiderCards prop
    const cardWidth = useWiderCards ? CARD_WIDTH_WIDER : CARD_WIDTH;
    return (
      <TouchableOpacity
        style={[
          styles.card,
          numColumns > 1 && styles.cardGrid, // Apply grid-specific styles
          { width: cardWidth }, // Always set width based on useWiderCards prop
        ]}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.9}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <ImageBackground
            source={imageSource}
            style={styles.image}
            imageStyle={styles.imageBg}
          >
            {/* Labels Container (top-left) */}
            {labels.length > 0 && (
              <View style={styles.labelsContainer}>
                {labels.map((label, index) => (
                  <View
                    key={index}
                    style={[
                      styles.labelTag,
                      index === labels.length - 1 && { marginBottom: 0 },
                    ]}
                  >
                    <Text style={styles.labelText}>{label}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Favorite Badge (top-right) */}
            {showFavoriteBadge && (
              <View style={styles.favoriteBadge}>
                <Ionicons name="heart" size={17} color="#FFFFFF" />
              </View>
            )}

            {/* Size Overlay (centered on image) */}
            {/* <View style={styles.sizeOverlay}>
              <Text style={styles.sizeText}>{size}</Text>
            </View> */}
          </ImageBackground>
        </View>

        {/* Details Section Below Image */}
        <View style={styles.detailsContainer}>
          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={1}>
            {title}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
            <View style={styles.starsContainer}>{renderStars(rating)}</View>
            {reviewCount > 0 && (
              <Text style={styles.reviewCount}>({reviewCount})</Text>
            )}
          </View>

          {/* Tags/Chips Row - All on one line */}
          <View style={styles.tagsContainer}>
            {/* Category tag - always show */}
            <View style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>
                {category || 'Static'}
              </Text>
            </View>
            {/* Size tag - always show */}
            <View style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>
                {sizeTag || 'Size 2ft by 4ft'}
              </Text>
            </View>
            {/* Location tag - show if available */}
            {location && location !== 'Unknown Location' ? (
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

  // Process data to add "More" card after 4th item for horizontal lists
  const processedData = React.useMemo(() => {
    if (numColumns === 1 && data && data.length > 3) {
      // For horizontal lists with more than 4 items, insert "More" after 4th item
      const firstFour = data.slice(0, 4);
      const moreCard: BoardItem = {
        id: 'more-card',
        isMore: true,
      };
      return [...firstFour, moreCard];
    }
    return data || [];
  }, [data, numColumns]);

  return (
    <View style={[styles.container, useWiderCards && styles.containerWider]}>
      {!useWiderCards && (
        <View style={styles.header}>
          <Text style={styles.heading}>{heading}</Text>
        </View>
      )}
      <FlatList
        data={processedData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal={numColumns === 1}
        numColumns={numColumns > 1 ? numColumns : undefined}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        nestedScrollEnabled={!scrollEnabled}
        contentContainerStyle={{
          paddingLeft: useWiderCards ? 5 : 15, // Minimal left padding for wider cards to maximize space
          paddingRight: useWiderCards ? 5 : 15, // Minimal right padding for wider cards
          ...(numColumns > 1 && {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
          }),
        }}
        columnWrapperStyle={
          numColumns > 1
            ? {
                justifyContent: 'center',
                paddingLeft: useWiderCards ? 5 : 5, // Minimal padding for wider cards in grid
                paddingRight: useWiderCards ? 5 : 5, // Minimal padding for wider cards in grid
              }
            : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
  },
  containerWider: {
    paddingHorizontal: 0, // Can adjust if needed
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 3,
    marginTop: 10,
    marginLeft: 0,
  },
  subHeading: {
    fontSize: width * 0.055,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 20,
    marginBottom: 15,
    marginTop: 20,
  },
  heading: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  seeAll: {
    fontSize: 12,
    marginRight: 10,
    color: '#70737D',
    fontWeight: '400',
  },
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    marginRight: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
    paddingTop: 5,
    paddingRight: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    marginBottom: 5,
    overflow: 'hidden',
  },
  cardGrid: {
    marginRight: 5,
    marginBottom: 5,
  },
  imageContainer: {
    width: '100%',
    height: 140, // Fixed height for image - leaves more room for details
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 11.07, // Gap from Figma
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageBg: {
    resizeMode: 'cover',
  },
  labelsContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'column',
    zIndex: 2,
  },
  labelTag: {
    backgroundColor: '#C539A5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 3,
  },
  sizeOverlay: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    marginLeft: -30,
    marginTop: -12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    minWidth: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeText: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 2,
    paddingHorizontal: 4,
    paddingBottom: 4,
    width: '100%',
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222222',
    marginBottom: 4,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    marginLeft: 6,
    marginRight: 4,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#222222',
  },
  reviewCount: {
    fontSize: 11,
    color: '#B0B1B4',
    fontWeight: '400',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 0,
    width: '100%',
  },
  tag: {
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginRight: 4,
    marginBottom: 4,
    flexShrink: 0,
  },
  tagText: {
    fontSize: 9,
    color: '#595959',
    fontWeight: '400',
    includeFontPadding: false,
    textAlignVertical: 'center',
    paddingHorizontal: 2,
  },
  moreCard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  moreCardText: {
    fontSize: 12,
    color: '#70737D',
    letterSpacing: 0.9,
    fontWeight: '300',
  },
});

export default BoardList;
