CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event` text NOT NULL,
	`category` text NOT NULL,
	`user_id` text,
	`properties` text,
	`created_at` text NOT NULL
);
