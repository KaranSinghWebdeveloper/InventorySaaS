import { Prisma } from "@prisma/client";

export const categoryWithRelationsArgs = Prisma.validator<Prisma.CategoryDefaultArgs>()({
  include: { children: true, parent: true }
});

export type CategoryWithRelationsModel = Prisma.CategoryGetPayload<typeof categoryWithRelationsArgs>;
