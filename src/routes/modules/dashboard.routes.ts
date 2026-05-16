import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware";
import { DashboardController } from "../../controllers/dashboard.controller";

const router = Router();
const controller = new DashboardController();

router.use(authenticate);

/**
 * @openapi
 * /dashboard:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Fetch dashboard overview metrics, charts, and recent activity
 *     responses:
 *       200:
 *         description: Dashboard overview fetched
 */
router.get("/", controller.overview);

export const dashboardRoutes = router;
