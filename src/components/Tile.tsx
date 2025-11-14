'use client';

import { Tile as TileType } from '@/types/game';
import { cn } from '@/lib/utils';

interface TileProps {
  tile: TileType;
  isCurrentGuess?: boolean;
  isActive?: boolean;
}

export const Tile = ({
  tile,
  isCurrentGuess = false,
  isActive = false,
}: TileProps) => {
  const getTileStyles = () => {
    if (isCurrentGuess && isActive) {
      return 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950';
    }

    switch (tile.state) {
      case 'correct':
        return 'bg-green-500 text-white border-green-500';
      case 'present':
        return 'bg-yellow-500 text-white border-yellow-500';
      case 'absent':
        return 'bg-gray-500 text-white border-gray-500';
      default:
        return 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div
      className={cn(
        'w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-lg sm:text-xl font-bold border-2 rounded transition-all duration-300 transform',
        getTileStyles(),
        tile.value && tile.state === 'empty' && 'animate-pulse',
        tile.state !== 'empty' && 'animate-bounce'
      )}
    >
      {tile.value}
    </div>
  );
};
