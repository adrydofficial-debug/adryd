import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCities } from '../hooks/hooks';
import { City } from '../domain/entities';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

interface FilterOption {
  id: string;
  name: string;
  category?: string;
}

interface AreaHistory {
  id: string;
  name: string;
}

const SearchLocation: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [selectedLocation, setSelectedLocation] = useState('Lahore');
  const [isLocationDropdownVisible, setIsLocationDropdownVisible] = useState(false);
  const [areaHistory, setAreaHistory] = useState<AreaHistory[]>([
    { id: '1', name: 'Mall Road' },
    { id: '2', name: 'Gulberg' },
    { id: '3', name: 'Model Town' },
  ]);

  const {
    data: citiesData = [],
    isLoading: isCitiesLoading,
    error: citiesError,
    refetch: refetchCities,
  } = useCities();

  const cities: City[] = citiesData ?? [];
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) {
      return cities;
    }
    const query = searchQuery.toLowerCase();
    return cities.filter(city => city.name.toLowerCase().includes(query));
  }, [cities, searchQuery]);

  // Select a city
  const selectCity = (cityName: string) => {
    setSelectedLocation(cityName);
    setIsLocationDropdownVisible(false);
    // Add to area history if not already present
    if (!areaHistory.find(area => area.name === cityName)) {
      setAreaHistory(prev => [
        { id: Date.now().toString(), name: cityName },
        ...prev.slice(0, 2), // Keep only last 3 items
      ]);
    }
  };

  // Remove area from history
  const removeAreaFromHistory = (areaId: string) => {
    setAreaHistory(prev => prev.filter(area => area.id !== areaId));
  };

  // Reset all area history
  const resetAreaHistory = () => {
    setAreaHistory([]);
  };

  // Filter options based on the image
  const filterOptions: FilterOption[] = useMemo(() => [
    { id: 'recommend', name: 'Recommend', category: 'general' },
    { id: 'near', name: 'Near', category: 'general' },
    { id: 'special', name: 'Special', category: 'general' },
    { id: 'digital-pole-signs', name: 'Digital Pole Signs', category: 'digital' },
    { id: 'digital-smd-led', name: 'Digital SMD / LED Screens', category: 'digital' },
    { id: 'digital-billboards', name: 'Digital Billboards', category: 'digital' },
    { id: 'digital-cinema', name: 'Digital Cinema Screens', category: 'digital' },
    { id: 'digital-wall-panels', name: 'Digital Wall Panels', category: 'digital' },
    { id: 'digital-instore', name: 'Digital In-store Displays', category: 'digital' },
    { id: 'billboards', name: 'Billboards', category: 'outdoor' },
    { id: 'bridge-panels', name: 'Bridge Panels', category: 'outdoor' },
    { id: 'bus-shelter', name: 'Bus Shelter Ads', category: 'outdoor' },
    { id: 'mopi-boards', name: 'Mopi Boards', category: 'outdoor' },
    { id: 'wall-panels', name: 'Wall Panels', category: 'outdoor' },
    { id: 'pole-signs', name: 'Pole Signs', category: 'outdoor' },
    { id: 'hoardings', name: 'Hoardings', category: 'outdoor' },
    { id: 'banners', name: 'Banners', category: 'print' },
    { id: 'posters', name: 'Posters', category: 'print' },
    { id: 'flyers', name: 'Flyers', category: 'print' },
    { id: 'airport-ads', name: 'Airport Advertising', category: 'special' },
    { id: 'vehicle-ads', name: 'Vehicle Advertising', category: 'special' },
  ], []);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return filterOptions;
    const query = searchQuery.toLowerCase();
    return filterOptions.filter(option =>
      option.name.toLowerCase().includes(query)
    );
  }, [searchQuery, filterOptions]);

  // Toggle filter selection
  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filterId)) {
        newSet.delete(filterId);
      } else {
        newSet.add(filterId);
      }
      return newSet;
    });
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSelectedFilters(new Set());
  };

  // Get selected filter names for display
  const selectedFilterNames = useMemo(() => {
    return filterOptions
      .filter(option => selectedFilters.has(option.id))
      .map(option => option.name);
  }, [selectedFilters, filterOptions]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your board"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.locationContainer}>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() =>
              setIsLocationDropdownVisible(prev => {
                const next = !prev;
                if (!prev) {
                  refetchCities();
                }
                return next;
              })
            }
          >
            <Text style={styles.locationText}>{selectedLocation}</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.filterIconButton}>
          <Ionicons name="options" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Dropdown - appears in scroll flow just above Set Filter */}
        {isLocationDropdownVisible && (
          <View style={styles.locationDropdownContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsLocationDropdownVisible(false)}
            >
              <Ionicons name="close" size={20} color="#000" />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.modalTitle}>Set Location</Text>

            {/* Location Input/Dropdown */}
            <View style={styles.locationInputContainer}>
              <Text style={styles.locationInputText}>{selectedLocation}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </View>

            {/* Cities List */}
            <View style={styles.citiesList}>
              {isCitiesLoading && (
                <ActivityIndicator size="small" color="#C538A5" />
              )}
              {citiesError && !isCitiesLoading && (
                <Text style={styles.errorText}>
                  Unable to load cities. Tap the location again to retry.
                </Text>
              )}
              {!isCitiesLoading && !citiesError && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {filteredCities.map(city => {
                    const isSelected = city.name === selectedLocation;
                    return (
                      <TouchableOpacity
                        key={city.id}
                        style={[
                          styles.cityItem,
                          isSelected && styles.cityItemSelected,
                        ]}
                        onPress={() => selectCity(city.name)}
                      >
                        <Text
                          style={[
                            styles.cityItemText,
                            isSelected && styles.cityItemTextSelected,
                          ]}
                        >
                          {city.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {filteredCities.length === 0 && (
                    <Text style={styles.noResultsText}>No cities found.</Text>
                  )}
                </ScrollView>
              )}
            </View>

            {/* Area History Section */}
            <View style={styles.areaHistorySection}>
              <View style={styles.areaHistoryHeader}>
                <Text style={styles.areaHistoryTitle}>Your Area History</Text>
                {areaHistory.length > 0 && (
                  <TouchableOpacity
                    style={styles.resetAllButton}
                    onPress={resetAreaHistory}
                  >
                    <Text style={styles.resetAllButtonText}>Reset All</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Area History Tags */}
              {areaHistory.length > 0 && (
                <View style={styles.areaHistoryTags}>
                  {areaHistory.map((area) => (
                    <View key={area.id} style={styles.areaTag}>
                      <Text style={styles.areaTagText}>{area.name}</Text>
                      <TouchableOpacity
                        style={styles.areaTagClose}
                        onPress={() => removeAreaFromHistory(area.id)}
                      >
                        <Ionicons name="close" size={14} color="#C538A5" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Set Filter Section */}
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Set Filter</Text>
          {selectedFilters.size > 0 && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetAllFilters}
            >
              <Text style={styles.resetButtonText}>Reset All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Selected Filter Tags - displayed just below Set Filter heading */}
        {selectedFilterNames.length > 0 && (
          <View style={styles.tagsContainer}>
            {selectedFilterNames.map((name, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{name}</Text>
                <TouchableOpacity
                  style={styles.tagClose}
                  onPress={() => {
                    const filterId = filterOptions.find(f => f.name === name)?.id;
                    if (filterId) toggleFilter(filterId);
                  }}
                >
                  <Ionicons name="close" size={16} color="#1c1b1cff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Filter Options List */}
        <View style={styles.optionsListContent}>
          {filteredOptions.map((option) => {
            const isSelected = selectedFilters.has(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.filterOption,
                  isSelected && styles.filterOptionSelected,
                ]}
                onPress={() => toggleFilter(option.id)}
              >
                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text
                  style={[
                    styles.filterOptionText,
                    isSelected && styles.filterOptionTextSelected,
                  ]}
                >
                  {option.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: StatusBar.currentHeight || 0,
    marginBottom: hp(4),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: wp(2),
    marginRight: wp(2),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    marginRight: wp(2),
  },
  searchIcon: {
    marginRight: wp(2),
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    padding: 0,
  },
  locationContainer: {
    marginRight: wp(2),
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.8),
  },
  locationText: {
    fontSize: 14,
    color: '#000',
    marginRight: wp(1),
    fontWeight: '500',
  },
  filterIconButton: {
    padding: wp(2),
  },
  // Main Scroll View
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: hp(2),
  },
  // Location Dropdown Styles (now in scroll flow)
  locationDropdownContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    marginTop: hp(1),
    marginHorizontal: wp(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(1),
    marginBottom: hp(1),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(2),
    paddingHorizontal: wp(2),
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    marginBottom: hp(2),
  },
  locationInputText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  citiesList: {
    maxHeight: height * 0.35,
    marginBottom: hp(2),
  },
  cityItem: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  cityItemSelected: {
    backgroundColor: '#FCE7F3',
  },
  cityItemText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
  },
  cityItemTextSelected: {
    color: '#C538A5',
    fontWeight: '500',
  },
  errorText: {
    textAlign: 'center',
    color: '#FF3B30',
    fontSize: 13,
    marginVertical: hp(1),
  },
  noResultsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
    marginVertical: hp(1),
  },
  areaHistorySection: {
    marginTop: hp(1),
    paddingTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  areaHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  areaHistoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  resetAllButton: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  resetAllButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  areaHistoryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  areaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE7F3',
    borderRadius: 20,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    marginRight: wp(2),
    marginBottom: hp(0.5),
  },
  areaTagText: {
    fontSize: 12,
    color: '#C538A5',
    marginRight: wp(1.5),
    fontWeight: '500',
  },
  areaTagClose: {
    padding: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  resetButton: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
  },
  resetButtonText: {
    fontSize: 14,
    color: '#C538A5',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: wp(4),
    paddingBottom: hp(1.5),
    marginTop: hp(-1), // Bring it closer to Set Filter heading
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2BCE9',
    borderRadius: 20,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    marginRight: wp(2),
    marginBottom: hp(0.5),
  },
  tagText: {
    fontSize: 12,
    color: '#000',
    marginRight: wp(1.5),
    fontWeight: '500',
  },
  tagClose: {
    padding: 2,
  },
  optionsListContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    marginBottom: hp(1),
  },
  filterOptionSelected: {
    backgroundColor: '#C538A5',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#999',
    marginRight: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
  },
  filterOptionTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default SearchLocation;

