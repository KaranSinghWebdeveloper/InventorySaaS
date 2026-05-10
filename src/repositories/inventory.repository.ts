import {
  InventoryReferenceType,
  InventoryTransactionType,
  Prisma,
  PrismaClient
} from "@prisma/client";
import { prisma } from "../database/prisma";
import { inventoryTransactionWithProductArgs } from "../models/inventory-transaction.model";

export class InventoryRepository {
  constructor(private readonly db: PrismaClient = prisma) { }

  async createTransaction(input: {
    businessId: number;
    productId: number;
    type: InventoryTransactionType;
    referenceType: InventoryReferenceType;
    referenceId?: number;
    quantity: number;
    quantityDelta: number;
  }) {
    return this.db.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: input.productId },
        data: { quantity: { increment: input.quantityDelta } }
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          businessId: input.businessId,
          productId: input.productId,
          type: input.type,
          referenceType: input.referenceType ?? null,
          referenceId: input.referenceId ?? 0,
          quantity: input.quantity
        },
        ...inventoryTransactionWithProductArgs
      });

      return { product, transaction };
    });
  }

  findProduct(businessId: number, productId: number) {
    return this.db.product.findFirst({
      where: { id: productId, businessId }
    });
  }

  async findMany(args: {
    businessId: number;
    skip: number;
    take: number;
    productId?: number;
    type?: InventoryTransactionType;
  }) {
    const where: Prisma.InventoryTransactionWhereInput = {
      businessId: args.businessId,
      ...(args.productId ? { productId: args.productId } : {}),
      ...(args.type ? { type: args.type } : {})
    };

    const [items, total] = await this.db.$transaction([
      this.db.inventoryTransaction.findMany({
        where,
        skip: args.skip,
        take: args.take,
        ...inventoryTransactionWithProductArgs,
        orderBy: { createdAt: "desc" }
      }),
      this.db.inventoryTransaction.count({ where })
    ]);

    return { items, total };
  }
}
