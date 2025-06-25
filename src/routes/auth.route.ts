import { Router } from "express";
import {
  signup,
  login,
  refreshAccessToken,
} from "../controllers/AuthController";
const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);

export default router;
