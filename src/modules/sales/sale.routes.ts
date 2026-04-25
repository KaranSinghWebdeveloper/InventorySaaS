import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/role.middleware";
import { validateRequest } from "../../common/middleware/validateRequest";
import { SaleController } from "./sale.controller";
import { createSaleSchema, saleListSchema } from "./sale.validator";

const router = Router();
const controller = new SaleController();

router.use(authenticate);
router.get("/", validateRequest(saleListSchema), controller.list);
router.post("/", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(createSaleSchema), controller.create);

export const saleRoutes = router;
