import { PurchaseWithRelationsModel } from "../models/purchase.model";

export const purchaseResource = (purchase: PurchaseWithRelationsModel) => ({
  id: purchase.id,
  businessId: purchase.businessId,
  supplierId: purchase.supplierId,
  purchaseNumber: purchase.purchaseNumber,
  invoiceNumber: purchase.invoiceNumber,
  supplierReference: purchase.supplierReference,
  totalAmount: purchase.totalAmount === null ? null : Number(purchase.totalAmount),
  notes: purchase.notes,
  terms: purchase.terms,
  status: purchase.status,
  purchaseDate: purchase.purchaseDate,
  expectedDeliveryDate: purchase.expectedDeliveryDate,
  sentAt: purchase.sentAt,
  confirmedAt: purchase.confirmedAt,
  receivedAt: purchase.receivedAt,
  verifiedAt: purchase.verifiedAt,
  supplier: purchase.supplier ? { id: purchase.supplier.id, name: purchase.supplier.name } : null,
  items:
    purchase.items?.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name,
      quantity: item.quantity,
      price: item.price === null ? null : Number(item.price),
      total: item.total === null ? null : Number(item.total)
    })) ?? [],
  createdAt: purchase.createdAt
});
