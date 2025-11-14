'use client';

import { GameState } from '@/types/game';
import { Tile } from './Tile';

interface GameBoardProps {
  gameState: GameState;
}

export const GameBoard = ({ gameState }: GameBoardProps) => {
  const renderRow = (rowIndex: number) => {
    const isCurrentRow = rowIndex === gameState.currentGuessIndex;
    const guess = gameState.guesses[rowIndex];
    
    if (guess) {
      // Render completed guess
      return (
        <div key={rowIndex} className="flex gap-1 sm:gap-2">
          {guess.tiles.map((tile, tileIndex) => (
            <Tile key={tileIndex} tile={tile} />
          ))}
        </div>
      );
    } else if (isCurrentRow) {
      // Render current guess in progress
      const currentTiles = gameState.currentGuess.split('').map(char => ({
        value: char,
        state: 'empty' as const,
      }));
      
      // Pad with empty tiles to make 6 total
      while (currentTiles.length < 6) {
        currentTiles.push({ value: '', state: 'empty' });
      }
      
      return (
        <div key={rowIndex} className="flex gap-1 sm:gap-2">
          {currentTiles.map((tile, tileIndex) => (
            <Tile 
              key={tileIndex} 
              tile={tile} 
              isCurrentGuess={true}
              isActive={tileIndex === gameState.currentGuess.length}
            />
          ))}
        </div>
      );
    } else {
      // Render empty row
      return (
        <div key={rowIndex} className="flex gap-1 sm:gap-2">
          {Array(6).fill(null).map((_, tileIndex) => (
            <Tile 
              key={tileIndex} 
              tile={{ value: '', state: 'empty' }} 
            />
          ))}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col gap-1 sm:gap-2 p-4 items-center">
      {Array(gameState.maxGuesses).fill(null).map((_, rowIndex) => renderRow(rowIndex))}
    </div>
  );
};
