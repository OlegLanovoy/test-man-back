FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./

# Устанавливаем зависимости
RUN npm install


COPY . .

RUN npm run clean-generate && npm run build

# =========================
# STAGE 2 — RUNNER
# =========================
FROM node:22-slim AS runner

WORKDIR /app

# Копируем только необходимые файлы из билдера
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./

# Устанавливаем только прод зависимости
RUN npm install --omit=dev

# Запуск
CMD ["npm", "run", "start"]
