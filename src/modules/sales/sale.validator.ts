import { z } from "zod";

export const createSaleSchema = z.object({
  body: z.object({
    customerId: z.string().uuid().nullable().optional(),
    invoiceNo: z.string().trim().min(1).max(80),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.coerce.number().int().positive(),
          unitPrice: z.coerce.number().nonnegative()
        })
      )
      .min(1)
  })
});

export const saleListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>["body"];
