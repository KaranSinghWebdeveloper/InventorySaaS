import {
  InventoryReferenceType,
  InventoryTransactionType,
  Prisma,
  PrismaClient,
  SaleStatus
} from "@prisma/client";
import { prisma } from "../database/prisma";
import { saleWithRelationsArgs } from "../models/sale.model";
import { CreateSaleInput } from "../requests/sale.request";

export class SaleRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(
    businessId: number,
    input: CreateSaleInput,
    computed: { totalAmount: number; paidAmount: number; dueAmount: number; status: SaleStatus }
  ) {
    return this.db.$transaction(async (tx) => {
      for (const item of input.items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, businessId }
        });

        if (!product || product.quantity < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${item.productId}`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } }
        });
      }

      const sale = await tx.sale.create({
        data: {
          businessId,
          customerId: input.customerId ?? null,
          invoiceNumber: input.invoiceNumber ?? null,
          totalAmount: computed.totalAmount,
          paidAmount: computed.paidAmount,
          dueAmount: computed.dueAmount,
          status: computed.status,
          saleDate: input.saleDate ? new Date(input.saleDate) : null,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price
            }))
          }
        },
        ...saleWithRelationsArgs
      });

      await tx.inventoryTransaction.createMany({
        data: input.items.map((item) => ({
          businessId,
          productId: item.productId,
          type: InventoryTransactionType.OUT,
          referenceType: InventoryReferenceType.SALE,
          referenceId: sale.id,
          quantity: item.quantity
        }))
      });

      return sale;
    });
  }

  async findMany(businessId: number, skip: number, take: number, search?: string) {
    const trimmedSearch = search?.trim();
    const where: Prisma.SaleWhereInput = {
      businessId,
      ...(trimmedSearch
        ? {
            OR: [
              { invoiceNumber: { contains: trimmedSearch } },
              { customer: { name: { contains: trimmedSearch } } }
            ]
          }
        : {})
    };

    const [items, total] = await this.db.$transaction([
      this.db.sale.findMany({
        where,
        skip,
        take,
        ...saleWithRelationsArgs,
        orderBy: { createdAt: "desc" }
      }),
      this.db.sale.count({ where })
    ]);
    return { items, total };
  }
}
