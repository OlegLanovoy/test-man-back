"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const secrets_1 = require("./secrets");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
// import userRoutes from "./routes/user.routes";
// import postsRoutes from "./routes/posts.route";
const rabbit_1 = require("./rabbit");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get("/", (_, res) => res.send("Server is running greets"));
app.use("/auth", auth_route_1.default);
// app.use("/user", userRoutes);
// app.use("/posts", postsRoutes);
// 💥 Подключаем Rabbit и только потом Express
(0, rabbit_1.connectRabbit)()
    .then(() => {
    console.log("🐰 RabbitMQ connected");
    (0, rabbit_1.consumeQueue)((msg) => {
        console.log("📥 Consumed from queue:", msg);
        const parsed = JSON.parse(msg);
        if (parsed.type === "user.updated") {
            console.log(`👤 User ${parsed.userId} updated fields:`, parsed.updatedFields);
        }
    });
    app.listen(secrets_1.PORT, () => {
        console.log(`🚀 Server is running on port ${secrets_1.PORT}`);
    });
})
    .catch((err) => {
    console.error("❌ Failed to connect to RabbitMQ:", err);
    process.exit(1);
});
``;
