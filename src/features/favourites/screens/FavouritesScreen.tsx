import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import BoardList from '../../../components/BoardList';
import { useFavoritesBoards } from '../../boards/hooks/useFavorites';
import { BoardItem } from '../../../components/BoardList';

const {width, height} = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

interface FavouritesScreenProps {
  navigation: any;
}

const FavouritesScreen: React.FC<FavouritesScreenProps> = ({navigation}) => {
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const limit = 10;
  
  // Use the favorites API hook
  const {
    data: favoritesData,
    isLoading,
    error,
    refetch,
  } = useFavoritesBoards(page, limit);

  // Convert API data to BoardItem format for BoardList component
  const convertToBoardItem = (board: any): BoardItem => {
    return {
      id: board.id?.toString() || 'unknown',
      title: board.title || 'Untitled Board',
      description: board.description || '',
      location: board.location || 'Unknown Location',
      distance: '1.6 km', // Default distance
      size: board.size || '12x8',
      price: board.price || 0,
      currency: board.currency || 'USD',
      image_url: board.image || null,
    };
  };

  const onRefresh = async () => {
    console.log('onRefresh triggered');
    setRefreshing(true);
    try {
      await refetch();
      console.log('Favorites refreshed successfully');
    } catch (error) {
      console.error('Error refreshing favorites:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFavouritePress = (item: BoardItem) => {
    navigation.navigate('SingleBoardDetail', {item});
  };

  // Refetch favorites when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('FavouritesScreen focused - refetching favorites data');
      if (!refreshing) {
        refetch();
      }
    }, [refetch, refreshing])
  );

  const renderProgressStep = (
    stepNumber: number,
    isActive: boolean,
    isCompleted: boolean,
  ) => (
    <View style={styles.progressStepContainer}>
      <View
        style={[
          styles.progressStep,
          isActive && styles.activeStep,
          isCompleted && styles.completedStep,
        ]}>
        <Text
          style={[
            styles.progressStepText,
            isActive && styles.activeStepText,
            isCompleted && styles.completedStepText,
          ]}>
          {stepNumber}
        </Text>
      </View>
      {stepNumber < 3 && (
        <View
          style={[
            styles.progressLine,
            isActive && styles.activeProgressLine,
          ]}
        />
      )}
    </View>
  );


  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFF4FD" barStyle="dark-content" />
      <LinearGradient
        colors={['#FFF4FD', '#fef3f9']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.container}>
        
        {/* Header with Back Arrow */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(6)} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Favourites</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          {renderProgressStep(1, true, false)}
          {renderProgressStep(2, false, false)}
          {renderProgressStep(3, false, false)}
        </View>

        {/* Favourites Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { minHeight: height * 0.8 } // Ensure minimum height for pull-to-refresh
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#C539A5']}
              tintColor="#C539A5"
            />
          }
          showsVerticalScrollIndicator={false}>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading favourites...</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={wp(15)} color="#ff6b6b" />
              <Text style={styles.emptyTitle}>Error Loading Favourites</Text>
              <Text style={styles.emptySubtitle}>
                {error instanceof Error ? error.message : 'Something went wrong'}
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : favoritesData && favoritesData.length > 0 ? (
            <BoardList
              data={favoritesData.map(convertToBoardItem)}
              heading="Favourite Boards"
              navigation={navigation}
              onPressDetail={handleFavouritePress}
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
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingTop: hp(5),
    paddingBottom: height * 0.03,
  },
  backButton: {
    backgroundColor: '#fff',
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSpacer: {
    width: wp(10),
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    paddingBottom: height * 0.03,
  },
  progressStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.04,
    backgroundColor: '#C12C9F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#C12C9F',
  },
  completedStep: {
    backgroundColor: '#4CAF50',
  },
  progressStepText: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#999',
  },
  activeStepText: {
    color: '#fff',
  },
  completedStepText: {
    color: '#fff',
  },
  progressLine: {
    width: width * 0.15,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: width * 0.02,
  },
  activeProgressLine: {
    backgroundColor: '#C12C9F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 280,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: width * 0.04,
    padding: width * 0.05,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadSection: {
    marginBottom: height * 0.03,
  },
  uploadContainer: {
    borderWidth: 2,
    borderColor: '#FF6B9D',
    borderStyle: 'dashed',
    borderRadius: width * 0.03,
    backgroundColor: '#FFF4FD',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.15,
  },
  uploadIcon: {},
  uploadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    marginBottom: height * 0.005,
  },
  uploadSubtext: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    fontWeight: '400',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  previewImage: {
    width: 310,
    height: 160,
    borderRadius: width * 0.02,
  },
  deleteImageButton: {
    position: 'absolute',
    bottom: -width * 0.02,
    right: -width * 0.02,
    backgroundColor: '#fff',
    borderRadius: width * 0.03,
    padding: width * 0.008,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formFields: {
    marginTop: height * 0.01,
  },
  customInputContainer: {
    marginBottom: height * 0.025,
  },
  buttonContainer: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    width: '90%',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
    fontStyle: 'italic',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6f6666ff',
    marginBottom: 8,
  },
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownContainer: {
    marginBottom: 0, // Remove default margin since it's inside input container
  },
  loadingContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  testButton: {
    backgroundColor: '#ff6b6b',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // New styles for FavouritesScreen
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

