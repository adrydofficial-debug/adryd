import { useState, useCallback } from 'react';
import { AdvertisementStatus } from '../../advertisements/types';
import {
  submitAdvertisement,
  cancelAdvertisement,
  approveAdvertisement,
  rejectAdvertisement,
  activateAdvertisement,
  completeAdvertisement,
} from '../api';

// Hook for managing advertisement status changes
export const useAdvertisementStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeStatusChange = useCallback(async (
    id: number,
    statusFunction: (id: number) => Promise<any>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await statusFunction(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change status');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const submit = useCallback(async (id: number): Promise<boolean> => {
    return executeStatusChange(id, submitAdvertisement);
  }, [executeStatusChange]);

  const cancel = useCallback(async (id: number): Promise<boolean> => {
    return executeStatusChange(id, cancelAdvertisement);
  }, [executeStatusChange]);

  const approve = useCallback(async (id: number): Promise<boolean> => {
    return executeStatusChange(id, approveAdvertisement);
  }, [executeStatusChange]);

  const reject = useCallback(async (id: number): Promise<boolean> => {
    return executeStatusChange(id, rejectAdvertisement);
  }, [executeStatusChange]);

  const activate = useCallback(async (id: number): Promise<boolean> => {
    return executeStatusChange(id, activateAdvertisement);
  }, [executeStatusChange]);

  const complete = useCallback(async (id: number): Promise<boolean> => {
    return executeStatusChange(id, completeAdvertisement);
  }, [executeStatusChange]);

  // Get status transition options based on current status
  const getAvailableTransitions = useCallback((currentStatus: AdvertisementStatus): AdvertisementStatus[] => {
    const transitions: Record<AdvertisementStatus, AdvertisementStatus[]> = {
      [AdvertisementStatus.DRAFT]: [AdvertisementStatus.PENDING, AdvertisementStatus.CANCELLED],
      [AdvertisementStatus.PENDING]: [AdvertisementStatus.APPROVED, AdvertisementStatus.REJECTED, AdvertisementStatus.CANCELLED],
      [AdvertisementStatus.APPROVED]: [AdvertisementStatus.ACTIVE, AdvertisementStatus.CANCELLED],
      [AdvertisementStatus.REJECTED]: [AdvertisementStatus.DRAFT, AdvertisementStatus.CANCELLED],
      [AdvertisementStatus.ACTIVE]: [AdvertisementStatus.COMPLETED, AdvertisementStatus.CANCELLED],
      [AdvertisementStatus.COMPLETED]: [],
      [AdvertisementStatus.CANCELLED]: [],
    };

    return transitions[currentStatus] || [];
  }, []);

  // Get status display information
  const getStatusInfo = useCallback((status: AdvertisementStatus) => {
    const statusInfo: Record<AdvertisementStatus, { label: string; color: string; description: string }> = {
      [AdvertisementStatus.DRAFT]: {
        label: 'Draft',
        color: '#6B7280',
        description: 'Advertisement is being prepared',
      },
      [AdvertisementStatus.PENDING]: {
        label: 'Pending',
        color: '#F59E0B',
        description: 'Waiting for approval',
      },
      [AdvertisementStatus.APPROVED]: {
        label: 'Approved',
        color: '#10B981',
        description: 'Ready to go live',
      },
      [AdvertisementStatus.REJECTED]: {
        label: 'Rejected',
        color: '#EF4444',
        description: 'Needs revision',
      },
      [AdvertisementStatus.ACTIVE]: {
        label: 'Active',
        color: '#3B82F6',
        description: 'Currently running',
      },
      [AdvertisementStatus.COMPLETED]: {
        label: 'Completed',
        color: '#8B5CF6',
        description: 'Campaign finished',
      },
      [AdvertisementStatus.CANCELLED]: {
        label: 'Cancelled',
        color: '#9CA3AF',
        description: 'Campaign cancelled',
      },
    };

    return statusInfo[status];
  }, []);

  return {
    loading,
    error,
    submit,
    cancel,
    approve,
    reject,
    activate,
    complete,
    getAvailableTransitions,
    getStatusInfo,
  };
};
