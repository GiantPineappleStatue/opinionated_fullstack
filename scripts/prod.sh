#!/bin/bash

# Load environment variables
set -a
source .env
set +a

# Set default values if not provided
PROJECT_NAME=${PROJECT_NAME:-fullstack}
NODE_ENV=production

# Function to display help message
show_help() {
  echo "Production script for the ${PROJECT_NAME} project"
  echo ""
  echo "Usage: $0 [command]"
  echo ""
  echo "Commands:"
  echo "  start       Build and start all services in production mode"
  echo "  stop        Stop all services"
  echo "  restart     Restart all services"
  echo "  logs        Show logs from all services"
  echo "  build       Build all Docker images for production"
  echo "  clean       Remove all containers, volumes, and networks"
  echo "  turbo-build Build all packages using Turborepo before Docker build"
  echo "  full-build  Build packages with Turborepo and then build Docker images"
  echo "  help        Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 start    # Build and start all services in production mode"
  echo "  $0 logs     # Show logs from all services"
  echo "  $0 turbo-build # Build all packages using Turborepo"
  echo "  $0 full-build # Complete build process (Turborepo + Docker)"
}

# Function to build all Docker images for production
build_images() {
  echo "Building Docker images for production..."
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
}

# Function to start all services in production mode
start_all() {
  echo "Starting all services in production mode..."
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
}

# Function to stop all services
stop_all() {
  echo "Stopping all services..."
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
}

# Function to restart all services
restart_all() {
  echo "Restarting all services..."
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart
}

# Function to show logs
show_logs() {
  echo "Showing logs from all services..."
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
}

# Function to clean up
clean_all() {
  echo "Removing all containers, volumes, and networks..."
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml down -v
  echo "Removing dangling images..."
  docker image prune -f
}

# Function to build all packages using Turborepo
turbo_build() {
  echo "Building all packages using Turborepo..."
  
  # First build shared packages that others depend on
  NODE_ENV=production npx turbo run build --filter=@repo/shared-types --filter=@repo/ui --filter=@repo/eslint-config --filter=@repo/typescript-config
  
  # Then build apps that depend on shared packages
  NODE_ENV=production npx turbo run build --filter=@repo/backend --filter=frontend
  
  echo "Turborepo build completed successfully!"
}

# Function to do a full build (Turborepo + Docker)
full_build() {
  echo "Starting full build process..."
  
  # First build all packages with Turborepo
  turbo_build
  
  # Then build Docker images
  build_images
  
  echo "Full build completed successfully!"
}

# Parse command line arguments
case "$1" in
  start)
    build_images
    start_all
    ;;
  stop)
    stop_all
    ;;
  restart)
    restart_all
    ;;
  logs)
    show_logs
    ;;
  build)
    build_images
    ;;
  clean)
    clean_all
    ;;
  turbo-build)
    turbo_build
    ;;
  full-build)
    full_build
    ;;
  help|*)
    show_help
    ;;
esac 