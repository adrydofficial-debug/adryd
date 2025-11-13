import React, { useState, useMemo } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
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
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import { useTranslation } from 'react-i18next';
import { useCreateAdvertisement } from '../hooks/useCreateAdvertisement';
import ProgressBar from '../../../components/ProgressBar';
// Removed global selected dates - now using only unavailable-times API
import { CreateAdvertisementRequest } from '../types';
import { useCampaignStore } from '../../../store/campaignStore';
import { useBoardUnavailableTimes } from '../../boards/hooks/useBoardUnavailableTimes';
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;
type RootStackParamList = {
  CampaignUploadFiles: undefined;
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
interface Props {
  navigation: NavigationProp | any;
}
const AdvertismentCreateScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation('advertisments');
  const setAdvertisementData = useCampaignStore((state) => state.setAdvertisementData);
  const selectedDaysFromStore = useCampaignStore((state) => state.selectedDays);
  const setSelectedDaysToStore = useCampaignStore((state) => state.setSelectedDays);
  const clearSelectedDays = useCampaignStore((state) => state.clearSelectedDays);
  const flow = route?.params?.flow ?? 'business';
  const COMPANY_ID = 1;
  const BOARD_ID = 1;
  const [campaignName] = useState<string>('Test Ad');
  const [size, setSize] = useState<string>('12x8 ft');
  const [type, setType] = useState<string>('Digital');
  const [category, setCategory] = useState<string>('Banner Board');
  const [location, setLocation] = useState<string>('Lahore');
  const [area, setArea] = useState<string>('Gulberg Main Boulevard');
  const [campaignImage] = useState<string>(
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80',
  );
  const [campaignCategory] = useState<string>('Static Category');
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
  const [description] = useState<string>('My great test advertisement.');
  const [locationName] = useState<string>('Lahore');
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
  
  // Fetch board unavailable times from API - this is the ONLY source of booked dates
  // All users will see the same unavailable dates from this API
  const { data: unavailableTimesData, refetch: refetchUnavailableTimes } = useBoardUnavailableTimes(BOARD_ID);
  
  // Refetch unavailable times when screen is focused to get latest booked dates
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('📅 Screen focused - refetching unavailable times to get latest booked dates');
      refetchUnavailableTimes();
    });
    return unsubscribe;
  }, [navigation, refetchUnavailableTimes]);
  
  // Extract booked dates ONLY from board unavailable times API
  // Only mark the start date of each booking range to avoid marking all days in between
  // This ensures that when API returns a range like "Nov 13 to Dec 1", we only mark Nov 13,
  // not all days from 13 to 30. Individual day bookings will still mark their specific days.
  const bookedDates = useMemo(() => {
    const dates = new Set<string>();
    
    // Add dates from board unavailable times API
    // This is the ONLY source of booked dates - all users see the same unavailable dates
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
      <StatusBar backgroundColor="#C538A5" barStyle="light-content" />
      <LinearGradient
        colors={['#FFF4FD', '#fef3f9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
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
            bounces={true}
            scrollEventThrottle={50}
            automaticallyAdjustKeyboardInsets={true}
            keyboardDismissMode="interactive"
          >
            <View style={styles.formCard}>
              <CustomInput
                label={t('createScreen.campaignName')}
                placeholder={t('createScreen.enterCampaignName')}
                value={campaignName}
                onChangeText={() => {}}
                containerStyle={styles.customInputContainer}
              />
              
              {/* Size Field */}
              <CustomInput
                label="Size"
                placeholder="Enter size"
                value={size}
                onChangeText={setSize}
                containerStyle={styles.customInputContainer}
              />

              {/* Type Field */}
              <CustomInput
                label="Type"
                placeholder="Enter type"
                value={type}
                onChangeText={setType}
                containerStyle={styles.customInputContainer}
              />

              {/* Category Field */}
              <CustomInput
                label="Category"
                placeholder="Enter category"
                value={category}
                onChangeText={setCategory}
                containerStyle={styles.customInputContainer}
              />

              {/* Location Field */}
              <CustomInput
                label="Location"
                placeholder="Enter location"
                value={location}
                onChangeText={setLocation}
                containerStyle={styles.customInputContainer}
              />

              {/* Area Field */}
              <CustomInput
                label="Area"
                placeholder="Enter area"
                value={area}
                onChangeText={setArea}
                containerStyle={styles.customInputContainer}
              />
              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateTimeLabel}>{t('createScreen.startDate')}</Text>

                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={openCalendar}
                >
                  <Ionicons name="calendar-outline" size={width * 0.06} color="#C538A5" />
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
                    size={width * 0.04}
                    color="#C538A5"
                  />
                </TouchableOpacity>
              </View>
              <CustomInput
                label={t('createScreen.description')}
                placeholder={t('createScreen.enterDescription')}
                value={description}
                onChangeText={() => {}}
                multiline={true}
                numberOfLines={4}
                containerStyle={styles.descriptionContainer}
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
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.customCalendar}>
                {/* Calendar Header */}
                <View style={styles.calendarHeaderRow}>
                  <TouchableOpacity
                    style={styles.monthNavButton}
                    onPress={() => navigateMonth('prev')}
                  >
                    <Ionicons name="chevron-back" size={20} color="#C538A5" />
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
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#C538A5"
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
          <CustomButton
            title={
              createAdMutation.isPending
                ? t('createScreen.next')
                : t('campaigns.create')
            }
            onPress={() => {
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
              
              // Create individual bookings for each selected day
              // API expects end_at to be the same as start_at for single-day bookings
              const bookings = sortedDates.map(date => {
                // Ensure we're working with a clean date object
                const cleanDate = new Date(date);
                
                // For single-day bookings, API expects start_at and end_at to be the same
                // Format: { "start_at": "2025-10-14T00:00:00Z", "end_at": "2025-10-14T00:00:00Z" }
                const dateAt = new Date(Date.UTC(
                  cleanDate.getFullYear(),
                  cleanDate.getMonth(),
                  cleanDate.getDate(),
                  0, 0, 0, 0
                ));
                
                const dateString = dateAt.toISOString();
                
                return {
                  start_at: dateString,
                  end_at: dateString, // Same as start_at for single-day bookings
                };
              });
              
              // Validate bookings before sending
              if (bookings.length === 0) {
                setErrorText('No valid bookings to create');
                return;
              }
              
              // Validate each booking has valid dates
              // Note: API allows start_at and end_at to be equal for single-day bookings
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

              const advertisementData: CreateAdvertisementRequest = {
                company_id: COMPANY_ID,
                board_id: BOARD_ID,
                title: campaignName.trim(),
                description: description.trim(),
                total_payment: 5000,
                bookings: bookings,
              };
              
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
                  
                  // Comprehensive error logging
                  console.error('========== ERROR DETAILS ==========');
                  console.error('Error status:', anyErr?.response?.status);
                  console.error('Error response:', anyErr?.response);
                  console.error('Error response data:', anyErr?.response?.data);
                  console.error('Error response headers:', anyErr?.response?.headers);
                  console.error('Full error:', JSON.stringify(anyErr, null, 2));
                  console.error('Request payload that failed:', JSON.stringify(advertisementData, null, 2));
                  console.error('===================================');
                  
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
                    finalMessage = `Server Error (500): The server encountered an error processing your request. ` +
                      `Please check the console for details. ` +
                      `If this persists, try selecting fewer days or contact support.`;
                    
                    // Log additional debugging info for 500 errors
                    console.error('🔴 500 Server Error - Additional Debug Info:', {
                      bookingsCount: advertisementData.bookings.length,
                      payloadSize: JSON.stringify(advertisementData).length,
                      firstBooking: advertisementData.bookings[0],
                      lastBooking: advertisementData.bookings[advertisementData.bookings.length - 1],
                      serverErrorDetails: serverData,
                    });
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
            }}
            variant="primary"
            size="medium"
            buttonStyle={styles.nextButton}
            disabled={createAdMutation.isPending}
          />
          {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
        </View>
      </LinearGradient>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C538A5',
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
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.2,
    flexGrow: 1,
    minHeight: height * 0.8,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: width * 0.04,
    padding: width * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    color: '#595959',
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
    backgroundColor: '#fff',
    borderRadius: width * 0.02,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.007,
    marginBottom: height * 0.015,
  },
  dateRangeDisplay: {
    flex: 1,
    marginLeft: width * 0.015,
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333',
    marginBottom: 2,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: width * 0.04,
    margin: width * 0.05,
    maxHeight: height * 0.7,
    width: width * 0.9,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
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
    padding: 15,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 15,
  },
  monthNavButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dayHeadersRow: {
    flexDirection: 'row',
    // marginBottom: 10,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    // paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  todayDay: {
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
  },
  pastDay: {
    opacity: 0.3,
  },
  selectedDay: {
    backgroundColor: '#C538A5',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  otherMonthText: {
    color: '#999',
  },
  todayText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  pastText: {
    color: '#999',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bookedDay: {
    backgroundColor: '#FFE0E0',
    borderRadius: 20,
    opacity: 0.6,
  },
  bookedText: {
    color: '#D32F2F',
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
    minHeight: height * 0.1,
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
});

export default AdvertismentCreateScreen;
