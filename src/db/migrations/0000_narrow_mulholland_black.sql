CREATE TABLE `body_weights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`recorded_on` text NOT NULL,
	`weight_kg` real NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `body_weights_recorded_on_unique` ON `body_weights` (`recorded_on`);--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`muscle_group` text NOT NULL,
	`created_at` integer NOT NULL,
	`archived_at` integer,
	CONSTRAINT "muscle_group_enum" CHECK("exercises"."muscle_group" IN ('Pecho','Espalda','Pierna','Hombro','Brazo','Core','Otros'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_name_unique` ON `exercises` (`name`);--> statement-breakpoint
CREATE TABLE `measurement_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`unit` text NOT NULL,
	`archived_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `measurement_types_name_unique` ON `measurement_types` (`name`);--> statement-breakpoint
CREATE TABLE `measurements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`measurement_type_id` integer NOT NULL,
	`recorded_on` text NOT NULL,
	`value` real NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`measurement_type_id`) REFERENCES `measurement_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `measurements_per_day` ON `measurements` (`measurement_type_id`,`recorded_on`);--> statement-breakpoint
CREATE TABLE `routine_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`position` integer NOT NULL,
	`target_sets` integer NOT NULL,
	`target_reps` integer NOT NULL,
	`target_weight_kg` real,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `routine_items_pos` ON `routine_items` (`routine_id`,`position`);--> statement-breakpoint
CREATE TABLE `routines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`archived_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `routines_name_unique` ON `routines` (`name`);--> statement-breakpoint
CREATE TABLE `session_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`exercise_name_snapshot` text NOT NULL,
	`position` integer NOT NULL,
	`weight_kg` real,
	`reps` integer NOT NULL,
	`completed_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `workout_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`owner_name` text,
	`weekly_goal_sessions` integer DEFAULT 4 NOT NULL,
	`weekly_goal_minutes` integer DEFAULT 240 NOT NULL,
	`weekly_goal_volume_kg` integer DEFAULT 18000 NOT NULL,
	`theme` text DEFAULT 'dark' NOT NULL,
	`accent` text DEFAULT '#FA114F' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer,
	`routine_name_snapshot` text NOT NULL,
	`started_at` integer NOT NULL,
	`finished_at` integer,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE set null
);
