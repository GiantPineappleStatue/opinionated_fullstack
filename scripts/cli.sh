#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Help message
show_help() {
  echo "Fullstack Boilerplate CLI"
  echo
  echo "Usage: ./scripts/cli.sh [command] [options]"
  echo
  echo "Commands:"
  echo "  start         Start all services in development mode"
  echo "  stop          Stop all services"
  echo "  restart       Restart all services"
  echo "  logs          Show logs of all or specific service"
  echo "  db:setup      Initialize database and run migrations"
  echo "  db:migrate    Run database migrations"
  echo "  db:seed       Seed the database with test data"
  echo "  test:setup    Create test user for authentication"
  echo "  status       Show status of all services"
  echo "  clean        Clean up all containers and volumes"
  echo
  echo "Options:"
  echo "  -h, --help    Show this help message"
  echo "  -s, --service Specify service name (for logs command)"
  echo
  echo "Examples:"
  echo "  ./scripts/cli.sh start"
  echo "  ./scripts/cli.sh logs -s backend"
  echo "  ./scripts/cli.sh db:setup"
}

# Check if docker-compose is available
check_docker_compose() {
  if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed"
    exit 1
  fi
}

# Wait for service to be healthy
wait_for_service() {
  local service=$1
  local max_attempts=${2:-30}
  local attempt=1

  print_info "Waiting for $service to be ready..."
  while [ $attempt -le $max_attempts ]; do
    if docker-compose ps "$service" | grep -q "healthy"; then
      print_success "$service is ready"
      return 0
    fi
    echo -n "."
    sleep 1
    attempt=$((attempt + 1))
  done
  print_error "$service failed to become ready after $max_attempts seconds"
  return 1
}

# Database setup command
db_setup() {
  print_info "Setting up database..."
  
  # Start MySQL if not running
  if ! docker-compose ps mysql | grep -q "Up"; then
    print_info "Starting MySQL..."
    docker-compose up -d mysql
    sleep 5
  fi

  # Wait for MySQL to be healthy
  wait_for_service mysql || exit 1

  # Run migrations
  print_info "Running migrations..."
  docker-compose exec mysql mysql -u user -ppassword fullstack_db -e "source /docker-entrypoint-initdb.d/001-create-users-table.sql; source /docker-entrypoint-initdb.d/002-create-refresh-tokens-table.sql;"
  
  if [ $? -eq 0 ]; then
    print_success "Database setup completed successfully"
  else
    print_error "Database setup failed"
    exit 1
  fi
}

# Create test user
create_test_user() {
  print_info "Creating test user..."
  docker-compose exec mysql mysql -u user -ppassword fullstack_db -e "INSERT INTO users (id, email, password, name, role, email_verified, created_at, updated_at) VALUES (UUID(), 'test@test.com', '\$2b\$10\$KvGygmLy8gRikv4KEJtC9.CKCIPdEiYcKpZp8bqF8S3OoHp0lJige', 'Test User', 'user', 1, NOW(), NOW());"
  
  if [ $? -eq 0 ]; then
    print_success "Test user created successfully"
    echo "Credentials:"
    echo "  Email: test@test.com"
    echo "  Password: password123"
  else
    print_error "Failed to create test user"
    exit 1
  fi
}

# Main command handler
case "$1" in
  "start")
    check_docker_compose
    print_info "Starting all services..."
    docker-compose up -d
    print_success "All services started"
    ;;
    
  "stop")
    check_docker_compose
    print_info "Stopping all services..."
    docker-compose down
    print_success "All services stopped"
    ;;
    
  "restart")
    check_docker_compose
    print_info "Restarting all services..."
    docker-compose down
    docker-compose up -d
    print_success "All services restarted"
    ;;
    
  "logs")
    check_docker_compose
    if [ "$2" = "-s" ] && [ ! -z "$3" ]; then
      docker-compose logs -f "$3"
    else
      docker-compose logs -f
    fi
    ;;
    
  "db:setup")
    check_docker_compose
    db_setup
    ;;
    
  "db:migrate")
    check_docker_compose
    print_info "Running migrations..."
    docker-compose exec mysql mysql -u user -ppassword fullstack_db -e "source /docker-entrypoint-initdb.d/001-create-users-table.sql; source /docker-entrypoint-initdb.d/002-create-refresh-tokens-table.sql;"
    ;;
    
  "test:setup")
    check_docker_compose
    create_test_user
    ;;
    
  "status")
    check_docker_compose
    docker-compose ps
    ;;
    
  "clean")
    check_docker_compose
    print_warning "This will remove all containers and volumes. Are you sure? (y/N)"
    read -r confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
      print_info "Cleaning up..."
      docker-compose down -v
      print_success "Cleanup completed"
    else
      print_info "Cleanup cancelled"
    fi
    ;;
    
  "-h"|"--help"|"help"|"")
    show_help
    ;;
    
  *)
    print_error "Unknown command: $1"
    echo
    show_help
    exit 1
    ;;
esac 