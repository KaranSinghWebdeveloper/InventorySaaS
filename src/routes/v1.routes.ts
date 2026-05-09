import { Router } from "express";
import { authRoutes } from "./modules/auth.routes";
import { categoryRoutes } from "./modules/category.routes";
import { inventoryRoutes } from "./modules/inventory.routes";
import { productRoutes } from "./modules/product.routes";
import { customerRoutes } from "./modules/customer.routes";
import { purchaseRoutes } from "./modules/purchase.routes";
import { saleRoutes } from "./modules/sale.routes";
import { supplierRoutes } from "./modules/supplier.routes";
import { userRoutes } from "./modules/user.routes";
import { settingsRoutes } from "./modules/settings.routes";

export const v1Routes = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: API health status
 */
v1Routes.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Inventory SaaS API is healthy",
    data: { uptime: process.uptime() },
    errors: null
  });
});

v1Routes.use("/auth", authRoutes);
v1Routes.use("/users", userRoutes);
v1Routes.use("/products", productRoutes);
v1Routes.use("/categories", categoryRoutes);
v1Routes.use("/inventory", inventoryRoutes);
v1Routes.use("/customers", customerRoutes);
v1Routes.use("/suppliers", supplierRoutes);
v1Routes.use("/sales", saleRoutes);
v1Routes.use("/purchases", purchaseRoutes);
v1Routes.use("/settings", settingsRoutes);
