import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/role.middleware";
import { validateRequest } from "../../common/middleware/validateRequest";
import { idParamSchema } from "../../common/validators/common.request";
import { SupplierController } from "../../controllers/supplier.controller";
import { createSupplierSchema, supplierListSchema, updateSupplierSchema } from "../../requests/supplier.request";

const router = Router();
const controller = new SupplierController();

router.use(authenticate);
router.get("/", validateRequest(supplierListSchema), controller.list);
router.post("/", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(createSupplierSchema), controller.create);
router.get("/:id", validateRequest(idParamSchema), controller.getById);
router.patch("/:id", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(updateSupplierSchema), controller.update);
router.delete("/:id", authorize(UserRole.ADMIN), validateRequest(idParamSchema), controller.delete);

export const supplierRoutes = router;
