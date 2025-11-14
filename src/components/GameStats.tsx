'use client';

import { GameStats as GameStatsType } from '@/types/game';
import { Modal, ModalActions } from '@/components/ui/modal';
import { useMemo } from 'react';

interface GameStatsProps {
  stats: GameStatsType;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const GameStats = ({
  stats,
  onReset,
  isOpen,
  onClose,
}: GameStatsProps) => {
  const winRate = useMemo(
    () =>
      stats.gamesPlayed > 0
        ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
        : 0,
    [stats.gamesPlayed, stats.gamesWon]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Statistics'
      actions={
        <ModalActions
          primaryAction={{
            label: 'Reset Stats',
            onClick: onReset,
            variant: 'destructive',
          }}
          secondaryAction={{
            label: 'Close',
            onClick: onClose,
            variant: 'outline',
          }}
        />
      }
    >
      <div className='grid grid-cols-2 gap-4 mb-6'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-gray-900 dark:text-white'>
            {stats.gamesPlayed}
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400'>
            Games Played
          </div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-gray-900 dark:text-white'>
            {winRate}%
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400'>
            Win Rate
          </div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-gray-900 dark:text-white'>
            {stats.currentStreak}
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400'>
            Current Streak
          </div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-gray-900 dark:text-white'>
            {stats.maxStreak}
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400'>
            Max Streak
          </div>
        </div>
      </div>

      <div className='mb-6'>
        <h3 className='text-sm font-semibold text-gray-900 dark:text-white mb-2'>
          Guess Distribution
        </h3>
        <div className='space-y-1'>
          {stats.guessDistribution.map((count, index) => {
            const maxCount = Math.max(...stats.guessDistribution);
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={index} className='flex items-center gap-2'>
                <div className='w-6 text-sm text-gray-600 dark:text-gray-400'>
                  {index + 1}
                </div>
                <div className='flex-1 bg-gray-200 dark:bg-gray-700 rounded h-4 relative'>
                  <div
                    className='bg-green-500 h-full rounded transition-all duration-300'
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className='w-8 text-sm text-gray-600 dark:text-gray-400'>
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
