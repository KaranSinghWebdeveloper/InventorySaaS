import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { CreateSaleInput } from "./sale.validator";

export class SaleRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(businessId: string, input: CreateSaleInput, total: number) {
    return this.db.$transaction(async (tx) => {
      for (const item of input.items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, businessId, deletedAt: null }
        });

        if (!product || product.stock < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${item.productId}`);
        }

        await tx.product.update({
          where: { id_businessId: { id: item.productId, businessId } },
          data: { stock: { decrement: item.quantity } }
        });

        await tx.inventoryTransaction.create({
          data: {
            businessId,
            productId: item.productId,
            type: "SALE",
            quantity: item.quantity,
            reference: input.invoiceNo
          }
        });
      }

      return tx.sale.create({
        data: {
          businessId,
          customerId: input.customerId ?? null,
          invoiceNo: input.invoiceNo,
          total,
          status: "COMPLETED",
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice
            }))
          }
        },
        include: { items: { include: { product: true } }, customer: true }
      });
    });
  }

  async findMany(businessId: string, skip: number, take: number) {
    const where: Prisma.SaleWhereInput = { businessId };
    const [items, total] = await this.db.$transaction([
      this.db.sale.findMany({
        where,
        skip,
        take,
        include: { customer: true },
        orderBy: { createdAt: "desc" }
      }),
      this.db.sale.count({ where })
    ]);
    return { items, total };
  }
}
