'use client';

import { useUserUpdateRequest } from '@dynamic-labs/sdk-react-core';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useEmbeddedWallet } from '@dynamic-labs/sdk-react-core';
import { useAccount } from 'wagmi';
import { useCallback } from 'react';
import { toast } from 'sonner';
import {
  UserMetadataService,
  GameHistoryEntry,
} from '@/services/userMetadataService';

// Type for game result without ID (ID is generated automatically)
export type GameResultInput = Omit<GameHistoryEntry, 'id'>;

export const useGameHistory = () => {
  const { updateUser } = useUserUpdateRequest();
  const { user } = useDynamicContext();
  const { createEmbeddedWallet, userHasEmbeddedWallet } = useEmbeddedWallet();
  const { address } = useAccount();

  const handleFirstWinNFT = useCallback(
    async (metadata: any): Promise<void> => {
      try {
        // Ensure user has an embedded wallet
        let walletAddress: string | undefined;

        if (!userHasEmbeddedWallet) {
          toast.info('Creating your wallet...');
          const wallet = await createEmbeddedWallet();
          walletAddress = wallet?.address;
        } else {
          // Get the embedded wallet address from wagmi useAccount hook
          walletAddress = address;
        }

        if (!walletAddress) {
          toast.error('Unable to get wallet address');
          return;
        }

        // Call NFT minting API
        const response = await fetch('/api/nft/mint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress,
            userId: user?.userId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to mint NFT');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to mint NFT');
        }

        // Mark NFT as received in metadata with image URL and transaction hash
        await UserMetadataService.markNFTReceived(
          updateUser,
          metadata,
          result.nftImageUrl,
          result.crossmintId || result.nftId,
          result.transactionHash
        );

        toast.success(
          '🎉 Congratulations! Your first win NFT has been minted!',
          {
            description: result.crossmintId
              ? `NFT ID: ${result.crossmintId.slice(0, 10)}...`
              : result.transactionHash
              ? `Transaction: ${result.transactionHash.slice(0, 10)}...`
              : 'Check your wallet!',
          }
        );
      } catch (error) {
        console.error('Error minting NFT:', error);
        toast.error('Failed to mint NFT. Please try again later.');
      }
    },
    [user, userHasEmbeddedWallet, createEmbeddedWallet, updateUser, address]
  );

  const saveGameHistory = useCallback(
    async (gameResult: GameResultInput): Promise<void> => {
      if (!user) {
        console.warn('User not logged in, skipping game history save');
        return;
      }

      try {
        const existingMetadata = UserMetadataService.getUserMetadata(user);
        const updatedMetadata = await UserMetadataService.addGameResult(
          updateUser,
          gameResult,
          existingMetadata
        );

        // Check if this is a win and user hasn't successfully received NFT yet
        // Only mint if: won AND (no hasReceivedNFT flag OR no proof of successful mint)
        const hasSuccessfulNFT =
          updatedMetadata.hasReceivedNFT &&
          (updatedMetadata.nftId || updatedMetadata.nftTransactionHash);

        if (gameResult.won && !hasSuccessfulNFT) {
          // Don't await - run in background
          handleFirstWinNFT(updatedMetadata).catch((error) => {
            console.error('NFT minting error:', error);
            // Don't show error toast - it's not critical
          });
        }
      } catch (error) {
        console.error('Error saving game history:', error);
        // Don't show error toast - game should continue
        // The error is already logged
      }
    },
    [user, updateUser, handleFirstWinNFT]
  );

  return {
    saveGameHistory,
  };
};
