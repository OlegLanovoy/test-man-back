import express from "express";
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Gateway is running!");
});

app.use("/auth", proxy("http://auth_service:3000"));
app.use("/user", proxy("http://user_service:3000"));
app.use("/posts", proxy("http://posts_service:3000"));

app.listen(3000, () => {
  console.log("🚀 Gateway listening on port 3000");
});
