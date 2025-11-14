import { TileState } from '@/types/game';

/**
 * Evaluates tile states for a guess against the target equation
 * @param guessChars - The characters in the player's guess
 * @param targetChars - The characters in the target equation
 * @returns Array of tile states for each position
 */
export const evaluateTileStates = (
  guessChars: string[],
  targetChars: string[]
): TileState[] => {
  const tileStates: TileState[] = new Array(6).fill('absent');
  const usedTargetIndices = new Set<number>();
  const usedGuessIndices = new Set<number>();

  // Count character frequencies in target
  const targetCharCounts = new Map<string, number>();
  targetChars.forEach(char => {
    targetCharCounts.set(char, (targetCharCounts.get(char) || 0) + 1);
  });

  // First pass: mark correct positions (green) - exact position matches
  for (let i = 0; i < Math.min(guessChars.length, targetChars.length); i++) {
    if (guessChars[i] === targetChars[i]) {
      tileStates[i] = 'correct';
      usedTargetIndices.add(i);
      usedGuessIndices.add(i);
      // Decrease the count for this character
      const count = targetCharCounts.get(guessChars[i]) || 0;
      targetCharCounts.set(guessChars[i], count - 1);
    }
  }

  // Second pass: mark present but wrong position (yellow) - character exists but wrong position
  for (let guessIndex = 0; guessIndex < guessChars.length; guessIndex++) {
    if (!usedGuessIndices.has(guessIndex)) {
      const guessChar = guessChars[guessIndex];
      // Check if this character still has remaining count in target
      const remainingCount = targetCharCounts.get(guessChar) || 0;
      if (remainingCount > 0) {
        // Look for this character in the target equation that hasn't been used yet
        for (let targetIndex = 0; targetIndex < targetChars.length; targetIndex++) {
          if (!usedTargetIndices.has(targetIndex) && targetChars[targetIndex] === guessChar) {
            tileStates[guessIndex] = 'present';
            usedTargetIndices.add(targetIndex);
            // Decrease the count for this character
            targetCharCounts.set(guessChar, remainingCount - 1);
            break; // Only use each target character once
          }
        }
      }
    }
  }

  return tileStates;
};

/**
 * Updates keyboard state based on tile evaluation results
 * @param currentState - Current keyboard state
 * @param tiles - Array of tiles with their states
 * @param numbers - Array of valid number characters
 * @param operators - Array of valid operator characters
 * @returns Updated keyboard state
 */
export const updateKeyboardState = (
  currentState: Record<string, string>,
  tiles: Array<{ value: string; state: string }>,
  numbers: readonly string[],
  operators: readonly string[]
): Record<string, string> => {
  const newState = { ...currentState };
  
  tiles.forEach(tile => {
    if (tile.value && (numbers.includes(tile.value as any) || operators.includes(tile.value as any))) {
      // Only update if the new state is "better" (correct > present > absent)
      const currentStateValue = newState[tile.value];
      const newStateValue = tile.state as 'correct' | 'present' | 'absent';
      
      if (!currentStateValue || 
          (newStateValue === 'correct') ||
          (newStateValue === 'present' && currentStateValue !== 'correct') ||
          (newStateValue === 'absent' && !currentStateValue)) {
        newState[tile.value] = newStateValue;
      }
    }
  });
  
  return newState;
};
