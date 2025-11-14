-- Rename Prisma-created indexes to match Drizzle's expected names
-- This script fixes the index naming mismatch between Prisma and Drizzle

-- Drop old Prisma indexes
DROP INDEX IF EXISTS daily_equations_date_key;
DROP INDEX IF EXISTS daily_equations_equation_key;
DROP INDEX IF EXISTS equation_pool_equation_key;

-- Create new Drizzle-compatible indexes
CREATE UNIQUE INDEX IF NOT EXISTS daily_equations_date_unique ON daily_equations(date);
CREATE UNIQUE INDEX IF NOT EXISTS daily_equations_equation_unique ON daily_equations(equation);
CREATE UNIQUE INDEX IF NOT EXISTS equation_pool_equation_unique ON equation_pool(equation);

