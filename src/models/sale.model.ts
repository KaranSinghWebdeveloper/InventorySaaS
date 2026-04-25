import { Prisma } from "@prisma/client";

export const saleWithRelationsArgs = Prisma.validator<Prisma.SaleDefaultArgs>()({
  include: {
    customer: true,
    items: { include: { product: true } }
  }
});

export type SaleWithRelationsModel = Prisma.SaleGetPayload<typeof saleWithRelationsArgs>;
