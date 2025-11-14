'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameHistory } from './useGameHistory';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export const useGameHistorySaving = () => {
  const { saveGameHistory } = useGameHistory();
  const { user } = useDynamicContext();
  const { setOnGameWon } = useGameStore();

  const saveGameHistoryRef = useRef(saveGameHistory);
  const userRef = useRef(user);

  // Keep refs updated
  useEffect(() => {
    saveGameHistoryRef.current = saveGameHistory;
  }, [saveGameHistory]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Set up game won callback to save history (non-blocking)
  useEffect(() => {
    setOnGameWon((data) => {
      // Only save if user is logged in
      if (!userRef.current) {
        return;
      }

      // Don't await - run in background to avoid blocking UI
      // Use setTimeout to ensure it runs after state updates
      setTimeout(() => {
        saveGameHistoryRef
          .current({
            date: new Date().toISOString(),
            equation: data.equation,
            targetNumber: data.targetNumber,
            guesses: data.guesses,
            won: true,
            isPracticeMode: data.isPracticeMode,
          })
          .catch((error) => {
            // Silently handle errors - game should continue even if save fails
            console.error('Background save error:', error);
          });
      }, 0);
    });
  }, [setOnGameWon]);
};
