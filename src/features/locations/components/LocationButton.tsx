// LocationButton.tsx
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../../../store/appStore';
import { useLocations } from '../hooks/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { LocationApi } from '../api/api';
import { mapLocation } from '../domain/mappers';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

const LocationButton: React.FC = () => {
  const {
    cities,
    isCitiesLoading,
    selectedCity,
    setSelectedCity,
    fetchCities,
    setSelectedLocation,
    selectedLocation,
    applyFilters,
  } = useAppStore();

  const queryClient = useQueryClient();

  const handleOpenModal = () => {
    setIsLocationDropdownVisible(true);

    // ✅ Only fetch if cities not already loaded
    if (cities.length === 0) {
      fetchCities();
    }

    setDraftSelectedCity(selectedCity);
    setDraftSelectedLocationId(selectedLocation?.id);
    setIsCitiesDropdownOpen(false);

    cities.forEach(city => {
      queryClient.prefetchQuery({
        queryKey: ['locations', city.id],
        queryFn: async () => {
          const res = await LocationApi.getLocations(city.id);
          return res.data!.map(mapLocation);
        },
        staleTime: 10 * 60 * 1000,
      });
    });
  };

  const [isLocationDropdownVisible, setIsLocationDropdownVisible] =
    useState(false);
  const [isCitiesDropdownOpen, setIsCitiesDropdownOpen] = useState(false);

  const [draftSelectedCity, setDraftSelectedCity] = useState(selectedCity);
  const [draftSelectedLocationId, setDraftSelectedLocationId] = useState<
    number | undefined
  >(selectedLocation?.id);

  const { data: locations = [], isLoading: isLocationsLoadingDraft } =
    useLocations(draftSelectedCity?.id);

  const handleApplyLocation = () => {
    // Close modal immediately
    setIsLocationDropdownVisible(false);
    setIsCitiesDropdownOpen(false);

    const cityChanged = draftSelectedCity?.id !== selectedCity?.id;
    const selectedLocationObj = locations.find(
      loc => loc.id === draftSelectedLocationId,
    );
    const locationChanged = selectedLocationObj?.id !== selectedLocation?.id;

    if (cityChanged && draftSelectedCity) {
      setSelectedCity(draftSelectedCity); // triggers applyFilters inside
      return; // setSelectedCity already calls applyFilters, stop here
    }

    if (locationChanged) {
      setSelectedLocation(selectedLocationObj ?? null); // triggers applyFilters inside
      return;
    }

    // Nothing changed — still refresh
    applyFilters({ page: 1 });
  };

  const handleCancelLocation = () => {
    setDraftSelectedCity(selectedCity);
    setDraftSelectedLocationId(selectedLocation?.id);
    setIsCitiesDropdownOpen(false);
    setIsLocationDropdownVisible(false);
  };

  return (
    <>
      {/* Button */}
      <TouchableOpacity
        style={styles.locationTag}
        onPress={handleOpenModal}

      >
        <Text
          style={styles.locationTagText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedCity?.name || 'Select City'}
        </Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isLocationDropdownVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelLocation}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCancelLocation}
          />
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScrollView} nestedScrollEnabled>
              <Text style={styles.modalTitle}>Set Location</Text>

              {/* City Selection */}
              <View style={styles.citySelectionContainer}>
                <TouchableOpacity
                  style={styles.locationInputContainer}
                  onPress={() => setIsCitiesDropdownOpen(prev => !prev)}
                >
                  <Text style={styles.locationInputText}>
                    {draftSelectedCity?.name || 'Select City'}
                  </Text>
                  <Ionicons
                    name={isCitiesDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>

                {isCitiesDropdownOpen && (
                  <View
                    style={[
                      styles.citiesDropdownWrapper,
                      styles.citiesDropdownWrapperOpen,
                    ]}
                  >
                    <View style={styles.citiesList}>
                      {isCitiesLoading && (
                        <View style={{ padding: hp(2), alignItems: 'center' }}>
                          <ActivityIndicator size="small" color="#C538A5" />
                        </View>
                      )}
                      {/* {citiesError && !isCitiesLoading && (
                          <View style={{ padding: hp(2) }}>
                            <Text style={styles.errorText}>
                              Unable to load cities. Tap the location again to
                              retry.
                            </Text>
                          </View>
                        )} */}
                      {!isCitiesLoading && (
                        <ScrollView
                          style={styles.citiesListScrollView}
                          showsVerticalScrollIndicator
                          nestedScrollEnabled
                        >
                          {cities.map(city => {
                            const isSelected =
                              city.id === draftSelectedCity?.id;
                            return (
                              <TouchableOpacity
                                key={city.id}
                                style={[
                                  styles.cityItem,
                                  isSelected && styles.cityItemSelected,
                                ]}
                                onPress={() => {
                                  setDraftSelectedCity(city);
                                  setDraftSelectedLocationId(undefined);
                                  setIsCitiesDropdownOpen(false);
                                }}
                              >
                                <View style={styles.radioButton}>
                                  {isSelected && (
                                    <View style={styles.radioButtonSelected} />
                                  )}
                                </View>
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
                          {cities.length === 0 && (
                            <View style={{ padding: hp(2) }}>
                              <Text style={styles.noResultsText}>
                                No cities found.
                              </Text>
                            </View>
                          )}
                        </ScrollView>
                      )}
                    </View>
                  </View>
                )}
              </View>

              {/* Area Selection */}
              {draftSelectedCity && (
                <View style={styles.selectAreaSection}>
                  <Text style={styles.selectAreaTitle}>Select Area</Text>
                  {isLocationsLoadingDraft && (
                    <ActivityIndicator size="small" color="#C538A5" />
                  )}
                  {!isLocationsLoadingDraft && (
                    <ScrollView style={styles.areasList} nestedScrollEnabled>
                      {locations.map(area => {
                        const isSelected = area.id === draftSelectedLocationId;
                        return (
                          <TouchableOpacity
                            key={area.id}
                            style={[
                              styles.areaItem,
                              isSelected && styles.areaItemSelected,
                            ]}
                            onPress={() =>
                              setDraftSelectedLocationId(prev =>
                                prev === area.id ? undefined : area.id
                              )
                            }
                          >
                            <View
                              style={[
                                styles.checkbox,
                                isSelected && styles.checkboxSelected,
                              ]}
                            />
                            <Text
                              style={[
                                styles.areaItemText,
                                isSelected && styles.areaItemTextSelected,
                              ]}
                            >
                              {area.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCancelLocation}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyButton}
                onPress={handleApplyLocation}
              >
                <Text style={styles.modalApplyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: hp(1.5),
    paddingBottom: hp(1.5),
  },
  backButton: {
    width: 40,
    height: 40,
    borderColor: '#E5E7EB',
    borderWidth: 0.7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2.5),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    minHeight: 48,
    marginRight: wp(2.5),
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    padding: 0,
    margin: 0,
  },
  locationTag: {
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    borderColor: '#E5E7EB',
    height: 25,
    paddingHorizontal: 10,
    paddingVertical: 0,
    marginLeft: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.7,
    maxWidth: wp(20),
    flexShrink: 1,     
  },
  locationTagText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    flexShrink: 1,   
  },
  locationTagActive: {
    // Add any background or border changes when active if needed
  },
  locationTagTextActive: {
    color: '#70737D',
  },
  filterIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
  },
  filterIconImage: {
    width: 40,
    height: 40,
  },
  // Main Container
  mainContainer: {
    flex: 1,
  },
  // Main Scroll View
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: hp(12),
  },
  appliedChipsScroll: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1.5),
  },
  appliedChipsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: wp(4),
  },
  appliedChip: {
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
    marginRight: wp(2),
    marginBottom: hp(1.3),
  },
  appliedChipText: {
    color: '#70737D',
    fontSize: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: wp(2),
  },
  errorBanner: {
    marginHorizontal: wp(4),
    marginBottom: hp(1),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1.2),
    borderRadius: 12,
    backgroundColor: '#FECACA',
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
  },
  resultsSection: {
    paddingBottom: hp(2),
    paddingLeft: wp(1),
  },
  resultsHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: hp(1),
  },
  paginationMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: hp(1),
    textAlign: 'center',
  },
  loadMoreButton: {
    marginTop: hp(2),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    backgroundColor: '#C538A5',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    minWidth: wp(30),
    minHeight: 48,
  },
  loadMoreButtonLoading: {
    opacity: 0.8,
  },
  loadMoreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noResultsContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  // Location Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.92,
    minHeight: height * 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalScrollView: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(3),
    flex: 1,
  },
  modalCloseButton: {
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
    fontWeight: '600',
    color: '#111827',
    marginBottom: hp(1),
    paddingTop: hp(4),
    paddingHorizontal: 0,
    letterSpacing: -0.3,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    minHeight: 48,
    width: '100%',
  },
  locationInputText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '400',
    padding: 0,
    margin: 0,
  },
  citySelectionContainer: {
    // marginBottom: hp(2),
  },
  citiesDropdownWrapper: {
    maxHeight: 0,
    overflow: 'hidden',
    marginTop: 0,
    marginBottom: 0,
    minHeight: 0,
  },
  citiesDropdownWrapperOpen: {
    maxHeight: height * 0.32,
    marginTop: hp(1),
    marginBottom: hp(2),
  },
  citiesList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    height: height * 0.32,
  },
  citiesListScrollView: {
    flex: 1,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
    minHeight: 54,
  },
  cityItemSelected: {
    backgroundColor: '#FCE7F3',
  },
  cityItemText: {
    fontSize: 14,
    color: '#70737D',
    fontWeight: '400',
    marginLeft: wp(3),
  },
  cityItemTextSelected: {
    color: '#000',
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C538A5',
  },
  selectAreaSection: {
    paddingTop: hp(2.5),
  },
  selectAreaTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: hp(1),
    paddingHorizontal: 0,
    letterSpacing: -0.2,
  },
  areasListContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: hp(0.5),
    marginBottom: 0,
    marginHorizontal: 0,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'transparent',
    maxHeight: height * 0.35,
  },
  areasList: {
    // maxHeight: height * 0.35,
    borderRadius:12,
    borderColor:"#E5E7EB",
    borderWidth:0.7,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: wp(4),
    paddingRight: wp(4),
    height: 54,
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
    marginBottom: 0,
  },
  areaItemFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  areaItemLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  areaItemSelected: {
    backgroundColor: '#FCE7F3',
    borderColor: '#F2BCE9',
  },
  areaItemText: {
    fontSize: 14,
    color: '#70737D',
    fontWeight: '400',
    marginLeft: 0,
  },
  areaItemTextSelected: {
    color: '#000',
    fontWeight: '400',
  },
  errorText: {
    textAlign: 'center',
    color: '#FF3B30',
    fontSize: 13,
    marginVertical: hp(1),
  },
  errorState: {
    paddingVertical: hp(2),
    alignItems: 'center',
  },
  errorStateText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: hp(1),
    textAlign: 'center',
    paddingHorizontal: wp(4),
  },
  retryFiltersButton: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: 20,
    backgroundColor: '#C538A5',
  },
  retryFiltersButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
    marginVertical: hp(1),
  },
  areaHistorySection: {
    // marginTop: hp(2.5),
    paddingTop: hp(2.5),
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  areaHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: hp(1.5),
  },
  areaHistoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    paddingHorizontal: 0,
    letterSpacing: -0.2,
  },
  resetAllButton: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  resetAllButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  areaHistoryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  filterHeaderContainer: {
    backgroundColor: '#F8F8F8',
    paddingTop: hp(1.75),
    paddingBottom: hp(1.75),
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    zIndex: 10,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    minHeight: hp(6),
  },
  filterOptionsScrollView: {
    flex: 1,
  },
  filterOptionsScrollContent: {
    paddingBottom: hp(3),
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingBottom: 0,
    paddingTop: 0,
    height: hp(7),
    minHeight: hp(7),
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
    lineHeight: 28,
    marginLeft: wp(2),
  },
  resetButton: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  resetButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tagsWrapper: {
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: hp(0.5),
  },
  tagsContainer: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1.2),
    paddingBottom: hp(0.8),
  },
  tagsContainerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: wp(4),
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE7F3',
    borderRadius: 20,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.9),
    marginRight: wp(2),
    marginBottom: hp(0.5),
  },
  tagText: {
    fontSize: 12,
    color: '#C538A5',
    marginRight: wp(1.5),
    fontWeight: '500',
  },
  tagClose: {
    padding: 2,
  },
  optionsListContent: {
    paddingHorizontal: wp(4),
    paddingTop: 0,
    paddingBottom: 0,
  },
  noOptionsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: hp(1),
  },
  filterSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: hp(1.5),
    marginHorizontal: wp(0.4),
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 6,
    height: 54,
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
    marginBottom: 0,
  },
  filterOptionFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  filterOptionLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  filterGroupHeader: {
    backgroundColor: '#F5F5F5',
  },
  filterCategoryItem: {
    paddingLeft: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 0,
  },
  filterOptionSelected: {
    backgroundColor: '#FCE7F3',
    borderColor: '#F2BCE9',
  },
  checkbox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#C538A5',
    borderColor: '#C538A5',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#70737D',
    fontWeight: '400',
    lineHeight: 20,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  filterOptionTextSelected: {
    color: '#000',
    // fontWeight: '500',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(6),
    paddingTop: hp(1.5),
    paddingBottom: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  cancelButton: {
    flex: 1,
    marginRight: wp(3),
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: hp(1.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: hp(1.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C538A5',
  },
  applyButtonDisabled: {
    backgroundColor: '#F3E8F5',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  modalFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(6),
    paddingTop: hp(1.5),
    paddingBottom: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    marginRight: wp(3),
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: hp(1.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalApplyButton: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: hp(1.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C538A5',
  },
  modalApplyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default LocationButton;
