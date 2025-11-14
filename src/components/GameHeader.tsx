'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import {
  DynamicConnectButton,
  useDynamicContext,
  useIsLoggedIn,
} from '@dynamic-labs/sdk-react-core';
import { useGameStore } from '@/store/gameStore';
import { useUserNFT } from '@/hooks/useUserNFT';
import { useGameInitialization } from '@/hooks/useGameInitialization';

interface GameHeaderProps {
  onShowNFT: () => void;
  onShowHistory: () => void;
  onShowStats: () => void;
  onShowInfo: () => void;
}

export const GameHeader = ({
  onShowNFT,
  onShowHistory,
  onShowStats,
  onShowInfo,
}: GameHeaderProps) => {
  const { user, handleLogOut } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { hasNFT } = useUserNFT();
  const { isPracticeMode, isClient, setPracticeMode } = useGameStore();
  const { resetInitialization, dailyQuery, randomQuery } =
    useGameInitialization();

  const handleTogglePracticeMode = async () => {
    const newPracticeMode = !isPracticeMode;
    setPracticeMode(newPracticeMode);

    // Update URL query parameter
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newPracticeMode) {
        url.searchParams.set('practice', 'true');
      } else {
        url.searchParams.delete('practice');
      }
      window.history.replaceState({}, '', url.toString());
    }

    // Reset initialization flag so new equation can be loaded
    resetInitialization();

    // Refetch the appropriate query based on new practice mode
    if (newPracticeMode) {
      await randomQuery.refetch();
    } else {
      await dailyQuery.refetch();
    }
  };

  return (
    <header className='w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
      <div className='flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 relative'>
        {/* Logo - Left */}
        <div className='flex items-center gap-2 flex-shrink-0'>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white'>
            Mathler
          </h1>
          {isClient && hasNFT && (
            <button
              onClick={onShowNFT}
              className='flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 dark:bg-yellow-500 hover:bg-yellow-500 dark:hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg transform hover:scale-105'
              title='View your achievement NFT'
              aria-label='View NFT'
            >
              <span className='text-lg'>🏅</span>
            </button>
          )}
        </div>

        {/* Center Buttons */}
        <div className='flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2'>
          {isClient && isLoggedIn && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onShowHistory}
              className='text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            >
              📜 History
            </Button>
          )}
          <Button
            variant='ghost'
            size='sm'
            onClick={onShowStats}
            className='text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          >
            📊 Stats
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={onShowInfo}
            className='text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          >
            ℹ️ Info
          </Button>
          <Button
            onClick={handleTogglePracticeMode}
            variant={isPracticeMode ? 'default' : 'outline'}
            size='sm'
            className='text-xs w-20'
          >
            🎯 Practice
          </Button>
        </div>

        {/* Right Side - Theme Toggle and Connect/Logout */}
        <div className='flex items-center gap-2 flex-shrink-0'>
          <ThemeToggle />
          {isClient ? (
            user ? (
              <Button
                variant='outline'
                size='sm'
                onClick={handleLogOut}
                className='text-xs text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
              >
                Log Out
              </Button>
            ) : (
              <DynamicConnectButton buttonClassName='h-8 px-3 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors whitespace-nowrap'>
                Connect
              </DynamicConnectButton>
            )
          ) : (
            <div className='h-8 w-16' />
          )}
        </div>
      </div>
    </header>
  );
};
