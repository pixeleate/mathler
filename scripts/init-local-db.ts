import { db } from '../src/db/local';
import { dailyEquations, equationPool } from '../src/db/schema';
import { generateRandomEquation } from '../src/utils/equationGenerator';
import { create, all } from 'mathjs';
import { randomUUID } from 'crypto';
import { count } from 'drizzle-orm';

const math = create(all);

async function main() {
  console.log('🚀 Initializing local Mathler database...');

  try {
    // Generate some sample equations for the equation pool
    console.log('📝 Generating sample equations...');

    const equations = [];
    for (let i = 0; i < 50; i++) {
      try {
        const equation = generateRandomEquation();
        const jsEquation = equation.replace(/×/g, '*').replace(/÷/g, '/');
        const targetNumber = math.evaluate(jsEquation);

        equations.push({
          id: randomUUID(),
          equation,
          targetNumber,
          difficulty: 'medium',
          used: false,
        });
      } catch (error) {
        console.log(`Skipping invalid equation: ${error}`);
      }
    }

    // Insert equations into the pool
    await db.insert(equationPool).values(equations);

    // Generate today's daily equation
    const today = new Date().toISOString().split('T')[0];
    const dailyEquation = generateRandomEquation();
    const jsDailyEquation = dailyEquation.replace(/×/g, '*').replace(/÷/g, '/');
    const dailyTargetNumber = math.evaluate(jsDailyEquation);

    await db.insert(dailyEquations).values({
      id: randomUUID(),
      date: today,
      equation: dailyEquation,
      targetNumber: dailyTargetNumber,
      difficulty: 'medium',
    });

    // Get database stats
    const equationPoolResult = await db
      .select({ count: count() })
      .from(equationPool);
    const equationPoolCount = equationPoolResult[0]?.count ?? 0;

    const dailyCountResult = await db
      .select({ count: count() })
      .from(dailyEquations);
    const dailyEquationCount = dailyCountResult[0]?.count ?? 0;

    console.log('📊 Database initialized successfully!');
    console.log(`📝 Generated ${equationPoolCount} equations in the pool`);
    console.log(`📅 Created daily equation for ${today}`);
    console.log(`🎯 Today's equation: ${dailyEquation} = ${dailyTargetNumber}`);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

main();
