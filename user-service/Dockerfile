FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run clean-generate && npm run build

# =========================
# STAGE 2 — RUNNER
# =========================
FROM node:22-slim AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./

RUN npm install --omit=dev

CMD ["npm", "run", "start"]


