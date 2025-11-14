'use client';

import { useEffect, useRef } from 'react';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { UserMetadataService } from '@/services/userMetadataService';
import { useGameHistory } from './useGameHistory';

export const useNFTMintingCheck = () => {
  const { user } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { saveGameHistory } = useGameHistory();

  const userRef = useRef(user);
  const isLoggedInRef = useRef(isLoggedIn);
  const saveGameHistoryRef = useRef(saveGameHistory);
  const nftCheckRef = useRef<string | null>(null);

  // Keep refs updated
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    isLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  useEffect(() => {
    saveGameHistoryRef.current = saveGameHistory;
  }, [saveGameHistory]);

  // Check if user has wins but no NFT, and trigger minting if needed
  useEffect(() => {
    if (!userRef.current || !isLoggedInRef.current) {
      nftCheckRef.current = null; // Reset when user logs out
      return;
    }

    const userId = userRef.current.userId;
    if (!userId) return; // No userId, can't track

    // Only check once per user
    if (nftCheckRef.current === userId) {
      return; // Already checked for this user
    }

    // Mark that we're checking for this user
    nftCheckRef.current = userId;

    const metadata = UserMetadataService.getUserMetadata(userRef.current);
    if (!metadata) return;

    // Check if user has wins in history
    const hasWins = metadata.history?.some((entry) => entry.won) || false;

    // Check if NFT was successfully minted (has proof)
    const hasSuccessfulNFT =
      metadata.hasReceivedNFT &&
      (metadata.nftId || metadata.nftTransactionHash);

    // If user has wins but no successful NFT, trigger minting
    if (hasWins && !hasSuccessfulNFT) {
      // Find the first win
      const firstWin = metadata.history?.find((entry) => entry.won);
      if (firstWin && firstWin.equation && firstWin.date) {
        // Trigger NFT minting in background (only once)
        setTimeout(() => {
          if (saveGameHistoryRef.current) {
            saveGameHistoryRef
              .current({
                date: firstWin.date,
                equation: firstWin.equation,
                targetNumber: firstWin.targetNumber,
                guesses: firstWin.guesses,
                won: true,
                isPracticeMode: firstWin.isPracticeMode,
              })
              .catch((error) => {
                console.error('Background NFT minting error:', error);
                // Reset ref on error so we can retry later if needed
                nftCheckRef.current = null;
              });
          }
        }, 1000);
      }
    }
  }, [user?.userId, isLoggedIn]);
};
