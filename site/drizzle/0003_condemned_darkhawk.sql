CREATE TABLE `email_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`settings_id` text NOT NULL,
	`settings_revision` text NOT NULL,
	`mode` text NOT NULL,
	`time_zone` text NOT NULL,
	`local_time` text NOT NULL,
	`local_date` text NOT NULL,
	`items` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'prepared' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`attempt_token` text,
	`created_at` text NOT NULL,
	`first_attempt_at` text,
	`last_attempt_at` text,
	`next_attempt_at` text,
	`accepted_at` text,
	`provider_id` text,
	`cancel_requested_at` text,
	`error` text
);
--> statement-breakpoint
CREATE INDEX `email_delivery_owner_status` ON `email_deliveries` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `email_delivery_quota` ON `email_deliveries` (`user_id`,`first_attempt_at`);--> statement-breakpoint
CREATE TABLE `email_dispatch_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`claim_token` text,
	`lease_until` text NOT NULL,
	`next_digest_not_before` text,
	`last_digest_date` text,
	`last_digest_outcome` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `email_outbox` ADD `delivery_id` text;--> statement-breakpoint
ALTER TABLE `email_outbox` ADD `provider_id` text;--> statement-breakpoint
CREATE INDEX `email_owner_delivery` ON `email_outbox` (`user_id`,`delivery_id`);
--> statement-breakpoint
-- Earlier attempted rows have no immutable request snapshot or durable provider ID.
-- Keep sent history; do not guess a new key/body for an uncertain legacy attempt.
UPDATE email_outbox SET status='needs_review',error='Legacy attempt has no immutable delivery snapshot'
WHERE attempts>0 AND status NOT IN ('sent','cancelled','needs_review');
