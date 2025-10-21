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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdvertisementGet } from '../api';
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
  // Static identifiers as requested
  const COMPANY_ID = 15;
  const BOARD_ID = 38;
  const [campaignName] = useState<string>('Test Ad');
  const [campaignCategory] = useState<string>('Static Category');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedDates, setSelectedDates] = useState<{[key: string]: any}>({});
  const [description] = useState<string>('My great test advertisement.');
  const [location] = useState<string>('Lahore');
  const [errorText, setErrorText] = useState<string>('');
  const [successResponse, setSuccessResponse] = useState<string>('');
  const queryClient = useQueryClient();
  const createAdMutation = useMutation({
    mutationFn: createAdvertisementGet, // Using GET method instead of POST
    onSuccess: (response) => {
      // Display success response
      console.log('API Success Response:', response);
      setSuccessResponse(JSON.stringify(response, null, 2));
      setErrorText(''); // Clear any previous errors
      // Invalidate lists if any cache key is used elsewhere
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
    onError: (error) => {
      console.error('API Error Response:', error);
      setErrorText(`API Error: ${error.message}`);
      setSuccessResponse(''); // Clear any previous success messages
    },
  });
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

  const onDayPress = (day: any) => {
    const selectedDate = new Date(day.dateString);
    
    if (Object.keys(selectedDates).length === 0) {
      // First selection - set start date
      setStartDate(selectedDate);
      setSelectedDates({
        [day.dateString]: {
          selected: true,
          startingDay: true,
          color: '#C538A5',
          textColor: 'white',
        }
      });
    } else {
      // Second selection - set end date and create range
      const startDateStr = Object.keys(selectedDates)[0];
      const startDateObj = new Date(startDateStr);
      
      if (selectedDate >= startDateObj) {
        // Valid range - create full range immediately
        setEndDate(selectedDate);
        const newSelectedDates: {[key: string]: any} = {};
        
        // Add all dates in range
        const currentDate = new Date(startDateObj);
        while (currentDate <= selectedDate) {
          const dateStr = formatDateForCalendar(currentDate);
          newSelectedDates[dateStr] = {
            selected: true,
            color: '#C538A5',
            textColor: 'white',
            startingDay: dateStr === startDateStr,
            endingDay: dateStr === day.dateString,
          };
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        setSelectedDates(newSelectedDates);
        setShowCalendar(false);
      } else {
        // Invalid range - reset and start over with new start date
        setStartDate(selectedDate);
        setSelectedDates({
          [day.dateString]: {
            selected: true,
            startingDay: true,
            color: '#C538A5',
            textColor: 'white',
          }
        });
      }
    }
  };

  const openCalendar = () => {
    setSelectedDates({});
    setShowCalendar(true);
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
                
                {Object.keys(selectedDates).length === 1 && (
                  <View style={styles.selectionHint}>
                    <Text style={styles.hintText}>
                      Now tap your end date to complete the range
                    </Text>
                  </View>
                )}
                
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>PKR 00</Text>
                </View>
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
              
              <View style={styles.simpleCalendar}>
                <Text style={styles.calendarInstructions}>
                  Select your date range by tapping start and end dates
                </Text>
                <View style={styles.dateSelectionButtons}>
                  <TouchableOpacity 
                    style={styles.dateSelectButton}
                    onPress={() => {
                      const today = new Date();
                      setStartDate(today);
                      setEndDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000));
                      setShowCalendar(false);
                    }}
                  >
                    <Text style={styles.dateSelectButtonText}>Today + 7 days</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.dateSelectButton}
                    onPress={() => {
                      const today = new Date();
                      setStartDate(today);
                      setEndDate(new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000));
                      setShowCalendar(false);
                    }}
                  >
                    <Text style={styles.dateSelectButtonText}>Today + 14 days</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.dateSelectButton}
                    onPress={() => {
                      const today = new Date();
                      setStartDate(today);
                      setEndDate(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000));
                      setShowCalendar(false);
                    }}
                  >
                    <Text style={styles.dateSelectButtonText}>Today + 30 days</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.customRangeSection}>
                  <Text style={styles.customRangeTitle}>Or select custom range:</Text>
                  <View style={styles.customDateInputs}>
                    <View style={styles.customDateInput}>
                      <Text style={styles.customDateLabel}>Start Date</Text>
                      <TouchableOpacity 
                        style={styles.customDateButton}
                        onPress={() => {
                          // Use DateTimePicker for start date
                          setShowCalendar(false);
                          // This would open a DateTimePicker for start date
                        }}
                      >
                        <Text style={styles.customDateButtonText}>
                          {formatDate(startDate)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.customDateInput}>
                      <Text style={styles.customDateLabel}>End Date</Text>
                      <TouchableOpacity 
                        style={styles.customDateButton}
                        onPress={() => {
                          // Use DateTimePicker for end date
                          setShowCalendar(false);
                          // This would open a DateTimePicker for end date
                        }}
                      >
                        <Text style={styles.customDateButtonText}>
                          {formatDate(endDate)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.calendarFooter}>
                <Text style={styles.calendarHint}>
                  {Object.keys(selectedDates).length === 0 
                    ? "Tap start date, then tap end date to select range"
                    : Object.keys(selectedDates).length === 1
                    ? "Now tap your end date to complete the range"
                    : "Range selected! Tap outside to close."
                  }
                </Text>
                {Object.keys(selectedDates).length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => {
                      setSelectedDates({});
                      setStartDate(new Date());
                      setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
                    }}
                  >
                    <Text style={styles.clearButtonText}>Clear Selection</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <CustomButton
            title={createAdMutation.isPending ? "Creating..." : "Create (GET)"}
            onPress={async () => {
              const isFormValid =
                campaignName.trim().length > 0 &&
                campaignCategory.trim().length > 0 &&
                description.trim().length > 0 &&
                startDate < endDate;

              if (!isFormValid || createAdMutation.isPending) {
                setErrorText(!isFormValid ? 'Please fill all fields and ensure end date is after start date.' : '');
                return;
              }
              try {
                setErrorText('');
                setSuccessResponse(''); // Clear previous responses
                // Build booking using selected start and end dates
                const startUtc = new Date(startDate.toISOString());
                const endUtc = new Date(endDate.toISOString());
                const payload = {
                  company_id: COMPANY_ID,
                  board_id: BOARD_ID,
                  title: campaignName,
                  description: description,
                  total_payment: 5000,
                  bookings: [
                    { start_at: startUtc.toISOString(), end_at: endUtc.toISOString() },
                  ],
                };
                console.log('CreateAdvertisement GET request payload →', payload);
                console.log('Making GET request to create advertisement...');
                const response = await createAdMutation.mutateAsync(payload);
                console.log('Advertisement created successfully via GET request!');
                console.log('Full API Response:', response);
                // Don't navigate immediately, let user see the response
                // navigation.navigate('CampaignUploadFiles');
              } catch (e) {
                // remain on the same screen on failure
                console.error('Failed to create advertisement via GET request:', e);
                setErrorText(`Failed to create advertisement: ${e instanceof Error ? e.message : 'Unknown error'}`);
              }
            }}
            variant="primary"
            size="medium"
            buttonStyle={styles.nextButton}
            disabled={createAdMutation.isPending}
          />
          {!!errorText && (
            <Text style={styles.errorText}>{errorText}</Text>
          )}
          {!!successResponse && (
            <View style={styles.successContainer}>
              <Text style={styles.successTitle}>✅ API Success Response:</Text>
              <Text style={styles.successText}>{successResponse}</Text>
              <Text style={styles.statusText}>
                Status: {createAdMutation.isSuccess ? 'SUCCESS' : 'PENDING'}
              </Text>
              <TouchableOpacity
                style={styles.nextScreenButton}
                onPress={() => navigation.navigate('CampaignUploadFiles')}
              >
                <Text style={styles.nextScreenButtonText}>Continue to Next Screen</Text>
              </TouchableOpacity>
            </View>
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
  successContainer: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  successTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successText: {
    color: '#2E7D32',
    fontSize: 11,
    fontFamily: 'monospace',
    backgroundColor: '#F1F8E9',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  nextScreenButton: {
    backgroundColor: '#C538A5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  nextScreenButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdvertismentCreateScreen;
