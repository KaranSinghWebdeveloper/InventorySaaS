import { Category, Product } from "@prisma/client";

type ProductWithCategory = Product & { category?: Category | null };

export const productResource = (product: ProductWithCategory) => ({
  id: product.id,
  businessId: product.businessId,
  categoryId: product.categoryId,
  sku: product.sku,
  name: product.name,
  description: product.description,
  unitPrice: Number(product.unitPrice),
  costPrice: Number(product.costPrice),
  stock: product.stock,
  reorderLevel: product.reorderLevel,
  isActive: product.isActive,
  category: product.category
    ? {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug
      }
    : null,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt
});
