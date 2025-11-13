import { useState, useEffect, useCallback } from 'react';
import { AdvertisementStatus } from '../domain/entities';
import {
  getAdvertisements,
  getAdvertisement,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  changeAdvertisementStatus,
} from '../api/api';
import {
  PaginatedAdvertisementsResponse,
  SingleAdvertisementResponse,
  CreateAdvertisementResponse,
} from '../api/types/responses';
import { ChangeAdvertisementStatusRequest } from '../api/types/requests';

type AdvertisementQueryParams = {
  page?: number;
  limit?: number;
  status?: AdvertisementStatus | string;
};

// Hook for managing advertisements list
export const useAdvertisements = (initialParams: AdvertisementQueryParams = {}) => {
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });
  const [params, setParams] = useState<AdvertisementQueryParams>(initialParams);

  const fetchAdvertisements = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Step 1: Fetch first page to get total count and server page size
      const initialPage = params.page || 1;
      // Use params.limit if provided, otherwise use a large number to try to get all data
      // But server may still override it with its own limit
      const requestedLimit = params.limit || 1000;

      console.log('🚀 STARTING FETCH:', {
        page: initialPage,
        requestedLimit,
        paramsStatus: params.status,
        willFilterByStatus: !!params.status,
      });

      const firstResponse: PaginatedAdvertisementsResponse = await getAdvertisements(
        initialPage,
        requestedLimit,
        undefined, // ALWAYS pass undefined for status to get ALL data, filter client-side
      );

      const {
        total = 0,
        limit: serverLimit = requestedLimit,
        data: firstPageData = [],
      } = firstResponse || {};

      console.log('📄 PAGE 1 FETCHED - RAW RESPONSE:', {
        fullResponse: JSON.stringify(firstResponse, null, 2),
        totalFromAPI: total,
        requestedLimit,
        serverLimit,
        returnedItems: Array.isArray(firstPageData) ? firstPageData.length : 0,
        itemIds: Array.isArray(firstPageData) ? firstPageData.map((item: any) => item.id) : [],
        allStatuses: Array.isArray(firstPageData) ? firstPageData.map((item: any) => item.status) : [],
      });

      if (!Array.isArray(firstPageData) || firstPageData.length === 0) {
        setAdvertisements([]);
        setPagination({
          total: 0,
          page: 1,
          limit: 0,
        });
        setLoading(false);
        return;
      }

      let allAdvertisements: any[] = [...firstPageData];
      const totalItems = total || allAdvertisements.length;
      
      // CRITICAL: Use the server's limit from the response
      // If server returns limit: 10, we MUST use 10 for subsequent requests
      const effectiveLimit = serverLimit > 0 ? serverLimit : firstPageData.length;
      
      // Calculate how many pages we need to fetch
      const totalPages = totalItems > 0 && effectiveLimit > 0 
        ? Math.ceil(totalItems / effectiveLimit)
        : 1;

      console.log('📊 PAGINATION CALCULATION:', {
        totalItems,
        effectiveLimit,
        totalPages,
        willFetchMore: totalPages > 1,
        currentCount: allAdvertisements.length,
        needMore: allAdvertisements.length < totalItems,
        calculation: `${totalItems} / ${effectiveLimit} = ${totalPages} pages`,
      });

      // Step 2: Fetch ALL remaining pages to get complete data
      // CRITICAL: Continue fetching until we have ALL items (totalItems)
      // Don't stop until we have collected all items from all pages
      let currentPage = initialPage + 1;
      
      // Keep fetching until we have all items OR no more data is returned
      while (allAdvertisements.length < totalItems) {
        // Check if we need to fetch more pages
        if (currentPage > totalPages) {
          console.log(`⚠️ Calculated pages exhausted (page ${currentPage} > ${totalPages}), but still need ${totalItems - allAdvertisements.length} more items`);
          // If we still need items but ran out of calculated pages, try fetching anyway
          // The API might have more data than the calculation suggests
        }
        
        console.log(`🔄 FETCHING PAGE ${currentPage} (have ${allAdvertisements.length} of ${totalItems}, need ${totalItems - allAdvertisements.length} more)`);
        
        try {
          const response: PaginatedAdvertisementsResponse = await getAdvertisements(
            currentPage,
            effectiveLimit, // Use server's limit, not our requested limit
            undefined, // NO STATUS FILTER - get ALL data
          );

          const pageData = Array.isArray(response?.data) ? response.data : [];
          const responseTotal = response?.total || totalItems;
          
          console.log(`📄 PAGE ${currentPage} FETCHED:`, {
            page: currentPage,
            returnedItems: pageData.length,
            itemIds: pageData.map((item: any) => item.id),
            accumulatedSoFar: allAdvertisements.length + pageData.length,
            totalNeeded: totalItems,
            responseTotal: responseTotal,
            stillNeed: totalItems - (allAdvertisements.length + pageData.length),
          });

          // If no data returned, stop fetching
          if (pageData.length === 0) {
            console.log(`⚠️ PAGE ${currentPage} RETURNED NO DATA - STOPPING`);
            break;
          }

          // Add page data to our collection
          allAdvertisements = allAdvertisements.concat(pageData);
          
          // Update total if API returned a different total (shouldn't happen, but just in case)
          if (responseTotal !== totalItems) {
            console.warn(`⚠️ API returned different total: ${responseTotal} vs expected ${totalItems}`);
          }
          
          // Check if we've reached or exceeded total
          if (allAdvertisements.length >= totalItems) {
            console.log(`✅ REACHED TOTAL (${allAdvertisements.length} >= ${totalItems}) - STOPPING`);
            break;
          }
          
          currentPage++;
          
          // Safety: prevent infinite loop (max 100 pages)
          if (currentPage > 100) {
            console.warn(`⚠️ SAFETY BREAK: Too many pages (${currentPage} > 100)`);
            break;
          }
        } catch (error) {
          console.error(`❌ ERROR FETCHING PAGE ${currentPage}:`, error);
          // If there's an error, stop fetching
          break;
        }
      }

      console.log('✅ FETCHING COMPLETE:', {
        totalFetched: allAdvertisements.length,
        expectedTotal: totalItems,
        allItemIds: allAdvertisements.map((item: any) => item.id),
        allStatuses: allAdvertisements.map((item: any) => item.status),
        matchExpected: allAdvertisements.length === totalItems,
        discrepancy: allAdvertisements.length !== totalItems ? `MISMATCH: Got ${allAdvertisements.length} but expected ${totalItems}` : 'OK',
      });
      
      // CRITICAL CHECK: If we got fewer items than expected, log a warning
      if (allAdvertisements.length < totalItems) {
        console.warn('⚠️⚠️⚠️ WARNING: Fetched fewer items than expected!', {
          fetched: allAdvertisements.length,
          expected: totalItems,
          missing: totalItems - allAdvertisements.length,
        });
      }

      console.log('💾 SETTING ADVERTISEMENTS STATE:', {
        count: allAdvertisements.length,
        ids: allAdvertisements.map((item: any) => item.id),
      });
      setAdvertisements(allAdvertisements);
      setPagination({
        total: totalItems || allAdvertisements.length,
        page: 1,
        limit: allAdvertisements.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch advertisements');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const refetch = useCallback(() => {
    fetchAdvertisements();
  }, [fetchAdvertisements]);

  const updateParams = useCallback((newParams: Partial<AdvertisementQueryParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const filterByStatus = useCallback((status: AdvertisementStatus | undefined) => {
    updateParams({ status, page: 1 });
  }, [updateParams]);

  const changePage = useCallback((page: number) => {
    updateParams({ page });
  }, [updateParams]);

  const changeLimit = useCallback((limit: number) => {
    updateParams({ limit, page: 1 });
  }, [updateParams]);

  useEffect(() => {
    fetchAdvertisements();
  }, [fetchAdvertisements]);

  return {
    advertisements,
    loading,
    error,
    pagination,
    params,
    refetch,
    updateParams,
    filterByStatus,
    changePage,
    changeLimit,
  };
};

// Hook for managing a single advertisement
export const useAdvertisement = (id: number | null) => {
  const [advertisement, setAdvertisement] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvertisement = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response: SingleAdvertisementResponse = await getAdvertisement(id);
      setAdvertisement(response as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch advertisement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAdvertisement();
  }, [fetchAdvertisement]);

  return {
    advertisement,
    loading,
    error,
    refetch: fetchAdvertisement,
  };
};

// Hook for advertisement mutations
export const useAdvertisementMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: any): Promise<any | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response: CreateAdvertisementResponse = await createAdvertisement(data);
      return response.advertisement as any;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create advertisement');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: number, data: any): Promise<any | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response: SingleAdvertisementResponse = await updateAdvertisement(id, data);
      return response as any;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update advertisement');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteAdvertisement(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete advertisement');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id: number, newStatus: AdvertisementStatus): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await changeAdvertisementStatus(id, { new_status: newStatus });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    create,
    update,
    remove,
    changeStatus,
  };
};
