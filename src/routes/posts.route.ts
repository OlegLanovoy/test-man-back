import { Router } from "express";
import {
  postCreate,
  getAllPosts,
  deleteLike,
} from "../controllers/PostController";
import { verifyAccessToken } from "../middlewares/user.middleware";

const router = Router();

router.get("/", getAllPosts);
router.post("/create", verifyAccessToken, postCreate);
router.delete("/likes/:postId", verifyAccessToken, deleteLike);

export default router;
