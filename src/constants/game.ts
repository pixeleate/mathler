// Game configuration constants
export const MAX_GUESSES = 6;
export const EQUATION_LENGTH = 6;
export const STATS_KEY = 'mathler-stats';

// Game status messages
export const GAME_MESSAGES = {
  DAILY_TARGET: 'Create an equation that equals',
  PRACTICE_TARGET: 'Create an equation that equals',
  WON: 'Congratulations! You solved it!',
  LOST: 'Game Over! Better luck next time.',
  PRACTICE_MODE: '🎯 Practice Mode - Random equations',
} as const;

// Toast messages
export const TOAST_MESSAGES = {
  INVALID_OPERATION: 'Invalid operation! Please use valid mathematical expressions.',
  INVALID_OPERATION_DESCRIPTION: 'Use numbers and operators (+, -, ×, ÷) in proper sequence. No negative numbers allowed.',
  EQUATION_MUST_EQUAL_TARGET: 'Equation must equal the target number!',
  CONGRATULATIONS: 'Congratulations! You solved it!',
  GAME_OVER: 'Game Over! Better luck next time.',
} as const;

// UI constants
export const UI_CONSTANTS = {
  SKELETON_WIDTH: 'w-64',
  SKELETON_HEIGHT: 'h-8',
  MODAL_MAX_WIDTH: 'max-w-md',
  MODAL_MAX_HEIGHT: 'max-h-[90vh]',
} as const;

// Keyboard constants
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
} as const;

// Theme constants
export const THEME_CONSTANTS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;
