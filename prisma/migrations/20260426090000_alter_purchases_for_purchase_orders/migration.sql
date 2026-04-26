SET NAMES utf8mb4;

ALTER TABLE `purchases`
  MODIFY `status` ENUM('save_draft', 'sent', 'pending_confirm', 'received', 'verified') NOT NULL DEFAULT 'save_draft',
  ADD COLUMN `purchase_number` VARCHAR(100) NULL AFTER `supplier_id`,
  ADD COLUMN `supplier_reference` VARCHAR(100) NULL AFTER `invoice_number`,
  ADD COLUMN `notes` TEXT NULL AFTER `total_amount`,
  ADD COLUMN `terms` TEXT NULL AFTER `notes`,
  ADD COLUMN `expected_delivery_date` DATE NULL AFTER `purchase_date`,
  ADD COLUMN `sent_at` DATETIME(3) NULL AFTER `expected_delivery_date`,
  ADD COLUMN `confirmed_at` DATETIME(3) NULL AFTER `sent_at`,
  ADD COLUMN `received_at` DATETIME(3) NULL AFTER `confirmed_at`,
  ADD COLUMN `verified_at` DATETIME(3) NULL AFTER `received_at`;

UPDATE `purchases`
SET `purchase_number` = CONCAT('PO-', LPAD(`id`, 6, '0'))
WHERE `purchase_number` IS NULL;

ALTER TABLE `purchases`
  MODIFY `purchase_number` VARCHAR(100) NOT NULL,
  ADD UNIQUE INDEX `purchases_business_id_purchase_number_key` (`business_id`, `purchase_number`);
