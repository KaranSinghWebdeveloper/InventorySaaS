import { Prisma } from "@prisma/client";

export const productWithCategoryArgs = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: { category: true }
});

export type ProductWithCategoryModel = Prisma.ProductGetPayload<typeof productWithCategoryArgs>;
