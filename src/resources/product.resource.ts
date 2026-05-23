import { ProductWithCategoryModel } from "../models/product.model";
import { env } from "../config/env";

const getBaseUrl = () => (env.APP_URL || `http://localhost:${env.PORT}`).replace(/\/$/, "");

const getImageUrl = (image: string | null) => {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  return `${getBaseUrl()}${image.startsWith("/") ? image : `/${image}`}`;
};

export const productResource = (product: ProductWithCategoryModel) => ({
  id: product.id,
  businessId: product.businessId,
  categoryId: product.categoryId,
  name: product.name,
  sku: product.sku,
  barcode: product.barcode,
  image: getImageUrl(product.image),
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
