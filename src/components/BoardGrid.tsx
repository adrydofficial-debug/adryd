import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
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

import { Images } from '../assets/images';

const CARD_HEIGHT = 237;

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
  labels?: string[];
  discount?: string;
  isMore?: boolean;
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

const renderStars = () => <Ionicons name="star" size={12} color="#FFB800" />;

const BoardGrid: React.FC<BoardListProps> = ({
  data = [],
  heading,
  onPressDetail,
  numColumns = 1,
  useWiderCards = false,
  scrollEnabled = true,
}) => {
  const { i18n: i18nInstance } = useTranslation();

  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);
  const [languageKey, setLanguageKey] = useState(0);

  useEffect(() => {
    const handleLanguageChange = (lang: string) => {
      const rtlLangs = new Set(['ar', 'ur', 'he', 'fa']);
      setIsRTL(rtlLangs.has(lang));
      setLanguageKey(prev => prev + 1);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const rtlLangs = new Set(['ar', 'ur', 'he', 'fa']);
      setIsRTL(rtlLangs.has(i18nInstance.language));
      setLanguageKey(prev => prev + 1);
    }, [i18nInstance.language]),
  );

  const handleCardPress = (item: BoardItem) => {
    if (onPressDetail) {
      onPressDetail(item);
    }
  };

  const processedData = React.useMemo(() => {
    if (numColumns === 1 && data.length > 4) {
      return [...data.slice(0, 4), { id: 'more-card', isMore: true }];
    }
    return data;
  }, [data, numColumns]);

  const renderItem = ({ item }: { item: BoardItem }) => {
    if (item.isMore) {
      return (
        <TouchableOpacity
          style={[styles.card, styles.moreCard, { flex: 1, maxWidth: '50%' }]}
          activeOpacity={0.9}
        >
          <Text style={styles.moreCardText}>More</Text>
        </TouchableOpacity>
      );
    }

    const imageSource =
      typeof item.image === 'string'
        ? { uri: item.image }
        : item.image || FALLBACK_IMAGE;

    return (
      <TouchableOpacity
        style={[styles.card, { flex: 1, maxWidth: '50%' }]}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <ImageBackground
            source={imageSource}
            style={styles.image}
            imageStyle={styles.imageBg}
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title || 'Unknown'}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingValue}>
              {(Number(item.rating) || 0).toFixed(1)}
            </Text>
            {renderStars()}
            <Text style={styles.reviewCount}>({item.reviewCount || 0})</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {!useWiderCards && (
        <View style={styles.header}>
          <Text style={styles.heading}>{heading}</Text>
        </View>
      )}

      <FlatList
        key={languageKey}
        data={processedData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal={numColumns === 1}
        numColumns={numColumns > 1 ? numColumns : undefined}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        nestedScrollEnabled={!scrollEnabled}
        contentContainerStyle={{
          paddingHorizontal: 5,
        }}
        columnWrapperStyle={
          numColumns > 1
            ? {
                justifyContent: 'flex-start',
                gap: 5,
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
    paddingTop: 5,
  },
  header: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  heading: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    minHeight: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
    padding: 5,
    marginTop: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageBg: {
    resizeMode: 'cover',
  },
  detailsContainer: {
    paddingHorizontal: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewCount: {
    fontSize: 11,
    color: '#B0B1B4',
    marginLeft: 4,
  },
  moreCard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreCardText: {
    fontSize: 12,
    color: '#70737D',
  },
});

export default BoardGrid;
