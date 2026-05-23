import { Prisma } from "@prisma/client";

export const purchaseWithRelationsArgs = Prisma.validator<Prisma.PurchaseDefaultArgs>()({
  include: {
    business: true,
    supplier: true,
    items: { include: { product: true } }
  }
});

export type PurchaseWithRelationsModel = Prisma.PurchaseGetPayload<typeof purchaseWithRelationsArgs>;
