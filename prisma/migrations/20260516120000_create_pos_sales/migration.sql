SET NAMES utf8mb4;

ALTER TABLE `inventory_transactions`
  MODIFY `reference_type` ENUM('purchase', 'sale', 'pos_sale', 'manual') NOT NULL;

CREATE TABLE `pos_sales` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `business_id` INT NOT NULL,
  `invoice_no` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(255) NULL,
  `customer_phone` VARCHAR(20) NULL,
  `subtotal` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `discount_amount` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `tax_amount` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `payment_method` ENUM('cash', 'upi', 'card', 'credit') NOT NULL DEFAULT 'cash',
  `paid_amount` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `pos_sales_business_invoice_unique` (`business_id`, `invoice_no`),
  INDEX `idx_pos_sales_business` (`business_id`),
  INDEX `idx_pos_sales_invoice` (`invoice_no`),
  INDEX `idx_pos_sales_created_at` (`created_at`),
  INDEX `idx_pos_sales_business_date` (`business_id`, `created_at`),
  CONSTRAINT `pos_sales_business_id_fkey`
    FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `pos_sales_created_by_fkey`
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `pos_sale_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sale_id` INT NOT NULL,
  `business_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `batch_no` VARCHAR(100) NULL,
  `expiry_date` DATE NULL,
  `quantity` DECIMAL(15,2) NOT NULL,
  `unit_price` DECIMAL(15,2) NOT NULL,
  `discount_amount` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `tax_amount` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(15,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_pos_sale_items_sale` (`sale_id`),
  INDEX `idx_pos_sale_items_product` (`product_id`),
  INDEX `idx_pos_sale_items_business` (`business_id`),
  CONSTRAINT `pos_sale_items_sale_id_fkey`
    FOREIGN KEY (`sale_id`) REFERENCES `pos_sales`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pos_sale_items_business_id_fkey`
    FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `pos_sale_items_product_id_fkey`
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
