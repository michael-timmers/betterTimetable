CREATE TABLE `clubs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`overview` text NOT NULL,
	`description` text NOT NULL,
	`faculty` varchar(50),
	`active` boolean DEFAULT false,
	`colour` varchar(10) DEFAULT '#BFDBFF',
	CONSTRAINT `clubs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrolments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(36) NOT NULL,
	`clubId` int NOT NULL,
	`role` varchar(50),
	CONSTRAINT `enrolments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`userId` varchar(36) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tabs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`active` boolean DEFAULT false,
	CONSTRAINT `tabs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_pwd_resets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(36) NOT NULL,
	`code` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `user_pwd_resets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`username` varchar(255),
	`passwordHash` text,
	`title` varchar(50),
	`firstName` varchar(255),
	`lastName` varchar(255),
	`email` varchar(255),
	`admin` boolean DEFAULT false,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
