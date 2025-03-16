# syntax=docker/dockerfile:1.4

FROM node:20-alpine AS base

# Set up turbo for pruning
FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune frontend --docker

# Install dependencies
FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Copy source code
COPY --from=builder /app/out/full/ .

# Development stage
FROM installer AS development
WORKDIR /app
ENV NODE_ENV=development
EXPOSE 5173
WORKDIR /app/apps/frontend
CMD ["npm", "run", "dev"]

# Build and Production stage
FROM installer AS production
WORKDIR /app
ENV NODE_ENV=production
RUN npm run build --workspace=apps/frontend
WORKDIR /app/apps/frontend
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"] 