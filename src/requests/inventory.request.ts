import { InventoryReferenceType, InventoryTransactionType } from "@prisma/client";
import { z } from "zod";

export const createInventoryTransactionSchema = z.object({
  body: z.object({
    productId: z.coerce.number().int().positive(),
    type: z.nativeEnum(InventoryTransactionType),
    referenceType: z.nativeEnum(InventoryReferenceType),
    referenceId: z.coerce.number().int().positive().optional(),
    quantity: z.coerce.number().int().positive()
  })
});

export const inventoryListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    productId: z.coerce.number().int().positive().optional(),
    type: z.nativeEnum(InventoryTransactionType).optional()
  })
});

export type CreateInventoryTransactionInput = z.infer<typeof createInventoryTransactionSchema>["body"];
