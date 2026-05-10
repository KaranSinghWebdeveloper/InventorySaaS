import { InventoryTransactionWithProductModel } from "../models/inventory-transaction.model";

export const inventoryTransactionResource = (transaction: InventoryTransactionWithProductModel) => ({
  id: transaction.id,
  businessId: transaction.businessId,
  productId: transaction.productId,
  type: transaction.type,
  referenceType: transaction.referenceType ?? null,
  referenceId: transaction.referenceId,
  quantity: transaction.quantity,
  product: transaction.product
    ? {
      id: transaction.product.id,
      name: transaction.product.name,
      sku: transaction.product.sku,
      quantity: transaction.product.quantity
    }
    : null,
  createdAt: transaction.createdAt
});
