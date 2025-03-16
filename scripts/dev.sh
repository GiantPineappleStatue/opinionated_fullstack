#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print colored messages
print_message() {
    echo -e "${GREEN}[DEV]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
check_requirements() {
    print_message "Checking requirements..."
    
    local missing_tools=()
    
    if ! command_exists docker; then
        missing_tools+=("docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_tools+=("docker-compose")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_warning "Missing required tools: ${missing_tools[*]}"
        print_message "Please install the missing tools and try again."
        exit 1
    fi
}

# Function to start the development environment
start_dev() {
    print_message "Starting development environment..."
    
    # Create necessary directories
    mkdir -p apps/python/.venv
    
    # Start services
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    
    # Wait for services to be healthy
    print_message "Waiting for services to be healthy..."
    sleep 10
    
    # Check service status
    docker-compose ps
    
    print_message "Development environment is ready!"
    print_message "Frontend: http://localhost:3000"
    print_message "Python API: http://localhost:8000"
    print_message "Adminer (MySQL): http://localhost:8080"
    print_message "Redis Commander: http://localhost:8081"
    print_message "RabbitMQ Management: http://localhost:15672"
    print_message "NATS Management: http://localhost:8222"
}

# Function to stop the development environment
stop_dev() {
    print_message "Stopping development environment..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
}

# Function to rebuild services
rebuild_dev() {
    print_message "Rebuilding services..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
    start_dev
}

# Function to show logs
show_logs() {
    print_message "Showing logs..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
}

# Main script
case "$1" in
    "start")
        check_requirements
        start_dev
        ;;
    "stop")
        stop_dev
        ;;
    "rebuild")
        rebuild_dev
        ;;
    "logs")
        show_logs
        ;;
    *)
        echo "Usage: $0 {start|stop|rebuild|logs}"
        exit 1
        ;;
esac 