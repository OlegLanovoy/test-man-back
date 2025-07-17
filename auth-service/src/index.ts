import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT } from "./secrets";

import authRoutes from "./routes/auth.route";
// import userRoutes from "./routes/user.routes";
// import postsRoutes from "./routes/posts.route";

import { connectRabbit, consumeQueue, sendToQueue } from "./rabbit";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// app.get("/", (_, res) => res.send("Server is running greets"));
app.use("/", authRoutes);

// 💥 Подключаем Rabbit и только потом Express
connectRabbit()
  .then(() => {
    console.log("🐰 RabbitMQ connected");

    consumeQueue((msg) => {
      console.log("📥 Consumed from queue:", msg);

      const parsed = JSON.parse(msg);
      if (parsed.type === "user.updated") {
        console.log(
          `👤 User ${parsed.userId} updated fields:`,
          parsed.updatedFields
        );
      }
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to RabbitMQ:", err);
    process.exit(1);
  });
``;
