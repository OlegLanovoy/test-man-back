import bcrypt from "bcrypt";
import prisma from "../../prisma/prisma";

export const createUser = async (data: any) => {
  const { firstName, lastName, email, age, password } = data;

  if (!firstName || !lastName || !email || !age || !password) {
    throw new Error("All fields are required");
  }

  // Проверка дубликатов
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email already exists");
  }

  // Хэширование
  const hashedPassword = await bcrypt.hash(password, 10);

  // Создание пользователя
  return prisma.user.create({
    data: {
      firstName,
      lastName,
      age,
      email,
      password: hashedPassword,
    },
  });
};

export const changeUserPassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
) => {
  if (!currentPassword || !newPassword) throw new Error("Пароли обязательны");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Пользователь не найден");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Неверный текущий пароль");

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });
};
