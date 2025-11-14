import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const dailyEquations = sqliteTable('daily_equations', {
  id: text('id').primaryKey(),
  date: text('date').notNull().unique(),
  equation: text('equation').notNull().unique(),
  targetNumber: integer('targetNumber').notNull(),
  difficulty: text('difficulty').notNull().default('medium'),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const equationPool = sqliteTable('equation_pool', {
  id: text('id').primaryKey(),
  equation: text('equation').notNull().unique(),
  targetNumber: integer('targetNumber').notNull(),
  difficulty: text('difficulty').notNull().default('medium'),
  used: integer('used', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type DailyEquation = typeof dailyEquations.$inferSelect;
export type NewDailyEquation = typeof dailyEquations.$inferInsert;
export type EquationPool = typeof equationPool.$inferSelect;
export type NewEquationPool = typeof equationPool.$inferInsert;
