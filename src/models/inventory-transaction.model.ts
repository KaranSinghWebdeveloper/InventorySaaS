import { Prisma } from "@prisma/client";

export const inventoryTransactionWithProductArgs =
  Prisma.validator<Prisma.InventoryTransactionDefaultArgs>()({
    include: { product: true }
  });

export type InventoryTransactionWithProductModel = Prisma.InventoryTransactionGetPayload<
  typeof inventoryTransactionWithProductArgs
>;
