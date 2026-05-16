import {
  InventoryReferenceType,
  InventoryTransactionType,
  Prisma,
  PrismaClient
} from "@prisma/client";
import { prisma } from "../database/prisma";
import { posSaleWithRelationsArgs } from "../models/pos-sale.model";
import { CreatePosSaleInput, PosSaleListQuery, UpdatePosSaleInput } from "../requests/pos-sale.request";

export type ComputedPosSaleItem = {
  productId: number;
  batchNo?: string | null;
  expiryDate?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
};

export type ComputedPosSaleTotals = {
  invoiceNo: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
};

export class PosSaleRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(
    businessId: number,
    createdBy: number,
    input: CreatePosSaleInput,
    computed: ComputedPosSaleTotals,
    items: ComputedPosSaleItem[]
  ) {
    return this.db.$transaction(async (tx) => {
      await this.ensureAvailableStock(tx, businessId, items);

      const sale = await tx.posSale.create({
        data: {
          businessId,
          createdBy,
          invoiceNo: computed.invoiceNo,
          customerName: input.customerName ?? null,
          customerPhone: input.customerPhone ?? null,
          subtotal: computed.subtotal,
          discountAmount: computed.discountAmount,
          taxAmount: computed.taxAmount,
          totalAmount: computed.totalAmount,
          paymentMethod: input.paymentMethod,
          paidAmount: input.paidAmount,
          items: {
            create: items.map((item) => ({
              businessId,
              productId: item.productId,
              batchNo: item.batchNo ?? null,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountAmount: item.discountAmount,
              taxAmount: item.taxAmount,
              totalAmount: item.totalAmount
            }))
          }
        },
        ...posSaleWithRelationsArgs
      });

      await this.applyStockOut(tx, businessId, sale.id, items);
      return sale;
    });
  }

  findById(businessId: number, id: number) {
    return this.db.posSale.findFirst({
      where: { id, businessId },
      ...posSaleWithRelationsArgs
    });
  }

  async findMany(args: {
    businessId: number;
    skip: number;
    take: number;
    query: PosSaleListQuery;
  }) {
    const where: Prisma.PosSaleWhereInput = {
      businessId: args.businessId,
      ...(args.query.paymentMethod ? { paymentMethod: args.query.paymentMethod } : {}),
      ...this.buildDateFilter(args.query.dateFrom, args.query.dateTo),
      ...(args.query.search
        ? {
            OR: [
              { invoiceNo: { contains: args.query.search } },
              { customerName: { contains: args.query.search } },
              { customerPhone: { contains: args.query.search } }
            ]
          }
        : {})
    };

    const [items, total] = await this.db.$transaction([
      this.db.posSale.findMany({
        where,
        skip: args.skip,
        take: args.take,
        ...posSaleWithRelationsArgs,
        orderBy: { createdAt: "desc" }
      }),
      this.db.posSale.count({ where })
    ]);

    return { items, total };
  }

  update(
    businessId: number,
    id: number,
    input: UpdatePosSaleInput,
    computed: ComputedPosSaleTotals,
    items?: ComputedPosSaleItem[]
  ) {
    return this.db.$transaction(async (tx) => {
      const existing = await tx.posSale.findFirst({
        where: { id, businessId },
        include: { items: true }
      });

      if (!existing) {
        throw new Error("POS_SALE_NOT_FOUND");
      }

      if (items) {
        await this.restoreStock(tx, businessId, existing.items);
        await this.ensureAvailableStock(tx, businessId, items);
        await tx.inventoryTransaction.deleteMany({
          where: { businessId, referenceType: InventoryReferenceType.POS_SALE, referenceId: id }
        });
        await tx.posSaleItem.deleteMany({ where: { saleId: id, businessId } });
      }

      const sale = await tx.posSale.update({
        where: { id },
        data: {
          invoiceNo: computed.invoiceNo,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          subtotal: computed.subtotal,
          discountAmount: computed.discountAmount,
          taxAmount: computed.taxAmount,
          totalAmount: computed.totalAmount,
          paymentMethod: input.paymentMethod,
          paidAmount: input.paidAmount,
          items: items
            ? {
                create: items.map((item) => ({
                  businessId,
                  productId: item.productId,
                  batchNo: item.batchNo ?? null,
                  expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  discountAmount: item.discountAmount,
                  taxAmount: item.taxAmount,
                  totalAmount: item.totalAmount
                }))
              }
            : undefined
        },
        ...posSaleWithRelationsArgs
      });

      if (items) {
        await this.applyStockOut(tx, businessId, id, items);
      }

      return sale;
    });
  }

  delete(businessId: number, id: number) {
    return this.db.$transaction(async (tx) => {
      const existing = await tx.posSale.findFirst({
        where: { id, businessId },
        include: { items: true }
      });

      if (!existing) {
        throw new Error("POS_SALE_NOT_FOUND");
      }

      await this.restoreStock(tx, businessId, existing.items);
      await tx.inventoryTransaction.deleteMany({
        where: { businessId, referenceType: InventoryReferenceType.POS_SALE, referenceId: id }
      });
      await tx.posSale.delete({ where: { id } });
    });
  }

  private buildDateFilter(dateFrom?: string, dateTo?: string): Pick<Prisma.PosSaleWhereInput, "createdAt"> {
    if (!dateFrom && !dateTo) {
      return {};
    }

    const createdAt: Prisma.DateTimeFilter = {};
    if (dateFrom) {
      createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      const nextDate = new Date(dateTo);
      nextDate.setDate(nextDate.getDate() + 1);
      createdAt.lt = nextDate;
    }

    return { createdAt };
  }

  private async ensureAvailableStock(
    tx: Prisma.TransactionClient,
    businessId: number,
    items: Array<{ productId: number; quantity: number }>
  ) {
    const quantityByProduct = this.sumQuantityByProduct(items);

    for (const [productId, quantity] of quantityByProduct) {
      const product = await tx.product.findFirst({
        where: { id: productId, businessId },
        select: { id: true, quantity: true }
      });

      if (!product || product.quantity < quantity) {
        throw new Error(`INSUFFICIENT_STOCK:${productId}`);
      }
    }
  }

  private async applyStockOut(
    tx: Prisma.TransactionClient,
    businessId: number,
    saleId: number,
    items: Array<{ productId: number; quantity: number }>
  ) {
    const quantityByProduct = this.sumQuantityByProduct(items);

    for (const [productId, quantity] of quantityByProduct) {
      await tx.product.update({
        where: { id: productId },
        data: { quantity: { decrement: quantity } }
      });
    }

    await tx.inventoryTransaction.createMany({
      data: Array.from(quantityByProduct.entries()).map(([productId, quantity]) => ({
        businessId,
        productId,
        type: InventoryTransactionType.OUT,
        referenceType: InventoryReferenceType.POS_SALE,
        referenceId: saleId,
        quantity
      }))
    });
  }

  private async restoreStock(
    tx: Prisma.TransactionClient,
    businessId: number,
    items: Array<{ productId: number; quantity: Prisma.Decimal }>
  ) {
    for (const [productId, quantity] of this.sumQuantityByProduct(
      items.map((item) => ({ productId: item.productId, quantity: Number(item.quantity) }))
    )) {
      await tx.product.update({
        where: { id: productId },
        data: { quantity: { increment: quantity } }
      });
    }
  }

  private sumQuantityByProduct(items: Array<{ productId: number; quantity: number }>) {
    const quantityByProduct = new Map<number, number>();

    for (const item of items) {
      quantityByProduct.set(item.productId, (quantityByProduct.get(item.productId) ?? 0) + item.quantity);
    }

    return quantityByProduct;
  }
}
