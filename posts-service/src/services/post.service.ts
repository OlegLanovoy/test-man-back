import { Request, Response } from "express";
import { JWT_SECRET } from "../secrets";
import prisma from "../../prisma/prisma";
import jwt from "jsonwebtoken";

export const postCreate = async (req: Request, res: Response) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const { title, text, category, tags } = req.body;

    if (!title || !text || !category || !Array.isArray(tags)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        text,
        category,
        tags,
        userId: decoded.userId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({ message: "Post created", post });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(posts);
  } catch (err) {
    console.error("getAllPosts error:", err);
    return res.status(500).json({ message: "Failed to fetch posts" });
  }
};

export const deleteLike = async (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const postId = Number(req.params.postId);

    if (!postId) return res.status(400).json({ message: "Invalid post ID" });

    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: decoded.userId,
          postId: postId,
        },
      },
    });

    return res.status(200).json({ message: "Unliked" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
