import { describe, it, expect } from 'vitest';
import { validateEquation, evaluateEquation, isGuessValidSolution } from '@/utils/math';

describe('Math utilities', () => {
  describe('validateEquation', () => {
    it('should validate correct equations', () => {
      expect(validateEquation('1+2×3')).toBe(true);
      expect(validateEquation('10-5÷1')).toBe(true);
      expect(validateEquation('2×3+4')).toBe(true);
      expect(validateEquation('40+40')).toBe(true); // Valid equation
      expect(validateEquation('-40+40')).toBe(false); // Invalid: starts with operator
    });

    it('should reject invalid equations', () => {
      // Too short or too long
      expect(validateEquation('1+2×')).toBe(false); // Too short
      expect(validateEquation('1+2×3+4')).toBe(false); // Too long
      
      // Division by zero
      expect(validateEquation('1÷0')).toBe(false);
      
      // Consecutive operators (invalid operations)
      expect(validateEquation('1++2×3')).toBe(false);
      expect(validateEquation('1--2×3')).toBe(false);
      expect(validateEquation('1××2×3')).toBe(false);
      expect(validateEquation('1÷÷2×3')).toBe(false);
      expect(validateEquation('1+-2×3')).toBe(false);
      expect(validateEquation('1-+2×3')).toBe(false);
      expect(validateEquation('1×+2×3')).toBe(false);
      expect(validateEquation('1÷-2×3')).toBe(false);
      
      // Invalid operator sequences
      expect(validateEquation('*-123')).toBe(false); // Starts with ×
      expect(validateEquation('÷123')).toBe(false); // Starts with ÷
      expect(validateEquation('1×-2')).toBe(false); // × followed by -
      expect(validateEquation('1÷+2')).toBe(false); // ÷ followed by +
      
      // Ends with operator
      expect(validateEquation('1+2-')).toBe(false);
      
      // No operators
      expect(validateEquation('123')).toBe(false);
      
      // Starts with invalid operator
      expect(validateEquation('+1×2×3')).toBe(false);
      
      // Multiple consecutive operators
      expect(validateEquation('---123')).toBe(false); // Three consecutive -
      expect(validateEquation('++123')).toBe(false); // Two consecutive +
      expect(validateEquation('--123')).toBe(false); // Two consecutive -
      
      // No negative numbers (starts with operator)
      expect(validateEquation('-40+40')).toBe(false); // Invalid: starts with operator
      expect(validateEquation('-123')).toBe(false); // Invalid: starts with operator
      expect(validateEquation('+123')).toBe(false); // Invalid: starts with operator
    });
  });

  describe('evaluateEquation', () => {
    it('should evaluate simple equations correctly', () => {
      expect(evaluateEquation('1+2×3')).toBe(7);
      expect(evaluateEquation('10-5÷1')).toBe(5);
      expect(evaluateEquation('2×3+4')).toBe(10);
    });

    it('should handle order of operations', () => {
      expect(evaluateEquation('2+3×4')).toBe(14); // 2 + (3×4) = 14
      expect(evaluateEquation('10÷2+3')).toBe(8); // (10÷2) + 3 = 8
      expect(evaluateEquation('2×3+4×5')).toBe(26); // (2×3) + (4×5) = 6 + 20 = 26
    });

    it('should throw error for invalid equations', () => {
      expect(() => evaluateEquation('1÷0')).toThrow();
      expect(() => evaluateEquation('1+2×')).toThrow();
    });
  });

  describe('isGuessValidSolution', () => {
    it('should accept commutative solutions', () => {
      const targetEquation = '20+7+3';
      expect(isGuessValidSolution('3+7+20', targetEquation)).toBe(true);
      expect(isGuessValidSolution('7+3+20', targetEquation)).toBe(true);
      expect(isGuessValidSolution('20+3+7', targetEquation)).toBe(true);
      expect(isGuessValidSolution('3+20+7', targetEquation)).toBe(true);
      expect(isGuessValidSolution('7+20+3', targetEquation)).toBe(true);
    });

    it('should reject non-equivalent equations', () => {
      const targetEquation = '20+7+3';
      expect(isGuessValidSolution('20+7-3', targetEquation)).toBe(false);
      expect(isGuessValidSolution('20×7+3', targetEquation)).toBe(false);
      expect(isGuessValidSolution('20+7×3', targetEquation)).toBe(false);
    });

    it('should handle complex order of operations', () => {
      const targetEquation = '2×3+4'; // = 10 (6 characters)
      
      expect(isGuessValidSolution('2×3+4', targetEquation)).toBe(true);
      // Test commutative solution
      expect(isGuessValidSolution('4+2×3', targetEquation)).toBe(true);
      
      // Test that different equations with same result are rejected
      expect(isGuessValidSolution('1+9', targetEquation)).toBe(false); // = 10, but different characters
      expect(isGuessValidSolution('5+5', targetEquation)).toBe(false); // = 10, but different characters
    });

    it('should reject specific invalid operations', () => {
      // Test the specific examples mentioned by user
      expect(validateEquation('*-123')).toBe(false); // Invalid: starts with ×
      expect(validateEquation('1×-2')).toBe(false); // Invalid: × followed by -
      expect(validateEquation('1÷+2')).toBe(false); // Invalid: ÷ followed by +
      expect(validateEquation('1+-2')).toBe(false); // Invalid: + followed by -
      expect(validateEquation('1--2')).toBe(false); // Invalid: - followed by -
      expect(validateEquation('1××2')).toBe(false); // Invalid: × followed by ×
      expect(validateEquation('1÷÷2')).toBe(false); // Invalid: ÷ followed by ÷
    });

    it('should only accept exact target equation or commutative variations', () => {
      const targetEquation = '1+2×3'; // = 7
      
      // Valid operations (exact equation and commutative solutions)
      expect(isGuessValidSolution('1+2×3', targetEquation)).toBe(true);
      expect(isGuessValidSolution('2×3+1', targetEquation)).toBe(true);
      expect(isGuessValidSolution('1+2×3', targetEquation)).toBe(true);
      
      // Invalid operations (different equations with same result but different characters)
      expect(isGuessValidSolution('2×2+3', targetEquation)).toBe(false); // = 7, but different characters
      expect(isGuessValidSolution('1+1+5', targetEquation)).toBe(false); // = 7, but different characters
      expect(isGuessValidSolution('3+4', targetEquation)).toBe(false); // = 7, but different characters
      
      // Invalid operations should be rejected
      expect(isGuessValidSolution('*-123', targetEquation)).toBe(false);
      expect(isGuessValidSolution('1×-2', targetEquation)).toBe(false);
      expect(isGuessValidSolution('1+-2', targetEquation)).toBe(false);
      
      // Valid operations that don't equal target
      expect(isGuessValidSolution('1+2+3', targetEquation)).toBe(false); // = 6, not 7
      expect(isGuessValidSolution('2×2+2', targetEquation)).toBe(false); // = 6, not 7
    });
  });
});
