-- Create API Keys table
CREATE TABLE `api_keys` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `provider` text NOT NULL,
  `api_key` text NOT NULL,
  `label` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint
CREATE INDEX `api_keys_user_id_idx` ON `api_keys` (`user_id`);--> statement-breakpoint
CREATE INDEX `api_keys_provider_idx` ON `api_keys` (`provider`);--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_user_provider_idx` ON `api_keys` (`user_id`, `provider`);
