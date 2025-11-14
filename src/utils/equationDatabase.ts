import { eq, count } from 'drizzle-orm';
import { db } from '@/db';
import { dailyEquations, equationPool } from '@/db/schema';
import { evaluateEquation } from './math';
import { generateRandomEquation as generateEquation } from './equationGenerator';
import { randomUUID } from 'crypto';

/**
 * Generates a random 6-character equation
 * @returns A random 6-character equation
 */
export const generateRandomEquation = generateEquation;

/**
 * Determines the difficulty of an equation based on its complexity
 * @param equation - The equation string
 * @param targetNumber - The result of the equation
 * @returns Difficulty level: 'easy', 'medium', or 'hard'
 */
export const getDifficulty = (
  equation: string,
  targetNumber: number
): string => {
  const hasMultiplication = equation.includes('×');
  const hasDivision = equation.includes('÷');
  const hasMultipleOps = (equation.match(/[+\-×÷]/g) || []).length > 1;
  const isLargeNumber = targetNumber > 50;

  if (hasDivision || (hasMultiplication && hasMultipleOps) || isLargeNumber) {
    return 'hard';
  } else if (hasMultiplication || hasMultipleOps) {
    return 'medium';
  } else {
    return 'easy';
  }
};

/**
 * Gets or creates a daily equation for a specific date
 * @param date - Date in YYYY-MM-DD format
 * @returns The equation and target number for the date
 */
export const getDailyEquation = async (
  date: string
): Promise<{ equation: string; targetNumber: number }> => {
  // First, check if we already have an equation for this date
  const existing = await db
    .select()
    .from(dailyEquations)
    .where(eq(dailyEquations.date, date))
    .limit(1);

  if (existing.length > 0) {
    return {
      equation: existing[0].equation,
      targetNumber: existing[0].targetNumber,
    };
  }

  // If not, try to get an unused equation from the pool
  const poolResults = await db
    .select()
    .from(equationPool)
    .where(eq(equationPool.used, false))
    .limit(1);

  let equationData = poolResults[0];

  // If no unused equations in pool, generate a new one
  if (!equationData) {
    const equation = generateRandomEquation();
    const targetNumber = evaluateEquation(equation);
    const difficulty = getDifficulty(equation, targetNumber);

    const [newEquation] = await db
      .insert(equationPool)
      .values({
        id: randomUUID(),
        equation,
        targetNumber,
        difficulty,
        used: true,
      })
      .returning();

    equationData = newEquation;
  } else {
    // Mark the equation as used
    const [updated] = await db
      .update(equationPool)
      .set({ used: true })
      .where(eq(equationPool.id, equationData.id))
      .returning();

    if (updated) {
      equationData = updated;
    }
  }

  // Save the equation for this specific date
  await db.insert(dailyEquations).values({
    id: randomUUID(),
    date,
    equation: equationData.equation,
    targetNumber: equationData.targetNumber,
    difficulty: equationData.difficulty,
  });

  return {
    equation: equationData.equation,
    targetNumber: equationData.targetNumber,
  };
};

/**
 * Gets a random equation for practice mode
 * @returns A random equation and target number
 */
export const getRandomEquation = async (): Promise<{
  equation: string;
  targetNumber: number;
}> => {
  // For practice mode, always generate a fresh random equation
  const equation = generateRandomEquation();
  const targetNumber = evaluateEquation(equation);

  return {
    equation,
    targetNumber,
  };
};

/**
 * Pre-generates equations for a year and stores them in the pool
 * @param year - The year to generate equations for (default: current year)
 */
export const preGenerateYear = async (
  year: number = new Date().getFullYear()
): Promise<void> => {
  const equations = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  // Generate equations for each day of the year
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const equation = generateRandomEquation();
    const targetNumber = evaluateEquation(equation);
    const difficulty = getDifficulty(equation, targetNumber);

    equations.push({
      equation,
      targetNumber,
      difficulty,
      used: false,
    });
  }

  // Filter duplicates and check against existing database entries
  const uniqueEquations = equations.filter(
    (eq, index, self) =>
      index === self.findIndex((e) => e.equation === eq.equation)
  );

  // Get existing equations to avoid duplicates
  const existingEquations = await db
    .select({ equation: equationPool.equation })
    .from(equationPool);
  const existingSet = new Set(existingEquations.map((e) => e.equation));

  // Filter out equations that already exist
  const newEquations = uniqueEquations
    .filter((eq) => !existingSet.has(eq.equation))
    .map((eq) => ({
      id: randomUUID(),
      equation: eq.equation,
      targetNumber: eq.targetNumber,
      difficulty: eq.difficulty,
      used: eq.used,
    }));

  if (newEquations.length > 0) {
    await db.insert(equationPool).values(newEquations);
  }

  console.log(`Pre-generated ${equations.length} equations for ${year}`);
};

/**
 * Gets statistics about the equation database
 * @returns Database statistics
 */
export const getDatabaseStats = async () => {
  const [totalPoolResult, usedPoolResult, dailyCountResult] = await Promise.all(
    [
      db.select({ count: count() }).from(equationPool),
      db
        .select({ count: count() })
        .from(equationPool)
        .where(eq(equationPool.used, true)),
      db.select({ count: count() }).from(dailyEquations),
    ]
  );

  const totalPool = totalPoolResult[0]?.count ?? 0;
  const usedPool = usedPoolResult[0]?.count ?? 0;
  const dailyCount = dailyCountResult[0]?.count ?? 0;

  return {
    totalPool,
    usedPool,
    unusedPool: totalPool - usedPool,
    dailyCount,
  };
};
