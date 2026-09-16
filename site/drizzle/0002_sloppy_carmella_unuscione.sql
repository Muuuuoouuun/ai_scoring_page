CREATE TABLE `feedback_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`session_hash` text NOT NULL,
	`user_id` text,
	`scope` text NOT NULL,
	`question_version` text NOT NULL,
	`context` text NOT NULL,
	`answer` text,
	`comment` text DEFAULT '' NOT NULL,
	`started_at` text NOT NULL,
	`answered_at` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feedback_session_question` ON `feedback_sessions` (`session_hash`,`scope`,`question_version`);--> statement-breakpoint
CREATE INDEX `feedback_owner` ON `feedback_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `feedback_cohort` ON `feedback_sessions` (`question_version`,`started_at`);