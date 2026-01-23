CREATE TABLE `tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL CHECK (`status` IN ('open', 'in_progress', 'closed', 'resolved')),
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TRIGGER IF NOT EXISTS `tickets_updated_at_trigger`
AFTER UPDATE ON `tickets`
FOR EACH ROW
BEGIN
  UPDATE `tickets`
  SET `updated_at` = CURRENT_TIMESTAMP
  WHERE `id` = NEW.`id`;
END;