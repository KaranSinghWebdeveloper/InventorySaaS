import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../database/prisma";

export class CustomerRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(businessId: string, data: Omit<Prisma.CustomerUncheckedCreateInput, "businessId">) {
    return this.db.customer.create({ data: { ...data, businessId } });
  }

  findById(businessId: string, id: string) {
    return this.db.customer.findFirst({ where: { id, businessId, deletedAt: null } });
  }

  async findMany(businessId: string, skip: number, take: number, search?: string) {
    const where: Prisma.CustomerWhereInput = {
      businessId,
      deletedAt: null,
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {})
    };
    const [items, total] = await this.db.$transaction([
      this.db.customer.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      this.db.customer.count({ where })
    ]);
    return { items, total };
  }

  update(businessId: string, id: string, data: Prisma.CustomerUncheckedUpdateInput) {
    return this.db.customer.update({ where: { id_businessId: { id, businessId } }, data });
  }

  softDelete(businessId: string, id: string) {
    return this.db.customer.update({
      where: { id_businessId: { id, businessId } },
      data: { deletedAt: new Date() }
    });
  }
}
