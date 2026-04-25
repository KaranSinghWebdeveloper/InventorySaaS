SET NAMES utf8mb4;

CREATE TABLE `sales` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `business_id` INT NOT NULL,
  `customer_id` INT NULL,
  `invoice_number` VARCHAR(100) NULL,
  `total_amount` DECIMAL(12,2) NULL,
  `paid_amount` DECIMAL(12,2) NULL,
  `due_amount` DECIMAL(12,2) NULL,
  `status` ENUM('paid', 'partial', 'unpaid') NOT NULL DEFAULT 'unpaid',
  `sale_date` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `sales_business_id_idx` (`business_id`),
  INDEX `sales_customer_id_idx` (`customer_id`),
  CONSTRAINT `sales_business_id_fkey`
    FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `sales_customer_id_fkey`
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
