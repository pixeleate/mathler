'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/store/gameStore';
import { GameBoard } from './GameBoard';
import { VirtualKeyboard } from './VirtualKeyboard';
import { GameHeader } from './GameHeader';
import { GameStatusMessage } from './GameStatusMessage';
import { GameActions } from './GameActions';
import { useGameInitialization } from '@/hooks/useGameInitialization';
import { useGameHistorySaving } from '@/hooks/useGameHistorySaving';
import { useNFTMintingCheck } from '@/hooks/useNFTMintingCheck';
import { GameStats } from './GameStats';
import { InfoModal } from './InfoModal';
import { GameHistory } from './GameHistory';
import { NFTModal } from './NFTModal';

export const Game = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [showNFT, setShowNFT] = useState(false);

  // Hooks for game logic
  useGameInitialization();
  useGameHistorySaving();
  useNFTMintingCheck();

  // Get all state and actions from Zustand store
  const {
    gameState,
    keyboardState,
    stats,
    isPracticeMode,
    isClient,
    showStats,
    showInfo,
    isLoading,
    resetKeyboardState,
    resetStats,
    setShowStats,
    setShowInfo,
  } = useGameStore();

  // Reset keyboard state when game resets
  useEffect(() => {
    if (gameState.currentGuessIndex === 0 && gameState.guesses.length === 0) {
      resetKeyboardState();
    }
  }, [
    gameState.currentGuessIndex,
    gameState.guesses.length,
    resetKeyboardState,
  ]);

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col'>
      <GameHeader
        onShowNFT={() => setShowNFT(true)}
        onShowHistory={() => setShowHistory(true)}
        onShowStats={() => setShowStats(true)}
        onShowInfo={() => setShowInfo(true)}
      />

      {/* Game Content */}
      <div className='flex-1 flex flex-col items-center py-8'>
        <div className='w-full max-w-md mx-auto px-4'>
          <GameStatusMessage
            gameStatus={gameState.gameStatus}
            targetNumber={gameState.targetNumber}
            targetEquation={gameState.targetEquation}
            guessesCount={gameState.guesses.length}
            isLoading={isLoading}
            isClient={isClient}
            isPracticeMode={isPracticeMode}
          />

          {/* Game Board */}
          <GameBoard gameState={gameState} />

          {/* Virtual Keyboard */}
          <VirtualKeyboard
            keyboardState={keyboardState}
            disabled={gameState.gameStatus !== 'playing'}
          />

          <GameActions gameStatus={gameState.gameStatus} />

          {/* Game Stats Modal */}
          <GameStats
            stats={stats}
            onReset={resetStats}
            isOpen={showStats}
            onClose={() => setShowStats(false)}
          />

          {/* Info Modal */}
          <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />

          {/* Game History Modal */}
          <GameHistory
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
          />

          {/* NFT Modal */}
          <NFTModal isOpen={showNFT} onClose={() => setShowNFT(false)} />
        </div>
      </div>
    </div>
  );
};
