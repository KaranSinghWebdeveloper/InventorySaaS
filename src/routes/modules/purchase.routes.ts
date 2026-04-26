import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/role.middleware";
import { validateRequest } from "../../common/middleware/validateRequest";
import { idParamSchema } from "../../common/validators/common.request";
import { PurchaseController } from "../../controllers/purchase.controller";
import {
  createPurchaseSchema,
  purchaseListSchema,
  updatePurchaseSchema,
  updatePurchaseStatusSchema
} from "../../requests/purchase.request";

const router = Router();
const controller = new PurchaseController();

router.use(authenticate);
router.get("/", validateRequest(purchaseListSchema), controller.list);
router.get("/:id", validateRequest(idParamSchema), controller.getById);
router.post("/", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(createPurchaseSchema), controller.create);
router.patch("/:id", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(updatePurchaseSchema), controller.update);
router.patch(
  "/:id/status",
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(updatePurchaseStatusSchema),
  controller.updateStatus
);

export const purchaseRoutes = router;
