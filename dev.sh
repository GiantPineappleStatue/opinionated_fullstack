#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if Docker is running
check_docker() {
  if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
  fi
}

# Function to show help
show_help() {
  echo -e "${GREEN}Development Script Help${NC}"
  echo "Usage: ./dev.sh [command]"
  echo ""
  echo "Commands:"
  echo "  up        - Start all services"
  echo "  down      - Stop all services"
  echo "  restart   - Restart all services"
  echo "  status    - Show status of all containers"
  echo "  watch     - Watch container status and logs in real-time"
  echo "  errors    - Show error messages from all services"
  echo "  stats     - Show resource usage of all containers"
  echo "  frontend  - Monitor frontend container"
  echo "  backend   - Monitor backend container"
  echo "  python    - Monitor Python service container"
  echo "  db        - Monitor database container"
  echo "  redis     - Monitor Redis container"
  echo "  rabbitmq  - Monitor RabbitMQ container"
  echo "  nats      - Monitor NATS container"
  echo "  clean     - Clean up Docker volumes and cached files"
  echo "  help      - Show this help message"
}

# Function to start services
start_services() {
  echo -e "${GREEN}Starting services...${NC}"
  docker-compose up -d
  echo -e "${GREEN}Services started!${NC}"
  echo -e "${YELLOW}Tip: Use './dev.sh watch' to monitor containers${NC}"
  show_status
}

# Function to stop services
stop_services() {
  echo -e "${YELLOW}Stopping services...${NC}"
  docker-compose down
  echo -e "${GREEN}Services stopped!${NC}"
}

# Function to restart services
restart_services() {
  echo -e "${YELLOW}Restarting services...${NC}"
  docker-compose down
  docker-compose up -d
  echo -e "${GREEN}Services restarted!${NC}"
  show_status
}

# Function to show container status
show_status() {
  echo -e "\n${BLUE}Container Status:${NC}"
  docker-compose ps
}

# Function to watch container status and logs
watch_containers() {
  local service=$1
  if [ -z "$service" ]; then
    # Split terminal into panes using tmux
    if ! command -v tmux &> /dev/null; then
      echo -e "${RED}tmux is required for watch mode. Please install tmux first.${NC}"
      exit 1
    fi

    tmux new-session -d -s dev
    tmux split-window -h
    tmux split-window -v
    tmux select-pane -t 0
    tmux send-keys "docker-compose ps --format 'table {{.Name}}\t{{.Status}}\t{{.Ports}}'" C-m
    tmux select-pane -t 1
    tmux send-keys "docker stats" C-m
    tmux select-pane -t 2
    tmux send-keys "docker-compose logs -f" C-m
    tmux -2 attach-session -d
  else
    # Monitor specific service
    tmux new-session -d -s dev
    tmux split-window -h
    tmux select-pane -t 0
    tmux send-keys "docker-compose ps $service" C-m
    tmux select-pane -t 1
    tmux send-keys "docker-compose logs -f --tail=100 $service" C-m
    tmux -2 attach-session -d
  fi
}

# Function to show error messages
show_errors() {
  local service=$1
  if [ -z "$service" ]; then
    echo -e "${BLUE}Checking for errors in all services...${NC}"
    docker-compose logs --tail=1000 | grep -i "error\|exception\|failed\|warning" --color
  else
    echo -e "${BLUE}Checking for errors in $service...${NC}"
    docker-compose logs --tail=1000 $service | grep -i "error\|exception\|failed\|warning" --color
  fi
}

# Function to show container stats
show_stats() {
  local service=$1
  if [ -z "$service" ]; then
    docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" --no-stream
  else
    docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" --no-stream | grep $service
  fi
}

# Function to monitor specific service
monitor_service() {
  local service=$1
  echo -e "${BLUE}Monitoring $service container:${NC}"
  echo -e "\n${YELLOW}Container Status:${NC}"
  docker-compose ps $service
  echo -e "\n${YELLOW}Resource Usage:${NC}"
  show_stats $service
  echo -e "\n${YELLOW}Recent Errors:${NC}"
  show_errors $service
  echo -e "\n${YELLOW}Live Logs:${NC}"
  docker-compose logs -f --tail=100 $service
}

# Function to clean up
clean_up() {
  echo -e "${YELLOW}Cleaning up Docker volumes and cached files...${NC}"
  docker-compose down -v
  rm -rf node_modules
  rm -rf apps/frontend/node_modules
  rm -rf apps/backend/node_modules
  rm -rf packages/*/node_modules
  echo -e "${GREEN}Cleanup complete!${NC}"
}

# Check if Docker is running
check_docker

# Process command
case "$1" in
  "up")
    start_services
    ;;
  "down")
    stop_services
    ;;
  "restart")
    restart_services
    ;;
  "status")
    show_status
    ;;
  "watch")
    watch_containers
    ;;
  "errors")
    show_errors
    ;;
  "stats")
    show_stats
    ;;
  "frontend")
    monitor_service frontend
    ;;
  "backend")
    monitor_service backend
    ;;
  "python")
    monitor_service python
    ;;
  "db")
    monitor_service mysql
    ;;
  "redis")
    monitor_service redis
    ;;
  "rabbitmq")
    monitor_service rabbitmq
    ;;
  "nats")
    monitor_service nats
    ;;
  "clean")
    clean_up
    ;;
  "help"|"")
    show_help
    ;;
  *)
    echo -e "${RED}Unknown command: $1${NC}"
    show_help
    exit 1
    ;;
esac 