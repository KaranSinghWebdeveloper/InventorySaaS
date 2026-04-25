import { Router } from "express";
import { validateRequest } from "../../common/middleware/validateRequest";
import { AuthController } from "../../controllers/auth.controller";
import { loginSchema, refreshTokenSchema, registerSchema } from "../../requests/auth.request";

const router = Router();
const controller = new AuthController();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a business and admin user
 *     responses:
 *       201:
 *         description: Registration successful
 */
router.post("/register", validateRequest(registerSchema), controller.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", validateRequest(loginSchema), controller.login);
router.post("/refresh-token", validateRequest(refreshTokenSchema), controller.refresh);

export const authRoutes = router;
