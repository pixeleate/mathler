'use client';

import { Modal } from '@/components/ui/modal';
import { useGameStore } from '@/store/gameStore';
import { useUserNFT } from '@/hooks/useUserNFT';

interface NFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  nftName?: string;
  nftDescription?: string;
}

export const NFTModal = ({
  isOpen,
  onClose,
  nftName = 'Mathler First Win Achievement',
  nftDescription = 'Congratulations on solving your first Mathler equation!',
}: NFTModalProps) => {
  const { isClient } = useGameStore();
  const { hasNFT, nftImageUrl, userMetadata } = useUserNFT();

  // Only render if client is ready and user has NFT
  if (!isClient || !hasNFT) {
    return null;
  }

  const transactionHash = userMetadata?.nftTransactionHash;
  // Avalanche Fuji explorer URL
  const explorerUrl = transactionHash
    ? `https://testnet.snowtrace.io/tx/${transactionHash}`
    : null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Your Achievement NFT'
      actions={
        <button
          onClick={onClose}
          className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
        >
          Close
        </button>
      }
    >
      <div className='flex flex-col items-center space-y-4'>
        <div className='relative w-full max-w-sm'>
          <img
            src={nftImageUrl}
            alt={nftName}
            className='w-full h-auto rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-lg'
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/512?text=NFT+Image';
            }}
          />
        </div>
        <div className='text-center space-y-2'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            {nftName}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {nftDescription}
          </p>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors'
            >
              <span>🔗</span>
              <span>View on Snowtrace</span>
              <span>↗</span>
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
};
