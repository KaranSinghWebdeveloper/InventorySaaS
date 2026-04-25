import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/role.middleware";
import { validateRequest } from "../../common/middleware/validateRequest";
import { InventoryController } from "./inventory.controller";
import { createInventoryTransactionSchema, inventoryListSchema } from "./inventory.validator";

const router = Router();
const controller = new InventoryController();

router.use(authenticate);
router.get("/", validateRequest(inventoryListSchema), controller.list);
router.post(
  "/transactions",
  authorize(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(createInventoryTransactionSchema),
  controller.createTransaction
);

export const inventoryRoutes = router;
