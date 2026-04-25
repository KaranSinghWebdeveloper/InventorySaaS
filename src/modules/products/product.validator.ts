import { z } from "zod";

const productBody = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  sku: z.string().trim().min(1).max(64),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional(),
  unitPrice: z.coerce.number().nonnegative(),
  costPrice: z.coerce.number().nonnegative(),
  reorderLevel: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().optional()
});

export const createProductSchema = z.object({ body: productBody });

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: productBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  })
});

export const productListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    categoryId: z.string().uuid().optional(),
    lowStock: z.coerce.boolean().optional()
  })
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
