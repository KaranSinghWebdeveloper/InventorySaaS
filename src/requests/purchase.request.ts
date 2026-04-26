import { PurchaseStatus } from "@prisma/client";
import { z } from "zod";

const purchaseItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative()
});

export const createPurchaseSchema = z.object({
  body: z.object({
    supplierId: z.coerce.number().int().positive().nullable().optional(),
    purchaseNumber: z.string().trim().min(1).max(100).optional(),
    invoiceNumber: z.string().trim().min(1).max(100).optional(),
    supplierReference: z.string().trim().max(100).optional(),
    purchaseDate: z.string().date().optional(),
    expectedDeliveryDate: z.string().date().optional(),
    notes: z.string().trim().max(5000).optional(),
    terms: z.string().trim().max(5000).optional(),
    status: z
      .nativeEnum(PurchaseStatus)
      .refine((value) => value !== PurchaseStatus.VERIFIED, "Verified purchase must be created after receiving")
      .optional(),
    items: z.array(purchaseItemSchema).min(1)
  })
});

export const updatePurchaseSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  body: z
    .object({
      supplierId: z.coerce.number().int().positive().nullable().optional(),
      purchaseNumber: z.string().trim().min(1).max(100).optional(),
      invoiceNumber: z.string().trim().min(1).max(100).optional(),
      supplierReference: z.string().trim().max(100).optional(),
      purchaseDate: z.string().date().optional(),
      expectedDeliveryDate: z.string().date().optional(),
      notes: z.string().trim().max(5000).optional(),
      terms: z.string().trim().max(5000).optional(),
      items: z.array(purchaseItemSchema).min(1).optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required"
    })
});

export const updatePurchaseStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  body: z.object({
    status: z.nativeEnum(PurchaseStatus),
    invoiceNumber: z.string().trim().min(1).max(100).optional(),
    supplierReference: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(5000).optional()
  })
});

export const purchaseListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: z.preprocess(
      (val) => {
        // Convert empty strings and null to undefined
        if (!val || (typeof val === 'string' && val.trim().length === 0)) {
          return undefined;
        }
        return val;
      },
      z.nativeEnum(PurchaseStatus).optional()
    ),
    supplierId: z.coerce.number().int().positive().optional(),
    search: z.string().trim().optional()
  })
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>["body"];
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>["body"];
export type UpdatePurchaseStatusInput = z.infer<typeof updatePurchaseStatusSchema>["body"];
