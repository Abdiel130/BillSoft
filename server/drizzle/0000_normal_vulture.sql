CREATE TABLE `tax_regimes` (
	`id` varchar(3) NOT NULL,
	`description` varchar(100),
	CONSTRAINT `tax_regimes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_forms` (
	`id` varchar(2) NOT NULL,
	`description` varchar(100),
	CONSTRAINT `payment_forms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` varchar(2) NOT NULL,
	`description` varchar(100),
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cfdi_uses` (
	`id` varchar(2) NOT NULL,
	`description` varchar(100),
	CONSTRAINT `cfdi_uses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`password` varchar(255) NOT NULL,
	`name` varchar(100),
	`lastname` varchar(100),
	`rol` int,
	`created_at` timestamp DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rfc` varchar(14) NOT NULL,
	`legal_name` varchar(255) NOT NULL,
	`zip_code` varchar(6) NOT NULL,
	`nickname` varchar(100),
	`tax_regime_id` varchar(3),
	`type` enum('CLIENT','EXTERNAL') NOT NULL,
	`create_at` timestamp DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_rfc_unique` UNIQUE(`rfc`)
);
--> statement-breakpoint
CREATE TABLE `company_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int,
	`ciec` text NOT NULL,
	`fiel_password` text,
	`certificate_path` varchar(255),
	`private_key_path` varchar(255),
	CONSTRAINT `company_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `company_clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` int,
	`external_id` int,
	CONSTRAINT `company_clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bill` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uuid` varchar(40),
	`issuer_id` int,
	`receiver_id` int,
	`folio` varchar(20),
	`emit_date` timestamp,
	`subtotal` decimal(15,2),
	`total` decimal(15,2),
	`total_tax` decimal(15,2),
	`balance` decimal(15,2),
	`exchange_rate` varchar(100),
	`currency` varchar(3),
	`payment_method_id` varchar(2),
	`payment_form_id` varchar(2),
	`cfdi_use_id` varchar(2),
	`status` enum('draft','stamped','canceled'),
	`cfdi_type` enum('I','E','P','T','N'),
	`xml_path` text,
	`register_at` timestamp DEFAULT (now()),
	`canceled_at` timestamp,
	CONSTRAINT `bill_id` PRIMARY KEY(`id`),
	CONSTRAINT `bill_uuid_unique` UNIQUE(`uuid`)
);
--> statement-breakpoint
CREATE TABLE `bill_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bill_id` int,
	`sat_product_code` varchar(12),
	`sat_unit_code` varchar(6),
	`sku` varchar(50),
	`description` text,
	`quantity` decimal(16,6),
	`unit_value` decimal(16,6),
	`discount` decimal(16,6),
	`amount` decimal(16,6),
	`tax_object` varchar(2),
	CONSTRAINT `bill_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bill_tax` (
	`id` int AUTO_INCREMENT NOT NULL,
	`item_id` int,
	`tax_type` enum('traslado','retencion'),
	`tax_code` varchar(4),
	`base_amount` decimal(16,6),
	`factor_type` varchar(10),
	`rate` decimal(10,6),
	`amount` decimal(16,6),
	CONSTRAINT `bill_tax_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int,
	`client_id` int,
	`payment_date` timestamp,
	`total_amount` decimal(15,2),
	`payment_form_id` varchar(2),
	`currency` varchar(3),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_related` (
	`id` int AUTO_INCREMENT NOT NULL,
	`payment_id` int,
	`bill_id` int,
	`partial_num` int,
	`previous_balance` decimal(16,6),
	`amount_paid` decimal(16,6),
	`pending_paid` decimal(16,6),
	`tax_breakdown` json,
	CONSTRAINT `payment_related_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `companies` ADD CONSTRAINT `companies_tax_regime_id_tax_regimes_id_fk` FOREIGN KEY (`tax_regime_id`) REFERENCES `tax_regimes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `company_credentials` ADD CONSTRAINT `company_credentials_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `company_clients` ADD CONSTRAINT `company_clients_client_id_companies_id_fk` FOREIGN KEY (`client_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `company_clients` ADD CONSTRAINT `company_clients_external_id_companies_id_fk` FOREIGN KEY (`external_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bill` ADD CONSTRAINT `bill_issuer_id_companies_id_fk` FOREIGN KEY (`issuer_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bill` ADD CONSTRAINT `bill_receiver_id_companies_id_fk` FOREIGN KEY (`receiver_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bill` ADD CONSTRAINT `bill_payment_method_id_payment_methods_id_fk` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bill` ADD CONSTRAINT `bill_payment_form_id_payment_forms_id_fk` FOREIGN KEY (`payment_form_id`) REFERENCES `payment_forms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bill` ADD CONSTRAINT `bill_cfdi_use_id_cfdi_uses_id_fk` FOREIGN KEY (`cfdi_use_id`) REFERENCES `cfdi_uses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bill_items` ADD CONSTRAINT `bill_items_bill_id_bill_id_fk` FOREIGN KEY (`bill_id`) REFERENCES `bill`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bill_tax` ADD CONSTRAINT `bill_tax_item_id_bill_items_id_fk` FOREIGN KEY (`item_id`) REFERENCES `bill_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_client_id_companies_id_fk` FOREIGN KEY (`client_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_payment_form_id_payment_forms_id_fk` FOREIGN KEY (`payment_form_id`) REFERENCES `payment_forms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_related` ADD CONSTRAINT `payment_related_payment_id_payments_id_fk` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_related` ADD CONSTRAINT `payment_related_bill_id_bill_id_fk` FOREIGN KEY (`bill_id`) REFERENCES `bill`(`id`) ON DELETE no action ON UPDATE no action;