"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secrets_1 = require("../secrets");
const verifyAccessToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secrets_1.JWT_SECRET);
        req.user =
            decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.verifyAccessToken = verifyAccessToken;
