'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { GameStatus } from '@/types/game';
import { GAME_MESSAGES, UI_CONSTANTS } from '@/constants/game';

interface GameStatusMessageProps {
  gameStatus: GameStatus;
  targetNumber: number;
  targetEquation: string;
  guessesCount: number;
  isLoading: boolean;
  isClient: boolean;
  isPracticeMode: boolean;
}

export const GameStatusMessage = ({
  gameStatus,
  targetNumber,
  targetEquation,
  guessesCount,
  isLoading,
  isClient,
  isPracticeMode,
}: GameStatusMessageProps) => {
  const getGameStatusMessage = () => {
    switch (gameStatus) {
      case 'won':
        return `🎉 ${GAME_MESSAGES.WON} You solved it in ${guessesCount} guesses!`;
      case 'lost':
        return `😔 ${GAME_MESSAGES.LOST} The target equation was ${targetEquation} = ${targetNumber}`;
      default:
        return isLoading
          ? 'Loading...'
          : `${GAME_MESSAGES.DAILY_TARGET} ${targetNumber}`;
    }
  };

  return (
    <div className='text-center mb-8'>
      <div className='text-lg text-gray-600 dark:text-gray-400 min-h-[2rem] flex items-center justify-center mb-4'>
        {!isClient || isLoading ? (
          <Skeleton
            className={`${UI_CONSTANTS.SKELETON_HEIGHT} ${UI_CONSTANTS.SKELETON_WIDTH} mx-auto transition-opacity duration-300`}
          />
        ) : (
          <span className='transition-opacity duration-300'>
            {getGameStatusMessage()}
          </span>
        )}
      </div>
      <div className='h-6 mt-1'>
        {isPracticeMode && (
          <p className='text-sm text-blue-600 dark:text-blue-400 font-medium'>
            {GAME_MESSAGES.PRACTICE_MODE}
          </p>
        )}
      </div>
    </div>
  );
};
