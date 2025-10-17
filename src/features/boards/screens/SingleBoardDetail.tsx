import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  ImageBackground,
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
import Upload from '../../../assets/images/EditSquare.svg';
import Location from '../../../assets/images/location-pinkSVG.svg';
// import Line from '../../assets/icons/line.svg';
import Heart from '../../../assets/images/EditSquare.svg';
import BackButton from '../../../components/BackButton';
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

// Function to render star icons based on rating
const renderStars = (rating: string) => {
  const stars = [];
  const fullStars = Math.floor(parseFloat(rating));
  const halfStar = parseFloat(rating) % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Ionicons key={`full-${i}`} name="star" size={11} color="#FBBC05" />);
  }
  if (halfStar) {
    stars.push(<Ionicons key="half" name="star-half" size={11} color="#FBBC05" />);
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={11} color="#FBBC05" />);
  }

  return stars;
};

const SingleBoardDetail: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = (route.params as { item: any }) || { item: null };
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();
  
  // Debug log to help troubleshoot
  console.log('SingleBoardDetail - route.params:', route.params);
  console.log('SingleBoardDetail - item:', item);
  
  // Initialize billboard data with item from navigation or fallback to default
  const [billboard, setBillboard] = useState<BillboardData>(() => {
    if (item && typeof item === 'object') {
      return {
        title: item.title || 'Billboard Campaign Ad',
        location: item.location || 'Lahore Gulberg',
        subLocation: item.distance || 'Near 16 Km',
        size: item.size || '2ft x 4ft',
        about: item.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        rating: item.rating?.toString() || '4.5', // Use actual rating from item data
        imagesList: item.image_url ? [{ uri: `https://adryd-backend-production.up.railway.app${item.image_url}` }] : [placeholder],
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
    if (item?.rating) {
      const newRating = item.rating.toString();
      setBillboard(prev => ({
        ...prev,
        rating: newRating,
      }));
    }
  }, [item?.rating]);

  // Normalize to exactly 5 images (use first five, or pad with placeholders)
  const images = useMemo(() => {
    // If we have images from the API data, use those
    if (item?.image_url) {
      const apiImage = { uri: `https://adryd-backend-production.up.railway.app${item.image_url}` };
      const list = [apiImage];
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

      Alert.alert('Success', 'Rating submitted successfully!');
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

  // Main image is controlled via thumbnail taps only to avoid accidental cycling

  return (
    <View style={styles.container}>
      {/* Billboard Section */}
      <View style={styles.first}>
        <View style={styles.mainBoard}>
          <ImageBackground
            source={images[selectedIndex]}
            style={styles.mainBoardBg}
            imageStyle={styles.mainBoardBgImage}
          >
            <View style={styles.boardTypes}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {images.map((src, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <TouchableOpacity
                      key={`thumb-${idx}`}
                      onPress={() => selectImageIndex(idx)}
                      style={[styles.subBoard, isSelected && styles.selectedSubBoard]}
                      activeOpacity={0.8}
                    >
                      <Image source={src} style={styles.thumbImage} resizeMode="cover" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.backbutton}>
              <BackButton />
            </View>
          </ImageBackground>
        </View>

        {/* Top-right icons */}
        <View style={styles.head}>
          <TouchableOpacity style={styles.uploadCircle}>
            <Upload width={width * 0.05} height={height * 0.03} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.heartBorder}>
            <Heart width={width * 0.08} height={height * 0.017} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.second}>
        <View style={styles.contentSection}>
          <View style={styles.paddingHorizontal}>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.title}>{billboard.title}</Text>
                <View style={styles.icon}>
                  <Location width={9} height={8} style={styles.locationIcon} />
                  <Text style={styles.location}>{billboard.location}</Text>
                </View>
                <View style={styles.icon2}>
                  {/* <Line /> */}
                  <Text style={styles.subLocation}>{billboard.subLocation}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.ratingContainer} onPress={openRatingModal}>
                <Text style={styles.rating}>{billboard.rating}</Text>
                <View style={styles.starRow}>{renderStars(billboard.rating)}</View>
                {/* Debug: Show current rating value */}
              
              </TouchableOpacity>
            </View>

            <View style={styles.line} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Size</Text>
              <Text style={styles.sectionText}>{billboard.size}</Text>
            </View>

            <View style={styles.line} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.sectionText}>{billboard.about}</Text>
            </View>

            <View style={styles.line} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
          </View>

          {/* Map Section */}
          <View style={styles.mapContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => (navigation as any).navigate('CurrentLocation')}
              style={styles.touchableMap}
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

          {/* Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Let's Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Rating Modal */}
      <Modal
        visible={isRatingModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeRatingModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Rate this Board</Text>
            <Text style={styles.modalSubtitle}>How would you rate this billboard?</Text>
            
            <View style={styles.starRatingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleStarPress(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= userRating ? "star" : "star-outline"}
                    size={40}
                    color={star <= userRating ? "#FFD700" : "#E0E0E0"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
           
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeRatingModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  (userRating === 0 || rateBoardMutation.isPending) && styles.disabledButton
                ]}
                onPress={handleSubmitRating}
                disabled={userRating === 0 || rateBoardMutation.isPending}
              >
                {rateBoardMutation.isPending ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={[
                    styles.submitButtonText,
                    (userRating === 0 || rateBoardMutation.isPending) && styles.disabledButtonText
                  ]}>
                    Submit
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SingleBoardDetail;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  first: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    borderRadius: 30,
  },
  second: { flex: 2, backgroundColor: 'white' },
  mainBoard: {
    width,
    height: height * 0.395,
    borderRadius: width * 0.077,
    overflow: 'hidden',
    marginTop: -height * 0.04,
  },
  mainBoardBg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  mainBoardBgImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  boardTypes: {
    bottom: height * 0.02,
    position: 'absolute',
    right: 0,
    left: width * 0.11,
    width: width * 0.8,
    height: height * 0.078,
    borderRadius: width * 0.038,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    zIndex: 2,
  },
  subBoard: {
    width: width * 0.145,
    height: height * 0.0675,
    borderRadius: width * 0.025,
    justifyContent: 'space-between',
    marginRight: width * 0.015,
    overflow: 'hidden',
  },
  selectedSubBoard: {
    borderColor: '#C539A5',
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  head: {
    top: height * 0.011,
    right: width * 0.06,
    position: 'absolute',
    flexDirection: 'row',
  },
  uploadCircle: {
    width: 36,
    height: 36,
    borderRadius: 54.82,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartBorder: {
    width: 36,
    height: 36,
    borderRadius: 54.82,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentSection: {
    backgroundColor: 'white',
  },
  paddingHorizontal: {
    paddingHorizontal: width * 0.05,
  },
  titleRow: {
    marginTop: height * 0.018,
  },
  title: {
    color: '#C539A5',
    fontSize: width * 0.051,
    fontWeight: '700',
  },
  ratingContainer: { position: 'absolute', top: 0, right: 5 },
  rating: {
    fontSize: width * 0.077,
    fontWeight: '700',
    color: '#333333',
  },
  starRow: { flexDirection: 'row' },
  location: {
    fontSize: width * 0.033,
    color: '#B0B1B4',
    paddingHorizontal: width * 0.008,
  },
  subLocation: {
    fontSize: width * 0.033,
    color: '#B0B1B4',
    paddingHorizontal: width * 0.02,
  },
  icon: { flexDirection: 'row' },
  icon2: { flexDirection: 'row', paddingHorizontal: 2 },
  line: {
    width: width * 0.9,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginTop: height * 0.004,
  },
  section: {
    marginBottom: height * 0.006,
    marginTop: height * 0.012,
  },
  map: {
    width: 330,
    height: 155,
    borderRadius: 16,
    borderWidth: 3,
  },
  touchableMap: {
    borderRadius: width * 0.04,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: width * 0.039,
    fontWeight: '700',
    color: '#595959',
  },
  sectionText: {
    fontSize: width * 0.033,
    color: '#B0B1B4',
  },
  mapContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIcon: {
    paddingVertical: 8,
  },
  buttonContainer: {
    alignSelf: 'center',
    marginTop: height * 0.02,
    marginBottom: height * 0.09,
  },
  button: {
    width: width * 0.595,
    height: height * 0.057,
    borderRadius: width * 0.039,
    backgroundColor: '#C539A5',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: width * 0.036,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
  },
  backbutton: {
    top: 15,
    left: 10,
    position: 'absolute',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: width * 0.85,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  starRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    
  },
  starButton: {
    padding: 8,
    marginHorizontal: 0,
  },
  ratingText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  submitButton: {
    backgroundColor: '#C539A5',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButtonText: {
    color: '#999',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
    maxHeight: 120,
  },
});
