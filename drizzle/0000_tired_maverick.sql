CREATE TABLE `daily_equations` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`equation` text NOT NULL,
	`targetNumber` integer NOT NULL,
	`difficulty` text DEFAULT 'medium' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_equations_date_unique` ON `daily_equations` (`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `daily_equations_equation_unique` ON `daily_equations` (`equation`);--> statement-breakpoint
CREATE TABLE `equation_pool` (
	`id` text PRIMARY KEY NOT NULL,
	`equation` text NOT NULL,
	`targetNumber` integer NOT NULL,
	`difficulty` text DEFAULT 'medium' NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `equation_pool_equation_unique` ON `equation_pool` (`equation`);