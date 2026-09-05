ALTER TABLE `users` ADD `is_pro` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `plan` text DEFAULT 'free' NOT NULL;