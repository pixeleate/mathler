/**
 * Client-side service for fetching equations from API routes
 */

export interface EquationResponse {
  equation: string;
  targetNumber: number;
}

/**
 * Gets the daily equation for a specific date
 * @param date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @returns Promise with equation and target number
 */
export const getDailyEquation = async (date?: string): Promise<EquationResponse> => {
  const url = new URL('/api/equations/daily', window.location.origin);
  if (date) {
    url.searchParams.set('date', date);
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch daily equation: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Gets a random equation for practice mode
 * @returns Promise with equation and target number
 */
export const getRandomEquation = async (): Promise<EquationResponse> => {
  const response = await fetch('/api/equations/random');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch random equation: ${response.statusText}`);
  }
  
  return response.json();
};
