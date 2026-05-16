import { PosSaleWithRelationsModel } from "../models/pos-sale.model";

export const posSaleResource = (sale: PosSaleWithRelationsModel) => ({
  id: sale.id,
  businessId: sale.businessId,
  invoiceNo: sale.invoiceNo,
  customerName: sale.customerName,
  customerPhone: sale.customerPhone,
  subtotal: Number(sale.subtotal),
  discountAmount: Number(sale.discountAmount),
  taxAmount: Number(sale.taxAmount),
  totalAmount: Number(sale.totalAmount),
  paymentMethod: sale.paymentMethod,
  paidAmount: Number(sale.paidAmount),
  createdBy: sale.createdBy,
  creator: sale.creator,
  items:
    sale.items?.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      batchNo: item.batchNo,
      expiryDate: item.expiryDate,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      discountAmount: Number(item.discountAmount),
      taxAmount: Number(item.taxAmount),
      totalAmount: Number(item.totalAmount),
      updatedAt: item.updatedAt
    })) ?? [],
  createdAt: sale.createdAt,
  updatedAt: sale.updatedAt
});
