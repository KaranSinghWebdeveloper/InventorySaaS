import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/role.middleware";
import { validateRequest } from "../../common/middleware/validateRequest";
import { uuidParamSchema } from "../../common/validators/common.schemas";
import { SupplierController } from "./supplier.controller";
import { createSupplierSchema, supplierListSchema, updateSupplierSchema } from "./supplier.validator";

const router = Router();
const controller = new SupplierController();

router.use(authenticate);
router.get("/", validateRequest(supplierListSchema), controller.list);
router.post("/", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(createSupplierSchema), controller.create);
router.get("/:id", validateRequest(uuidParamSchema), controller.getById);
router.patch("/:id", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(updateSupplierSchema), controller.update);
router.delete("/:id", authorize(UserRole.ADMIN), validateRequest(uuidParamSchema), controller.delete);

export const supplierRoutes = router;
