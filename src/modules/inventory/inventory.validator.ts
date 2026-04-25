import { InventoryTransactionType } from "@prisma/client";
import { z } from "zod";

export const createInventoryTransactionSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    type: z.nativeEnum(InventoryTransactionType),
    quantity: z.coerce.number().int().positive(),
    reference: z.string().trim().max(120).optional(),
    notes: z.string().trim().max(1000).optional()
  })
});

export const inventoryListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    productId: z.string().uuid().optional(),
    type: z.nativeEnum(InventoryTransactionType).optional()
  })
});

export type CreateInventoryTransactionInput = z.infer<typeof createInventoryTransactionSchema>["body"];
