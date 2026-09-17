CREATE TABLE `notice_source_heads` (
	`card_key` text PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`event_revision` integer NOT NULL,
	`version` text NOT NULL,
	`conflict` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notification_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`card_key` text NOT NULL,
	`hide_topic` text NOT NULL,
	`latest_notification_id` text NOT NULL,
	`source_version` text NOT NULL,
	`source_revision` integer NOT NULL,
	`snapshot` text NOT NULL,
	`status` text NOT NULL,
	`email_reason` text NOT NULL,
	`legacy_baseline_version` text,
	`read` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notification_card_owner_key` ON `notification_cards` (`user_id`,`card_key`);--> statement-breakpoint
ALTER TABLE `notifications` ADD `metadata` text;