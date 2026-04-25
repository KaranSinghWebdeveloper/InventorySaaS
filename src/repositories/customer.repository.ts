import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../database/prisma";

export class CustomerRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(businessId: number, data: Omit<Prisma.CustomerUncheckedCreateInput, "businessId">) {
    return this.db.customer.create({ data: { ...data, businessId } });
  }

  findById(businessId: number, id: number) {
    return this.db.customer.findFirst({ where: { id, businessId } });
  }

  async findMany(businessId: number, skip: number, take: number, search?: string) {
    const where: Prisma.CustomerWhereInput = {
      businessId,
      ...(search ? { name: { contains: search } } : {})
    };
    const [items, total] = await this.db.$transaction([
      this.db.customer.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      this.db.customer.count({ where })
    ]);
    return { items, total };
  }

  update(id: number, data: Prisma.CustomerUncheckedUpdateInput) {
    return this.db.customer.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.db.customer.delete({ where: { id } });
  }
}
