// src/components/BoardList.tsx
import React from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width, height} = Dimensions.get('window');
const BASE_WIDTH = 375;
const BASE_HEIGHT = 912;

// 🔹 Increased card size by ~20%
const CARD_WIDTH = (200 / BASE_WIDTH) * width;
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
    title: 'BILL BOARD',
    location: 'Lahore Gulberg',
    distance: '1.6 km',
    size: '12x8',
    image: require('../assets/images/bannerBg.png'),
  },
  {
    id: '2',
    title: 'BILL BOARD',
    location: 'Lahore Gulberg',
    distance: '1.6 km',
    size: '12x8',
    image: require('../assets/images/bannerBg.png'),
  },
  {
    id: '3',
    title: 'BILL BOARD',
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
          <View style={styles.infoOverlay}>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.title} numberOfLines={1}>
                {title.split(' ').slice(0, 12).join(' ')}
                {title.split(' ').length > 12 ? '...' : ''}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
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
    <View style={styles.container}>
      {subHeading && <Text style={styles.subHeading}>{subHeading}</Text>}
      <View style={styles.header}>
        <Text style={styles.heading}>{heading}</Text>
        <TouchableOpacity onPress={handleSeeAllPress}>
          <Text style={styles.seeAll}>See All</Text>
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
    paddingVertical: 5,
    borderRadius: 20,
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
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  subHeading: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 15,
    marginBottom: 4,
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
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingBottom: 5,
    marginBottom: 10,
  },
  cardGrid: {
    marginRight: 5, // Reduced margin for grid layout
    marginBottom: 8, // Slightly reduced bottom margin
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
