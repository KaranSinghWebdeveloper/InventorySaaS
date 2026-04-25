import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/role.middleware";
import { validateRequest } from "../../common/middleware/validateRequest";
import { idParamSchema } from "../../common/validators/common.request";
import { CategoryController } from "../../controllers/category.controller";
import { categoryListSchema, createCategorySchema, updateCategorySchema } from "../../requests/category.request";

const router = Router();
const controller = new CategoryController();

router.use(authenticate);

/**
 * @openapi
 * /categories:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: List categories or hierarchy with tree=true
 *     responses:
 *       200:
 *         description: Categories fetched
 */
router.get("/", validateRequest(categoryListSchema), controller.list);
router.post("/", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(createCategorySchema), controller.create);
router.get("/:id", validateRequest(idParamSchema), controller.getById);
router.patch("/:id", authorize(UserRole.ADMIN, UserRole.STAFF), validateRequest(updateCategorySchema), controller.update);
router.delete("/:id", authorize(UserRole.ADMIN), validateRequest(idParamSchema), controller.delete);

export const categoryRoutes = router;
