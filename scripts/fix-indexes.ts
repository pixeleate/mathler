import { config } from 'dotenv';
import { createClient } from '@libsql/client';

// Load environment variables
config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  console.log('🔧 Fixing index names to match Drizzle expectations...');

  try {
    // Drop old Prisma indexes
    console.log('Dropping old Prisma indexes...');
    await client.execute('DROP INDEX IF EXISTS daily_equations_date_key');
    await client.execute('DROP INDEX IF EXISTS daily_equations_equation_key');
    await client.execute('DROP INDEX IF EXISTS equation_pool_equation_key');

    // Create new Drizzle-compatible indexes
    console.log('Creating Drizzle-compatible indexes...');
    await client.execute(
      'CREATE UNIQUE INDEX IF NOT EXISTS daily_equations_date_unique ON daily_equations(date)'
    );
    await client.execute(
      'CREATE UNIQUE INDEX IF NOT EXISTS daily_equations_equation_unique ON daily_equations(equation)'
    );
    await client.execute(
      'CREATE UNIQUE INDEX IF NOT EXISTS equation_pool_equation_unique ON equation_pool(equation)'
    );

    console.log('✅ Indexes fixed successfully!');
    console.log('You can now run: bun run db:push');
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();

