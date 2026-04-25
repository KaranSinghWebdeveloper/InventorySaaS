import { InventoryTransaction, Product } from "@prisma/client";

type InventoryTransactionWithProduct = InventoryTransaction & { product?: Product };

export const inventoryTransactionResource = (transaction: InventoryTransactionWithProduct) => ({
  id: transaction.id,
  businessId: transaction.businessId,
  productId: transaction.productId,
  type: transaction.type,
  quantity: transaction.quantity,
  reference: transaction.reference,
  notes: transaction.notes,
  product: transaction.product
    ? {
        id: transaction.product.id,
        sku: transaction.product.sku,
        name: transaction.product.name,
        stock: transaction.product.stock
      }
    : null,
  createdAt: transaction.createdAt
});
