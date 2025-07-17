"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshAccessToken = exports.login = exports.signup = void 0;
const secrets_1 = require("../secrets");
const prisma_1 = __importDefault(require("../../prisma/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_service_1 = require("../services/auth.service"); // логика вынесена сюда
const jwt_1 = require("../utils/jwt");
const signup = async (req, res) => {
    try {
        const user = await (0, auth_service_1.createUser)(req.body);
        const { accessToken, refreshToken } = (0, jwt_1.generateTokens)({
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
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid email" });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const { accessToken, refreshToken } = (0, jwt_1.generateTokens)({
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
    }
    catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Login failed. Try again later." });
    }
};
exports.login = login;
// controllers/AuthController.ts
const refreshAccessToken = (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token)
        return res.status(401).json({ message: "No refresh token" });
    try {
        const payload = jsonwebtoken_1.default.verify(token, secrets_1.JWT_SECRET);
        const { accessToken, refreshToken } = (0, jwt_1.generateTokens)(payload);
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        console.log("✅ Tokens refreshed for userId:", payload.userId);
        return res.status(200).json({ message: "Token refreshed" });
    }
    catch {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};
exports.refreshAccessToken = refreshAccessToken;
const logout = (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        path: "/",
    });
    return res.status(200).json({ message: "Logged out successfully" });
};
exports.logout = logout;
