import { PosPaymentMethod } from "@prisma/client";
import { z } from "zod";

const wholeStockQuantity = z.coerce
  .number()
  .positive()
  .refine(Number.isInteger, "Quantity must be a whole number because product stock is tracked as whole units");

const posSaleItemBody = z.object({
  productId: z.coerce.number().int().positive(),
  batchNo: z.string().trim().min(1).max(100).nullable().optional(),
  expiryDate: z.string().date().nullable().optional(),
  quantity: wholeStockQuantity,
  unitPrice: z.coerce.number().nonnegative(),
  discountAmount: z.coerce.number().nonnegative().default(0),
  taxAmount: z.coerce.number().nonnegative().default(0)
});

const posSaleBaseBody = z.object({
  invoiceNo: z.string().trim().min(1).max(50).optional(),
  customerName: z.string().trim().min(1).max(255).nullable().optional(),
  customerPhone: z.string().trim().min(1).max(20).nullable().optional(),
  discountAmount: z.coerce.number().nonnegative().optional(),
  taxAmount: z.coerce.number().nonnegative().optional(),
  paymentMethod: z.nativeEnum(PosPaymentMethod).optional(),
  paidAmount: z.coerce.number().nonnegative().optional(),
  items: z.array(posSaleItemBody).min(1)
});

export const createPosSaleSchema = z.object({
  body: posSaleBaseBody.extend({
    paymentMethod: z.nativeEnum(PosPaymentMethod).default(PosPaymentMethod.CASH),
    paidAmount: z.coerce.number().nonnegative().default(0)
  })
});

export const updatePosSaleSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: posSaleBaseBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  })
});

export const posSaleListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    paymentMethod: z.nativeEnum(PosPaymentMethod).optional(),
    dateFrom: z.string().date().optional(),
    dateTo: z.string().date().optional()
  })
});

export type CreatePosSaleInput = z.infer<typeof createPosSaleSchema>["body"];
export type UpdatePosSaleInput = z.infer<typeof updatePosSaleSchema>["body"];
export type PosSaleListQuery = z.infer<typeof posSaleListSchema>["query"];
