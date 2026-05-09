import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../../common/middleware/auth.middleware";
import { authorize } from "../../common/middleware/role.middleware";
import { validateRequest } from "../../common/middleware/validateRequest";
import { SettingsController } from "../../controllers/settings.controller";
import { getSettingsSchema, updateSettingsSchema } from "../../requests/settings.request";

const router = Router();
const controller = new SettingsController();

router.use(authenticate);

/**
 * @openapi
 * /settings:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get business settings, business info, and enabled modules
 *     responses:
 *       200:
 *         description: Settings fetched
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update business settings and module access
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.get("/", validateRequest(getSettingsSchema), controller.get);
router.put("/", authorize(UserRole.ADMIN), validateRequest(updateSettingsSchema), controller.update);

export const settingsRoutes = router;