import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../database/prisma";

export class SupplierRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(businessId: string, data: Omit<Prisma.SupplierUncheckedCreateInput, "businessId">) {
    return this.db.supplier.create({ data: { ...data, businessId } });
  }

  findById(businessId: string, id: string) {
    return this.db.supplier.findFirst({ where: { id, businessId, deletedAt: null } });
  }

  async findMany(businessId: string, skip: number, take: number, search?: string) {
    const where: Prisma.SupplierWhereInput = {
      businessId,
      deletedAt: null,
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {})
    };
    const [items, total] = await this.db.$transaction([
      this.db.supplier.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      this.db.supplier.count({ where })
    ]);
    return { items, total };
  }

  update(businessId: string, id: string, data: Prisma.SupplierUncheckedUpdateInput) {
    return this.db.supplier.update({ where: { id_businessId: { id, businessId } }, data });
  }

  softDelete(businessId: string, id: string) {
    return this.db.supplier.update({
      where: { id_businessId: { id, businessId } },
      data: { deletedAt: new Date() }
    });
  }
}
