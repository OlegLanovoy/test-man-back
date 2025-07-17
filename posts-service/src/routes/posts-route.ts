import { Router } from "express";
import {
  postCreate,
  getAllPosts,
  deleteLike,
} from "../controllers/controller";
import { verifyAccessToken } from "../middlewares/middleware";

const router = Router();

router.get("/", getAllPosts);
router.post("/create", verifyAccessToken, postCreate);
router.delete("/likes/:postId", verifyAccessToken, deleteLike);

export default router;
