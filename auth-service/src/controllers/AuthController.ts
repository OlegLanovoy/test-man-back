import { Request, Response } from "express";
import { JWT_SECRET } from "../secrets";
import prisma from "../../prisma/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser } from "../services/auth.service"; // логика вынесена сюда
import { generateTokens } from "../utils/jwt";

export const signup = async (req: Request, res: Response) => {
  try {
    const user = await createUser(req.body);

    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      // secure: true,
      // sameSite: "strict"
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // secure: true,
      // sameSite: "strict"
    });

    return res.status(200).json({
      message: "Signup successful",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
      },
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed. Try again later." });
  }
};

// controllers/AuthController.ts
export const refreshAccessToken = (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email?: string;
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("✅ Tokens refreshed for userId:", (payload as any).userId);

    return res.status(200).json({ message: "Token refreshed" });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = (req: Request, res: Response) => {
res.clearCookie("accessToken", {
  httpOnly: true,
  secure: false,
  path: "/",
});

  return res.status(200).json({ message: "Logged out successfully" });
};