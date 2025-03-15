#!/bin/bash

# Load environment variables
set -a
source .env
set +a

# Set default values if not provided
PROJECT_NAME=${PROJECT_NAME:-fullstack}

# Function to display help message
show_help() {
  echo "Development script for the ${PROJECT_NAME} project"
  echo ""
  echo "Usage: $0 [command]"
  echo ""
  echo "Commands:"
  echo "  start       Start all services with hot reloading"
  echo "  stop        Stop all services"
  echo "  restart     Restart all services"
  echo "  logs        Show logs from all services"
  echo "  frontend    Start only the frontend service"
  echo "  backend     Start only the backend service"
  echo "  python      Start only the Python service"
  echo "  infra       Start only the infrastructure services (MySQL, Redis, RabbitMQ, NATS)"
  echo "  clean       Remove all containers, volumes, and networks"
  echo "  turbo       Run a Turborepo command (e.g. ./scripts/dev.sh turbo dev)"
  echo "  turbo-start Build packages with Turborepo and start Docker services"
  echo "  help        Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 start    # Start all services"
  echo "  $0 logs     # Show logs from all services"
  echo "  $0 backend  # Start only the backend service and its dependencies"
  echo "  $0 turbo dev # Run the dev script across all workspaces using Turborepo"
  echo "  $0 turbo-start # Build packages with Turborepo and start Docker services"
}

# Function to start infrastructure services
start_infra() {
  echo "Starting infrastructure services..."
  docker-compose up -d mysql redis rabbitmq nats
}

# Function to start all services
start_all() {
  echo "Starting all services with hot reloading..."
  docker-compose up -d
}

# Function to stop all services
stop_all() {
  echo "Stopping all services..."
  docker-compose down
}

# Function to restart all services
restart_all() {
  echo "Restarting all services..."
  docker-compose restart
}

# Function to show logs
show_logs() {
  echo "Showing logs from all services..."
  docker-compose logs -f
}

# Function to start frontend service
start_frontend() {
  echo "Starting frontend service and its dependencies..."
  docker-compose up -d backend
  docker-compose up -d frontend
}

# Function to start backend service
start_backend() {
  echo "Starting backend service and its dependencies..."
  start_infra
  docker-compose up -d backend
}

# Function to start Python service
start_python() {
  echo "Starting Python service and its dependencies..."
  docker-compose up -d rabbitmq nats
  docker-compose up -d python
}

# Function to clean up
clean_all() {
  echo "Removing all containers, volumes, and networks..."
  docker-compose down -v
  echo "Removing dangling images..."
  docker image prune -f
}

# Function to run Turborepo commands
run_turbo() {
  if [ -z "$1" ]; then
    echo "Error: No Turborepo command specified"
    echo "Usage: $0 turbo [command]"
    echo "Example: $0 turbo dev"
    exit 1
  fi
  
  echo "Running Turborepo command: $1"
  npx turbo run "$@"
}

# Function to build packages with Turborepo and start Docker services
turbo_start() {
  echo "Building packages with Turborepo..."
  npx turbo run build --filter=@repo/shared-types --filter=@repo/ui
  
  echo "Starting all services with hot reloading..."
  docker-compose up -d
}

# Parse command line arguments
case "$1" in
  start)
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
  frontend)
    start_frontend
    ;;
  backend)
    start_backend
    ;;
  python)
    start_python
    ;;
  infra)
    start_infra
    ;;
  clean)
    clean_all
    ;;
  turbo)
    shift
    run_turbo "$@"
    ;;
  turbo-start)
    turbo_start
    ;;
  help|*)
    show_help
    ;;
esac 