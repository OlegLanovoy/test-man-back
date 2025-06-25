import { Request, Response } from "express";
import { JWT_SECRET } from "../secrets";
import prisma from "../../prisma/prisma";

import jwt from "jsonwebtoken";
import { changeUserPassword } from "../services/user.service"; // логика вынесена сюда

export const getMe = async (req: Request, res: Response) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        age: true,
        email: true,
        bio: true,
        linkedIn: true,
        webSite: true,
        instagram: true,
        facebook: true,
        company: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Authorized", user });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    // Список допустимых полей
    const allowedFields = [
      "firstName",
      "lastName",
      "age",
      "email",
      "bio",
      "webSite",
      "linkedIn",
      "instagram",
      "facebook",
      "company",
      "role",
    ];

    // Фильтруем только те поля, которые реально пришли
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(
        ([key, value]) =>
          allowedFields.includes(key) &&
          value !== undefined &&
          value !== null &&
          value !== ""
      )
    );

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        age: true,
        email: true,
        bio: true,
        webSite: true,
        linkedIn: true,
        instagram: true,
        facebook: true,
        company: true,
        role: true,
      },
    });

    return res.status(200).json({
      message: "Profile updated",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  type AuthPayload = {
    userId: number;
    email?: string;
  };
  try {
    const { userId } = (req as Request & { user: AuthPayload }).user;

    const { currentPassword, newPassword } = req.body;

    await changeUserPassword(userId, currentPassword, newPassword);

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({ message: err.message || "Server error" });
  }
};
