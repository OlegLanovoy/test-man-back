
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
if (!process.env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined in .env file");
}

export const PORT = process.env.PORT;
export const JWT_SECRET = process.env.JWT_SECRET;
export const RABBITMQ_URL = process.env.RABBITMQ_URL