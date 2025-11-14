import { useQuery } from '@tanstack/react-query';

interface EquationResponse {
  equation: string;
  targetNumber: number;
}

// Fetch daily equation
export const useDailyEquation = () => {
  return useQuery<EquationResponse>({
    queryKey: ['equation', 'daily'],
    queryFn: async () => {
      const date = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/equations/daily?date=${date}`);
      if (!response.ok) {
        throw new Error('Failed to fetch daily equation');
      }
      return response.json();
    },
    // Cache for the entire day
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

// Fetch random equation
export const useRandomEquation = () => {
  return useQuery<EquationResponse>({
    queryKey: ['equation', 'random'],
    queryFn: async () => {
      const response = await fetch('/api/equations/random');
      if (!response.ok) {
        throw new Error('Failed to fetch random equation');
      }
      return response.json();
    },
    // Don't cache random equations - always fetch fresh
    staleTime: 0,
    gcTime: 0,
    // Disable automatic refetching
    enabled: false,
  });
};
