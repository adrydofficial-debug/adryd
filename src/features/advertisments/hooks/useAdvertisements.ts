import { useState, useEffect, useCallback } from 'react';
import {
  AdvertisementWithRelations,
  AdvertisementQueryParams,
  AdvertisementStatus,
} from '../domain/entities';
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

// Hook for managing advertisements list
export const useAdvertisements = (initialParams: AdvertisementQueryParams = {}) => {
  const [advertisements, setAdvertisements] = useState<AdvertisementWithRelations[]>([]);
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
      const response: PaginatedAdvertisementsResponse = await getAdvertisements(
        params.page || 1,
        params.limit || 10,
        params.status
      );
      setAdvertisements(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
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
  const [advertisement, setAdvertisement] = useState<AdvertisementWithRelations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvertisement = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response: SingleAdvertisementResponse = await getAdvertisement(id);
      setAdvertisement(response as AdvertisementWithRelations);
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

  const create = async (data: any): Promise<AdvertisementWithRelations | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response: CreateAdvertisementResponse = await createAdvertisement(data);
      return response.advertisement as AdvertisementWithRelations;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create advertisement');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: number, data: any): Promise<AdvertisementWithRelations | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response: SingleAdvertisementResponse = await updateAdvertisement(id, data);
      return response as AdvertisementWithRelations;
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
