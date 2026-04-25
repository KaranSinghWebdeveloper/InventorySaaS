import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../database/prisma";

export class ProductRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(businessId: string, data: Omit<Prisma.ProductUncheckedCreateInput, "businessId">) {
    return this.db.product.create({ data: { ...data, businessId } });
  }

  findById(businessId: string, id: string) {
    return this.db.product.findFirst({
      where: { id, businessId, deletedAt: null },
      include: { category: true }
    });
  }

  async findMany(args: {
    businessId: string;
    skip: number;
    take: number;
    search?: string;
    categoryId?: string;
    lowStock?: boolean;
  }) {
    const where: Prisma.ProductWhereInput = {
      businessId: args.businessId,
      deletedAt: null,
      ...(args.categoryId ? { categoryId: args.categoryId } : {}),
      ...(args.search
        ? {
            OR: [
              { name: { contains: args.search, mode: "insensitive" } },
              { sku: { contains: args.search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [items, total] = await this.db.$transaction([
      this.db.product.findMany({
        where,
        skip: args.skip,
        take: args.take,
        include: { category: true },
        orderBy: { createdAt: "desc" }
      }),
      this.db.product.count({ where })
    ]);

    const filteredItems = args.lowStock
      ? items.filter((product) => product.stock <= product.reorderLevel)
      : items;

    return {
      items: filteredItems,
      total: args.lowStock ? filteredItems.length : total
    };
  }

  update(businessId: string, id: string, data: Prisma.ProductUncheckedUpdateInput) {
    return this.db.product.update({
      where: { id_businessId: { id, businessId } },
      data,
      include: { category: true }
    });
  }

  softDelete(businessId: string, id: string) {
    return this.db.product.update({
      where: { id_businessId: { id, businessId } },
      data: { deletedAt: new Date(), isActive: false }
    });
  }
}
