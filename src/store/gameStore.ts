'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import {
  GameState,
  Guess,
  GameStatus,
  Tile,
  TileState,
  KeyboardState,
  GameStats as GameStatsType,
} from '@/types/game';
import {
  evaluateEquation,
  validateEquation,
  isGuessValidSolution,
} from '@/utils/math';
import { OPERATORS, NUMBERS } from '@/utils/math';
import { MAX_GUESSES, STATS_KEY, TOAST_MESSAGES } from '@/constants/game';
import {
  evaluateTileStates,
  updateKeyboardState,
} from '@/utils/tileEvaluation';

interface GameStore {
  // Game State
  gameState: GameState;
  keyboardState: KeyboardState;
  stats: GameStatsType;

  // UI State
  isPracticeMode: boolean;
  isClient: boolean;
  showStats: boolean;
  showInfo: boolean;
  isLoading: boolean;

  // Game Actions
  addToCurrentGuess: (value: string) => void;
  removeFromCurrentGuess: () => void;
  submitGuess: () => void;
  resetGame: () => void;

  // Keyboard Actions
  updateKeyboardState: (tiles: Array<{ value: string; state: string }>) => void;
  resetKeyboardState: () => void;

  // Stats Actions
  updateStats: (won: boolean, guessCount: number) => void;
  resetStats: () => void;

  // UI Actions
  setPracticeMode: (isPractice: boolean) => void;
  setClient: (isClient: boolean) => void;
  setShowStats: (show: boolean) => void;
  setShowInfo: (show: boolean) => void;
  setLoading: (loading: boolean) => void;

