// src/components/BoardList.tsx
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
const BASE_WIDTH = 375;
const BASE_HEIGHT = 912;

// 🔹 Increased card size by ~20%
const CARD_WIDTH = (175 / BASE_WIDTH) * width;
const CARD_HEIGHT = (210 / BASE_HEIGHT) * height;

// 🔹 Data item type
export interface BoardItem {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  distance?: string;
  size?: string;
  price?: number;
  currency?: string;
  image?: any; // require('../images/bannerBg.png') or remote URL fallback
  image_url?: string;
  rating?: number | string;
}

// 🔹 Props type
interface BoardListProps {
  data?: BoardItem[];
  heading: string;
  subHeading?: string;
  navigation?: any;
  onPressDetail?: (item: BoardItem) => void;
  numColumns?: number; // Add numColumns prop for grid layout
}

// 🔹 Default static data
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

const BoardList: React.FC<BoardListProps> = ({
  data = boardData,
  heading,
  subHeading,
  navigation,
  onPressDetail,
  numColumns = 1, // Default to 1 column (horizontal layout)
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
    const resolveImageSource = () => {
      if (item.image) {
        if (typeof item.image === 'string') {
          if (item.image.startsWith('http')) {
            return { uri: item.image };
          }
          return {
            uri: `https://adryd-backend-production.up.railway.app${item.image}`,
          };
        }
        return item.image;
      }

      if (item.image_url) {
        if (typeof item.image_url === 'string') {
          if (item.image_url.startsWith('http')) {
            return { uri: item.image_url };
          }
          return {
            uri: `https://adryd-backend-production.up.railway.app${item.image_url}`,
          };
        }
      }

      return require('../assets/images/bannerBg.png');
    };

    const imageSource = resolveImageSource();
    const title = item.title || 'Unknown';
    const location = item.location || 'Unknown Location';
    const distance = item.distance || '1.6 km';
    const size = item.size || '12x8';

    return (
      <TouchableOpacity
        style={[
          styles.card,
          numColumns > 1 && styles.cardGrid, // Apply grid-specific styles
        ]}
        onPress={() => handleCardPress(item)}>
        <ImageBackground
          source={imageSource}
          style={styles.image}
          imageStyle={styles.imageBg}>
          <Text style={styles.sizeStyle}>{size}</Text>
          <View style={[styles.infoOverlay, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.detailTextWrapper, isRTL && { paddingRight: 0, paddingLeft: 8 }]}>
              <Text style={styles.title} numberOfLines={1}>
                {title.split(' ').slice(0, 12).join(' ')}
                {title.split(' ').length > 12 ? '...' : ''}
              </Text>
              <View
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                }}>
                <Ionicons
                  name="location-sharp"
                  size={9}
                  color="#888"
                  style={{paddingHorizontal: -6}}
                />
                <Text style={styles.subtitle} numberOfLines={1}>
                  {location.split(' ').slice(0, 10).join(' ')}
                  {location.split(' ').length > 12 ? '...' : ''}
                </Text>
              </View>
              <Text style={[styles.subtitle, {paddingHorizontal: 8}]}>
                {distance}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container} key={`boardlist-${isRTL}-${languageKey}`}>
      {/* {subHeading && <Text style={styles.subHeading}>{subHeading}</Text>} */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={styles.heading} key={`heading-${languageKey}-${currentLanguage}`}>{heading}</Text>
        <TouchableOpacity onPress={handleSeeAllPress}>
          {/* <Text style={styles.seeAll}>See All</Text> */}
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal={numColumns === 1}
        numColumns={numColumns > 1 ? numColumns : undefined}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 10,
          ...(numColumns > 1 && {
            alignItems: 'center',
            paddingVertical: 10,
          }),
        }}
        columnWrapperStyle={
          numColumns > 1
            ? {
                justifyContent: 'center',
                paddingHorizontal: 5, // Reduced from 10 to 5
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
    // paddingVertical: 5,
    borderRadius: 20,
    // marginTop: -15, // Pull the BoardList up closer to BoardTabs
  },
  sizeStyle: {
    position: 'absolute',
    top: 80,
    left: 70,
    right: 50,
    fontSize: 22,
    color: '#9292924D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Ensure vertical alignment
    paddingHorizontal: 15,
    marginBottom: -20, // Negative margin to pull cards closer
    paddingBottom: 0, // Remove any bottom padding
  },
  subHeading: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 15,
    marginBottom: -3, // Negative margin to reduce space
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '700',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: 5,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingBottom: 5,
    // marginBottom: 10,
  },
  cardGrid: {
    marginRight: 5, // Reduced margin for grid layout
    marginBottom: 2, // Slightly reduced bottom margin
  },
  image: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
  },
  imageBg: {
    borderRadius: 20,
    borderColor: '#E5E7EB',
    borderWidth: 3,
  },
  infoOverlay: {
    position: 'absolute',
    left: 4,
    right: 4,
    bottom: 8,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 11,
    marginHorizontal: 4,
    // flexDirection will be set dynamically based on RTL/LTR
  },
  detailTextWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '300',
  },
});

export default BoardList;


