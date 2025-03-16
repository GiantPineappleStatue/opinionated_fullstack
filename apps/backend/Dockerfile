# syntax=docker/dockerfile:1.4

# Base stage for shared dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/typescript-config/package*.json ./packages/typescript-config/

# Development stage
FROM base AS development
RUN apk add --no-cache wget redis
RUN npm install
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
WORKDIR /app/apps/backend
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build --workspace=apps/backend

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package*.json ./
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
RUN apk add --no-cache wget redis
ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["npm", "run", "start:prod"] 