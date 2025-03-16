# Fullstack Boilerplate

A modern, production-ready fullstack boilerplate featuring Next.js, NestJS, and a robust microservices architecture.

## Features

- **Frontend**: Next.js with TypeScript, Tailwind CSS, and modern UI components
- **Backend**: NestJS with TypeScript, featuring a modular architecture
- **Authentication**: JWT-based authentication with session management
- **Database**: MySQL with TypeORM for robust data management
- **Caching**: Redis/KeyDB for high-performance caching
- **Message Queues**: RabbitMQ and NATS for reliable message processing
- **API Documentation**: Swagger/OpenAPI integration
- **Testing**: Jest and React Testing Library setup
- **Docker**: Containerization for all services
- **CI/CD**: GitHub Actions workflow templates
- **CLI**: Built-in command-line interface for common development tasks

## Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- Git

## Quick Start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fullstack-boilerplate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration

4. Start the development environment:
   ```bash
   # Start all services using the CLI
   ./cli start

   # Set up the database and create a test user
   ./cli db:setup
   ./cli test:setup
   ```

5. Access the applications:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000
   - RabbitMQ Management: http://localhost:15672
   - NATS Monitoring: http://localhost:8222

## CLI Usage

The project includes a command-line interface for common development tasks. The CLI can be accessed using either `./scripts/cli.sh` or the more convenient `./cli` command. Here are the available commands:

```bash
# Show help and available commands
./cli help

# Start all services in development mode
./cli start

# Stop all services
./cli stop

# Restart all services
./cli restart

# Show logs (all services or specific service)
./cli logs
./cli logs -s backend

# Database operations
./cli db:setup    # Initialize database and run migrations
./cli db:migrate  # Run database migrations
./cli db:seed     # Seed the database with test data

# Create test user for authentication
./cli test:setup

# Show status of all services
./cli status

# Clean up all containers and volumes
./cli clean
```

### Test User Credentials

After running `./cli test:setup`, you can use these credentials for testing:
- Email: test@test.com
- Password: password123

## Project Structure

```
├── frontend/                # Next.js frontend application
├── backend/                 # NestJS backend application
├── shared/                  # Shared types and utilities
├── docker/                  # Docker configuration files
├── .github/                 # GitHub Actions and templates
├── docs/                    # Project documentation
└── scripts/                 # Development and deployment scripts
    └── cli.sh              # Command-line interface
```

## Development

### Frontend Development

The frontend is built with Next.js and includes:
- TypeScript for type safety
- Tailwind CSS for styling
- Modern React patterns and hooks
- Comprehensive component library
- State management solution

### Backend Development

The backend uses NestJS and features:
- Modular architecture
- TypeORM for database operations
- JWT authentication
- Role-based access control
- API rate limiting
- Caching strategies
- Message queue integration

## Testing

```bash
# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend

# Run all tests
npm run test
```

## Deployment

Deployment configurations are provided for:
- Docker Compose for production
- Kubernetes manifests
- Cloud platform specific guides (AWS, GCP, Azure)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the repository or contact the maintainers.
