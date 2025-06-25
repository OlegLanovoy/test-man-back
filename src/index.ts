import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT } from "./secrets";
import amqp from "amqplib";

import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.routes";
import postsRoutes from "./routes/posts.route";
import { connectRabbit, consumeQueue } from "./rabbit";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (_, res) => res.send("Server is running greets"));
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/posts", postsRoutes);
