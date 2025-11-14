import { db } from '../src/db';
import { dailyEquations, equationPool } from '../src/db/schema';
import { generateRandomEquation } from '../src/utils/equationGenerator';
import { create, all } from 'mathjs';
import { randomUUID } from 'crypto';
import { count, sql } from 'drizzle-orm';

const math = create(all);

function getDifficulty(equation: string, targetNumber: number): string {
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
}

function evaluateEquation(equation: string): number {
  const jsEquation = equation.replace(/×/g, '*').replace(/÷/g, '/');
  return math.evaluate(jsEquation);
}

async function main() {
  console.log('🚀 Initializing Turso Mathler database...');

  try {
    // Generate equations for the equation pool
    console.log('📝 Generating equation pool...');
    const equations = [];

    for (let i = 0; i < 1000; i++) {
      try {
        const equation = generateRandomEquation();
        const targetNumber = evaluateEquation(equation);
        const difficulty = getDifficulty(equation, targetNumber);

        equations.push({
          id: randomUUID(),
          equation,
          targetNumber,
          difficulty,
          used: false,
        });
      } catch (error) {
        console.log(`Skipping invalid equation: ${error}`);
      }
    }

    // Filter out duplicates
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
    const newEquations = uniqueEquations.filter(
      (eq) => !existingSet.has(eq.equation)
    );

    console.log(
      `📝 Inserting ${newEquations.length} new equations into pool...`
    );
    if (newEquations.length > 0) {
      await db.insert(equationPool).values(newEquations);
    }

    // Generate today's daily equation
    const today = new Date().toISOString().split('T')[0];
    const dailyEquation = generateRandomEquation();
    const dailyTargetNumber = evaluateEquation(dailyEquation);
    const dailyDifficulty = getDifficulty(dailyEquation, dailyTargetNumber);

    console.log(`📅 Creating daily equation for ${today}...`);
    await db.insert(dailyEquations).values({
      id: randomUUID(),
      date: today,
      equation: dailyEquation,
      targetNumber: dailyTargetNumber,
      difficulty: dailyDifficulty,
    });

    // Get database stats
    const stats = await db
      .select({
        total_equations: count(),
        unused_equations: sql<number>`COUNT(CASE WHEN ${equationPool.used} = 0 THEN 1 END)`,
        used_equations: sql<number>`COUNT(CASE WHEN ${equationPool.used} = 1 THEN 1 END)`,
      })
      .from(equationPool);

    const dailyCountResult = await db
      .select({ count: count() })
      .from(dailyEquations);
    const dailyCount = dailyCountResult[0]?.count ?? 0;

    console.log('📊 Turso database initialized successfully!');
    console.log('Stats:', stats[0]);
    console.log(`📅 Daily equations: ${dailyCount}`);
    console.log(`🎯 Today's equation: ${dailyEquation} = ${dailyTargetNumber}`);
  } catch (error) {
    console.error('❌ Error initializing Turso database:', error);
    process.exit(1);
  }
}

main();
