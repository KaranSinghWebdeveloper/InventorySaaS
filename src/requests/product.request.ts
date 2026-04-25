import { z } from "zod";

const productBody = z.object({
  categoryId: z.coerce.number().int().positive().nullable().optional(),
  sku: z.string().trim().min(1).max(64).optional(),
  barcode: z.string().trim().max(100).optional(),
  name: z.string().trim().min(2).max(160),
  price: z.coerce.number().nonnegative(),
  costPrice: z.coerce.number().nonnegative().optional(),
  lowStockAlert: z.coerce.number().int().min(0).default(0),
  unit: z.string().trim().max(50).optional(),
  status: z.coerce.number().int().min(0).max(1).optional()
});

export const createProductSchema = z.object({ body: productBody });

export const updateProductSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: productBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  })
});

export const productListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    lowStock: z.coerce.boolean().optional()
  })
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
