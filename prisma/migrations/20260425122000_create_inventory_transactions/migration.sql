SET NAMES utf8mb4;

CREATE TABLE `inventory_transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `business_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `type` ENUM('in', 'out') NOT NULL,
  `reference_type` ENUM('purchase', 'sale', 'manual') NOT NULL,
  `reference_id` INT NULL,
  `quantity` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `inventory_transactions_business_id_idx` (`business_id`),
  INDEX `inventory_transactions_product_id_idx` (`product_id`),
  INDEX `inventory_transactions_reference_type_reference_id_idx` (`reference_type`, `reference_id`),
  CONSTRAINT `inventory_transactions_business_id_fkey`
    FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `inventory_transactions_product_id_fkey`
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
