import { z } from "zod";

export const createSaleSchema = z.object({
  body: z.object({
    customerId: z.coerce.number().int().positive().nullable().optional(),
    invoiceNumber: z.string().trim().min(1).max(100).optional(),
    paidAmount: z.coerce.number().nonnegative().default(0),
    saleDate: z.string().date().optional(),
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

export const saleListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional()
  })
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>["body"];
