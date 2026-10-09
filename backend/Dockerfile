# syntax=docker/dockerfile:1

# openssl (CLI) es obligatorio: sin él Prisma detecta "musl-openssl-1.1.x" y los
# engines no cargan (Alpine trae libssl.so.3). Debe instalarse ANTES de
# npm install / prisma generate / prisma db push para que descargue los engines 3.0.x.
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json ./
RUN npm install --no-audit --no-fund

FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
RUN npx prisma generate
COPY . .

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV PORT=3000
# app.js hace listen salvo con NODE_ENV=test (los tests levantan su propio puerto)
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:$PORT/health" || exit 1
# db push sincroniza el esquema PostgreSQL al arrancar (el repo no tiene prisma/migrations).
# Si llegas a generar migraciones, sustituye por: npx prisma migrate deploy
CMD ["sh", "-c", "npx prisma db push --skip-generate && node app.js"]
