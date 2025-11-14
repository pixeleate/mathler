'use client';

import { Button } from '@/components/ui/button';
import { GameStatus } from '@/types/game';
import { useGameStore } from '@/store/gameStore';
import { useGameInitialization } from '@/hooks/useGameInitialization';

interface GameActionsProps {
  gameStatus: GameStatus;
}

export const GameActions = ({ gameStatus }: GameActionsProps) => {
  const { isPracticeMode, resetGame } = useGameStore();
  const { resetInitialization, dailyQuery, randomQuery } =
    useGameInitialization();

  const handleNewGame = async () => {
    // Reset initialization flag so new equation can be loaded
    resetInitialization();

    // Refetch the appropriate query based on practice mode
    if (isPracticeMode) {
      await randomQuery.refetch();
    } else {
      await dailyQuery.refetch();
    }

    // Reset game state (guesses, current guess, etc.)
    resetGame();
  };

  if (gameStatus === 'playing') {
    return null;
  }

  return (
    <div className='text-center mt-6'>
      {isPracticeMode ? (
        <Button onClick={handleNewGame} size='lg' className='px-6 py-3'>
          New Game
        </Button>
      ) : (
        <Button onClick={handleNewGame} size='lg' className='px-6 py-3'>
          Try Again
        </Button>
      )}
    </div>
  );
};
