import { Prisma } from "@prisma/client";
import {
  DashboardCategorySaleRow,
  DashboardPurchaseTrendRow,
  DashboardRecentInventoryTransaction,
  DashboardRecentPurchase,
  DashboardRecentSale,
  DashboardRepository,
  DashboardSaleTrendRow
} from "../repositories/dashboard.repository";
import {
  DashboardActivity,
  DashboardCategoryPoint,
  DashboardResource,
  DashboardTrendPoint,
  dashboardResource
} from "../resources/dashboard.resource";

const CATEGORY_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b", "#22c55e", "#ef4444"];

export class DashboardService {
  constructor(private readonly dashboardRepository = new DashboardRepository()) {}

  async getOverview(businessId: number) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [stats, trendRows, categorySales, recentActivity] = await Promise.all([
      this.dashboardRepository.getStats({
        businessId,
        currentMonthStart,
        previousMonthStart,
        nextMonthStart
      }),
      this.dashboardRepository.getTrendRows(businessId, trendStart),
      this.dashboardRepository.getCategorySales(businessId, trendStart),
      this.dashboardRepository.getRecentActivity(businessId, 5)
    ]);

    const dashboard: DashboardResource = {
      stats: {
        totalRevenue: {
          title: "Total Revenue",
          value: this.toNumber(stats.totalRevenue),
          format: "currency",
          trend: this.buildTrend(stats.currentMonthRevenue, stats.previousMonthRevenue)
        },
        totalProducts: {
          title: "Total Products",
          value: stats.totalProducts,
          format: "number",
          trend: this.buildTrend(stats.currentMonthProducts, stats.previousMonthProducts)
        },
        lowStockItems: {
          title: "Low Stock Items",
          value: stats.lowStockItems,
          format: "number",
          trend: {
            value: stats.totalProducts === 0 ? 0 : this.round((stats.lowStockItems / stats.totalProducts) * 100),
            isPositive: stats.lowStockItems === 0
          }
        },
        salesThisMonth: {
          title: "Sales This Month",
          value: this.toNumber(stats.currentMonthRevenue),
          format: "currency",
          trend: this.buildTrend(stats.currentMonthRevenue, stats.previousMonthRevenue)
        }
      },
      salesPurchasesTrend: this.buildTrendPoints(trendRows.sales, trendRows.purchases, trendStart),
      categoryDistribution: this.buildCategoryDistribution(categorySales),
      recentActivity: this.buildRecentActivity(recentActivity)
    };

    return dashboardResource(dashboard);
  }

  private buildTrendPoints(
    sales: DashboardSaleTrendRow[],
    purchases: DashboardPurchaseTrendRow[],
    trendStart: Date
  ): DashboardTrendPoint[] {
    const points = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(trendStart.getFullYear(), trendStart.getMonth() + index, 1);
      const key = this.getMonthKey(date);
      return {
        key,
        month: date.toLocaleString("en", { month: "short" }),
        sales: 0,
        purchases: 0
      };
    });

    const pointByKey = new Map(points.map((point) => [point.key, point]));

    for (const sale of sales) {
      const date = sale.saleDate ?? sale.createdAt;
      const point = pointByKey.get(this.getMonthKey(date));
      if (point) {
        point.sales += this.toNumber(sale.totalAmount);
      }
    }

    for (const purchase of purchases) {
      const date = purchase.purchaseDate ?? purchase.createdAt;
      const point = pointByKey.get(this.getMonthKey(date));
      if (point) {
        point.purchases += this.toNumber(purchase.totalAmount);
      }
    }

    return points.map(({ month, sales: salesTotal, purchases: purchasesTotal }) => ({
      month,
      sales: this.round(salesTotal),
      purchases: this.round(purchasesTotal)
    }));
  }

  private buildCategoryDistribution(rows: DashboardCategorySaleRow[]): DashboardCategoryPoint[] {
    const totals = new Map<string, number>();

    for (const row of rows) {
      const categoryName = row.product.category?.name ?? "Uncategorized";
      totals.set(categoryName, (totals.get(categoryName) ?? 0) + this.toNumber(row.total));
    }

    const grandTotal = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);

    return Array.from(totals.entries())
      .sort(([, left], [, right]) => right - left)
      .map(([name, value], index) => ({
        name,
        value: this.round(value),
        percent: grandTotal === 0 ? 0 : this.round((value / grandTotal) * 100),
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] ?? "#6366f1"
      }));
  }

  private buildRecentActivity(activity: {
    sales: DashboardRecentSale[];
    purchases: DashboardRecentPurchase[];
    stockTransactions: DashboardRecentInventoryTransaction[];
  }): DashboardActivity[] {
    const sales = activity.sales.map((sale): DashboardActivity => ({
      id: `sale-${sale.id}`,
      type: "sale",
      title: `Sale to ${sale.customer?.name ?? "Walk-in customer"}`,
      amount: this.toNumber(sale.totalAmount),
      quantity: null,
      status: sale.status.toLowerCase(),
      createdAt: sale.createdAt
    }));

    const purchases = activity.purchases.map((purchase): DashboardActivity => ({
      id: `purchase-${purchase.id}`,
      type: "purchase",
      title: `Purchase from ${purchase.supplier?.name ?? purchase.purchaseNumber}`,
      amount: this.toNumber(purchase.totalAmount),
      quantity: null,
      status: purchase.status.toLowerCase(),
      createdAt: purchase.createdAt
    }));

    const stockTransactions = activity.stockTransactions.map((transaction): DashboardActivity => ({
      id: `stock-${transaction.id}`,
      type: "stock",
      title: `Stock ${transaction.type === "IN" ? "In" : "Out"}: ${transaction.product.name}`,
      amount: null,
      quantity: transaction.type === "IN" ? transaction.quantity : -transaction.quantity,
      status: transaction.type.toLowerCase(),
      createdAt: transaction.createdAt
    }));

    return [...sales, ...purchases, ...stockTransactions]
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, 5);
  }

  private buildTrend(current: Prisma.Decimal | number | null, previous: Prisma.Decimal | number | null) {
    const currentValue = this.toNumber(current);
    const previousValue = this.toNumber(previous);

    if (previousValue === 0) {
      return {
        value: currentValue === 0 ? 0 : 100,
        isPositive: currentValue >= previousValue
      };
    }

    const difference = ((currentValue - previousValue) / previousValue) * 100;
    return {
      value: this.round(Math.abs(difference)),
      isPositive: difference >= 0
    };
  }

  private getMonthKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  private toNumber(value: Prisma.Decimal | number | null) {
    if (value === null) {
      return 0;
    }

    return typeof value === "number" ? value : Number(value);
  }

  private round(value: number) {
    return Math.round(value * 100) / 100;
  }
}
