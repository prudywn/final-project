# Build stage
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy app (drizzle schema for migrate; migrations run externally in prod)
COPY . .

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./
COPY --from=base /app/src ./src
COPY --from=base /app/drizzle ./drizzle

ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "src/index.js"]
