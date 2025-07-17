"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeUserPassword = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../prisma/prisma"));
const createUser = async (data) => {
    const { firstName, lastName, email, age, password } = data;
    if (!firstName || !lastName || !email || !age || !password) {
        throw new Error("All fields are required");
    }
    // Проверка дубликатов
    const existing = await prisma_1.default.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error("Email already exists");
    }
    // Хэширование
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    // Создание пользователя
    return prisma_1.default.user.create({
        data: {
            firstName,
            lastName,
            age,
            email,
            password: hashedPassword,
        },
    });
};
exports.createUser = createUser;
const changeUserPassword = async (userId, currentPassword, newPassword) => {
    if (!currentPassword || !newPassword)
        throw new Error("Пароли обязательны");
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new Error("Пользователь не найден");
    const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
    if (!isMatch)
        throw new Error("Неверный текущий пароль");
    const hashed = await bcrypt_1.default.hash(newPassword, 10);
    await prisma_1.default.user.update({
        where: { id: userId },
        data: { password: hashed },
    });
};
exports.changeUserPassword = changeUserPassword;
