"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secrets_1 = require("../secrets");
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const generateTokens = (payload) => {
    const accessToken = jsonwebtoken_1.default.sign(payload, secrets_1.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, secrets_1.JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
