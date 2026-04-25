import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../database/prisma";

export class SupplierRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(businessId: number, data: Omit<Prisma.SupplierUncheckedCreateInput, "businessId">) {
    return this.db.supplier.create({ data: { ...data, businessId } });
  }

  findById(businessId: number, id: number) {
    return this.db.supplier.findFirst({ where: { id, businessId } });
  }

  async findMany(businessId: number, skip: number, take: number, search?: string) {
    const where: Prisma.SupplierWhereInput = {
      businessId,
      ...(search ? { name: { contains: search } } : {})
    };
    const [items, total] = await this.db.$transaction([
      this.db.supplier.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      this.db.supplier.count({ where })
    ]);
    return { items, total };
  }

  update(id: number, data: Prisma.SupplierUncheckedUpdateInput) {
    return this.db.supplier.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.db.supplier.delete({ where: { id } });
  }
}
