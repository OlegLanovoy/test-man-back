import { Router } from "express";
import {
  postCreate,
  getAllPosts,
  deleteLike,
  getPostById,
} from "../controllers/controller";
import { verifyAccessToken } from "../middlewares/middleware";

const router = Router();

router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.post("/create", verifyAccessToken, postCreate);
router.delete("/likes/:postId", verifyAccessToken, deleteLike);

export default router;
