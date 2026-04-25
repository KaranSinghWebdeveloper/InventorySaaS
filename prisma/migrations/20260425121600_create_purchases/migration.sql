SET NAMES utf8mb4;

CREATE TABLE `purchases` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `business_id` INT NOT NULL,
  `supplier_id` INT NULL,
  `invoice_number` VARCHAR(100) NULL,
  `total_amount` DECIMAL(12,2) NULL,
  `status` ENUM('pending', 'completed') NOT NULL DEFAULT 'completed',
  `purchase_date` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `purchases_business_id_idx` (`business_id`),
  INDEX `purchases_supplier_id_idx` (`supplier_id`),
  CONSTRAINT `purchases_business_id_fkey`
    FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `purchases_supplier_id_fkey`
    FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
