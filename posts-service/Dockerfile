# Используем лёгкий образ Node.js
FROM node:20-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json (или pnpm-lock.yaml) сначала
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта в контейнер
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем TypeScript в dist
RUN npm run build

# Открываем порт (на всякий случай)
EXPOSE 3000

# Команда запуска сервиса
CMD ["npm", "run", "start"]
