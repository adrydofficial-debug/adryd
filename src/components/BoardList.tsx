import React, { useState, useEffect, useCallback } from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  I18nManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const {width, height} = Dimensions.get('window');
const CARD_WIDTH = 165;
const CARD_HEIGHT = 237;



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
}

interface BoardListProps {
  data?: BoardItem[];
  heading: string;
  subHeading?: string;
  navigation?: any;
  onPressDetail?: (item: BoardItem) => void;
  numColumns?: number; 
}

const boardData: BoardItem[] = [
  {
    id: '1',
    title: '',
    location: 'Lahore Gulberg',
    distance: '1.6 km',
    size: '12x8',
    image: require('../assets/images/bannerBg.png'),
  },
  {
    id: '2',
    title: '',
    location: 'Lahore Gulberg',
    distance: '1.6 km',
    size: '12x8',
    image: require('../assets/images/bannerBg.png'),
  },
  {
    id: '3',
    title: '',
    location: 'Lahore Gulberg',
    distance: '1.6 km',
    size: '12x8',
    image: require('../assets/images/bannerBg.png'),
  },
];

const renderStars = (rating: number | string | undefined) => {
  const starColor = '#FFB800';
  const starSize = 12;
  
  return (
    <Ionicons name="star" size={starSize} color={starColor} />
  );
};

const BoardList: React.FC<BoardListProps> = ({
  data = boardData,
  heading,
  subHeading,
  navigation,
  onPressDetail,
  numColumns = 1, 
}) => {
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
    }, [i18nInstance.language, navigation])
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
    if (navigation) {
      navigation.navigate('CategoryScreen', {
        categoryId: 'all',
        categoryName: heading,
        subHeading: subHeading,
        showAllCategories: false,
      });
    }
  };

  const renderItem = ({item}: {item: BoardItem}) => {
    // Render "More" card if flag is set
    if (item.isMore) {
      return (
        <TouchableOpacity
          style={[
            styles.card,
            numColumns > 1 && styles.cardGrid,
            styles.moreCard
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

    const imageSource =
      item.image ||
      (item.image_url
        ? {
            uri: `https://adryd-backend-production.up.railway.app${item.image_url}`,
          }
        : require('../assets/images/bannerBg.png'));
    const title = item.title || 'Unknown';
    const location = item.location || 'Unknown Location';
    const distance = item.distance || '1.6 km';
    const size = item.size || '';
    const rating = typeof item.rating === 'string' ? parseFloat(item.rating) : (item.rating || 0);
    const reviewCount = item.reviewCount || 112; // Default to 112 if not provided
    // Ensure category is always available - check multiple possible sources
    const category = item.category || (item as any).category_name || 'Static';
    const isRecommended = item.isRecommended || false;
    
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
    const formatSizeTag = (sizeStr: string, itemWidth?: number, itemHeight?: number): string => {
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
        return sizeStr.toLowerCase().includes('size') ? sizeStr : `Size ${sizeStr}`;
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
      return sizeStr.toLowerCase().includes('size') ? sizeStr : `Size ${sizeStr}`;
    };
    
    // Try to get width/height from item if available
    const itemWidth = (item as any).width;
    const itemHeight = (item as any).height;
    const sizeTag = formatSizeTag(size, itemWidth, itemHeight);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          numColumns > 1 && styles.cardGrid, // Apply grid-specific styles
        ]}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.9}>
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <ImageBackground
            source={imageSource}
            style={styles.image}
            imageStyle={styles.imageBg}>
            {/* Labels Container (top-left) */}
            {labels.length > 0 && (
              <View style={styles.labelsContainer}>
                {labels.map((label, index) => (
                  <View key={index} style={[styles.labelTag, index === labels.length - 1 && { marginBottom: 0 }]}>
                    <Text style={styles.labelText}>{label}</Text>
                  </View>
                ))}
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
            <View style={styles.starsContainer}>
              {renderStars(rating)}
            </View>
            {reviewCount > 0 && (
              <Text style={styles.reviewCount}>({reviewCount})</Text>
            )}
          </View>

          {/* Tags/Chips Row - All on one line */}
          <View style={styles.tagsContainer}>
            {/* Category tag - always show */}
            <View style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>{category || 'Static'}</Text>
            </View>
            {/* Size tag - always show */}
            <View style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>{sizeTag || 'Size 2ft by 4ft'}</Text>
            </View>
            {/* Location tag - show if available */}
            {location && location !== 'Unknown Location' ? (
              <View style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>{location}</Text>
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
    <View style={styles.container}>
      {/* {subHeading && <Text style={styles.subHeading}>{subHeading}</Text>} */}
      <View style={styles.header}>
        <Text style={styles.heading}>{heading}</Text>
        <TouchableOpacity onPress={handleSeeAllPress}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={processedData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal={numColumns === 1}
        numColumns={numColumns > 1 ? numColumns : undefined}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 15,
          ...(numColumns > 1 && {
            alignItems: 'center',
            paddingVertical: 10,
          }),
        }}
        columnWrapperStyle={
          numColumns > 1
            ? {
                justifyContent: 'center',
                paddingHorizontal: 5, 
              }
            : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    // marginBottom: 2,
    paddingBottom: 10,
    paddingTop: 5,
    marginLeft: 14,
  },
  subHeading: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 15,
    marginBottom: -3,
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
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
    marginRight: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
    paddingTop: 5,
    paddingRight: 5,
    paddingBottom: 7,
    paddingLeft: 5,
    marginBottom: 10,
  },
  cardGrid: {
    marginRight: 8,
    marginBottom: 8,
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
    backgroundColor: '#F5F5F5',
    paddingTop: 2,
    paddingHorizontal: 4,
    paddingBottom: 4, 
    width: '100%',
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 4,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
    includeFontPadding: false,
    textAlignVertical: 'center',
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


