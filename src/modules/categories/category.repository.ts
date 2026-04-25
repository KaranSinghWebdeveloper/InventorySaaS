import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../database/prisma";

export class CategoryRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(businessId: string, data: Omit<Prisma.CategoryUncheckedCreateInput, "businessId">) {
    return this.db.category.create({ data: { ...data, businessId } });
  }

  findById(businessId: string, id: string) {
    return this.db.category.findFirst({
      where: { id, businessId, deletedAt: null },
      include: { children: { where: { deletedAt: null } }, parent: true }
    });
  }

  findMany(businessId: string, search?: string) {
    return this.db.category.findMany({
      where: {
        businessId,
        deletedAt: null,
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {})
      },
      include: { children: { where: { deletedAt: null } }, parent: true },
      orderBy: { name: "asc" }
    });
  }

  update(businessId: string, id: string, data: Prisma.CategoryUncheckedUpdateInput) {
    return this.db.category.update({
      where: { id_businessId: { id, businessId } },
      data,
      include: { children: { where: { deletedAt: null } }, parent: true }
    });
  }

  softDelete(businessId: string, id: string) {
    return this.db.category.update({
      where: { id_businessId: { id, businessId } },
      data: { deletedAt: new Date() }
    });
  }
}
