FROM node:20-alpine AS base

# Add turbo
FROM base AS turbo-builder
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune frontend --docker

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
RUN npm run build --workspace=frontend

# Production image
FROM nginx:alpine AS production
COPY --from=app-builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Development image
FROM installer AS development
WORKDIR /app
ENV NODE_ENV=development

COPY --from=turbo-builder /app/out/full/ .
EXPOSE 3000
CMD ["npm", "run", "dev", "--workspace=frontend", "--", "--host", "0.0.0.0"] 