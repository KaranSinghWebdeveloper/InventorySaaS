import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../database/prisma";
import { productWithCategoryArgs } from "../models/product.model";

export class ProductRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(businessId: number, data: Omit<Prisma.ProductUncheckedCreateInput, "businessId">) {
    return this.db.product.create({
      data: { ...data, businessId },
      ...productWithCategoryArgs
    });
  }

  findById(businessId: number, id: number) {
    return this.db.product.findFirst({
      where: { id, businessId },
      ...productWithCategoryArgs
    });
  }

  async findMany(args: {
    businessId: number;
    skip: number;
    take: number;
    search?: string;
    categoryId?: number;
    lowStock?: boolean;
  }) {
    const where: Prisma.ProductWhereInput = {
      businessId: args.businessId,
      ...(args.categoryId ? { categoryId: args.categoryId } : {}),
      ...(args.search
        ? {
            OR: [
              { name: { contains: args.search } },
              { sku: { contains: args.search } },
              { barcode: { contains: args.search } }
            ]
          }
        : {}),
    };

    const [items, total] = await this.db.$transaction([
      this.db.product.findMany({
        where,
        skip: args.skip,
        take: args.take,
        ...productWithCategoryArgs,
        orderBy: { createdAt: "desc" }
      }),
      this.db.product.count({ where })
    ]);

    const filteredItems = args.lowStock
      ? items.filter((item) => item.quantity <= item.lowStockAlert)
      : items;

    return {
      items: filteredItems,
      total: args.lowStock ? filteredItems.length : total
    };
  }

  update(businessId: number, id: number, data: Prisma.ProductUncheckedUpdateInput) {
    return this.db.product.update({
      where: { id },
      data,
      ...productWithCategoryArgs
    });
  }

  delete(id: number) {
    return this.db.product.delete({ where: { id } });
  }
}
