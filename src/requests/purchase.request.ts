import { z } from "zod";

export const createPurchaseSchema = z.object({
  body: z.object({
    supplierId: z.coerce.number().int().positive().nullable().optional(),
    invoiceNumber: z.string().trim().min(1).max(100).optional(),
    purchaseDate: z.string().date().optional(),
    items: z
      .array(
        z.object({
          productId: z.coerce.number().int().positive(),
          quantity: z.coerce.number().int().positive(),
          price: z.coerce.number().nonnegative()
        })
      )
      .min(1)
  })
});

export const purchaseListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>["body"];
