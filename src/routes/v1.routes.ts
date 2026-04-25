import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { categoryRoutes } from "../modules/categories/category.routes";
import { inventoryRoutes } from "../modules/inventory/inventory.routes";
import { productRoutes } from "../modules/products/product.routes";
import { customerRoutes } from "../modules/customers/customer.routes";
import { purchaseRoutes } from "../modules/purchases/purchase.routes";
import { saleRoutes } from "../modules/sales/sale.routes";
import { supplierRoutes } from "../modules/suppliers/supplier.routes";
import { userRoutes } from "../modules/users/user.routes";

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
