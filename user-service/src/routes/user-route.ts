import { Router } from "express";
import {
  getMe,
  getProfile,
  changePassword,
} from "../controllers/controller";
import { verifyAccessToken } from "../middlewares/middleware";

const router = Router();

router.get("/me", getMe);
router.patch("/me/profile", getProfile);
router.patch("/me/change-password", verifyAccessToken, changePassword);


export default router;
