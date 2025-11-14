// Mathematical equation validation and evaluation utilities
import { evaluate } from 'mathjs';

export const OPERATORS = ['+', '-', '×', '÷'] as const;
export const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export type Operator = typeof OPERATORS[number];
export type Number = typeof NUMBERS[number];

/**
 * Validates if a string is a valid mathematical equation
 * @param equation - The equation string to validate
 * @returns boolean indicating if the equation is valid
 */
export const validateEquation = (equation: string): boolean => {
  if (!equation || equation.length < 3 || equation.length > 6) {
    return false;
  }

  // Check if equation contains only valid characters
  const validChars = [...NUMBERS, ...OPERATORS];
  if (!equation.split('').every(char => validChars.includes(char as any))) {
    return false;
  }

  // Check if equation starts and ends with numbers
  if (!NUMBERS.includes(equation[0] as Number) || !NUMBERS.includes(equation[equation.length - 1] as Number)) {
    return false;
  }

  // Check for consecutive operators (invalid operations like *-*, ---, etc.)
  for (let i = 0; i < equation.length - 1; i++) {
    if (OPERATORS.includes(equation[i] as Operator) && OPERATORS.includes(equation[i + 1] as Operator)) {
      return false;
    }
  }

  // Check for invalid operator sequences at the beginning
  // Don't allow any operators at the start (no negative numbers)
  if (OPERATORS.includes(equation[0] as Operator)) {
    return false;
  }

  // Check for multiple consecutive operators (reject all consecutive operators)
  for (let i = 0; i < equation.length - 1; i++) {
    if (OPERATORS.includes(equation[i] as Operator) && OPERATORS.includes(equation[i + 1] as Operator)) {
      return false;
    }
  }

  // Must have proper number-operator-number pattern (no negative numbers)
  let hasValidPattern = false;
  for (let i = 1; i < equation.length - 1; i++) {
    if (NUMBERS.includes(equation[i - 1] as Number) && 
        OPERATORS.includes(equation[i] as Operator) && 
        NUMBERS.includes(equation[i + 1] as Number)) {
      hasValidPattern = true;
      break;
    }
  }
  
  // Must have a valid number-operator-number pattern
  if (!hasValidPattern) {
    return false;
  }

  // Check for division by zero
  if (equation.includes('÷0')) {
    return false;
  }

  // Check for valid mathematical structure
  // Must have at least one operator and proper number-operator-number pattern
  const hasOperator = OPERATORS.some(op => equation.includes(op));
  if (!hasOperator) {
    return false;
  }

  // Additional validation: ensure the equation can be parsed as a valid mathematical expression
  try {
    const result = evaluateEquation(equation);
    return typeof result === 'number' && !isNaN(result) && isFinite(result);
  } catch {
    return false;
  }
};

/**
 * Evaluates a mathematical equation using math.js with proper order of operations (PEMDAS/BODMAS)
 * @param equation - The equation string to evaluate
 * @returns The result of the equation evaluation
 */
export const evaluateEquation = (equation: string): number => {
  if (!equation) {
    throw new Error('Empty equation');
  }

  try {
    // Convert × to * and ÷ to / for math.js evaluation
    const jsEquation = equation.replace(/×/g, '*').replace(/÷/g, '/');
    
    // Use math.js to evaluate the equation
    const result = evaluate(jsEquation);
    
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Invalid result');
    }
    
    return result;
  } catch (error) {
    throw new Error(`Invalid equation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


/**
 * Checks if a guess equation is a valid solution for the target equation
 * Only accepts the exact target equation or its commutative variations
 * @param guessEquation - The player's guess
 * @param targetEquation - The target equation
 * @returns True if the guess is a valid solution
 */
export const isGuessValidSolution = (guessEquation: string, targetEquation: string): boolean => {
  try {
    // First check if the guess is a valid equation
    if (!validateEquation(guessEquation)) {
      return false;
    }
    
    // Check if both equations evaluate to the same result
    const guessResult = evaluateEquation(guessEquation);
    const targetResult = evaluateEquation(targetEquation);
    
    if (guessResult !== targetResult) {
      return false;
    }
    
    // Now check if the guess uses the same characters as the target equation
    // This ensures we only accept the exact equation or its commutative variations
    const guessChars = guessEquation.split('').sort();
    const targetChars = targetEquation.split('').sort();
    
    // Check if both equations have the same characters (allowing commutative solutions)
    if (guessChars.length !== targetChars.length) {
      return false;
    }
    
    for (let i = 0; i < guessChars.length; i++) {
      if (guessChars[i] !== targetChars[i]) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
};

