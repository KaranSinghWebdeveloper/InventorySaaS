import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/role.middleware";
import { validateRequest } from "../../common/middleware/validateRequest";
import { idParamSchema } from "../../common/validators/common.request";
import { CustomerController } from "../../controllers/customer.controller";
import { createCustomerSchema, customerListSchema, updateCustomerSchema } from "../../requests/customer.request";

const router = Router();
const controller = new CustomerController();

router.use(authenticate);
router.get("/", validateRequest(customerListSchema), controller.list);
router.post("/", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(createCustomerSchema), controller.create);
router.get("/:id", validateRequest(idParamSchema), controller.getById);
router.patch("/:id", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(updateCustomerSchema), controller.update);
router.delete("/:id", authorize(UserRole.ADMIN), validateRequest(idParamSchema), controller.delete);

export const customerRoutes = router;
