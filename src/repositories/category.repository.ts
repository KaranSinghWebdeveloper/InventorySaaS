import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../database/prisma";
import { categoryWithRelationsArgs } from "../models/category.model";

export class CategoryRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(businessId: number, data: Omit<Prisma.CategoryUncheckedCreateInput, "businessId">) {
    return this.db.category.create({
      data: { ...data, businessId },
      ...categoryWithRelationsArgs
    });
  }

  findById(businessId: number, id: number) {
    return this.db.category.findFirst({
      where: { id, businessId },
      ...categoryWithRelationsArgs
    });
  }

  findMany(businessId: number, search?: string, status?: number) {
    return this.db.category.findMany({
      where: {
        businessId,
        ...(typeof status === "number" ? { status } : {}),
        ...(search ? { name: { contains: search } } : {})
      },
      ...categoryWithRelationsArgs,
      orderBy: { name: "asc" }
    });
  }

  update(businessId: number, id: number, data: Prisma.CategoryUncheckedUpdateInput) {
    return this.db.category.update({
      where: { id },
      data,
      ...categoryWithRelationsArgs
    });
  }

  delete(id: number) {
    return this.db.category.delete({ where: { id } });
  }
}
