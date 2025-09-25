import { useQuery } from '@tanstack/react-query';
import { roomsAPI } from '../lib/api';

// Hook to preload critical data
export const usePreloadData = () => {
  // Preload rooms data immediately
  const roomsQuery = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsAPI.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    rooms: roomsQuery.data?.data?.rooms || [],
    isRoomsLoading: roomsQuery.isLoading,
    roomsError: roomsQuery.error,
  };
};
