'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useDailyEquation, useRandomEquation } from './useEquations';
import { MAX_GUESSES } from '@/constants/game';
import { GameStatus } from '@/types/game';
import { toast } from 'sonner';

export const useGameInitialization = () => {
  const initializedRef = useRef(false);
  const { isPracticeMode, isClient, setLoading, setClient, setPracticeMode } =
    useGameStore();
  const dailyQuery = useDailyEquation();
  const randomQuery = useRandomEquation();

  // Initialize client and practice mode
  useEffect(() => {
    setClient(true);
    const urlParams = new URLSearchParams(window.location.search);
    const urlPracticeMode = urlParams.get('practice') === 'true';
    setPracticeMode(urlPracticeMode);
  }, [setClient, setPracticeMode]);

  // Handle equation loading with React Query
  useEffect(() => {
    if (!isClient || initializedRef.current) return;

    const query = isPracticeMode ? randomQuery : dailyQuery;

    if (query.data) {
      useGameStore.setState((state) => ({
        gameState: {
          targetNumber: query.data.targetNumber,
          targetEquation: query.data.equation,
          guesses: [],
          currentGuess: '',
          gameStatus: 'playing' as GameStatus,
          maxGuesses: MAX_GUESSES,
          currentGuessIndex: 0,
        },
      }));
      setLoading(false);
      initializedRef.current = true;
    } else if (query.isLoading) {
      setLoading(true);
    } else if (query.isError) {
      setLoading(false);
      toast.error('Failed to load game. Please refresh the page.');
      console.error('Failed to load equation:', query.error);
    }
  }, [
    isClient,
    isPracticeMode,
    dailyQuery.data,
    randomQuery.data,
    dailyQuery.isLoading,
    randomQuery.isLoading,
    randomQuery.isError,
    dailyQuery.isError,
    setLoading,
  ]);

  const resetInitialization = () => {
    initializedRef.current = false;
  };

  return {
    dailyQuery,
    randomQuery,
    resetInitialization,
  };
};
