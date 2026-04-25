import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { CreatePurchaseInput } from "./purchase.validator";

export class PurchaseRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(businessId: string, input: CreatePurchaseInput, total: number) {
    return this.db.$transaction(async (tx) => {
      for (const item of input.items) {
        await tx.product.update({
          where: { id_businessId: { id: item.productId, businessId } },
          data: { stock: { increment: item.quantity } }
        });

        await tx.inventoryTransaction.create({
          data: {
            businessId,
            productId: item.productId,
            type: "PURCHASE",
            quantity: item.quantity,
            reference: input.purchaseNo
          }
        });
      }

      return tx.purchase.create({
        data: {
          businessId,
          supplierId: input.supplierId ?? null,
          purchaseNo: input.purchaseNo,
          total,
          status: "RECEIVED",
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitCost: item.unitCost,
              total: item.quantity * item.unitCost
            }))
          }
        },
        include: { items: { include: { product: true } }, supplier: true }
      });
    });
  }

  async findMany(businessId: string, skip: number, take: number) {
    const where: Prisma.PurchaseWhereInput = { businessId };
    const [items, total] = await this.db.$transaction([
      this.db.purchase.findMany({
        where,
        skip,
        take,
        include: { supplier: true },
        orderBy: { createdAt: "desc" }
      }),
      this.db.purchase.count({ where })
    ]);
    return { items, total };
  }
}
