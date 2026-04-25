import { SaleWithRelationsModel } from "../models/sale.model";

export const saleResource = (sale: SaleWithRelationsModel) => ({
  id: sale.id,
  businessId: sale.businessId,
  customerId: sale.customerId,
  invoiceNumber: sale.invoiceNumber,
  totalAmount: sale.totalAmount === null ? null : Number(sale.totalAmount),
  paidAmount: sale.paidAmount === null ? null : Number(sale.paidAmount),
  dueAmount: sale.dueAmount === null ? null : Number(sale.dueAmount),
  status: sale.status,
  saleDate: sale.saleDate,
  customer: sale.customer ? { id: sale.customer.id, name: sale.customer.name } : null,
  items:
    sale.items?.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name,
      quantity: item.quantity,
      price: item.price === null ? null : Number(item.price),
      total: item.total === null ? null : Number(item.total)
    })) ?? [],
  createdAt: sale.createdAt
});
