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
    expiresIn: "7d",
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
