import {
  InventoryReferenceType,
  Prisma,
  PrismaClient,
  Purchase,
  Sale
} from "@prisma/client";
import { prisma } from "../database/prisma";

export type DashboardSaleTrendRow = Pick<Sale, "totalAmount" | "saleDate" | "createdAt">;
export type DashboardPurchaseTrendRow = Pick<Purchase, "totalAmount" | "purchaseDate" | "createdAt">;

export type DashboardCategorySaleRow = {
  total: Prisma.Decimal | null;
  product: {
    category: {
      name: string;
    } | null;
  };
};

export type DashboardRecentSale = Pick<Sale, "id" | "totalAmount" | "status" | "createdAt"> & {
  customer: {
    name: string | null;
  } | null;
};

export type DashboardRecentPurchase = Pick<Purchase, "id" | "purchaseNumber" | "totalAmount" | "status" | "createdAt"> & {
  supplier: {
    name: string;
  } | null;
};

export type DashboardRecentInventoryTransaction = {
  id: number;
  type: "IN" | "OUT";
  quantity: number;
  createdAt: Date;
  product: {
    name: string;
  };
};

export class DashboardRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getStats(args: {
    businessId: number;
    currentMonthStart: Date;
    previousMonthStart: Date;
    nextMonthStart: Date;
  }) {
    const lowStockWhere: Prisma.ProductWhereInput = {
      businessId: args.businessId,
      lowStockAlert: { gt: 0 },
      quantity: { lte: this.db.product.fields.lowStockAlert }
    };

    const [
      totalRevenue,
      currentMonthRevenue,
      previousMonthRevenue,
      totalProducts,
      currentMonthProducts,
      previousMonthProducts,
      lowStockItems
    ] = await this.db.$transaction([
      this.db.sale.aggregate({
        where: { businessId: args.businessId },
        _sum: { totalAmount: true }
      }),
      this.db.sale.aggregate({
        where: {
          businessId: args.businessId,
          createdAt: { gte: args.currentMonthStart, lt: args.nextMonthStart }
        },
        _sum: { totalAmount: true }
      }),
      this.db.sale.aggregate({
        where: {
          businessId: args.businessId,
          createdAt: { gte: args.previousMonthStart, lt: args.currentMonthStart }
        },
        _sum: { totalAmount: true }
      }),
      this.db.product.count({ where: { businessId: args.businessId } }),
      this.db.product.count({
        where: {
          businessId: args.businessId,
          createdAt: { gte: args.currentMonthStart, lt: args.nextMonthStart }
        }
      }),
      this.db.product.count({
        where: {
          businessId: args.businessId,
          createdAt: { gte: args.previousMonthStart, lt: args.currentMonthStart }
        }
      }),
      this.db.product.count({ where: lowStockWhere })
    ]);

    return {
      totalRevenue: totalRevenue._sum.totalAmount,
      currentMonthRevenue: currentMonthRevenue._sum.totalAmount,
      previousMonthRevenue: previousMonthRevenue._sum.totalAmount,
      totalProducts,
      currentMonthProducts,
      previousMonthProducts,
      lowStockItems
    };
  }

  async getTrendRows(businessId: number, from: Date) {
    const [sales, purchases] = await this.db.$transaction([
      this.db.sale.findMany({
        where: {
          businessId,
          OR: [{ saleDate: { gte: from } }, { saleDate: null, createdAt: { gte: from } }]
        },
        select: { totalAmount: true, saleDate: true, createdAt: true }
      }),
      this.db.purchase.findMany({
        where: {
          businessId,
          OR: [{ purchaseDate: { gte: from } }, { purchaseDate: null, createdAt: { gte: from } }]
        },
        select: { totalAmount: true, purchaseDate: true, createdAt: true }
      })
    ]);

    return { sales, purchases };
  }

  getCategorySales(businessId: number, from: Date) {
    return this.db.saleItem.findMany({
      where: {
        sale: {
          businessId,
          OR: [{ saleDate: { gte: from } }, { saleDate: null, createdAt: { gte: from } }]
        }
      },
      select: {
        total: true,
        product: {
          select: {
            category: {
              select: { name: true }
            }
          }
        }
      }
    });
  }

  async getRecentActivity(businessId: number, limit: number) {
    const [sales, purchases, stockTransactions] = await this.db.$transaction([
      this.db.sale.findMany({
        where: { businessId },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          customer: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" },
        take: limit
      }),
      this.db.purchase.findMany({
        where: { businessId },
        select: {
          id: true,
          purchaseNumber: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          supplier: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" },
        take: limit
      }),
      this.db.inventoryTransaction.findMany({
        where: {
          businessId,
          referenceType: InventoryReferenceType.MANUAL
        },
        select: {
          id: true,
          type: true,
          quantity: true,
          createdAt: true,
          product: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" },
        take: limit
      })
    ]);

    return { sales, purchases, stockTransactions };
  }
}
