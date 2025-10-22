import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, StatusBar,
TextInput, ScrollView, Platform, KeyboardAvoidingView,} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
// import { Calendar } from 'react-native-calendars';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCreateAdvertisement } from '../hooks/useCreateAdvertisement';
import { CreateAdvertisementRequest } from '../types';
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
const AdvertismentCreateScreen: React.FC<Props> = ({ navigation }) => {
  const COMPANY_ID = 15;
  const BOARD_ID = 38;
  const [campaignName] = useState<string>('Test Ad');
  const [campaignCategory] = useState<string>('Static Category');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [description] = useState<string>('My great test advertisement.');
  const [location] = useState<string>('Lahore');
  const [errorText, setErrorText] = useState<string>('');

  // Use the hook for API calls
  const createAdMutation = useCreateAdvertisement();
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

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isDateSelected = (date: Date) => {
    return selectedDays.some(selectedDate => isSameDay(selectedDate, date));
  };

  const onDayPress = (date: Date) => {
    if (isDateSelected(date)) {
      // Remove date if already selected
      setSelectedDays(prev => prev.filter(selectedDate => !isSameDay(selectedDate, date)));
    } else {
      // Add date to selection
      setSelectedDays(prev => [...prev, date].sort((a, b) => a.getTime() - b.getTime()));
    }
  };

  const openCalendar = () => {
    setSelectedDays([]);
    setShowCalendar(true);
  };

  const confirmSelection = () => {
    if (selectedDays.length > 0) {
      const sortedDays = [...selectedDays].sort((a, b) => a.getTime() - b.getTime());
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
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        isPast,
        isSelected
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
  const renderProgressStep = (stepNumber: number, isActive: boolean, isCompleted: boolean) => (
    <View style={styles.progressStepContainer}>
      <View style={[styles.progressStep, isActive && styles.activeStep, isCompleted && styles.completedStep]}>
        <Text style={[styles.progressStepText, isActive && styles.activeStepText, isCompleted && styles.completedStepText]}>
          {stepNumber}
        </Text>
      </View>
      {stepNumber < 3 && <View style={[styles.progressLine, isActive && styles.activeProgressLine]} />}
    </View>
  );
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#C538A5" barStyle="light-content" />
      <LinearGradient
        colors={["#FFF4FD", "#fef3f9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(6)} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Campaign Detail</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.progressContainer}>
          {renderProgressStep(1, false, true)}
          {renderProgressStep(2, true, false)}
          {renderProgressStep(3, false, false)}
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
                label="Campaign Name"
                placeholder="Enter campaign name"
                value={campaignName}
                onChangeText={() => {}}
                containerStyle={styles.customInputContainer}
              />
              <CustomInput
                label="Campaign Categroty"
                placeholder="Select category"
                value={campaignCategory}
                onChangeText={() => {}}
                containerStyle={styles.customInputContainer}
              />
              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateTimeLabel}>Campaign Duration</Text>
                
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
                  <Ionicons name="chevron-down" size={width * 0.04} color="#C538A5" />
                    </TouchableOpacity>
                
                {selectedDays.length === 1 && (
                  <View style={styles.selectionHint}>
                    <Text style={styles.hintText}>
                      Now tap your end date to complete the range
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <TextInput
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={() => {}}
                  placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim."
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.locationContainer}>
                <Text style={styles.locationLabel}>Loaction</Text>
                <View style={styles.mapContainer}>
                  <View style={styles.mapPlaceholder}>
                    <Ionicons name="location" size={width * 0.06} color="#666" />
                    <Text style={styles.mapText}>{location}</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Calendar Modal */}
        {showCalendar && (
          <View style={styles.calendarModal}>
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>Select Date Range</Text>
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
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.monthNavButton}
                    onPress={() => navigateMonth('next')}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#C538A5" />
                  </TouchableOpacity>
                </View>

                {/* Day Headers */}
                <View style={styles.dayHeadersRow}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <Text key={day} style={styles.dayHeaderText}>{day}</Text>
                  ))}
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
                      ]}
                      onPress={() => !day.isPast && onDayPress(day.date)}
                      disabled={day.isPast}
                    >
                      <Text style={[
                        styles.dayText,
                        !day.isCurrentMonth && styles.otherMonthText,
                        day.isToday && styles.todayText,
                        day.isPast && styles.pastText,
                        day.isSelected && styles.selectedText,
                      ]}>
                        {day.date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Selection Summary */}
                <View style={styles.selectionSummary}>
                  <Text style={styles.selectionText}>
                    {selectedDays.length > 0 
                      ? `${selectedDays.length} day${selectedDays.length !== 1 ? 's' : ''} selected`
                      : 'Tap days to select them'
                    }
                  </Text>
                </View>
              </View>
              
              <View style={styles.calendarFooter}>
                <View style={styles.calendarButtons}>
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => {
                      setSelectedDays([]);
                      setStartDate(new Date());
                      setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
                    }}
                  >
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.confirmButton, selectedDays.length === 0 && styles.disabledButton]}
                    onPress={confirmSelection}
                    disabled={selectedDays.length === 0}
                  >
                    <Text style={[styles.confirmButtonText, selectedDays.length === 0 && styles.disabledButtonText]}>
                      Confirm Selection
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <CustomButton
            title={createAdMutation.isPending ? "Creating..." : "Create Advertisement"}
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
              if (selectedDays.length === 0) {
                setErrorText('Please select at least one day');
                return;
              }

              // Clear any previous errors
                setErrorText('');

              // Prepare the data for API call
              const advertisementData: CreateAdvertisementRequest = {
                  company_id: COMPANY_ID,
                  board_id: BOARD_ID,
                  title: campaignName,
                  description: description,
                total_payment: 0,
                  bookings: [
                  {
                    start_at: startDate.toISOString(),
                    end_at: endDate.toISOString(),
                  },
                ],
              };

              console.log('Creating advertisement with data:', advertisementData);

              // Call the API using the hook with callbacks
              createAdMutation.mutate(advertisementData, {
                onSuccess: (response) => {
                  navigation.navigate('CampaignUploadFiles', {
                  });
                },
                onError: (error) => {

                  setErrorText(`Error: ${error.message || 'Failed to create advertisement'}`);
                },
              });
            }}
            variant="primary"
            size="medium"
            buttonStyle={styles.nextButton}
            disabled={createAdMutation.isPending}
          />
          {!!errorText && (
            <Text style={styles.errorText}>{errorText}</Text>
          )}
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
    backgroundColor: '#f5f5f5',
    borderRadius: width * 0.02,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    marginBottom: height * 0.015,
  },
  dateRangeDisplay: {
    flex: 1,
    marginLeft: width * 0.03,
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: '#FF5722',
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
    marginBottom: 15,
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
    marginBottom: 10,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    paddingVertical: 8,
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
  selectionSummary: {
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
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
    paddingBottom: height * 0.05,
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
