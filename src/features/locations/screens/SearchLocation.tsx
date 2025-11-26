import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCities, useLocations } from '../hooks/hooks';
import { City, Location } from '../domain/entities';
import BoardList, { BoardItem } from '../../../components/BoardList';
import { useBoardFilters } from '../../boards/hooks/useBoardFilters';
import { fetchFilteredBoards } from '../../boards/api/api';
import { FilterBoardsParams } from '../../boards/api/types/requests';
import { FilteredBoardsResponse } from '../../boards/api/types/responses';
import { mapFilteredBoards } from '../../boards/domain/mappers';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_MIN_PRICE = 100;
const DEFAULT_MAX_PRICE = 1000;

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
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [draftSelectedFilters, setDraftSelectedFilters] = useState<Set<string>>(new Set());
  const [appliedFilters, setAppliedFilters] = useState<Set<string>>(new Set());
  const [appliedFilterOrder, setAppliedFilterOrder] = useState<string[]>([]);
  const [filteredBoards, setFilteredBoards] = useState<BoardItem[]>([]);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [filterPagination, setFilterPagination] = useState({
    page: DEFAULT_PAGE,
    totalPages: 1,
    total: 0,
    limit: DEFAULT_LIMIT,
  });
  const [selectedLocation, setSelectedLocation] = useState('Lahore');
  const [selectedCityId, setSelectedCityId] = useState<number | undefined>(undefined);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>(undefined);
  const [isLocationExplicitlySelected, setIsLocationExplicitlySelected] = useState(false);
  const [draftSelectedArea, setDraftSelectedArea] = useState<string>('');
  const [draftSelectedLocationId, setDraftSelectedLocationId] = useState<number | undefined>(undefined);
  const [isLocationDropdownVisible, setIsLocationDropdownVisible] = useState(false);
  const [isCitiesDropdownOpen, setIsCitiesDropdownOpen] = useState(false);
  const [isFilterSectionVisible, setIsFilterSectionVisible] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [areaHistory, setAreaHistory] = useState<AreaHistory[]>([
    { id: '1', name: 'Mall Road' },
    { id: '2', name: 'Gulberg' },
    { id: '3', name: 'Model Town' },
  ]);
  const tagsScrollViewRef = useRef<ScrollView>(null);

  const {
    data: citiesData = [],
    isLoading: isCitiesLoading,
    error: citiesError,
    refetch: refetchCities,
  } = useCities();

  const {
    data: areasData = [],
    isLoading: isAreasLoading,
    error: areasError,
  } = useLocations(selectedCityId);

  const {
    data: boardFiltersData,
    isLoading: isBoardFiltersLoading,
    error: boardFiltersError,
    refetch: refetchBoardFilters,
  } = useBoardFilters();

  const {
    mutateAsync: runFilterRequest,
    isPending: isApplyingFilters,
  } = useMutation<FilteredBoardsResponse, Error, FilterBoardsParams>({
    mutationFn: (variables: FilterBoardsParams) => fetchFilteredBoards(variables),
  });

  const cities: City[] = citiesData ?? [];
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) {
      return cities;
    }
    const query = searchQuery.toLowerCase();
    return cities.filter(city => city.name.toLowerCase().includes(query));
  }, [cities, searchQuery]);

  // Initialize selectedCityId when cities load (but don't mark as explicitly selected)
  useEffect(() => {
    if (cities.length > 0 && !selectedCityId && !isLocationExplicitlySelected) {
      const defaultCity = cities.find(city => city.name === selectedLocation);
      if (defaultCity) {
        setSelectedCityId(defaultCity.id);
        // Don't set isLocationExplicitlySelected - this is just default initialization
      }
    }
  }, [cities, selectedLocation, selectedCityId, isLocationExplicitlySelected]);

  useEffect(() => {
    const params = route?.params;
    if (params) {
      if (params.openLocationModal === true) {
        setIsLocationDropdownVisible(true);
        refetchCities();
        setDraftSelectedArea(selectedArea);
        setDraftSelectedLocationId(selectedLocationId);
        setIsCitiesDropdownOpen(false);
      }
      
      if (params.openFilters === true) {
        setIsFilterSectionVisible(true);
        refetchBoardFilters();
      }
    }
  }, [route?.params, selectedArea, selectedLocationId, refetchCities, refetchBoardFilters]);

  // Select a city
  const selectCity = (city: City) => {
    setSelectedLocation(city.name);
    setSelectedCityId(city.id);
    setDraftSelectedArea('');
    setDraftSelectedLocationId(undefined); // Clear location ID when city changes
    setSelectedLocationId(undefined); // Clear selected location ID when city changes
    setIsLocationExplicitlySelected(true); // Mark as explicitly selected by user
    setIsCitiesDropdownOpen(false); // Close cities dropdown when city is selected
    // Add to area history if not already present
    if (!areaHistory.find(area => area.name === city.name)) {
      setAreaHistory(prev => [
        { id: Date.now().toString(), name: city.name },
        ...prev.slice(0, 2), // Keep only last 3 items
      ]);
    }
  };

  // Select an area
  const selectArea = (area: Location) => {
    setDraftSelectedArea(area.name);
    setDraftSelectedLocationId(area.id);
  };

  // Cancel location selection
  const handleCancelLocation = () => {
    setDraftSelectedArea(selectedArea);
    setDraftSelectedLocationId(selectedLocationId);
    setIsLocationDropdownVisible(false);
  };

  // Remove area from history
  const removeAreaFromHistory = (areaId: string) => {
    setAreaHistory(prev => prev.filter(area => area.id !== areaId));
  };

  // Reset all area history
  const resetAreaHistory = () => {
    setAreaHistory([]);
  };

  // Special filters (See All, Recommended)
  const specialFilters: FilterOption[] = useMemo(() => {
    return [
      { id: 'see-all', name: 'See All', category: 'special' },
      { id: 'recommended', name: 'Recommended', category: 'special' },
    ];
  }, []);

  // Filter options from API - organized by groups
  const filterGroups = useMemo(() => {
    if (!boardFiltersData?.groups) {
      return [];
    }
    return boardFiltersData.groups.map(group => ({
      id: group.slug,
      name: group.name,
      slug: group.slug,
      categories: (group.categories || []).map(cat => ({
        id: cat.slug,
        name: cat.name,
        slug: cat.slug,
        groupSlug: group.slug,
      })),
    }));
  }, [boardFiltersData]);

  // Flat list of all filter options (for backward compatibility)
  const filterOptions: FilterOption[] = useMemo(() => {
    const allOptions: FilterOption[] = [];
    
    // Add special filters
    allOptions.push(...specialFilters);
    
    // Add group and category filters
    filterGroups.forEach(group => {
      // Add group itself
      allOptions.push({
        id: group.slug,
        name: group.name,
        category: 'group',
      });
      // Add categories
      group.categories.forEach(cat => {
        allOptions.push({
          id: cat.slug,
          name: cat.name,
          category: 'category',
        });
      });
    });
    
    return allOptions;
  }, [specialFilters, filterGroups]);

  const filterOptionsMap = useMemo(() => {
    const map = new Map<string, FilterOption>();
    filterOptions.forEach(option => map.set(option.id, option));
    return map;
  }, [filterOptions]);

  const filterOrderMap = useMemo(() => {
    const order = new Map<string, number>();
    filterOptions.forEach((option, index) => {
      order.set(option.id, index);
    });
    return order;
  }, [filterOptions]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return filterOptions;
    const query = searchQuery.toLowerCase();
    return filterOptions.filter(option =>
      option.name.toLowerCase().includes(query)
    );
  }, [searchQuery, filterOptions]);

  // Get all child category slugs for a group
  const getGroupChildSlugs = useCallback((groupSlug: string): string[] => {
    const group = filterGroups.find(g => g.slug === groupSlug);
    if (!group) return [];
    return group.categories.map(cat => cat.slug);
  }, [filterGroups]);

  // Check if all children of a group are selected
  const areAllChildrenSelected = useCallback((groupSlug: string): boolean => {
    const childSlugs = getGroupChildSlugs(groupSlug);
    if (childSlugs.length === 0) return false;
    return childSlugs.every(slug => draftSelectedFilters.has(slug));
  }, [draftSelectedFilters, getGroupChildSlugs]);

  // Toggle filter selection (with parent-child logic)
  const toggleFilter = useCallback((filterId: string, isGroup: boolean = false) => {
    setDraftSelectedFilters(prev => {
      const newSet = new Set(prev);
      
      // Handle "See All" special case
      if (filterId === 'see-all') {
        const isSeeAllSelected = prev.has('see-all');
        
        if (isSeeAllSelected) {
          // Deselect "See All", "Recommended" and all category filters
          newSet.delete('see-all');
          newSet.delete('recommended');
          // Remove all category filters (keep only special filters if any)
          filterGroups.forEach(group => {
            group.categories.forEach(cat => {
              newSet.delete(cat.slug);
            });
          });
        } else {
          // Select "See All", "Recommended" and all category filters
          newSet.add('see-all');
          newSet.add('recommended');
          // Add all category filters from all groups
          filterGroups.forEach(group => {
            group.categories.forEach(cat => {
              newSet.add(cat.slug);
            });
          });
        }
        return newSet;
      }
      
      if (isGroup) {
        // If it's a group, toggle all its children
        const childSlugs = getGroupChildSlugs(filterId);
        const allSelected = childSlugs.length > 0 && childSlugs.every(slug => prev.has(slug));
        
        if (allSelected) {
          // Deselect all children
          childSlugs.forEach(slug => newSet.delete(slug));
          // Also deselect "See All" and "Recommended" if they were selected
          newSet.delete('see-all');
          newSet.delete('recommended');
        } else {
          // Select all children
          childSlugs.forEach(slug => newSet.add(slug));
          // Check if all categories are now selected, if so, also select "See All" and "Recommended"
          const allCategoriesSelected = filterGroups.every(group => 
            group.categories.every(cat => {
              if (group.slug === filterId) {
                // For the current group, check if all are selected after adding
                return newSet.has(cat.slug);
              }
              return prev.has(cat.slug);
            })
          );
          if (allCategoriesSelected) {
            newSet.add('see-all');
            newSet.add('recommended');
          }
        }
      } else {
        // Regular toggle for individual filters
        if (newSet.has(filterId)) {
          newSet.delete(filterId);
          // If deselecting a category, also deselect "See All" and "Recommended"
          newSet.delete('see-all');
          newSet.delete('recommended');
        } else {
          newSet.add(filterId);
          // Check if all categories are now selected, if so, also select "See All" and "Recommended"
          const allCategoriesSelected = filterGroups.every(group => 
            group.categories.every(cat => {
              if (cat.slug === filterId) {
                // For the current category, check if it's selected after adding
                return newSet.has(cat.slug);
              }
              return prev.has(cat.slug);
            })
          );
          if (allCategoriesSelected) {
            newSet.add('see-all');
            newSet.add('recommended');
          }
        }
      }
      
      return newSet;
    });
  }, [getGroupChildSlugs, filterGroups]);

  // Reset all filters
  const resetAllFilters = () => {
    setDraftSelectedFilters(new Set());
    setAppliedFilters(new Set());
    setAppliedFilterOrder([]);
    setFilteredBoards([]);
    setAppliedSearchQuery('');
    setSearchQuery('');
    setApiError(null);
    setFilterPagination({
      page: DEFAULT_PAGE,
      totalPages: 1,
      total: 0,
      limit: DEFAULT_LIMIT,
    });
  };

  const selectedFilterNames = useMemo(() => {
    return Array.from(draftSelectedFilters)
      .map(id => filterOptionsMap.get(id))
      .filter(Boolean)
      .map(option => option!.name);
  }, [draftSelectedFilters, filterOptionsMap]);

  // Auto-scroll to latest tag when a new filter is selected
  useEffect(() => {
    if (selectedFilterNames.length > 0 && tagsScrollViewRef.current) {
      // Small delay to ensure the tag is rendered
      setTimeout(() => {
        tagsScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [selectedFilterNames.length]);

  const appliedFilterTags = useMemo(() => {
    return appliedFilterOrder
      .map(id => filterOptionsMap.get(id))
      .filter(Boolean)
      .map(option => ({
        id: option!.id,
        name: option!.name,
      }));
  }, [appliedFilterOrder, filterOptionsMap]);

  const convertBoardToBoardItem = useCallback(
    (board: any): BoardItem => {
      const primaryMediaUrl =
        Array.isArray(board.media) && board.media.length > 0
          ? board.media[0]?.url
          : null;
      const imageUrl = board.image_url || board.image || primaryMediaUrl;

      const priceValue =
        typeof board.price === 'number'
          ? board.price
          : board.price
          ? parseFloat(board.price)
          : 0;

      const locationString =
        typeof board.location === 'string'
          ? board.location
          : board.location?.name || board.category?.name || 'Unknown Location';

      return {
        id: board.id?.toString() || 'unknown',
        title: board.title || 'Untitled Board',
        description: board.description || '',
        location: locationString,
        distance: '1.6 km',
        size:
          board.width && board.height
            ? `${board.width}x${board.height}`
            : '12x8',
        price: priceValue || 0,
        currency: board.currency || 'PKR',
        image_url: imageUrl || null,
        image: imageUrl || undefined,
        rating: board.avg_rating ?? board.rating ?? 0,
        reviewCount: board.total_ratings ?? board.reviewCount ?? 0,
        category: board.category?.name || 'Static',
        media: Array.isArray(board.media) ? board.media : [],
      };
    },
    [],
  );

  const handleDetailPress = useCallback(
    (item: BoardItem) => {
      navigation.navigate('SingleBoardDetail', { item });
    },
    [navigation],
  );

  const sortedDraftFilterIds = useMemo(() => {
    const ids = Array.from(draftSelectedFilters);
    return ids.sort((a, b) => {
      const orderA = filterOrderMap.get(a) ?? Number.MAX_SAFE_INTEGER;
      const orderB = filterOrderMap.get(b) ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [draftSelectedFilters, filterOrderMap]);

  const hasFilterChanges = useMemo(() => {
    if (sortedDraftFilterIds.length !== appliedFilterOrder.length) {
      return true;
    }
    for (let i = 0; i < sortedDraftFilterIds.length; i += 1) {
      if (sortedDraftFilterIds[i] !== appliedFilterOrder[i]) {
        return true;
      }
    }
    return false;
  }, [sortedDraftFilterIds, appliedFilterOrder]);

  const hasSearchChange = useMemo(() => {
    return (appliedSearchQuery || '').trim() !== searchQuery.trim();
  }, [appliedSearchQuery, searchQuery]);

  const hasChanges = hasFilterChanges || hasSearchChange;

  const handleCancelChanges = useCallback(() => {
    setDraftSelectedFilters(new Set(appliedFilters));
    setSearchQuery(appliedSearchQuery);
    setApiError(null);
  }, [appliedFilters, appliedSearchQuery]);

  // Apply location selection
  const handleApplyLocation = useCallback(async () => {
    setSelectedArea(draftSelectedArea);
    setSelectedLocationId(draftSelectedLocationId);
    // Clear city_id if area is selected (we use location_id instead)
    if (draftSelectedLocationId) {
      setSelectedCityId(undefined);
      setIsLocationExplicitlySelected(true); // Mark as explicitly selected
    }
    setIsLocationDropdownVisible(false);
    // Add to area history if not already present
    if (draftSelectedArea && !areaHistory.find(area => area.name === draftSelectedArea)) {
      setAreaHistory(prev => [
        { id: Date.now().toString(), name: draftSelectedArea },
        ...prev.slice(0, 2), // Keep only last 3 items
      ]);
    }
    // Automatically trigger filter API call with the new location
    // Use draft values directly since state updates are async
    const locationIdToUse = draftSelectedLocationId;
    const cityIdToUse = draftSelectedLocationId ? undefined : selectedCityId;
    
    if (locationIdToUse || cityIdToUse) {
      const trimmedSearch = searchQuery.trim();
      const sortedIds = sortedDraftFilterIds;
      
      // Build payload based on what filters are selected
      const payload: FilterBoardsParams = {
        // Pagination
        page: DEFAULT_PAGE,
        limit: DEFAULT_LIMIT,
        // Search
        search: trimmedSearch || undefined,
        // Price filters
        min_price: DEFAULT_MIN_PRICE,
        max_price: DEFAULT_MAX_PRICE,
      };

      // Filter out special filter IDs and group slugs - only send category slugs
      const validCategorySlugs = sortedIds.filter(id => {
        // Exclude special filters (they don't have real slugs)
        if (id === 'see-all' || id === 'recommended') {
          return false;
        }
        // Exclude group slugs - only include category slugs
        const isGroupSlug = filterGroups.some(g => g.slug === id);
        return !isGroupSlug;
      });

      // Scenario 1: Filter by slug (board type filters) - only category slugs
      if (validCategorySlugs.length > 0) {
        payload.slug = validCategorySlugs;
        payload.slugs = validCategorySlugs; // Some backends expect both
      }

      // Scenario 2: Filter by location/city
      // Only send if explicitly selected (locationIdToUse means area was selected)
      if (locationIdToUse) {
        payload.location_id = locationIdToUse;
      } else if (cityIdToUse && isLocationExplicitlySelected) {
        // Only send city_id if user explicitly selected a city
        payload.city_id = cityIdToUse;
      }

      console.log('[SearchLocation] Auto-applying filters after location selection:', JSON.stringify(payload, null, 2));
      setApiError(null);
      try {
        const response = await runFilterRequest(payload);
        console.log('[SearchLocation] Filtered boards API response:', response);
        const mapped = mapFilteredBoards(response);
        const total = response.pagination?.total ?? mapped.boards.length;
        const limit = response.pagination?.limit ?? DEFAULT_LIMIT;

        setFilteredBoards(mapped.boards.map(convertBoardToBoardItem));
        setFilterPagination({
          page: mapped.page,
          totalPages: mapped.totalPages,
          total,
          limit,
        });
        // Store only valid category slugs in applied filters
        setAppliedFilters(new Set(validCategorySlugs));
        setAppliedFilterOrder(validCategorySlugs);
        setAppliedSearchQuery(trimmedSearch);
      } catch (error) {
        console.error('[SearchLocation] Failed to apply filters:', error);
        setApiError('Unable to fetch boards. Please try again.');
      }
    }
  }, [
    draftSelectedArea,
    draftSelectedLocationId,
    selectedCityId,
    areaHistory,
    searchQuery,
    sortedDraftFilterIds,
    runFilterRequest,
    convertBoardToBoardItem,
    isLocationExplicitlySelected,
    filterGroups,
  ]);

  const buildFilterPayload = useCallback((page: number = DEFAULT_PAGE): FilterBoardsParams => {
    const trimmedSearch = searchQuery.trim();
    const sortedIds = sortedDraftFilterIds;
    
    // Filter out special filter IDs and group slugs - only send category slugs
    const validCategorySlugs = sortedIds.filter(id => {
      // Exclude special filters (they don't have real slugs)
      if (id === 'see-all' || id === 'recommended') {
        return false;
      }
      // Exclude group slugs - only include category slugs
      const isGroupSlug = filterGroups.some(g => g.slug === id);
      return !isGroupSlug;
    });
    
    // Build payload based on what filters are selected
    const payload: FilterBoardsParams = {
      // Pagination
      page,
      limit: DEFAULT_LIMIT,
      // Search
      search: trimmedSearch || undefined,
      // Price filters
      min_price: DEFAULT_MIN_PRICE,
      max_price: DEFAULT_MAX_PRICE,
    };

    // Scenario 1: Filter by slug (board type filters) - only category slugs
    if (validCategorySlugs.length > 0) {
      payload.slug = validCategorySlugs;
      payload.slugs = validCategorySlugs; // Some backends expect both
    }

    // Scenario 2: Filter by location/city
    // Only send location/city filters if explicitly selected by user
    // If area/location is selected, use location_id; otherwise use city_id
    if (selectedLocationId) {
      payload.location_id = selectedLocationId;
    } else if (selectedCityId && isLocationExplicitlySelected) {
      // Only send city_id if user explicitly selected a city (not just default)
      payload.city_id = selectedCityId;
    }

    return payload;
  }, [
    searchQuery,
    sortedDraftFilterIds,
    selectedLocationId,
    selectedCityId,
    isLocationExplicitlySelected,
    filterGroups,
  ]);

  const handleApplyFilters = useCallback(async () => {
    if (isApplyingFilters) {
      return;
    }

    const trimmedSearch = searchQuery.trim();
    const sortedIds = sortedDraftFilterIds;
    
    // Filter out special filter IDs and group slugs - only send category slugs
    const validCategorySlugs = sortedIds.filter(id => {
      // Exclude special filters (they don't have real slugs)
      if (id === 'see-all' || id === 'recommended') {
        return false;
      }
      // Exclude group slugs - only include category slugs
      const isGroupSlug = filterGroups.some(g => g.slug === id);
      return !isGroupSlug;
    });

    const payload = buildFilterPayload(DEFAULT_PAGE);

    console.log('[SearchLocation] Applying filters payload:', JSON.stringify(payload, null, 2));

    setApiError(null);
    try {
      const response = await runFilterRequest(payload);
      console.log('[SearchLocation] Filtered boards API response:', response);
      const mapped = mapFilteredBoards(response);
      const total = response.pagination?.total ?? mapped.boards.length;
      const limit = response.pagination?.limit ?? DEFAULT_LIMIT;

      setFilteredBoards(mapped.boards.map(convertBoardToBoardItem));
      setFilterPagination({
        page: mapped.page,
        totalPages: mapped.totalPages,
        total,
        limit,
      });
      // Store only valid category slugs in applied filters
      setAppliedFilters(new Set(validCategorySlugs));
      setAppliedFilterOrder(validCategorySlugs);
      setAppliedSearchQuery(trimmedSearch);
    } catch (error) {
      console.error('[SearchLocation] Failed to apply filters:', error);
      setApiError('Unable to fetch boards. Please try again.');
    }
  }, [
    convertBoardToBoardItem,
    isApplyingFilters,
    runFilterRequest,
    searchQuery,
    sortedDraftFilterIds,
    selectedLocationId,
    selectedCityId,
    isLocationExplicitlySelected,
    filterGroups,
    buildFilterPayload,
  ]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || isApplyingFilters) {
      return;
    }

    const nextPage = filterPagination.page + 1;
    if (nextPage > filterPagination.totalPages) {
      return; // No more pages to load
    }

    setIsLoadingMore(true);
    setApiError(null);

    try {
      const payload = buildFilterPayload(nextPage);
      const response = await runFilterRequest(payload);
      const mapped = mapFilteredBoards(response);
      const total = response.pagination?.total ?? filterPagination.total;
      const limit = response.pagination?.limit ?? DEFAULT_LIMIT;

      // Append new boards to existing ones
      setFilteredBoards(prev => [
        ...prev,
        ...mapped.boards.map(convertBoardToBoardItem),
      ]);
      setFilterPagination({
        page: mapped.page,
        totalPages: mapped.totalPages,
        total,
        limit,
      });
    } catch (error) {
      console.error('[SearchLocation] Failed to load more boards:', error);
      setApiError('Unable to load more boards. Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    isApplyingFilters,
    filterPagination,
    buildFilterPayload,
    runFilterRequest,
    convertBoardToBoardItem,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#70737D" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your board"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={[
              styles.locationTag,
              isLocationDropdownVisible && styles.locationTagActive,
            ]}
            onPress={() => {
              setIsLocationDropdownVisible(prev => {
                const next = !prev;
                if (!prev) {
                  refetchCities();
                  setDraftSelectedArea(selectedArea);
                  setDraftSelectedLocationId(selectedLocationId);
                  setIsCitiesDropdownOpen(false); // Keep cities dropdown closed by default
                } else {
                  setIsCitiesDropdownOpen(false); // Close cities dropdown when modal closes
                }
                return next;
              });
            }}
          >
            <Text
              style={[
                styles.locationTagText,
                isLocationDropdownVisible && styles.locationTagTextActive,
              ]}
            >
              {selectedLocation}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.filterIconButton}
          onPress={() => {
            setIsFilterSectionVisible(prev => !prev);
            if (!isFilterSectionVisible) {
              refetchBoardFilters();
            }
          }}
        >
          <Ionicons
            name="options"
            size={20}
            color={isFilterSectionVisible ? '#70737D' : '#333'}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContainer}>
        {/* Set Filter Section - Only visible when filter icon is clicked */}
        {isFilterSectionVisible ? (
          <>
            {/* Fixed Header and Tags */}
            <View style={styles.filterHeaderContainer}>
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Set Filter</Text>
                {draftSelectedFilters.size > 0 && (
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetAllFilters}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resetButtonText}>Reset All</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Selected Filter Tags - displayed just below Set Filter heading */}
              {selectedFilterNames.length > 0 && (
                <View style={styles.tagsWrapper}>
                  <ScrollView
                    ref={tagsScrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tagsContainer}
                    contentContainerStyle={styles.tagsContainerContent}
                  >
                    {selectedFilterNames.map((name, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{name}</Text>
                        <TouchableOpacity
                          style={styles.tagClose}
                          onPress={() => {
                            const filterId = filterOptions.find(
                              f => f.name === name,
                            )?.id;
                            if (filterId) toggleFilter(filterId);
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="close" size={14} color="#C538A5" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Scrollable Filter Options List */}
            <ScrollView
              style={styles.filterOptionsScrollView}
              contentContainerStyle={styles.filterOptionsScrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <View style={styles.optionsListContent}>
                {isBoardFiltersLoading ? (
                  <ActivityIndicator size="small" color="#C538A5" />
                ) : boardFiltersError ? (
                  <View style={styles.errorState}>
                    <Text style={styles.errorStateText}>
                      Unable to load filters. Tap retry to try again.
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        refetchBoardFilters();
                      }}
                      style={styles.retryFiltersButton}
                    >
                      <Text style={styles.retryFiltersButtonText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {/* Special Filters Section */}
                    {specialFilters.filter(option => 
                      !searchQuery.trim() || 
                      option.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length > 0 && (
                      <View style={styles.filterSectionCard}>
                        {specialFilters
                          .filter(option => 
                            !searchQuery.trim() || 
                            option.name.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((option, index, array) => {
                            const isSelected = draftSelectedFilters.has(option.id);
                            const isFirst = index === 0;
                            const isLast = index === array.length - 1;
                            return (
                              <TouchableOpacity
                                key={option.id}
                                style={[
                                  styles.filterOption,
                                  isFirst && styles.filterOptionFirst,
                                  isLast && styles.filterOptionLast,
                                  isSelected && styles.filterOptionSelected,
                                ]}
                                onPress={() => toggleFilter(option.id, false)}
                              >
                                <View
                                  style={[
                                    styles.checkbox,
                                    isSelected && styles.checkboxSelected,
                                  ]}
                                >
                                  {isSelected && (
                                    <Ionicons name="checkmark" size={11} color="#fff" />
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
                    )}

                    {/* Group Filters Section */}
                    {filterGroups
                      .filter(group => 
                        !searchQuery.trim() || 
                        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        group.categories.some(cat => 
                          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                      )
                      .map(group => {
                        const allChildrenSelected = areAllChildrenSelected(group.slug);
                        const hasSomeChildrenSelected = group.categories.some(cat => 
                          draftSelectedFilters.has(cat.slug)
                        );
                        const isGroupIndeterminate = hasSomeChildrenSelected && !allChildrenSelected;
                        const filteredCategories = group.categories.filter(cat => 
                          !searchQuery.trim() || 
                          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                        
                        return (
                          <View key={group.slug} style={styles.filterSectionCard}>
                            {/* Group Header */}
                            <TouchableOpacity
                              style={[
                                styles.filterOption,
                                styles.filterGroupHeader,
                                filteredCategories.length === 0 && styles.filterOptionLast,
                                (allChildrenSelected || isGroupIndeterminate) && styles.filterOptionSelected,
                              ]}
                              onPress={() => toggleFilter(group.slug, true)}
                            >
                              <View
                                style={[
                                  styles.checkbox,
                                  (allChildrenSelected || isGroupIndeterminate) && styles.checkboxSelected,
                                ]}
                              >
                                {(allChildrenSelected || isGroupIndeterminate) && (
                                  <Ionicons 
                                    name={isGroupIndeterminate ? "remove" : "checkmark"} 
                                    size={11} 
                                    color="#fff" 
                                  />
                                )}
                              </View>
                              <Text
                                style={[
                                  styles.filterOptionText,
                                  (allChildrenSelected || isGroupIndeterminate) && styles.filterOptionTextSelected,
                                ]}
                              >
                                {group.name}
                              </Text>
                            </TouchableOpacity>

                            {/* Group Categories (Children) */}
                            {filteredCategories.map((category, index) => {
                              const isSelected = draftSelectedFilters.has(category.slug);
                              const isLast = index === filteredCategories.length - 1;
                              return (
                                <TouchableOpacity
                                  key={category.slug}
                                  style={[
                                    styles.filterOption,
                                    styles.filterCategoryItem,
                                    isLast && styles.filterOptionLast,
                                    isSelected && styles.filterOptionSelected,
                                  ]}
                                  onPress={() => toggleFilter(category.slug, false)}
                                >
                                  <View
                                    style={[
                                      styles.checkbox,
                                      isSelected && styles.checkboxSelected,
                                    ]}
                                  >
                                    {isSelected && (
                                      <Ionicons name="checkmark" size={12} color="#fff" />
                                    )}
                                  </View>
                                  <View/>
                                  <Text
                                    style={[
                                      styles.filterOptionText,
                                      isSelected && styles.filterOptionTextSelected,
                                    ]}
                                  >
                                    {category.name}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        );
                      })}

                    {/* Show message if no filters match search */}
                    {searchQuery.trim() && 
                     specialFilters.every(opt => !opt.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
                     filterGroups.every(group => 
                       !group.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                       !group.categories.some(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
                     ) && (
                      <Text style={styles.noOptionsText}>
                        No filters match your search.
                      </Text>
                    )}
                  </>
                )}
              </View>
            </ScrollView>
          </>
        ) : (
          <ScrollView
            style={styles.mainScrollView}
            contentContainerStyle={styles.mainScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {(appliedFilterTags.length > 0 || appliedSearchQuery) && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.appliedChipsScroll}
                contentContainerStyle={styles.appliedChipsContent}
              >
                {appliedFilterTags.map(tag => (
                  <View key={tag.id} style={styles.appliedChip}>
                    <Text style={styles.appliedChipText}>{tag.name}</Text>
                  </View>
                ))}
                {appliedSearchQuery ? (
                  <View style={styles.appliedChip}>
                    <Text style={styles.appliedChipText}>
                      Search: {appliedSearchQuery}
                    </Text>
                  </View>
                ) : null}
              </ScrollView>
            )}

            {isApplyingFilters && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#C538A5" />
                <Text style={styles.loadingText}>Applying filters…</Text>
              </View>
            )}

            {apiError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{apiError}</Text>
              </View>
            )}

            {/* Boards Results */}
            {filteredBoards.length > 0 && (
              <View style={styles.resultsSection}>
                {/* <Text style={styles.resultsHeading}>Filtered Boards</Text> */}
                <BoardList
                  data={filteredBoards}
                  heading=""
                  showSeeAll={false}
                  numColumns={2}
                  navigation={navigation}
                  onPressDetail={handleDetailPress}
                />
                <Text style={styles.paginationMeta}>
                  Showing {filteredBoards.length} of {filterPagination.total}{' '}
                  results
                </Text>
                {filteredBoards.length < filterPagination.total && (
                  <TouchableOpacity
                    style={[
                      styles.loadMoreButton,
                      isLoadingMore && styles.loadMoreButtonLoading,
                    ]}
                    onPress={handleLoadMore}
                    disabled={isLoadingMore}
                    activeOpacity={0.7}
                  >
                    {isLoadingMore ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.loadMoreButtonText}>Load More</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {filteredBoards.length === 0 &&
              !isApplyingFilters &&
              (appliedFilterOrder.length > 0 || appliedSearchQuery) &&
              !apiError && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>
                    No boards match your current filters. Try adjusting them.
                  </Text>
                </View>
              )}
          </ScrollView>
        )}

        {/* Location Modal - Bottom Sheet */}
        <Modal
          visible={isLocationDropdownVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsLocationDropdownVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setIsLocationDropdownVisible(false)}
            />
            <View style={styles.modalContent}>
              <ScrollView
                style={styles.modalScrollView}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setIsLocationDropdownVisible(false)}
                >
                  <Ionicons name="close" size={20} color="#000" />
                </TouchableOpacity>

                {/* Title */}
                <Text style={styles.modalTitle}>Set Location</Text>

                {/* City Selection */}
                <TouchableOpacity
                style={styles.locationInputContainer}
                onPress={() => {
                  setIsCitiesDropdownOpen(prev => !prev);
                  if (!isCitiesDropdownOpen) {
                    refetchCities();
                  }
                }}
              >
                <Text style={styles.locationInputText}>{selectedLocation}</Text>
                <Ionicons
                  name={isCitiesDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666"
                />
                </TouchableOpacity>

                {/* Cities List */}
                {isCitiesDropdownOpen && (
                  <View style={styles.citiesList}>
                    {isCitiesLoading && (
                      <View style={{ padding: hp(2), alignItems: 'center' }}>
                        <ActivityIndicator size="small" color="#C538A5" />
                      </View>
                    )}
                    {citiesError && !isCitiesLoading && (
                      <View style={{ padding: hp(2) }}>
                        <Text style={styles.errorText}>
                          Unable to load cities. Tap the location again to retry.
                        </Text>
                      </View>
                    )}
                    {!isCitiesLoading && !citiesError && (
                      <ScrollView
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                      >
                        {filteredCities.map(city => {
                          const isSelected = city.id === selectedCityId;
                          return (
                            <TouchableOpacity
                              key={city.id}
                              style={[
                                styles.cityItem,
                                isSelected && styles.cityItemSelected,
                              ]}
                              onPress={() => selectCity(city)}
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
                        {filteredCities.length === 0 && (
                          <View style={{ padding: hp(2) }}>
                            <Text style={styles.noResultsText}>No cities found.</Text>
                          </View>
                        )}
                      </ScrollView>
                    )}
                  </View>
                )}

                {/* Area History Section */}
                {areaHistory.length > 0 && (
                  <View style={styles.areaHistorySection}>
                  <View style={styles.areaHistoryHeader}>
                    <Text style={styles.areaHistoryTitle}>Your Area History</Text>
                    <TouchableOpacity
                      style={styles.resetAllButton}
                      onPress={resetAreaHistory}
                    >
                      <Text style={styles.resetAllButtonText}>Reset All</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Area History Tags */}
                  <View style={styles.areaHistoryTags}>
                    {areaHistory.map(area => (
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
                  </View>
                )}

                {/* Select Area Section */}
                {selectedCityId && (
                  <View style={styles.selectAreaSection}>
                  <Text style={styles.selectAreaTitle}>Select Area</Text>
                  {isAreasLoading && (
                    <ActivityIndicator size="small" color="#C538A5" />
                  )}
                  {areasError && !isAreasLoading && (
                    <Text style={styles.errorText}>
                      Unable to load areas. Please try again.
                    </Text>
                  )}
                  {!isAreasLoading && !areasError && (
                    <ScrollView
                      style={styles.areasList}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                    >
                      {areasData.map((area: Location) => {
                        const isSelected = area.id === draftSelectedLocationId;
                        return (
                          <TouchableOpacity
                            key={area.id}
                            style={[
                              styles.areaItem,
                              isSelected && styles.areaItemSelected,
                            ]}
                            onPress={() => selectArea(area)}
                          >
                            <View
                              style={[
                                styles.checkbox,
                                isSelected && styles.checkboxSelected,
                              ]}
                            >
                              {isSelected && (
                                <Ionicons name="checkmark" size={12} color="#fff" />
                              )}
                            </View>
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
                      {areasData.length === 0 && (
                        <Text style={styles.noResultsText}>No areas found.</Text>
                      )}
                    </ScrollView>
                  )}
                  </View>
                )}

                {/* Footer Actions */}
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
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>

      {/* Footer Actions - Only visible when filter section is open */}
      {isFilterSectionVisible && (
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              handleCancelChanges();
              setIsFilterSectionVisible(false);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.applyButton,
              (!hasChanges || isApplyingFilters) && styles.applyButtonDisabled,
            ]}
            activeOpacity={hasChanges && !isApplyingFilters ? 0.7 : 1}
            onPress={async () => {
              await handleApplyFilters();
              setIsFilterSectionVisible(false);
            }}
            disabled={!hasChanges || isApplyingFilters}
          >
            <Text style={styles.applyButtonText}>
              {isApplyingFilters ? 'Applying…' : 'Apply'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    borderColor:"#E5E7EB",
    borderWidth:0.7,
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
    borderWidth:0.7,
  },
  locationTagText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
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
    borderWidth:0.7,
    borderColor:"#E5E7EB",
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
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
  },
  modalScrollView: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: hp(1),
    marginBottom: hp(2),
    maxHeight: height * 0.35,
    overflow: 'hidden',
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
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
    marginTop: hp(2),
    paddingTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  selectAreaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(1.5),
  },
  areasList: {
    maxHeight: height * 0.3,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 6,
    height: 54,
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
    marginBottom: 0,
  },
  areaItemSelected: {
    backgroundColor: '#FCE7F3',
    borderColor: '#F2BCE9',
  },
  areaItemText: {
    fontSize: 14,
    color: '#70737D',
    fontWeight: '400',
    marginLeft: 12,
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
    backgroundColor: '#FFFFFF',
    paddingTop: hp(2),
    paddingBottom: hp(1.5),
    marginBottom: hp(2),
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
    paddingBottom: hp(1.8),
    paddingTop: 0,
    height: hp(7),
    minHeight: hp(7),
  },
  filterTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  resetButton: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    paddingVertical: hp(0.8),
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
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#F5F5F5',
    marginTop: 0,
  },
  filterOptionSelected: {
    backgroundColor: '#FCE7F3',
    borderColor: '#F2BCE9',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    marginRight: 12,
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
    paddingHorizontal: wp(4),
    paddingTop: hp(1.5),
    paddingBottom: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: hp(2),
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

export default SearchLocation;

