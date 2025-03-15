FROM node:20-alpine AS base

# Add turbo
FROM base AS turbo-builder
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune @repo/backend --docker

# Install dependencies
FROM base AS installer
WORKDIR /app
COPY --from=turbo-builder /app/out/json/ .
COPY --from=turbo-builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project
FROM installer AS app-builder
WORKDIR /app
COPY --from=turbo-builder /app/out/full/ .
RUN npm run build --workspace=@repo/backend

# Production image
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and dependencies
COPY --from=app-builder /app/apps/backend/dist ./dist
COPY --from=app-builder /app/apps/backend/package.json ./package.json
COPY --from=app-builder /app/node_modules ./node_modules

EXPOSE ${PORT:-3001}
CMD ["node", "dist/main"]

# Development image
FROM installer AS development
WORKDIR /app
ENV NODE_ENV=development

COPY --from=turbo-builder /app/out/full/ .
EXPOSE ${PORT:-3001}
CMD ["npm", "run", "dev", "--workspace=@repo/backend"] 