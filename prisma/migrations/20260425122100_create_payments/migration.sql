SET NAMES utf8mb4;

CREATE TABLE `payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `business_id` INT NOT NULL,
  `type` ENUM('sale', 'purchase') NOT NULL,
  `reference_id` INT NULL,
  `amount` DECIMAL(12,2) NULL,
  `method` ENUM('cash', 'upi', 'card') NULL,
  `payment_date` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `payments_business_id_idx` (`business_id`),
  CONSTRAINT `payments_business_id_fkey`
    FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
