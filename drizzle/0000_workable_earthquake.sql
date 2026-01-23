CREATE TABLE `bids` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vendor_id` integer NOT NULL,
	`item_description` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`total_price` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`lead_time_days` integer,
	`valid_until` text,
	`submitted_date` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`subcategory` text,
	`description` text NOT NULL,
	`amount` real NOT NULL,
	`frequency` text NOT NULL,
	`date` text NOT NULL,
	`end_date` text,
	`vendor_id` integer,
	`scenario_id` integer,
	`status` text DEFAULT 'planned' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`scenario_id`) REFERENCES `scenarios`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `personnel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`department` text NOT NULL,
	`employment_type` text NOT NULL,
	`base_salary` real NOT NULL,
	`bonus` real DEFAULT 0,
	`benefits` real DEFAULT 0,
	`start_date` text NOT NULL,
	`end_date` text,
	`scenario_id` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`scenario_id`) REFERENCES `scenarios`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `projections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scenario_id` integer NOT NULL,
	`year` integer NOT NULL,
	`month` integer,
	`revenue` real DEFAULT 0 NOT NULL,
	`cogs` real DEFAULT 0 NOT NULL,
	`gross_profit` real DEFAULT 0 NOT NULL,
	`marketing` real DEFAULT 0 NOT NULL,
	`gna` real DEFAULT 0 NOT NULL,
	`rd` real DEFAULT 0 NOT NULL,
	`ebitda` real DEFAULT 0 NOT NULL,
	`net_income` real DEFAULT 0 NOT NULL,
	`operating_cash_flow` real DEFAULT 0 NOT NULL,
	`capex` real DEFAULT 0 NOT NULL,
	`free_cash_flow` real DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`scenario_id`) REFERENCES `scenarios`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `promo_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`discount_type` text NOT NULL,
	`discount_value` real NOT NULL,
	`min_order_value` real,
	`max_uses` integer,
	`used_count` integer DEFAULT 0 NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`is_active` integer DEFAULT true NOT NULL,
	`channel` text DEFAULT 'all',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `promo_codes_code_unique` ON `promo_codes` (`code`);--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text DEFAULT 'base' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`start_year` integer NOT NULL,
	`end_year` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`contact_name` text,
	`email` text,
	`phone` text,
	`address` text,
	`payment_terms` text,
	`currency` text DEFAULT 'USD' NOT NULL,
	`tax_id` text,
	`rating` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
