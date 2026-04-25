import {
  InventoryReferenceType,
  InventoryTransactionType,
  Prisma,
  PrismaClient,
  PurchaseStatus
} from "@prisma/client";
import { prisma } from "../database/prisma";
import { purchaseWithRelationsArgs } from "../models/purchase.model";
import { CreatePurchaseInput } from "../requests/purchase.request";

export class PurchaseRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(businessId: number, input: CreatePurchaseInput, totalAmount: number) {
    return this.db.$transaction(async (tx) => {
      for (const item of input.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } }
        });
      }

      const purchase = await tx.purchase.create({
        data: {
          businessId,
          supplierId: input.supplierId ?? null,
          invoiceNumber: input.invoiceNumber ?? null,
          totalAmount,
          status: PurchaseStatus.COMPLETED,
          purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price
            }))
          }
        },
        ...purchaseWithRelationsArgs
      });

      await tx.inventoryTransaction.createMany({
        data: input.items.map((item) => ({
          businessId,
          productId: item.productId,
          type: InventoryTransactionType.IN,
          referenceType: InventoryReferenceType.PURCHASE,
          referenceId: purchase.id,
          quantity: item.quantity
        }))
      });

      return purchase;
    });
  }

  async findMany(businessId: number, skip: number, take: number) {
    const where: Prisma.PurchaseWhereInput = { businessId };
    const [items, total] = await this.db.$transaction([
      this.db.purchase.findMany({
        where,
        skip,
        take,
        ...purchaseWithRelationsArgs,
        orderBy: { createdAt: "desc" }
      }),
      this.db.purchase.count({ where })
    ]);
    return { items, total };
  }
}
