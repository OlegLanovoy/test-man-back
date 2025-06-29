import { Router } from "express";
import {
  signup,
  login,
  refreshAccessToken,
  logout,
} from "../controllers/AuthController";
const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

export default router;
