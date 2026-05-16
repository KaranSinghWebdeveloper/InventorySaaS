import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/role.middleware";
import { validateRequest } from "../../common/middleware/validateRequest";
import { idParamSchema } from "../../common/validators/common.request";
import { PosSaleController } from "../../controllers/pos-sale.controller";
import {
  createPosSaleSchema,
  posSaleListSchema,
  updatePosSaleSchema
} from "../../requests/pos-sale.request";

const router = Router();
const controller = new PosSaleController();

router.use(authenticate);

/**
 * @openapi
 * /pos-sales:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: List POS sales with pagination, search, payment method, and date filters
 *     responses:
 *       200:
 *         description: POS sales fetched
 */
router.get("/", validateRequest(posSaleListSchema), controller.list);

/**
 * @openapi
 * /pos-sales:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create POS sale and reduce product stock
 *     responses:
 *       201:
 *         description: POS sale created
 */
router.post("/", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(createPosSaleSchema), controller.create);
router.get("/:id", validateRequest(idParamSchema), controller.getById);
router.patch("/:id", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(updatePosSaleSchema), controller.update);
router.delete("/:id", authorize(UserRole.ADMIN), validateRequest(idParamSchema), controller.delete);

export const posSaleRoutes = router;
