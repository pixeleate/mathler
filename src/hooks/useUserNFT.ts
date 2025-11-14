'use client';

import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { UserMetadataService } from '@/services/userMetadataService';

export const useUserNFT = () => {
  const { user } = useDynamicContext();

  const userMetadata = user ? UserMetadataService.getUserMetadata(user) : null;

  // Only show medal if NFT was actually successfully minted (has ID or transaction hash)
  const hasNFT =
    userMetadata?.hasReceivedNFT &&
    (userMetadata?.nftId || userMetadata?.nftTransactionHash)
      ? true
      : false;

  const nftImageUrl =
    userMetadata?.nftImageUrl ||
    process.env.NEXT_PUBLIC_NFT_IMAGE_URL ||
    'https://placehold.co/512';

  return {
    userMetadata,
    hasNFT,
    nftImageUrl,
  };
};
