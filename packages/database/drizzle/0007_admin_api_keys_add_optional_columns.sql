-- Add missing optional columns to admin_api_keys table
ALTER TABLE `admin_api_keys` ADD COLUMN `last_used_at` text;-->statement-breakpoint
ALTER TABLE `admin_api_keys` ADD COLUMN `expires_at` text;-->statement-breakpoint
