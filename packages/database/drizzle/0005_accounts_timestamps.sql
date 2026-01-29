-- Add timestamps to accounts table
ALTER TABLE `accounts` ADD COLUMN `created_at` integer DEFAULT (strftime('%s', 'now') * 1000);-->statement-breakpoint
ALTER TABLE `accounts` ADD COLUMN `updated_at` integer DEFAULT (strftime('%s', 'now') * 1000);-->statement-breakpoint
-- Update existing rows to have timestamps
UPDATE `accounts` SET `created_at` = strftime('%s', 'now') * 1000 WHERE `created_at` IS NULL;-->statement-breakpoint
UPDATE `accounts` SET `updated_at` = strftime('%s', 'now') * 1000 WHERE `updated_at` IS NULL;-->statement-breakpoint
