-- Create Admin API Keys table
CREATE TABLE `admin_api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`key` text NOT NULL,
	`key_prefix` text NOT NULL,
	`description` text,
	`scopes` text NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_api_keys_key_idx` ON `admin_api_keys` (`key`);--> statement-breakpoint
CREATE INDEX `admin_api_keys_created_by_idx` ON `admin_api_keys` (`created_by`);--> statement-breakpoint

-- Create System Logs table
CREATE TABLE `system_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`level` text NOT NULL,
	`category` text NOT NULL,
	`message` text NOT NULL,
	`details` text,
	`user_id` text,
	`metadata` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `system_logs_level_idx` ON `system_logs` (`level`);--> statement-breakpoint
CREATE INDEX `system_logs_category_idx` ON `system_logs` (`category`);--> statement-breakpoint
CREATE INDEX `system_logs_user_id_idx` ON `system_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `system_logs_created_at_idx` ON `system_logs` (`created_at`);
