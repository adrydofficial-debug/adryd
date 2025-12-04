import React, { useState, useMemo } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// import { Calendar } from 'react-native-calendars';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomInput from '../../../components/CustomInput';
import PrimaryButton from '../../../components/PrimaryButton';
import { useTranslation } from 'react-i18next';
import { useCreateAdvertisement } from '../hooks/useCreateAdvertisement';
import ProgressBar from '../../../components/ProgressBar';
// Removed global selected dates - now using only unavailable-times API
import { CreateAdvertisementRequest } from '../types';
import { useCampaignStore } from '../../../store/campaignStore';
import { useBoardUnavailableTimes } from '../../boards/hooks/useBoardUnavailableTimes';
import { useCampaignFlowStore } from '../../../store/campaignFlowStore';
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

// Maximum number of days that can be selected at once to prevent server overload
const MAX_DAYS_PER_REQUEST = 30;
type RootStackParamList = {
  CampaignUploadFiles: undefined;
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
interface Props {
  navigation: NavigationProp | any;
  route?: any;
}
const AdvertismentCreateScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation('advertisments');
  const setAdvertisementData = useCampaignStore((state) => state.setAdvertisementData);
  const selectedDaysFromStore = useCampaignStore((state) => state.selectedDays);
  const setSelectedDaysToStore = useCampaignStore((state) => state.setSelectedDays);
  const clearSelectedDays = useCampaignStore((state) => state.clearSelectedDays);
  
  const selectedBoard = useCampaignFlowStore(s => s.selectedBoard);
  const selectedChoice = useCampaignFlowStore(s => s.selectedChoice);
  const selectedCompany = useCampaignFlowStore(s => s.selectedCompany);
  const resetCampaignFlow = useCampaignFlowStore(s => s.resetCampaignFlow);
  
  const flow = route?.params?.flow ?? 'business';
  const companyIdFromRoute = route?.params?.companyId; // Get company_id from route params (for business flow)
  const boardDataFromRoute = route?.params?.boardData; // Get board data from route params
  
  const boardData = boardDataFromRoute || selectedBoard;
  const COMPANY_ID = companyIdFromRoute || 1; // Use company_id from route, or default to 1
  
  const BOARD_ID = boardData?.id ? parseInt(boardData.id) : 1;
  
  const getBoardSize = () => {
    if (boardData?.size) return boardData.size;
    if (boardData?.width && boardData?.height) {
      return `${boardData.width}x${boardData.height} ft`;
    }
    return '12x8 ft';
  };
  
  const getBoardType = () => {
    if (boardData?.category) {
      const cat = typeof boardData.category === 'string' 
        ? boardData.category 
        : boardData.category?.name || '';
      if (cat.toLowerCase().includes('digital')) return 'Digital';
      if (cat.toLowerCase().includes('static')) return 'Static';
    }
    return 'Digital';
  };
  
  const getBoardCategory = () => {
    if (boardData?.category) {
      return typeof boardData.category === 'string' 
        ? boardData.category 
        : boardData.category?.name || 'Banner Board';
    }
    return 'Banner Board';
  };
  
  const getBoardLocation = () => {
    if (boardData?.location) {
      return typeof boardData.location === 'string' 
        ? boardData.location 
        : boardData.location?.name || 'Lahore';
    }
    return 'Lahore';
  };
  
  const getBoardArea = () => {
    if (boardData?.area) return boardData.area;
    if (boardData?.location) {
      const loc = typeof boardData.location === 'string' 
        ? boardData.location 
        : boardData.location?.name || '';
      return loc;
    }
    return 'Gulberg Main Boulevard';
  };
  
  const getBoardDescription = () => {
    if (boardData?.description) return boardData.description;
    return 'My great test advertisement.';
  };
  
  const getBoardImage = () => {
    if (boardData?.image_url) return boardData.image_url;
    if (boardData?.image) {
      const img = typeof boardData.image === 'string' 
        ? boardData.image 
        : boardData.image?.uri || '';
      return img || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80';
    }
    if (boardData?.media && Array.isArray(boardData.media) && boardData.media.length > 0) {
      return boardData.media[0]?.url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80';
    }
    return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80';
  };
  
  const [campaignName, setCampaignName] = useState<string>(boardData?.title || 'Test Ad');
  const [size, setSize] = useState<string>(getBoardSize());
  const [type, setType] = useState<string>(getBoardType());
  const [category, setCategory] = useState<string>(getBoardCategory());
  const [location, setLocation] = useState<string>(getBoardLocation());
  const [area, setArea] = useState<string>(getBoardArea());
  const [campaignImage] = useState<string>(getBoardImage());
  const [campaignCategory] = useState<string>(getBoardCategory());
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  // Use store for selectedDays, convert strings back to Dates
  const selectedDays = React.useMemo(() => {
    return selectedDaysFromStore.map(day => 
      day instanceof Date ? day : new Date(day)
    ).filter(day => !isNaN(day.getTime()));
  }, [selectedDaysFromStore]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [description, setDescription] = useState<string>(getBoardDescription());
  const [locationName] = useState<string>(getBoardLocation());
  const [errorText, setErrorText] = useState<string>('');

  // Use the hook for API calls
  const createAdMutation = useCreateAdvertisement();
  
  // Helper functions
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const formatDateForCalendar = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Fetch unavailable times for the board
  const { data: unavailableTimesData, refetch: refetchUnavailableTimes } = useBoardUnavailableTimes(BOARD_ID);
  
  // Refetch unavailable times when screen is focused to get latest booked dates
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('📅 Screen focused - refetching unavailable times to get latest booked dates');
      refetchUnavailableTimes();
    });
    return unsubscribe;
  }, [navigation, refetchUnavailableTimes]);
  
  
  const bookedDates = useMemo(() => {
    const dates = new Set<string>();
    
    if (unavailableTimesData?.unavailable && Array.isArray(unavailableTimesData.unavailable)) {
      console.log('📅 Processing', unavailableTimesData.unavailable.length, 'unavailable time ranges from API');
      unavailableTimesData.unavailable.forEach(unavailable => {
        if (unavailable.start_at && unavailable.end_at) {
          const start = new Date(unavailable.start_at);
          
          // Get the date-only value for the start date (ignore time)
          const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
          
          // Only mark the start date of each booking range
          // This prevents marking all days from 13 to 30 when only specific days are booked
          // For single-day bookings, this correctly marks that one day
          // For multi-day ranges, this only marks the start day, not all days in between
          const dateKey = formatDateForCalendar(new Date(startDateOnly));
          dates.add(dateKey);
        }
      });
      console.log('✅ Added dates from board unavailable times API:', Array.from(dates).sort());
    }
    
    return dates;
  }, [unavailableTimesData]);

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isDateSelected = (date: Date) => {
    return selectedDays.some(selectedDate => isSameDay(selectedDate, date));
  };

  // Check if a date is already booked by another user
  const isDateBooked = (date: Date) => {
    const dateKey = formatDateForCalendar(date);
    return bookedDates.has(dateKey);
  };

  const onDayPress = (date: Date) => {
    // Prevent selection of booked dates
    if (isDateBooked(date)) {
      setErrorText('This date is already booked');
      return;
    }
    
    // Clear error when successfully selecting a date
    setErrorText('');
    
    let updatedDays: Date[];
    
    if (isDateSelected(date)) {
      // Remove date if already selected
      updatedDays = selectedDays.filter(selectedDate => !isSameDay(selectedDate, date));
    } else {
      // Add date to selection
      updatedDays = [...selectedDays, date].sort((a, b) => a.getTime() - b.getTime());
    }
    
    // Save to local store (for current user's selection only)
    setSelectedDaysToStore(updatedDays);
  };

  const openCalendar = async () => {
    // Always refetch unavailable times to get the latest booked dates from API
    // This ensures that dates booked by other users are visible to all users
    console.log('📅 Opening calendar - refetching unavailable times to get latest booked dates');
    await refetchUnavailableTimes();
    
    // Preserve current selection from store, or populate from date range if available
    if (selectedDays.length === 0 && startDate && endDate) {
      // If no days are selected but we have a date range, populate selectedDays from the range
      const days: Date[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      const current = new Date(start);
      while (current <= end) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      setSelectedDaysToStore(days);
    }
    setShowCalendar(true);
  };

  const confirmSelection = () => {
    if (selectedDays.length > 0) {
      const sortedDays = [...selectedDays].sort(
        (a, b) => a.getTime() - b.getTime(),
      );
      setStartDate(sortedDays[0]);
      setEndDate(sortedDays[sortedDays.length - 1]);
      setShowCalendar(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isToday = isSameDay(date, today);
      const isPast = date < today && !isToday;
      const isSelected = isDateSelected(date);
      const isBooked = isDateBooked(date);

      days.push({
        date,
        isCurrentMonth,
        isToday,
        isPast,
        isSelected,
        isBooked,
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const calculateDays = () => {
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Extract submission logic
  const handleSubmit = () => {
    // Validate form data
    if (!campaignName.trim()) {
      setErrorText('Campaign name is required');
      return;
    }
    if (!campaignCategory.trim()) {
      setErrorText('Campaign category is required');
      return;
    }
    
    // Validate that dates are selected from calendar
    let selectedDates: Date[];
    
    if (selectedDays.length > 0) {
      // Use selectedDays from calendar - these are the exact dates user selected
      selectedDates = [...selectedDays].sort((a, b) => a.getTime() - b.getTime());
      
      console.log('📅 Using selected days from calendar:', {
        totalSelected: selectedDays.length,
        allSelectedDates: selectedDates.map(d => d.toISOString().split('T')[0]),
      });
    } else if (startDate && endDate) {
      // Fallback: create array of dates from startDate to endDate
      selectedDates = [];
      const current = new Date(startDate);
      const end = new Date(endDate);
      while (current <= end) {
        selectedDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      console.log('⚠️ No selectedDays, using startDate/endDate fallback');
    } else {
      setErrorText('Please select at least one day from the calendar');
      return;
    }

    // Clear any previous errors
    setErrorText('');
    
    // Sort dates to ensure proper ordering
    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    
    // Limit the number of days to prevent server overload
    if (sortedDates.length > MAX_DAYS_PER_REQUEST) {
      setErrorText(`Please select a maximum of ${MAX_DAYS_PER_REQUEST} days at a time. You selected ${sortedDates.length} days.`);
      Alert.alert(
        'Too Many Days Selected',
        `You can only select up to ${MAX_DAYS_PER_REQUEST} days at a time. Please reduce your selection and try again.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
   
    const bookings = sortedDates.map(date => {
      const cleanDate = new Date(date);
      
      const dateAt = new Date(Date.UTC(
        cleanDate.getFullYear(),
        cleanDate.getMonth(),
        cleanDate.getDate(),
        0, 0, 0, 0
      ));
      
      const dateString = dateAt.toISOString();
      
      return {
        start_at: dateString,
        end_at: dateString, 
      };
    });
    
    // Validate bookings before sending
    if (bookings.length === 0) {
      setErrorText('No valid bookings to create');
      return;
    }
    
    const invalidBookings = bookings.filter(
      booking => !booking.start_at || !booking.end_at || 
      booking.start_at > booking.end_at || // Allow equal, but not start > end
      !booking.start_at.includes('T') || !booking.end_at.includes('T')
    );
    
    if (invalidBookings.length > 0) {
      setErrorText(`Invalid bookings detected: ${invalidBookings.length} booking(s) have invalid dates`);
      console.error('Invalid bookings:', invalidBookings);
      return;
    }
    
    // Check for duplicate bookings (same start_at and end_at) and remove them
    const bookingKeys = new Set<string>();
    const uniqueBookings: Array<{ start_at: string; end_at: string }> = [];
    
    bookings.forEach(booking => {
      const key = `${booking.start_at}_${booking.end_at}`;
      if (!bookingKeys.has(key)) {
        bookingKeys.add(key);
        uniqueBookings.push(booking);
      }
    });
    
    if (uniqueBookings.length !== bookings.length) {
      console.warn(`⚠️ Removed ${bookings.length - uniqueBookings.length} duplicate booking(s)`);
      // Replace bookings array with unique bookings
      bookings.splice(0, bookings.length, ...uniqueBookings);
      console.log('✅ Unique bookings count:', bookings.length);
    }
    
    // Log booking details for debugging
    console.log('📅 Created bookings:', {
      count: bookings.length,
      firstBooking: bookings[0],
      lastBooking: bookings[bookings.length - 1],
      allBookings: bookings,
    });

    // Ensure all required fields are present and valid
    if (!campaignName || campaignName.trim() === '') {
      setErrorText('Campaign name is required');
      return;
    }
    
    if (!description || description.trim() === '') {
      setErrorText('Description is required');
      return;
    }
    let advertisementData: CreateAdvertisementRequest;
    
    if (flow === 'business') {
      if (!COMPANY_ID || COMPANY_ID <= 0) {
        setErrorText('Company ID is required for business flow. Please create a company first.');
        Alert.alert(
          'Missing Company',
          'Please create a company before creating an advertisement for business flow.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Business flow: include company_id
      advertisementData = {
        company_id: COMPANY_ID,
        board_id: BOARD_ID,
        title: campaignName.trim(),
        description: description.trim(),
        total_payment: 5000,
        bookings: bookings,
      };
    } else {
      // Individual flow: omit company_id entirely (server doesn't accept 0 or null)
      // Some servers may require the field to be completely omitted rather than null
      advertisementData = {
        // company_id is intentionally omitted for individual flow
        // If server requires it, we'll need to handle that in the API layer
        board_id: BOARD_ID,
        title: campaignName.trim(),
        description: description.trim(),
        total_payment: 5000,
        bookings: bookings,
      } as CreateAdvertisementRequest;
    }
    
    // Validate board_id exists
    if (!BOARD_ID || BOARD_ID <= 0) {
      setErrorText('Invalid board ID. Please contact support.');
      return;
    }
    
    // Additional validation: Check if bookings array is too large
    if (bookings.length > MAX_DAYS_PER_REQUEST) {
      setErrorText(`Too many bookings (${bookings.length}). Maximum allowed: ${MAX_DAYS_PER_REQUEST}`);
      return;
    }
    
    // Final validation of the payload
    console.log('📤 Final payload validation:', {
      hasCompanyId: !!advertisementData.company_id,
      hasBoardId: !!advertisementData.board_id,
      hasTitle: !!advertisementData.title,
      hasDescription: !!advertisementData.description,
      bookingsCount: advertisementData.bookings.length,
      payloadSize: JSON.stringify(advertisementData).length,
    });

    console.log('🚀 Creating advertisement with selected dates:', {
      selectedDaysCount: selectedDays.length,
      bookingsCount: bookings.length,
      bookings: bookings,
      fullPayload: JSON.stringify(advertisementData, null, 2),
    });

    // Save advertisement data to store before API call
    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];
    setAdvertisementData({
      campaignName: campaignName,
      description: description,
      location: location || locationName,
      selectedDays: sortedDates,
      startDate: firstDate,
      endDate: lastDate,
      category: category || campaignCategory,
      totalPayment: 5000,
      tax: 1000,
      size,
      type,
      area,
      previewImage: campaignImage,
      mediaUri: campaignImage,
      mediaType: 'image/jpeg',
      isVideo: false,
    });

    // Call the API using the hook with callbacks
    createAdMutation.mutate(advertisementData, {
      onSuccess: async response => {
        console.log('upload url is :', response.upload.uploadUrl);
        
        // Clear selected days from local store since they're now in the API
        clearSelectedDays();
       
        resetCampaignFlow();
        
        // Refetch unavailable times to update booked dates immediately
        await refetchUnavailableTimes();
        
        // Navigate to CampaignUploadFiles with upload info
        navigation.navigate('CampaignUploadFiles', {
          campaignId: response.advertisement?.id?.toString() || '',
          uploadUrl: response.upload?.uploadUrl || '',
          publicUrl: response.upload?.publicUrl || '',
          key: response.upload?.key || '',
          flow,
        });
      },
      onError: error => {
        // Log full error details for debugging
        const anyErr: any = error as any;
        
        // Extract detailed error message
        const serverData = anyErr?.response?.data;
        let errorMessage = 'Failed to create advertisement';
        
        if (serverData) {
          // Try different possible error message formats
          if (serverData.message) {
            errorMessage = serverData.message;
          } else if (serverData.error) {
            errorMessage = typeof serverData.error === 'string' 
              ? serverData.error 
              : JSON.stringify(serverData.error);
          } else if (serverData.errors) {
            // Handle validation errors
            if (Array.isArray(serverData.errors)) {
              errorMessage = `Validation errors: ${serverData.errors.join(', ')}`;
            } else if (typeof serverData.errors === 'object') {
              const errorList = Object.entries(serverData.errors)
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                .join('; ');
              errorMessage = `Validation errors: ${errorList}`;
            } else {
              errorMessage = `Validation errors: ${serverData.errors}`;
            }
          } else if (typeof serverData === 'string') {
            errorMessage = serverData;
          } else {
            // Show the entire error object
            errorMessage = `Server error: ${JSON.stringify(serverData)}`;
          }
        } else if (anyErr?.message) {
          errorMessage = anyErr.message;
        }
        
        const statusCode = anyErr?.response?.status || 'Unknown';
        
        // Provide more helpful error messages for common issues
        let finalMessage = `Error (${statusCode}): ${errorMessage}`;
        
        if (statusCode === 500) {
          // Provide more specific error messages based on common causes
          let specificMessage = '';
          
          if (advertisementData.bookings.length > MAX_DAYS_PER_REQUEST) {
            specificMessage = `You selected ${advertisementData.bookings.length} days, which may be too many. Try selecting fewer days (max ${MAX_DAYS_PER_REQUEST}).`;
          } else if (flow === 'individual' && advertisementData.company_id !== null && advertisementData.company_id !== undefined) {
            specificMessage = 'Individual flow should have company_id as null. Please contact support if this persists.';
          } else if (!BOARD_ID || BOARD_ID <= 0) {
            specificMessage = 'Invalid board ID. Please contact support.';
          } else if (flow === 'individual') {
            specificMessage = 'Server may not accept null company_id for individual flow. Please contact support.';
          } else {
            specificMessage = 'This may be due to invalid data or server issues.';
          }
          
          finalMessage = `Server Error (500): ${specificMessage} ` +
            `Please check the console for details. ` +
            `If this persists, try selecting fewer days or contact support.`;
          
        }
        
        console.error('Final error message:', finalMessage);
        setErrorText(finalMessage);
        
        // Also show alert for visibility
        Alert.alert(
          'Error Creating Advertisement',
          finalMessage,
          [{ text: 'OK' }]
        );
      },
    });
  };
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
        ]}
      >
        <Text
          style={[
            styles.progressStepText,
            isActive && styles.activeStepText,
            isCompleted && styles.completedStepText,
          ]}
        >
          {stepNumber}
        </Text>
      </View>
      {stepNumber < 3 && (
        <View
          style={[styles.progressLine, isActive && styles.activeProgressLine]}
        />
      )}
    </View>
  );
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFF4FD" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              // Reset campaign flow when going back without completing
              resetCampaignFlow();
              navigation.goBack();
            }}
          >
            <Ionicons name="arrow-back" size={wp(6)} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('createScreen.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.progressContainer}>
          <ProgressBar currentStep={1}/>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formCard}>
              <CustomInput
                label={t('createScreen.campaignName')}
                placeholder={t('createScreen.enterCampaignName')}
                value={campaignName}
                onChangeText={setCampaignName}
                containerStyle={styles.customInputContainer}
              />
              
              {/* Size Field - Disabled */}
              <CustomInput
                label="Size"
                placeholder="Enter size"
                value={size}
                onChangeText={setSize}
                containerStyle={styles.customInputContainer}
                disabled={true}
              />

              {/* Type Field - Disabled */}
              <CustomInput
                label="Type"
                placeholder="Enter type"
                value={type}
                onChangeText={setType}
                containerStyle={styles.customInputContainer}
                disabled={true}
              />

              {/* Category Field - Disabled */}
              <CustomInput
                label="Category"
                placeholder="Enter category"
                value={category}
                onChangeText={setCategory}
                containerStyle={styles.customInputContainer}
                disabled={true}
              />

              {/* Location Field - Disabled */}
              <CustomInput
                label="City"
                placeholder="Enter location"
                value={location}
                onChangeText={setLocation}
                containerStyle={styles.customInputContainer}
                disabled={true}
              />

              {/* Area Field - Disabled */}
              <CustomInput
                label="Area"
                placeholder="Enter area"
                value={area}
                onChangeText={setArea}
                containerStyle={styles.customInputContainer}
                disabled={true}
              />
              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateTimeLabel}>{t('createScreen.startDate')}</Text>
                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={openCalendar}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calendar-outline" size={18} color="#C12C9F" />
                  <View style={styles.dateRangeDisplay}>
                    <Text style={styles.dateRangeText}>
                      {formatDate(startDate)} - {formatDate(endDate)}
                    </Text>
                    <Text style={styles.durationText}>
                      {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              <CustomInput
                label={t('createScreen.description')}
                placeholder={t('createScreen.enterDescription')}
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={8}
                containerStyle={styles.descriptionContainer}
                inputStyle={styles.descriptionInput}
              />
              {/* <View style={styles.locationContainer}> */}
                {/* <Text style={styles.locationLabel}>{t('createScreen.location')}</Text> */}
                {/* <View style={styles.mapContainer}>
                  <View style={styles.mapPlaceholder}>
                    <Ionicons
                      name="location"
                      size={width * 0.06}
                      color="#666"
                    />
                    <Text style={styles.mapText}>{location}</Text>
                  </View>
                </View> */}
              {/* </View> */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Calendar Modal */}
        {showCalendar && (
          <View style={styles.calendarModal}>
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>{t('createScreen.selectDates')}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowCalendar(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.customCalendar}>
                {/* Calendar Header */}
                <View style={styles.calendarHeaderRow}>
                  <TouchableOpacity
                    style={styles.monthNavButton}
                    onPress={() => navigateMonth('prev')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chevron-back" size={22} color="#C12C9F" />
                  </TouchableOpacity>

                  <Text style={styles.monthYearText}>
                    {currentMonth.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>

                  <TouchableOpacity
                    style={styles.monthNavButton}
                    onPress={() => navigateMonth('next')}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color="#C12C9F"
                    />
                  </TouchableOpacity>
                </View>

                {/* Day Headers */}
                <View style={styles.dayHeadersRow}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                    day => (
                      <Text key={day} style={styles.dayHeaderText}>
                        {day}
                      </Text>
                    ),
                  )}
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarGrid}>
                  {generateCalendarDays().map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.calendarDay,
                        !day.isCurrentMonth && styles.otherMonthDay,
                        day.isToday && styles.todayDay,
                        day.isPast && styles.pastDay,
                        day.isSelected && styles.selectedDay,
                        day.isBooked && styles.bookedDay,
                      ]}
                      onPress={() => !day.isPast && !day.isBooked && onDayPress(day.date)}
                      disabled={day.isPast || day.isBooked}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          !day.isCurrentMonth && styles.otherMonthText,
                          day.isToday && styles.todayText,
                          day.isPast && styles.pastText,
                          day.isSelected && styles.selectedText,
                          day.isBooked && styles.bookedText,
                        ]}
                      >
                        {day.date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Selection Summary */}
                {/* <View style={styles.selectionSummary}>
                  <Text style={styles.selectionText}>
                    {selectedDays.length > 0
                      ? `${selectedDays.length} day${
                          selectedDays.length !== 1 ? 's' : ''
                        } selected`
                      : ''}
                  </Text>
                </View> */}
              </View>

              <View style={styles.calendarFooter}>
                <View style={styles.calendarButtons}>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                      setSelectedDaysToStore([]);
                      setStartDate(new Date());
                      setEndDate(
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.clearButtonText}>{t('createScreen.cancel')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      selectedDays.length === 0 && styles.disabledButton,
                    ]}
                    onPress={confirmSelection}
                    disabled={selectedDays.length === 0}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.confirmButtonText,
                        selectedDays.length === 0 && styles.disabledButtonText,
                      ]}
                    >
                      {t('createScreen.confirm')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={t('createScreen.next')}
            onPress={() => {
              handleSubmit();
            }}
            buttonStyle={styles.nextButton}
            disabled={createAdMutation.isPending}
            loading={createAdMutation.isPending}
          />
          {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
        </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? height * 0.05 : height * 0.02,
    paddingBottom: height * 0.01,
  },
  statusTime: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#fff',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: width * 0.02,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingTop: hp(5),
    paddingBottom: height * 0.03,
    backgroundColor: '#FFFFFF',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#202020',
  },
  headerSpacer: {
    width: wp(10),
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    paddingBottom: height * 0.04,
    paddingTop: height * 0.04,
  },
  progressStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.04,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#C538A5',
  },
  completedStep: {
    backgroundColor: '#C538A5',
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
  },
  activeProgressLine: {
    backgroundColor: '#C538A5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: width * 0.12,
    paddingBottom: 20,
  },
  formCard: {
    // Removed card background for cleaner look
  },
  customInputContainer: {
    marginBottom: height * 0.025,
  },
  dateTimeContainer: {
    marginBottom: height * 0.025,
  },
  dateTimeLabel: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: '#18181B',
    lineHeight: 15,
    letterSpacing: -0.154,
    marginBottom: 8,
  },
  multiDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.015,
  },
  dateField: {
    flex: 1,
    marginHorizontal: width * 0.01,
  },
  dateFieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: width * 0.02,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.012,
  },
  dateButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginLeft: width * 0.02,
    flex: 1,
  },
  daysField: {
    flex: 1,
    marginLeft: width * 0.02,
  },
  daysFieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  daysCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: width * 0.02,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.012,
    justifyContent: 'space-between',
  },
  daysButton: {
    backgroundColor: '#C538A5',
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.04,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysValue: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#333',
    minWidth: width * 0.08,
    textAlign: 'center',
    marginHorizontal: width * 0.02,
  },
  daysDisplay: {
    backgroundColor: '#F0F8FF',
    borderRadius: width * 0.02,
    padding: width * 0.03,
    marginBottom: height * 0.015,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  daysLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    paddingTop: 10,
    paddingRight: 16,
    paddingBottom: 10,
    paddingLeft: 16,
    height: 50,
    marginBottom: 0,
  },
  dateRangeDisplay: {
    flex: 1,
    marginLeft: 12,
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#111827',
    marginBottom: 2,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  selectionHint: {
    backgroundColor: '#FFF3E0',
    borderRadius: width * 0.02,
    padding: width * 0.03,
    marginBottom: height * 0.015,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  hintText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E65100',
    textAlign: 'center',
  },
  calendarModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: width * 0.05,
    maxHeight: height * 0.75,
    width: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  calendar: {
    borderRadius: width * 0.02,
  },
  calendarFooter: {
    padding: width * 0.04,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  calendarHint: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#C539A5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    alignSelf: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  simpleCalendar: {
    padding: 20,
  },
  calendarInstructions: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateSelectionButtons: {
    marginBottom: 20,
  },
  dateSelectButton: {
    backgroundColor: '#C538A5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  dateSelectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  customRangeSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 20,
  },
  customRangeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  customDateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customDateInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  customDateLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  customDateButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  customDateButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  customCalendar: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  monthNavButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter',
  },
  dayHeadersRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 4,
    justifyContent: 'space-between',
  },
  dayHeaderText: {
    width: '13%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'Inter',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    justifyContent: 'space-between',
  },
  calendarDay: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    minHeight: 44,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  todayDay: {
    backgroundColor: '#FDF4FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C12C9F',
  },
  pastDay: {
    opacity: 0.4,
  },
  selectedDay: {
    backgroundColor: '#C12C9F',
    borderRadius: 12,
    shadowColor: '#C12C9F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter',
  },
  otherMonthText: {
    color: '#9CA3AF',
  },
  todayText: {
    color: '#C12C9F',
    fontWeight: '600',
  },
  pastText: {
    color: '#9CA3AF',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bookedDay: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    opacity: 0.7,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  bookedText: {
    color: '#DC2626',
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  selectionSummary: {
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  calendarButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  confirmButton: {
    backgroundColor: '#C538A5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  disabledButtonText: {
    color: '#999',
  },
  priceContainer: {
    backgroundColor: '#F6E1F2',
    paddingHorizontal: width * 0.09,
    paddingVertical: height * 0.017,
    borderTopRightRadius: width * 0.015,
    borderBottomRightRadius: width * 0.015,
    marginLeft: 'auto',
    alignItems: 'center',
  },
  priceText: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: '#C538A5',
  },
  descriptionContainer: {
    marginBottom: height * 0.025,
  },
  descriptionLabel: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#333',
    marginBottom: height * 0.008,
  },
  descriptionInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: width * 0.02,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    fontSize: 12,
    color: '#000',
    height: height * 0.2,
    minHeight: height * 0.2,
  },
  locationContainer: {
    marginBottom: height * 0.025,
  },
  locationLabel: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#333',
    marginBottom: height * 0.008,
  },
  mapContainer: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: width * 0.02,
    height: height * 0.12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapText: {
    fontSize: width * 0.04,
    color: '#666',
    marginLeft: width * 0.02,
  },
  buttonContainer: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    width: '90%',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 24,
    fontFamily: 'Inter',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 0,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  modalYesButton: {
    flex: 1,
    backgroundColor: '#C539A5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C539A5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalYesButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});

export default AdvertismentCreateScreen;
