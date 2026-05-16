export type DashboardStat = {
  title: string;
  value: number;
  format: "currency" | "number";
  trend: {
    value: number;
    isPositive: boolean;
  };
};

export type DashboardTrendPoint = {
  month: string;
  sales: number;
  purchases: number;
};

export type DashboardCategoryPoint = {
  name: string;
  value: number;
  percent: number;
  color: string;
};

export type DashboardActivity = {
  id: string;
  type: "sale" | "purchase" | "stock";
  title: string;
  amount: number | null;
  quantity: number | null;
  status: string;
  createdAt: Date;
};

export type DashboardResource = {
  stats: {
    totalRevenue: DashboardStat;
    totalProducts: DashboardStat;
    lowStockItems: DashboardStat;
    salesThisMonth: DashboardStat;
  };
  salesPurchasesTrend: DashboardTrendPoint[];
  categoryDistribution: DashboardCategoryPoint[];
  recentActivity: DashboardActivity[];
};

export const dashboardResource = (dashboard: DashboardResource) => dashboard;
