import { InventoryTransactionType, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../database/prisma";

export class InventoryRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async createTransaction(input: {
    businessId: string;
    productId: string;
    type: InventoryTransactionType;
    quantity: number;
    reference?: string;
    notes?: string;
    stockDelta: number;
  }) {
    return this.db.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id_businessId: { id: input.productId, businessId: input.businessId } },
        data: { stock: { increment: input.stockDelta } }
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          businessId: input.businessId,
          productId: input.productId,
          type: input.type,
          quantity: input.quantity,
          reference: input.reference,
          notes: input.notes
        },
        include: { product: true }
      });

      return { product, transaction };
    });
  }

  findProduct(businessId: string, productId: string) {
    return this.db.product.findFirst({
      where: { id: productId, businessId, deletedAt: null }
    });
  }

  async findMany(args: {
    businessId: string;
    skip: number;
    take: number;
    productId?: string;
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
        include: { product: true },
        orderBy: { createdAt: "desc" }
      }),
      this.db.inventoryTransaction.count({ where })
    ]);

    return { items, total };
  }
}
