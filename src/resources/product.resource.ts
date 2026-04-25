import { ProductWithCategoryModel } from "../models/product.model";

export const productResource = (product: ProductWithCategoryModel) => ({
  id: product.id,
  businessId: product.businessId,
  categoryId: product.categoryId,
  name: product.name,
  sku: product.sku,
  barcode: product.barcode,
  price: Number(product.price),
  costPrice: product.costPrice === null ? null : Number(product.costPrice),
  quantity: product.quantity,
  lowStockAlert: product.lowStockAlert,
  unit: product.unit,
  status: product.status,
  category: product.category
    ? {
        id: product.category.id,
        name: product.category.name
      }
    : null,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt
});
