import { Router } from "express";
import {
  getMe,
  getProfile,
  changePassword,
} from "../controllers/UserController";
import { verifyAccessToken } from "../middlewares/user.middleware";

const router = Router();

router.get("/me", getMe);
router.patch("/me/profile", getProfile);
router.patch("/me/change-password", verifyAccessToken, changePassword);

export default router;
