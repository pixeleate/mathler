import { create, all } from 'mathjs';

const math = create(all);

/**
 * Generates a random 6-character equation using math.js
 * @returns A random 6-character equation
 */
export const generateRandomEquation = (): string => {
  const maxAttempts = 1000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const patterns = [
      // Pattern 1: AB×C+D (two digit × single digit + single digit) - 6 chars: 12×3+4
      () => {
        const a = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const b = Math.floor(Math.random() * 10);
        const c = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const d = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const op1 = ['×'][Math.floor(Math.random() * 1)]; // Only × to ensure positive results
        const op2 = ['+'][Math.floor(Math.random() * 1)]; // Only + to ensure positive results
        return `${a}${b}${op1}${c}${op2}${d}`;
      },
      
      // Pattern 2: A+B+CD (single digit + single digit + two digit) - 6 chars: 1+2+34
      () => {
        const a = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const b = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const c = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const d = Math.floor(Math.random() * 10);
        const op1 = ['+'][Math.floor(Math.random() * 1)]; // Only + to avoid negative results
        const op2 = ['+', '-'][Math.floor(Math.random() * 2)];
        return `${a}${op1}${b}${op2}${c}${d}`;
      },
      
      // Pattern 3: AB+C+D (two digit + single digit + single digit) - 6 chars: 12+3+4
      () => {
        const a = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const b = Math.floor(Math.random() * 10);
        const c = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const d = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const op1 = ['+'][Math.floor(Math.random() * 1)]; // Only + to avoid negative results
        const op2 = ['+', '-'][Math.floor(Math.random() * 2)];
        return `${a}${b}${op1}${c}${op2}${d}`;
      },
      
      // Pattern 4: A×B+CD (single digit × single digit + two digit) - 6 chars: 1×2+34
      () => {
        const a = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const b = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const c = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const d = Math.floor(Math.random() * 10);
        const op1 = ['×'][Math.floor(Math.random() * 1)]; // Only × to avoid division by zero
        const op2 = ['+'][Math.floor(Math.random() * 1)]; // Only + to ensure positive results
        return `${a}${op1}${b}${op2}${c}${d}`;
      },
      
      // Pattern 5: A+B×CD (single digit + single digit × two digit) - 6 chars: 1+2×34
      () => {
        const a = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const b = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const c = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const d = Math.floor(Math.random() * 10);
        const op1 = ['+'][Math.floor(Math.random() * 1)]; // Only + to ensure positive results
        const op2 = ['×'][Math.floor(Math.random() * 1)]; // Only × to avoid division by zero
        return `${a}${op1}${b}${op2}${c}${d}`;
      },
      
      // Pattern 6: AB×C+D (two digit × single digit + single digit) - 6 chars: 12×3+4
      () => {
        const a = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const b = Math.floor(Math.random() * 10);
        const c = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const d = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const op1 = ['×'][Math.floor(Math.random() * 1)]; // Only × to avoid division by zero
        const op2 = ['+'][Math.floor(Math.random() * 1)]; // Only + to ensure positive results
        return `${a}${b}${op1}${c}${op2}${d}`;
      },
      
      // Pattern 7: A÷B+CD (single digit ÷ single digit + two digit) - 6 chars: 8÷2+34 (safe division)
      () => {
        const a = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid 0
        const b = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid division by zero
        const c = Math.floor(Math.random() * 10);
        const d = Math.floor(Math.random() * 10);
        const op2 = ['+', '-'][Math.floor(Math.random() * 2)];
        return `${a}÷${b}${op2}${c}${d}`;
      }
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const equation = pattern();
    
    // Validate the equation before returning
    try {
      if (equation.length === 6) {
        // Convert × to * and ÷ to / for math.js evaluation
        const jsEquation = equation.replace(/×/g, '*').replace(/÷/g, '/');
        const result = math.evaluate(jsEquation);
        
        // Check for valid result: must be a positive integer
        if (typeof result === 'number' && isFinite(result) && result !== undefined && result !== null) {
          // Only allow positive integers (no negative numbers, no decimals)
          if (Number.isInteger(result) && result > 0 && result < 10000) {
            return equation;
          }
        }
      }
    } catch {
      // Invalid equation, try again
    }
  }
  
  // If we can't generate a valid equation after maxAttempts, throw an error
  throw new Error('Failed to generate a valid 6-character equation after maximum attempts');
};

/**
 * Gets the daily target equation
 * @returns The daily equation and target number
 */
export const getDailyTarget = async (): Promise<{ equation: string; targetNumber: number }> => {
  // Get current date in YYYY-MM-DD format
  const date = new Date().toISOString().split('T')[0];
  
  // Fetch from API
  const response = await fetch(`/api/equations/daily?date=${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch daily equation');
  }
  
  return await response.json();
};

/**
 * Gets a random target equation for practice mode
 * @returns A random equation and target number
 */
export const getRandomTarget = async (): Promise<{ equation: string; targetNumber: number }> => {
  // Fetch from API
  const response = await fetch('/api/equations/random');
  if (!response.ok) {
    throw new Error('Failed to fetch random equation');
  }
  
  return await response.json();
};
