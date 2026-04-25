import { Customer, Product, Sale, SaleItem } from "@prisma/client";

type SaleWithRelations = Sale & {
  customer?: Customer | null;
  items?: Array<SaleItem & { product?: Product }>;
};

export const saleResource = (sale: SaleWithRelations) => ({
  id: sale.id,
  businessId: sale.businessId,
  customerId: sale.customerId,
  invoiceNo: sale.invoiceNo,
  total: Number(sale.total),
  status: sale.status,
  customer: sale.customer ? { id: sale.customer.id, name: sale.customer.name } : null,
  items:
    sale.items?.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total)
    })) ?? [],
  createdAt: sale.createdAt
});
