import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware";
import { parseProfileMultipart } from "../../common/middleware/profileMultipart";
import { validateRequest } from "../../common/middleware/validateRequest";
import { UserController } from "../../controllers/user.controller";
import { updateProfileSchema } from "../../requests/user.request";

const router = Router();
const controller = new UserController();

router.use(authenticate);
router.get("/profile", controller.profile);
router.patch("/profile", parseProfileMultipart, validateRequest(updateProfileSchema), controller.updateProfile);

export const userRoutes = router;
