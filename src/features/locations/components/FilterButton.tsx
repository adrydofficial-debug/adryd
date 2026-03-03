import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../../../store/appStore';
import { FilterMeta } from '../../boards/domain/entities';
import { useBoardFilters } from '../../boards/hooks';

const filterIcon = require('../../../assets/icons/filter_button.png');

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

const FilterButton: React.FC = () => {
  const { setAppliedFilters } = useAppStore();

  const [isFilterSectionVisible, setIsFilterSectionVisible] = useState(false);

  const [draftSelectedFilters, setDraftSelectedFilters] = useState<Set<string>>(
    new Set(),
  );

  //   const [appliedFilterOrder, setAppliedFilterOrder] = useState<string[]>([]);

  const tagsScrollViewRef = useRef<ScrollView>(null);

  const {
    data: boardFiltersData,
    isLoading: isBoardFiltersLoading,
    error: boardFiltersError,
    refetch: refetchBoardFilters,
  } = useBoardFilters();

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

  const specialFilters: FilterMeta[] = useMemo(() => {
    return [
      { slug: 'see-all', name: 'See All', groupSlug: 'special' },
      { slug: 'recommended', name: 'Recommended', groupSlug: 'special' },
    ];
  }, []);

  // Flat list of all filter options (for backward compatibility)
  const filterOptions: FilterMeta[] = useMemo(() => {
    const allOptions: FilterMeta[] = [];

    // Add special filters
    allOptions.push(...specialFilters);

    // Add group and category filters
    filterGroups.forEach(group => {
      // Add group itself
      allOptions.push({
        slug: group.slug,
        name: group.name,
        groupSlug: 'group',
      });
      // Add categories
      group.categories.forEach(cat => {
        allOptions.push({
          slug: cat.slug,
          name: cat.name,
          groupSlug: 'category',
        });
      });
    });

    return allOptions;
  }, [specialFilters, filterGroups]);

  const filterOptionsMap = useMemo(() => {
    const map = new Map<string, FilterMeta>();
    filterOptions.forEach(option => map.set(option.slug, option));
    return map;
  }, [filterOptions]);

  const filterOrderMap = useMemo(() => {
    const order = new Map<string, number>();
    filterOptions.forEach((option, index) => {
      order.set(option.slug, index);
    });
    return order;
  }, [filterOptions]);

  useEffect(() => {
    if (filterGroups.length > 0 && boardFiltersData?.groups) {
      const newFilters = new Set<string>();
      newFilters.add('see-all');
      newFilters.add('recommended');

      const categorySlugs: string[] = [];

      filterGroups.forEach(group => {
        group.categories.forEach(cat => {
          newFilters.add(cat.slug);
          categorySlugs.push(cat.slug);
        });
      });

      setDraftSelectedFilters(newFilters);
    }
  }, [filterGroups, boardFiltersData]);

  // Get all child category slugs for a group
  const getGroupChildSlugs = useCallback(
    (groupSlug: string): string[] => {
      const group = filterGroups.find(g => g.slug === groupSlug);
      if (!group) return [];
      return group.categories.map(cat => cat.slug);
    },
    [filterGroups],
  );

  // Check if all children of a group are selected
  const areAllChildrenSelected = useCallback(
    (groupSlug: string): boolean => {
      const childSlugs = getGroupChildSlugs(groupSlug);
      if (childSlugs.length === 0) return false;
      return childSlugs.every(slug => draftSelectedFilters.has(slug));
    },
    [draftSelectedFilters, getGroupChildSlugs],
  );

  // Toggle filter selection (with parent-child logic)
  const toggleFilter = useCallback(
    (filterId: string, isGroup: boolean = false) => {
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
          const allSelected =
            childSlugs.length > 0 && childSlugs.every(slug => prev.has(slug));

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
              }),
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
              }),
            );
            if (allCategoriesSelected) {
              newSet.add('see-all');
              newSet.add('recommended');
            }
          }
        }

        return newSet;
      });
    },
    [getGroupChildSlugs, filterGroups],
  );

  // Reset all filters
  const resetAllFilters = () => {
    setDraftSelectedFilters(new Set());
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

  //   const appliedFilterTags = useMemo(() => {
  //     return appliedFilterOrder
  //       .map(id => filterOptionsMap.get(id))
  //       .filter(Boolean)
  //       .map(option => ({
  //         id: option!.slug,
  //         name: option!.name,
  //       }));
  //   }, [appliedFilterOrder, filterOptionsMap]);

  //   const { mutateAsync: runFilterRequest, isPending: isApplyingFilters } =
  //     useMutation<FilteredBoardsResponse, Error, FilterBoardsParams>({
  //       mutationFn: (variables: FilterBoardsParams) =>
  //         fetchFilteredBoards(variables),
  //     });

  //   const buildFilterPayload = useCallback(
  //     (page: number = DEFAULT_PAGE): FilterBoardsParams => {
  //       const trimmedSearch = searchQuery.trim();
  //       const sortedIds = sortedDraftFilterIds;

  //       // Only include real category slugs
  //       const validCategorySlugs = sortedIds.filter(id => {
  //         if (id === 'see-all' || id === 'recommended') return false;
  //         return !filterGroups.some(g => g.slug === id);
  //       });

  //       // Base payload
  //       const payload: FilterBoardsParams = {
  //         page,
  //         limit: DEFAULT_LIMIT,
  //         search: trimmedSearch || undefined,
  //         min_price: DEFAULT_MIN_PRICE,
  //         max_price: DEFAULT_MAX_PRICE,
  //       };

  //       if (validCategorySlugs.length > 0) {
  //         payload.slug = validCategorySlugs;
  //         payload.slugs = validCategorySlugs;
  //       }

  //       // Use store values, not draft values
  //       if (selectedLocationId) {
  //         payload.location_id = selectedLocationId;
  //       } else if (selectedCity) {
  //         payload.city_id = selectedCity.id;
  //       }

  //       return payload;
  //     },
  //     [
  //       searchQuery,
  //       sortedDraftFilterIds,
  //       selectedLocationId,
  //       selectedCity,
  //       filterGroups,
  //     ],
  //   );

  const sortedDraftFilterIds = useMemo(() => {
    const ids = Array.from(draftSelectedFilters);
    return ids.sort((a, b) => {
      const orderA = filterOrderMap.get(a) ?? Number.MAX_SAFE_INTEGER;
      const orderB = filterOrderMap.get(b) ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [draftSelectedFilters, filterOrderMap]);

  //   const hasFilterChanges = useMemo(() => {
  //     if (sortedDraftFilterIds.length !== appliedFilterOrder.length) {
  //       return true;
  //     }
  //     for (let i = 0; i < sortedDraftFilterIds.length; i += 1) {
  //       if (sortedDraftFilterIds[i] !== appliedFilterOrder[i]) {
  //         return true;
  //       }
  //     }
  //     return false;
  //   }, [sortedDraftFilterIds, appliedFilterOrder]);

  const handleCancelChanges = useCallback(() => {
    setIsFilterSectionVisible(false);
  }, []);

  const handleApplyFilters = useCallback(async () => {
    // remove junk filters
    const validCategorySlugs = sortedDraftFilterIds.filter(id => {
      if (id === 'see-all' || id === 'recommended') return false;
      return !filterGroups.some(g => g.slug === id);
    });

    // update store
    setAppliedFilters(new Set(validCategorySlugs));
    // setAppliedFilterOrder(validCategorySlugs);

    // OPTIONAL: if you're fetching immediately
    // (you commented this earlier so I’ll respect your chaos)
    /*
  const payload = buildFilterPayload(DEFAULT_PAGE);
  const response = await runFilterRequest(payload);

  const mapped = mapBoardsResponse(response);

  setFilteredBoards(mapped.boards.map(convertBoardToBoardItem));
  setFilterPagination({
    page: mapped.page,
    totalPages: mapped.totalPages,
    total: mapped.total,
    limit: DEFAULT_LIMIT,
  });
  */
  }, [
    sortedDraftFilterIds,
    filterGroups,
    setAppliedFilters,
    // setAppliedFilterOrder,
  ]);

  const handleOpenFilters = useCallback(() => {
    const newDraft = new Set<string>();

    // restore applied category filters
    // appliedFilterOrder.forEach(id => newDraft.add(id));

    // restore special filters logic
    // if (appliedFilterOrder.length > 0) {
    //   newDraft.add('recommended');
    // }

    // check if ALL categories are selected → add "see-all"
    const allCategorySlugs = filterGroups.flatMap(g =>
      g.categories.map(c => c.slug),
    );

    const isAllSelected =
      allCategorySlugs.length > 0 &&
      allCategorySlugs.every(slug => newDraft.has(slug));

    if (isAllSelected) {
      newDraft.add('see-all');
    }

    setDraftSelectedFilters(newDraft);
    setIsFilterSectionVisible(true);
  }, [filterGroups]);

  return (
    <>
      <TouchableOpacity
        style={styles.filterIconButton}
        onPress={handleOpenFilters}
      >
        <Image
          source={filterIcon}
          style={styles.filterIconImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isFilterSectionVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFilterSectionVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsFilterSectionVisible(false)}
          />
          <View style={styles.modalContent}>
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
                              )?.slug;
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
                      {
                        //   .filter(
                        //     option =>
                        //       !searchQuery.trim() ||
                        //       option.name
                        //         .toLowerCase()
                        //         .includes(searchQuery.toLowerCase()),
                        //   )
                        specialFilters.length > 0 && (
                          <View style={styles.filterSectionCard}>
                            {specialFilters
                              // .filter(
                              //   option =>
                              //     !searchQuery.trim() ||
                              //     option.name
                              //       .toLowerCase()
                              //       .includes(searchQuery.toLowerCase()),
                              // )
                              .map((option, index, array) => {
                                const isSelected = draftSelectedFilters.has(
                                  option.slug,
                                );
                                const isFirst = index === 0;
                                const isLast = index === array.length - 1;
                                return (
                                  <TouchableOpacity
                                    key={option.slug}
                                    style={[
                                      styles.filterOption,
                                      isFirst && styles.filterOptionFirst,
                                      isLast && styles.filterOptionLast,
                                      isSelected && styles.filterOptionSelected,
                                    ]}
                                    onPress={() =>
                                      toggleFilter(option.slug, false)
                                    }
                                  >
                                    <View
                                      style={[
                                        styles.checkbox,
                                        isSelected && styles.checkboxSelected,
                                      ]}
                                    ></View>
                                    <Text
                                      style={[
                                        styles.filterOptionText,
                                        isSelected &&
                                          styles.filterOptionTextSelected,
                                      ]}
                                    >
                                      {option.name}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                          </View>
                        )
                      }

                      {/* Group Filters Section */}
                      {filterGroups
                        // .filter(
                        //   group =>
                        //     !searchQuery.trim() ||
                        //     group.name
                        //       .toLowerCase()
                        //       .includes(searchQuery.toLowerCase()) ||
                        //     group.categories.some(cat =>
                        //       cat.name
                        //         .toLowerCase()
                        //         .includes(searchQuery.toLowerCase()),
                        //     ),
                        // )
                        .map(group => {
                          const allChildrenSelected = areAllChildrenSelected(
                            group.slug,
                          );
                          const hasSomeChildrenSelected = group.categories.some(
                            cat => draftSelectedFilters.has(cat.slug),
                          );
                          const isGroupIndeterminate =
                            hasSomeChildrenSelected && !allChildrenSelected;
                          const filteredCategories = group.categories;
                          //   .filter(
                          //     cat =>
                          //       !searchQuery.trim() ||
                          //       cat.name
                          //         .toLowerCase()
                          //         .includes(searchQuery.toLowerCase()),
                          //   );

                          return (
                            <View
                              key={group.slug}
                              style={styles.filterSectionCard}
                            >
                              {/* Group Header */}
                              <TouchableOpacity
                                style={[
                                  styles.filterOption,
                                  styles.filterGroupHeader,
                                  filteredCategories.length === 0 &&
                                    styles.filterOptionLast,
                                  (allChildrenSelected ||
                                    isGroupIndeterminate) &&
                                    styles.filterOptionSelected,
                                ]}
                                onPress={() => toggleFilter(group.slug, true)}
                              >
                                <View
                                  style={[
                                    styles.checkbox,
                                    (allChildrenSelected ||
                                      isGroupIndeterminate) &&
                                      styles.checkboxSelected,
                                  ]}
                                ></View>
                                <Text
                                  style={[
                                    styles.filterOptionText,
                                    (allChildrenSelected ||
                                      isGroupIndeterminate) &&
                                      styles.filterOptionTextSelected,
                                  ]}
                                >
                                  {group.name}
                                </Text>
                              </TouchableOpacity>

                              {/* Group Categories (Children) */}
                              {filteredCategories.map((category, index) => {
                                const isSelected = draftSelectedFilters.has(
                                  category.slug,
                                );
                                const isLast =
                                  index === filteredCategories.length - 1;
                                return (
                                  <TouchableOpacity
                                    key={category.slug}
                                    style={[
                                      styles.filterOption,
                                      styles.filterCategoryItem,
                                      isLast && styles.filterOptionLast,
                                      isSelected && styles.filterOptionSelected,
                                    ]}
                                    onPress={() =>
                                      toggleFilter(category.slug, false)
                                    }
                                  >
                                    <View
                                      style={[
                                        styles.checkbox,
                                        isSelected && styles.checkboxSelected,
                                      ]}
                                    ></View>
                                    <View />
                                    <Text
                                      style={[
                                        styles.filterOptionText,
                                        isSelected &&
                                          styles.filterOptionTextSelected,
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
                      {/* {searchQuery.trim() &&
                        specialFilters.every(
                          opt =>
                            !opt.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                        ) &&
                        filterGroups.every(
                          group =>
                            !group.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) &&
                            !group.categories.some(cat =>
                              cat.name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()),
                            ),
                        ) && (
                          <Text style={styles.noOptionsText}>
                            No filters match your search.
                          </Text>
                        )} */}
                    </>
                  )}
                </View>
              </ScrollView>
            </>

            {/* Footer */}
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
                  //   (!hasChanges || isApplyingFilters) &&
                  //     styles.applyButtonDisabled,
                ]}
                // activeOpacity={hasChanges && !isApplyingFilters ? 0.7 : 1}
                activeOpacity={1}
                onPress={async () => {
                  await handleApplyFilters();
                  setIsFilterSectionVisible(false);
                }}
                // disabled={!hasChanges || isApplyingFilters}
              >
                <Text style={styles.applyButtonText}>
                  {/* {isApplyingFilters ? 'Applying…' : 'Apply'} */}
                  {'Apply'}
                </Text>
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
    fontWeight: '700',
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
    maxHeight: height * 0.35,
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
export default FilterButton;
