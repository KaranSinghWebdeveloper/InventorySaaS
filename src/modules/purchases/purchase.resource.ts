import { Product, Purchase, PurchaseItem, Supplier } from "@prisma/client";

type PurchaseWithRelations = Purchase & {
  supplier?: Supplier | null;
  items?: Array<PurchaseItem & { product?: Product }>;
};

export const purchaseResource = (purchase: PurchaseWithRelations) => ({
  id: purchase.id,
  businessId: purchase.businessId,
  supplierId: purchase.supplierId,
  purchaseNo: purchase.purchaseNo,
  total: Number(purchase.total),
  status: purchase.status,
  supplier: purchase.supplier ? { id: purchase.supplier.id, name: purchase.supplier.name } : null,
  items:
    purchase.items?.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name,
      quantity: item.quantity,
      unitCost: Number(item.unitCost),
      total: Number(item.total)
    })) ?? [],
  createdAt: purchase.createdAt
});
