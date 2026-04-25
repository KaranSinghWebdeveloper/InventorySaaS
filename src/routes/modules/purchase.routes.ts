import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/role.middleware";
import { validateRequest } from "../../common/middleware/validateRequest";
import { PurchaseController } from "../../controllers/purchase.controller";
import { createPurchaseSchema, purchaseListSchema } from "../../requests/purchase.request";

const router = Router();
const controller = new PurchaseController();

router.use(authenticate);
router.get("/", validateRequest(purchaseListSchema), controller.list);
router.post("/", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(createPurchaseSchema), controller.create);

export const purchaseRoutes = router;
