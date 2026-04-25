SET NAMES utf8mb4;

CREATE TABLE `sale_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sale_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10,2) NULL,
  `total` DECIMAL(12,2) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `sale_items_sale_id_idx` (`sale_id`),
  INDEX `sale_items_product_id_idx` (`product_id`),
  CONSTRAINT `sale_items_sale_id_fkey`
    FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sale_items_product_id_fkey`
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
