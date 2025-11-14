import { db } from '../src/db';
import { equationPool } from '../src/db/schema';
import { count, sql } from 'drizzle-orm';
import { preGenerateYear } from '../src/utils/equationDatabase';

async function main() {
  console.log('🚀 Initializing Mathler database...');

  try {
    // Pre-generate equations for the current year and next year
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    console.log(`📅 Pre-generating equations for ${currentYear}...`);
    await preGenerateYear(currentYear);

    console.log(`📅 Pre-generating equations for ${nextYear}...`);
    await preGenerateYear(nextYear);

    // Get database stats
    const stats = await db
      .select({
        total_equations: count(),
        unused_equations: sql<number>`COUNT(CASE WHEN ${equationPool.used} = 0 THEN 1 END)`,
        used_equations: sql<number>`COUNT(CASE WHEN ${equationPool.used} = 1 THEN 1 END)`,
      })
      .from(equationPool);

    console.log('📊 Database initialized successfully!');
    console.log('Stats:', stats[0]);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

main();
