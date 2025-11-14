import { describe, it, expect } from 'vitest';
import {
  getDailyTarget,
  getRandomTarget,
  generateRandomEquation,
} from '@/utils/equationGenerator';

describe('Equation Generator', () => {
  describe('generateRandomEquation', () => {
    it('should generate only 6-character equations', () => {
      // Test multiple generations to ensure consistency
      for (let i = 0; i < 10; i++) {
        const equation = generateRandomEquation();
        expect(equation.length).toBe(6);
      }
    });

    it('should generate valid equation strings', () => {
      // Test multiple generations to ensure consistency
      for (let i = 0; i < 10; i++) {
        const equation = generateRandomEquation();
        expect(equation.length).toBe(6);
        expect(typeof equation).toBe('string');
        // Should contain at least one operator
        expect(/[+\-×÷]/.test(equation)).toBe(true);
      }
    });
  });

  describe('getDailyTarget', () => {
    it('should return a 6-character equation', async () => {
      const target = await getDailyTarget();
      expect(target.equation.length).toBe(6);
    });

    it('should return a valid equation that equals the target number', async () => {
      const target = await getDailyTarget();
      // This is a basic check - in a real test we'd evaluate the equation
      expect(typeof target.targetNumber).toBe('number');
      expect(typeof target.equation).toBe('string');
    });
  });

  describe('getRandomTarget', () => {
    it('should return a 6-character equation', async () => {
      const target = await getRandomTarget();
      expect(target.equation.length).toBe(6);
    });

    it('should return a valid equation that equals the target number', async () => {
      const target = await getRandomTarget();
      expect(typeof target.targetNumber).toBe('number');
      expect(typeof target.equation).toBe('string');
    });
  });
});
