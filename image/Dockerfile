FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:24-alpine

WORKDIR /app

# Berechtigungen vorbereiten
RUN addgroup -S patsy && adduser -S patsy -G patsy

# Mit korrekten Rechten aus dem Builder kopieren
COPY --chown=patsy:patsy --from=builder /app/dist ./dist
COPY --chown=patsy:patsy --from=builder /app/node_modules ./node_modules
COPY --chown=patsy:patsy --from=builder /app/package.json ./

ENV NODE_ENV=production

USER patsy

EXPOSE 3100

CMD ["node", "dist/index.js"]
