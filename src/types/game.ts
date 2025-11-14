export type TileState = 'empty' | 'correct' | 'present' | 'absent';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface Tile {
  value: string;
  state: TileState;
}

export interface Guess {
  tiles: Tile[];
  equation: string;
  result: number | null;
  isValid: boolean;
}

export interface GameState {
  targetNumber: number;
  targetEquation: string;
  guesses: Guess[];
  currentGuess: string;
  gameStatus: GameStatus;
  maxGuesses: number;
  currentGuessIndex: number;
}

export interface KeyboardState {
  [key: string]: TileState;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
}
