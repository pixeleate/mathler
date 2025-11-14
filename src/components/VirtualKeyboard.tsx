'use client';

import { useEffect, useRef } from 'react';
import { KeyboardState } from '@/types/game';
import { OPERATORS, NUMBERS } from '@/utils/math';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';

interface VirtualKeyboardProps {
  keyboardState: KeyboardState;
  disabled?: boolean;
}

export const VirtualKeyboard = ({ 
  keyboardState, 
  disabled = false 
}: VirtualKeyboardProps) => {
  const { gameState, addToCurrentGuess, removeFromCurrentGuess, submitGuess } = useGameStore();

  // Use refs for handlers to avoid dependency issues
  const gameStateRef = useRef(gameState);
  const submitGuessRef = useRef(submitGuess);
  const removeFromCurrentGuessRef = useRef(removeFromCurrentGuess);
  const addToCurrentGuessRef = useRef(addToCurrentGuess);

  // Keep refs updated
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    submitGuessRef.current = submitGuess;
    removeFromCurrentGuessRef.current = removeFromCurrentGuess;
    addToCurrentGuessRef.current = addToCurrentGuess;
  }, [submitGuess, removeFromCurrentGuess, addToCurrentGuess]);

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameStateRef.current.gameStatus !== 'playing') return;

      if (event.key === 'Enter') {
        submitGuessRef.current();
      } else if (event.key === 'Backspace') {
        removeFromCurrentGuessRef.current();
      } else if (/^[0-9+\-*/]$/.test(event.key)) {
        // Convert * to × and / to ÷ for display
        const key =
          event.key === '*' ? '×' : event.key === '/' ? '÷' : event.key;
        addToCurrentGuessRef.current(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyPress = (key: string) => {
    if (gameState.gameStatus !== 'playing') return;
    addToCurrentGuess(key);
  };

  const handleEnter = () => {
    if (gameState.gameStatus !== 'playing') return;
    submitGuess();
  };

  const handleBackspace = () => {
    if (gameState.gameStatus !== 'playing') return;
    removeFromCurrentGuess();
  };
  const getKeyStyle = (key: string) => {
    const state = keyboardState[key];
    
    switch (state) {
      case 'correct':
        return 'bg-green-500 text-white border-green-500';
      case 'present':
        return 'bg-yellow-500 text-white border-yellow-500';
      case 'absent':
        return 'bg-gray-500 text-white border-gray-500';
      default:
        return 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600';
    }
  };

  const KeyButton = ({ 
    children, 
    onClick, 
    className = '', 
    isWide = false 
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string;
    isWide?: boolean;
  }) => (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      size="sm"
      className={cn(
        'h-12 sm:h-14 px-2 sm:px-4 text-sm sm:text-base font-semibold transition-all duration-150 active:scale-95',
        isWide ? 'flex-1' : 'w-8 sm:w-12',
        className
      )}
    >
      {children}
    </Button>
  );

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-2">
      {/* Number row */}
      <div className="flex gap-1 sm:gap-2 justify-center">
        {NUMBERS.map(num => (
          <KeyButton
            key={num}
            onClick={() => handleKeyPress(num)}
            className={getKeyStyle(num)}
          >
            {num}
          </KeyButton>
        ))}
      </div>

      {/* Operator row with Enter and Delete */}
      <div className="flex gap-1 sm:gap-2">
        <KeyButton
          onClick={handleEnter}
          isWide
          className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
        >
          ENTER
        </KeyButton>
        {OPERATORS.map(op => (
          <KeyButton
            key={op}
            onClick={() => handleKeyPress(op)}
            className={getKeyStyle(op)}
          >
            {op}
          </KeyButton>
        ))}
        <KeyButton
          onClick={handleBackspace}
          isWide
          className="bg-red-500 text-white border-red-500 hover:bg-red-600"
        >
          ⌫
        </KeyButton>
      </div>
    </div>
  );
};
