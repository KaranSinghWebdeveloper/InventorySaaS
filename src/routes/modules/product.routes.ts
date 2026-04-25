import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/role.middleware";
import { validateRequest } from "../../common/middleware/validateRequest";
import { idParamSchema } from "../../common/validators/common.request";
import { ProductController } from "../../controllers/product.controller";
import { createProductSchema, productListSchema, updateProductSchema } from "../../requests/product.request";

const router = Router();
const controller = new ProductController();

router.use(authenticate);

/**
 * @openapi
 * /products:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: List products with pagination and search
 *     responses:
 *       200:
 *         description: Products fetched
 */
router.get("/", validateRequest(productListSchema), controller.list);

/**
 * @openapi
 * /products:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create product
 *     responses:
 *       201:
 *         description: Product created
 */
router.post("/", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(createProductSchema), controller.create);
router.get("/:id", validateRequest(idParamSchema), controller.getById);
router.patch("/:id", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(updateProductSchema), controller.update);
router.delete("/:id", authorize(UserRole.ADMIN), validateRequest(idParamSchema), controller.delete);

export const productRoutes = router;