  // Callbacks
  onGameWon?: (data: {
    equation: string;
    targetNumber: number;
    guesses: number;
    isPracticeMode: boolean;
  }) => void;
  setOnGameWon: (
    callback: (data: {
      equation: string;
      targetNumber: number;
      guesses: number;
      isPracticeMode: boolean;
    }) => void
  ) => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        gameState: {
          targetNumber: 0,
          targetEquation: '',
          guesses: [],
          currentGuess: '',
          gameStatus: 'playing' as GameStatus,
          maxGuesses: MAX_GUESSES,
          currentGuessIndex: 0,
        },
        keyboardState: {},
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          maxStreak: 0,
          guessDistribution: [0, 0, 0, 0, 0, 0],
        },
        isPracticeMode: false,
        isClient: false,
        showStats: false,
        showInfo: false,
        isLoading: true,
        onGameWon: undefined,

        // Game Actions
        addToCurrentGuess: (value: string) => {
          const { gameState } = get();
          if (
            gameState.currentGuess.length < 6 &&
            gameState.gameStatus === 'playing'
          ) {
            set((state) => ({
              gameState: {
                ...state.gameState,
                currentGuess: state.gameState.currentGuess + value,
              },
            }));
          }
        },

        removeFromCurrentGuess: () => {
          const { gameState } = get();
          if (
            gameState.currentGuess.length > 0 &&
            gameState.gameStatus === 'playing'
          ) {
            set((state) => ({
              gameState: {
                ...state.gameState,
                currentGuess: state.gameState.currentGuess.slice(0, -1),
              },
            }));
          }
        },

        submitGuess: () => {
          const { gameState, isPracticeMode } = get();

          if (
            gameState.currentGuess.length !== 6 ||
            gameState.gameStatus !== 'playing'
          ) {
            return;
          }

          const equation = gameState.currentGuess;
          const isValid = validateEquation(equation);

          if (!isValid) {
            toast.error(TOAST_MESSAGES.INVALID_OPERATION, {
              description: TOAST_MESSAGES.INVALID_OPERATION_DESCRIPTION,
            });
            return;
          }

          const result = evaluateEquation(equation);
          const isCorrectSolution = isGuessValidSolution(
            equation,
            gameState.targetEquation
          );

          // Check if equation equals target number
          if (result !== gameState.targetNumber) {
            toast.error(TOAST_MESSAGES.EQUATION_MUST_EQUAL_TARGET, {
              description: `Your equation equals ${result}, but the target is ${gameState.targetNumber}`,
            });
            return;
          }

          // Create tiles for the guess
          const tiles: Tile[] = equation.split('').map((char) => ({
            value: char,
            state: 'empty' as TileState,
          }));

          const newGuess: Guess = {
            tiles,
            equation,
            result,
            isValid,
          };

          // Determine tile states based on correctness
          if (isCorrectSolution) {
            // Correct guess (including commutative solutions) - all tiles are correct
            newGuess.tiles = tiles.map((tile) => ({
              ...tile,
              state: 'correct' as TileState,
            }));

            toast.success(TOAST_MESSAGES.CONGRATULATIONS, {
              description: `The equation ${equation} equals ${result}`,
            });

            set((state) => ({
              gameState: {
                ...state.gameState,
                guesses: [...state.gameState.guesses, newGuess],
                currentGuess: '',
                gameStatus: 'won' as GameStatus,
              },
            }));

            // Update stats for win
            get().updateStats(true, gameState.guesses.length + 1);

            // Call onGameWon callback if set (non-blocking)
            const { onGameWon, isPracticeMode } = get();
            if (onGameWon) {
              // Wrap in try-catch to prevent blocking if callback throws
              try {
                onGameWon({
                  equation: gameState.targetEquation,
                  targetNumber: gameState.targetNumber,
                  guesses: gameState.guesses.length + 1,
                  isPracticeMode,
                });
              } catch (error) {
                console.error('Error in onGameWon callback:', error);
                // Don't block - game should continue
              }
            }
          } else {
            // Evaluate tile states for incorrect guess
            const targetChars = gameState.targetEquation.split('');
            const guessChars = equation.split('');

            const tileStates = evaluateTileStates(guessChars, targetChars);

            newGuess.tiles = tiles.map((tile, index) => ({
              ...tile,
              state: tileStates[index],
            }));

            const newGuessIndex = gameState.currentGuessIndex + 1;
            const isLastGuess = newGuessIndex >= MAX_GUESSES;

            if (isLastGuess) {
              toast.error(TOAST_MESSAGES.GAME_OVER, {
                description: `The target equation was ${gameState.targetEquation}`,
              });
            }

            set((state) => ({
              gameState: {
                ...state.gameState,
                guesses: [...state.gameState.guesses, newGuess],
                currentGuess: '',
                currentGuessIndex: newGuessIndex,
                gameStatus: isLastGuess
                  ? ('lost' as GameStatus)
                  : ('playing' as GameStatus),
              },
            }));

            // Update keyboard state
            get().updateKeyboardState(newGuess.tiles);

            // Update stats for loss if it's the last guess
            if (isLastGuess) {
              get().updateStats(false, 0);
            }
          }
        },

        resetGame: () => {
          // Reset game state - React Query will handle fetching new equation
          set((state) => ({
            gameState: {
              ...state.gameState,
              guesses: [],
              currentGuess: '',
              gameStatus: 'playing' as GameStatus,
              currentGuessIndex: 0,
            },
          }));

          // Reset keyboard state
          get().resetKeyboardState();
        },

        // Keyboard Actions
        updateKeyboardState: (
          tiles: Array<{ value: string; state: string }>
        ) => {
          set((state) => {
            const newState = updateKeyboardState(
              state.keyboardState,
              tiles,
              NUMBERS,
              OPERATORS
            );
            return { keyboardState: newState as KeyboardState };
          });
        },

        resetKeyboardState: () => {
          set({ keyboardState: {} });
        },

        // Stats Actions
        updateStats: (won: boolean, guessCount: number) => {
          set((state) => {
            const newStats = { ...state.stats };

            newStats.gamesPlayed += 1;

            if (won) {
              newStats.gamesWon += 1;
              newStats.currentStreak += 1;
              newStats.maxStreak = Math.max(
                newStats.maxStreak,
                newStats.currentStreak
              );

              // Update guess distribution (1-indexed)
              if (guessCount >= 1 && guessCount <= 6) {
                newStats.guessDistribution[guessCount - 1] += 1;
              }
            } else {
              newStats.currentStreak = 0;
            }

            return { stats: newStats };
          });
        },

        resetStats: () => {
          const defaultStats = {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0,
            guessDistribution: [0, 0, 0, 0, 0, 0],
          };
          set({ stats: defaultStats });
        },

        // UI Actions
        setPracticeMode: (isPractice: boolean) => {
          set({ isPracticeMode: isPractice });
          const { gameState } = get();
          // Reset game when switching modes if:
          // 1. No guesses have been made yet, OR
          // 2. User has won the game (so they can start fresh in practice mode)
          if (
            gameState.guesses.length === 0 ||
            gameState.gameStatus === 'won'
          ) {
            get().resetGame();
          }
        },

        setClient: (isClient: boolean) => {
          set({ isClient });
        },

        setShowStats: (show: boolean) => {
          set({ showStats: show });
        },

        setShowInfo: (show: boolean) => {
          set({ showInfo: show });
        },
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setOnGameWon: (
          callback: (data: {
            equation: string;
            targetNumber: number;
            guesses: number;
            isPracticeMode: boolean;
          }) => void
        ) => {
          set({ onGameWon: callback });
        },
      }),
      {
        name: STATS_KEY,
        partialize: (state) => ({ stats: state.stats }),
      }
    ),
    {
      name: 'mathler-game-store',
    }
  )
);

// Note: Game initialization is now handled in the Game component
// to ensure proper client-side execution and error handling
