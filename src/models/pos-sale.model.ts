import { Prisma } from "@prisma/client";

export const posSaleWithRelationsArgs = Prisma.validator<Prisma.PosSaleDefaultArgs>()({
  include: {
    creator: { select: { id: true, name: true } },
    items: { include: { product: true } }
  }
});

export type PosSaleWithRelationsModel = Prisma.PosSaleGetPayload<typeof posSaleWithRelationsArgs>;
