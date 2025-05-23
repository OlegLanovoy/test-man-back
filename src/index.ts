import express, { Request, Response } from "express";
import cors from "cors";
import { PORT, JWT_SECRET } from "./secrets";
import prisma from "../prisma/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

interface User {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  bio: string;
  linkedIn: string;
  instagram: string;
  facebook: string;
  company: string;
  role: string;
}

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server is running greets");
});

app.listen(PORT, () => {
  console.log(
    "Server is Successfully Running,and App is listening on port " + PORT
  );
});

app.post("/auth/signup", async (req: Request, res: Response) => {
  const { firstName, lastName, email, age, password } = req.body;

  console.log("Got from client:", {
    firstName,
    lastName,
    email,
    age,
    password,
  });

  // можешь сделать проверку, базу и т.д.
  if (!firstName || !lastName || !email || !age || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      age,
      email,
      password: hashedPassword,
    },
  });

  console.log(user);

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    // sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: "Login successful",
    user: { firstName, lastName, email, age },
  });
});

app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Проверка полей
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Проверка пользователя
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid email" });
  }

  // Проверка пароля
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Генерация токена
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  // Кладём в куку
  res.cookie("token", token, {
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
});

app.get("/me", async (req: Request, res: Response) => {
  const token = req.cookies.token;

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
    return res.status(401).json({ message: "Invalid token" });
  }
});

app.post("/post-create", async (req: Request, res: Response) => {
  const token = req.cookies.token;

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
});

app.get("/posts", async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
      },
    });
    res.json(posts);
  } catch (err) {
    console.error(`Failed to get posts`, err);
    res.status(500).json({ error: "Server Error" });
  }
});

app.patch("/me/profile", async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
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
});
