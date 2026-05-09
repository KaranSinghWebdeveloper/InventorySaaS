import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware";
import { sendSuccess } from "../../common/response/apiResponse";

const router = Router();

router.get("/profile", authenticate, (req, res) => {
  return sendSuccess(res, "Authenticated user fetched", req.user);
});

export const userRoutes = router;
