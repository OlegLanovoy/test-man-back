"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getProfile = exports.getMe = void 0;
const secrets_1 = require("../secrets");
const prisma_1 = __importDefault(require("../../prisma/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_service_1 = require("../services/user.service"); // логика вынесена сюда
const rabbit_1 = require("../rabbit");
const getMe = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secrets_1.JWT_SECRET);
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (err) {
        console.error("getMe error:", err);
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.getMe = getMe;
const getProfile = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token)
            return res.status(401).json({ message: "Not authorized" });
        const decoded = jsonwebtoken_1.default.verify(token, secrets_1.JWT_SECRET);
        const userId = decoded.userId;
        // Список допустимых полей
        const allowedFields = [
            "firstName",
            "lastName",
            "age",
            "email",
            "bio",
            "webSite",
            "linkedIn",
            "instagram",
            "facebook",
            "company",
            "role",
        ];
        // Фильтруем только те поля, которые реально пришли
        const updateData = Object.fromEntries(Object.entries(req.body).filter(([key, value]) => allowedFields.includes(key) &&
            value !== undefined &&
            value !== null &&
            value !== ""));
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                age: true,
                email: true,
                bio: true,
                webSite: true,
                linkedIn: true,
                instagram: true,
                facebook: true,
                company: true,
                role: true,
            },
        });
        (0, rabbit_1.sendToQueue)(JSON.stringify({
            type: "user.updated",
            userId,
            updatedFields: Object.keys(updateData),
            timestamp: new Date().toISOString(),
        }));
        return res.status(200).json({
            message: "Profile updated",
            user: updatedUser,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getProfile = getProfile;
const changePassword = async (req, res) => {
    try {
        const { userId } = req.user;
        const { currentPassword, newPassword } = req.body;
        await (0, user_service_1.changeUserPassword)(userId, currentPassword, newPassword);
        return res.status(200).json({ message: "Password changed successfully" });
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({ message: err.message || "Server error" });
    }
};
exports.changePassword = changePassword;
