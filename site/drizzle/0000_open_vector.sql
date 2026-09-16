CREATE TABLE `email_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`notification_id` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`sent_at` text,
	`error` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_notification` ON `email_outbox` (`notification_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`source_key` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`href` text NOT NULL,
	`read` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notification_owner` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `notification_unique` ON `notifications` (`user_id`,`source_key`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`author` text NOT NULL,
	`kind` text NOT NULL,
	`tool_id` text,
	`parent_id` text,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`task` text,
	`plan` text,
	`used_at` text,
	`affiliation` text DEFAULT 'none' NOT NULL,
	`ratings` text,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `posts_tool_created` ON `posts` (`tool_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `posts_parent` ON `posts` (`parent_id`);--> statement-breakpoint
CREATE INDEX `posts_owner` ON `posts` (`user_id`);--> statement-breakpoint
CREATE TABLE `private_records` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`target` text,
	`payload` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `private_owner_kind` ON `private_records` (`user_id`,`kind`);--> statement-breakpoint
CREATE UNIQUE INDEX `private_owner_target` ON `private_records` (`user_id`,`kind`,`target`);--> statement-breakpoint
CREATE TABLE `reactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reaction_user_post` ON `reactions` (`user_id`,`post_id`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`target_id` text NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `report_user_target` ON `reports` (`user_id`,`target_id`);--> statement-breakpoint
CREATE TABLE `source_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`etag` text,
	`content_hash` text,
	`title` text,
	`checked_at` text,
	`changed_at` text,
	`status` text NOT NULL,
	`error` text,
	`payload` text
);
--> statement-breakpoint
CREATE TABLE `sync_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text,
	`status` text NOT NULL,
	`checked` integer DEFAULT 0 NOT NULL,
	`changed` integer DEFAULT 0 NOT NULL,
	`errors` integer DEFAULT 0 NOT NULL
);
