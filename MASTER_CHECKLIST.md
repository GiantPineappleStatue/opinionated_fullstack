# Fullstack Project Master Checklist

This document serves as the central reference for tracking progress across all components of the fullstack project. It provides a comprehensive overview of implementation status, requirements, and architecture details.

## Project Overview

A modern fullstack application with a React frontend, NestJS backend, and Python service for specialized processing. The application features robust authentication, real-time capabilities, message queuing for asynchronous tasks, and a scalable architecture.

## Implementation Status Summary

### Frontend (apps/frontend)
- ✅ Core Setup (Vite, React, TypeScript, TanStack Router, TanStack Query, Tailwind, Shadcn UI)
- ✅ API Client & Error Handling
- ✅ Complete auth flow implementation
  - ✅ Login functionality
  - ✅ Registration flow
  - ✅ Logout flow
  - ✅ Password reset flow
  - ✅ Email verification
  - ✅ Account management
  - ✅ Persistent sessions
  - ✅ Comprehensive auth state management
  - ✅ Secure cookie-based refresh token mechanism
- ✅ Protected routes
  - ✅ Route protection system
  - ✅ Redirect unauthenticated users
  - ✅ Preserve intended destination after login
  - ✅ Role-based access control UI
  - 🔺 Permission-based access control UI (optional)

### Backend (NestJS)
- ✅ Core Setup (NestJS, TypeScript, Module Structure)
- ⚠️ Database Integration (partial)
  - ✅ Connection setup with optional mock
  - ✅ Connection pooling
  - ✅ Entity definitions without ORM
  - ✅ Migrations for user table with role column
  - ✅ Migrations for refresh tokens table
  - ✅ Seeders
  - 🔺 Advanced database features (partial)
    - ✅ Transaction support for all database operations
    - 🔺 Query builders (optional)
- ✅ Caching Integration
  - ✅ Redis/KeyDB connection with optional mock
  - ✅ Cache module integration
  - ✅ Cache strategies & invalidation
    - ✅ User profile caching with TTL
    - ✅ Cache invalidation on logout and role changes
    - ✅ Custom cache decorators (@NoCache, @CacheKey, @CacheTTL)
    - ✅ Automatic caching for GET requests
  - ✅ Advanced caching features
    - ✅ TTL for cached resources
    - ✅ Cache metrics and monitoring
    - ✅ Cache hit/miss tracking
    - ✅ Cache invalidation by prefix
    - ✅ Admin-only cache management endpoints
- ✅ Session Management
- ✅ Authentication
  - ✅ Cookie-based session authentication
  - ✅ Role-based access control (User and Admin roles)
  - ✅ Public routes with @Public() decorator
  - ✅ Role-restricted routes with @Roles() decorator
  - ✅ UUIDv7 for user IDs
  - ✅ Enhanced cookie-based auth with access/refresh tokens
  - ✅ Token rotation and security features
  - ✅ Automatic token refresh mechanism
  - ✅ Email verification with token-based confirmation
  - ✅ Mock email service for development
- 🔺 Message Queue Integration (partial)
  - ✅ RabbitMQ & NATS integration with optional mocks
  - ✅ Basic task processing system
  - 🔺 Advanced messaging features (retry, DLQ, prioritization, etc.) (optional)
- ❌ WebSocket integration
- 🔺 Complete API endpoints (partial)
  - ✅ Authentication endpoints (login, register, logout, refresh)
  - ✅ Email verification endpoints (verify, resend, status)
  - ✅ Account management endpoints (update profile, change password, delete account)
  - ✅ Admin endpoints (get team members, promote user to admin)
  - ✅ OpenAI proxy endpoints (completions, streaming)
- ✅ Error Handling
  - ✅ Custom exception filters
  - ✅ Consistent error responses
  - ✅ Proper error logging

### Backend (FastAPI)
- ✅ Core Setup & Basic Features
- 🔺 Database integration (not needed - service uses NestJS backend for data)
- 🔺 Authentication (not needed - service is called by authenticated NestJS backend)
- ✅ OpenAI integration
  - ✅ Chat completions API
  - ✅ Streaming responses
  - ✅ Error handling and logging
- ✅ NestJS Integration
  - ✅ Proxy endpoints in NestJS backend
  - ✅ Environment configuration
  - ✅ Error handling and logging
- ✅ Automatic type synchronization with NestJS
  - ✅ OpenAPI schema fetching
  - ✅ Pydantic model generation
  - ✅ Automatic schema updates on startup
- ✅ Message Queue Integration
  - ✅ RabbitMQ for task consumption
  - ✅ NATS for real-time updates

### Shared Types (packages/shared-types)
- ✅ Basic package setup
- ✅ User & Auth types
  - ✅ User roles enum (UserRole)
  - ✅ Auth response types with role support
- ✅ API response types
- ✅ Zod schemas
- ✅ OpenAPI-compatible DTO classes
- 🔺 Complete type coverage for all endpoints (ongoing)

### Infrastructure
- ✅ Docker & Kubernetes Setup
  - ✅ Docker configuration for all services
  - ✅ Docker Compose for development & production
  - ✅ Kubernetes configuration (basic)
  - ✅ Development environment with hot reloading
- 🔺 Infrastructure Services (partial)
  - ✅ Service containers & configuration
  - ✅ Service health checks & networking
  - 🔺 Monitoring and logging (optional)
  - 🔺 Backup and restore procedures (optional)
  - 🔺 High availability configuration (optional)

### CI/CD
- 🔺 GitHub Actions (optional)
- ✅ Deployment configuration

### Monorepo Setup
- ✅ Turborepo configuration
- ✅ Workspace package management
- 🔺 Advanced monorepo features (optional)

### API Documentation
- ✅ OpenAPI/Swagger integration
  - ✅ NestJS Swagger setup
  - ✅ API endpoint documentation
  - ✅ DTO classes for Swagger
  - 🔺 Complete documentation for all endpoints (ongoing)
  - 🔺 API versioning in documentation (optional)

## Technology Stack

### Frontend
- **Framework**: React (latest), Vite, TypeScript
- **Routing**: TanStack Router (file-based routing)
- **State/Data Management**: TanStack Query
- **UI Framework**: Shadcn UI + Tailwind CSS
- **User Feedback**: Shadcn/Sonner Toast Notifications
- **HTTP Client**: Native fetch() (wrapped for consistency)
- **Validation**: Zod for schema definition and client-side validation
- **Auth**: Cookie-based authentication (HTTP-only secure cookies for both session and tokens)
- **Storage**: LocalStorage only for non-sensitive user preferences and UI state

### Backend (NestJS)
- **Runtime & Framework**: NestJS (latest), TypeScript, @nestjs/platform-express
- **Database**: MySQL (latest), raw queries using mysql2 with prepared statements (with mock option)
- **Session Management**: Redis/KeyDB-backed sessions (with memory store fallback), secure HTTP-only cookies
- **Authentication & Security**:
  - Current: Cookie-based session authentication
  - Planned: Enhanced cookie-based auth with access/refresh tokens (all in HTTP-only cookies)
  - bcrypt (secure password hashing)
  - Helmet (@nestjs/helmet) secure headers
  - Throttling/Rate Limiting (@nestjs/throttler)
  - CORS configuration
- **Core Utilities**:
  - Configuration Management (@nestjs/config)
  - Caching (@nestjs/cache-manager)
  - Validation (class-validator, class-transformer)
  - Scheduling (@nestjs/schedule)
  - Mapped Types (@nestjs/mapped-types)
- **Real-time & Messaging**:
  - WebSockets (@nestjs/websockets)
  - RabbitMQ (async task delegation, with mock option)
  - NATS (real-time streaming from Python service, with mock option)
- **Middleware & Enhancements**:
  - Response Compression
  - Structured Request Logging
  - Graceful Shutdown Handlers
- **Tooling & Standards**: ESLint, Prettier, Zod

### Python Service (FastAPI)
- **Framework**: FastAPI (latest Python stable)
- **Containerization**: Fully Dockerized
- **Communication**:
  - Receives tasks from NestJS via RabbitMQ
  - Publishes streaming data to NestJS via NATS
- **Server**: Uvicorn
- **Configuration**: Pydantic Settings
- **Logging**: Structured logging with Loguru
- **Error Handling**: Tenacity for retry logic

### Infrastructure & Deployment
- **Local Dev Environment**: 
  - Option 1: Direct local development with mock services
  - Option 2: Docker Compose with all required services (MySQL, KeyDB/Redis, RabbitMQ, NATS)
- **Production Deployment**: 
  - Option 1: Docker Compose with production configuration
  - Option 2: Kubernetes with Helm charts
- **Build Practices**: Multi-stage Docker builds
- **Resource Management**: Kubernetes readiness & liveness probes
- **CI/CD**: GitHub Actions (planned)

### Monorepo Structure
- **Tool**: Turborepo
- **Organization**:
  - Frontend & NestJS backend in monorepo (shared types & utilities)
  - Python service independently containerized
- **Workspaces**:
  - apps/frontend: React frontend application
  - apps/backend: NestJS backend application
  - apps/docs: Documentation site
  - packages/shared-types: Shared TypeScript types
  - packages/ui: Shared UI components
  - packages/eslint-config: Shared ESLint configuration
  - packages/typescript-config: Shared TypeScript configuration

## Detailed Requirements Checklist

### Frontend Requirements
- ✅ Project setup with Vite, React, TypeScript
- ✅ Routing with TanStack Router
- ✅ State management with TanStack Query
- ✅ UI framework with Shadcn UI and Tailwind CSS
- ✅ Toast notifications with Sonner
- ✅ API client setup
- ✅ Error handling for API requests
- ✅ CORS handling for cross-origin requests
- ✅ Complete authentication flow
  - ✅ Basic login functionality
  - ✅ Registration with form validation
  - ✅ Session persistence across browser refreshes
  - ✅ Automatic cookie-based token refresh mechanism
  - ✅ Secure logout with token invalidation
  - ✅ Authentication state management
  - ✅ Loading states during authentication
  - ✅ Error handling for authentication failures
  - ✅ Email verification flow
  - ✅ Password reset flow
  - ✅ Account management screens
  - ✅ Safe storage of non-sensitive user data in localStorage
- ✅ Protected routes
  - ✅ Route protection HOC or component
  - ✅ Authentication state integration with router
  - ✅ Redirect logic for unauthenticated users
  - ✅ Preservation of intended destination
  - ✅ Role-based route protection
  - ❌ Permission-based route protection
  - ✅ Loading states during authentication checks
- ✅ Form validation with Zod
- ✅ Loading states
- ✅ Responsive design
- 🔺 Accessibility compliance (partial)

### NestJS Backend Requirements

#### Core Setup
- ✅ Project initialization with NestJS CLI
- ✅ TypeScript configuration
- ✅ Module structure setup
- ✅ Environment configuration (@nestjs/config)
- ✅ Logging setup (built-in Logger)
- ✅ Optional services for local development

#### Authentication & Authorization
- ✅ Session-based authentication (without Passport)
  - ✅ Session creation and storage
  - ✅ Session validation
  - ✅ Session destruction (logout)
- ✅ Enhanced cookie-based authentication
  - ✅ Access token in HTTP-only cookie
  - ✅ Refresh token in HTTP-only cookie
  - ✅ Token rotation on refresh
  - ✅ Token blacklisting for revocation
  - ✅ Token expiration handling
  - ✅ Automatic token refresh mechanism
  - ✅ Proper error handling for token validation
- ✅ Custom AuthGuard for route protection
  - ✅ Support for both session and token-based authentication
  - ✅ Fallback mechanism from token to session
- ✅ Session storage in Redis/KeyDB (with memory store fallback)
- ✅ Secure HTTP-only cookies
- ✅ JWT token generation and validation
- ✅ Role-based access control
  - ✅ Role definition and assignment (User and Admin roles)
  - ✅ Role-based guards (RolesGuard)
  - ✅ Role validation in endpoints (@Roles() decorator)
  - ✅ Admin-only endpoints and functionality
- ❌ Permission-based access control
  - ❌ Permission definition and assignment
  - ❌ Permission-based guards
  - ❌ Permission validation in endpoints
- ✅ Password reset functionality
  - ✅ Password reset token generation
  - ✅ Password reset token validation
  - ✅ Secure password update
- ❌ Email verification
  - ❌ Email verification token generation
  - ❌ Email verification token validation
  - ❌ Email status tracking
- ❌ Two-factor authentication
  - ❌ TOTP implementation
  - ❌ Backup codes
  - ❌ 2FA enrollment flow
  - ❌ 2FA validation flow

#### API Features
- ✅ Rate limiting with @nestjs/throttler
- ✅ Request validation using Zod
- ✅ Global exception filter
  - ✅ HttpExceptionFilter for HTTP exceptions
  - ✅ AllExceptionsFilter for all other exceptions
- ✅ Custom validation pipe for Zod
- ✅ API versioning (global prefix)
- ✅ CORS configuration for cross-origin requests
- ✅ API documentation with Swagger/OpenAPI
- 🔺 Comprehensive logging (partial)
  - ✅ Basic logging with NestJS Logger
  - ❌ Structured logging
  - ❌ Log aggregation
- 🔺 Request/Response interceptors (partial)
  - ✅ Response transformation
  - ❌ Request logging
- ❌ Pagination utilities
- ❌ Sorting and filtering utilities

#### Database
- ✅ MySQL connection setup
- ✅ Connection pooling
- ✅ Basic query execution
- ✅ Prepared statements for security
- ✅ User table with role column
- ✅ UUIDv7 for primary keys
  - ✅ UUIDv7 generation for new users
  - ✅ Database schema updated to use CHAR(36) for IDs
- ✅ Entity definitions without ORM
  - ✅ User entity with type safety
  - ❌ Other entity definitions
- ❌ Advanced query builders
- ✅ Transaction support
  - ✅ All database operations use transactions
  - ✅ Consistent error handling for transactions
- ❌ Database migrations for other tables
- ✅ Database seeders
  - ✅ User seeder with admin and regular users
  - ✅ Transaction support in seeders
  - ❌ Seeders for other entities

#### Caching
- ✅ Redis/KeyDB connection setup (with mock option)
- ✅ Cache module integration
- ✅ Optional Redis/KeyDB for local development
- 🔺 Cache strategies implementation (partial)
  - ✅ User profile caching with TTL
  - ✅ Cache invalidation on logout and role changes
  - ❌ Comprehensive cache strategy for all resources
- 🔺 Cache invalidation (partial)
  - ✅ Basic cache invalidation for user data
  - ❌ Advanced cache invalidation patterns
- ✅ Cache key management
- 🔺 TTL configuration (partial)
  - ✅ TTL for user profiles (5 minutes)
  - ❌ Configurable TTL for different resource types
- ❌ Cache hit/miss metrics

#### Asynchronous Processing
- ✅ RabbitMQ integration (with mock option)
- ✅ Task queue implementation
- ✅ Email tasks
- ✅ Notification tasks
- ✅ Data processing tasks
- ✅ Task status tracking via NATS
- ✅ Optional RabbitMQ for local development
- ❌ Retry mechanisms
- ❌ Dead letter queues
- ❌ Task prioritization
- ❌ Task scheduling
- ❌ Task cancellation
- ❌ Task progress reporting

#### Real-time Features
- ✅ NATS integration (with mock option)
- ✅ Event publishing
- ✅ Event subscription
- ✅ Optional NATS for local development
- ❌ WebSocket integration
- ❌ Socket.IO integration
- ❌ Real-time notifications
- ❌ Presence tracking
- ❌ Room/channel management
- ❌ Message broadcasting
- ❌ Connection state management

#### Security
- ✅ CORS configuration
- ✅ Helmet integration
- ✅ Response compression
- ✅ Graceful shutdown handlers
- 🔺 Data consistency protection (partial)
  - ✅ Transaction support for all database operations
  - ❌ Optimistic concurrency control
- ❌ CSRF protection
- ❌ Content Security Policy
- ❌ Rate limiting per user
- ❌ Input sanitization
- ❌ SQL injection protection
  - ✅ Prepared statements for all database queries
  - ❌ Input validation for all user inputs
- ❌ XSS protection
- ❌ Security headers
- ❌ Dependency scanning
- ❌ Audit logging

#### Testing
- ❌ Unit tests
- ❌ Integration tests
- ❌ E2E tests
- ❌ Test coverage reporting
- ❌ Mocking utilities
- ❌ Test fixtures
- ❌ Test data factories
- ❌ CI integration

#### Performance
- ✅ Response compression
- ❌ Response caching
- ❌ Query optimization
- ❌ Lazy loading
- ✅ Connection pooling
- ❌ Resource monitoring
- ❌ Performance metrics

#### Monitoring & Logging
- ✅ Basic logging setup
- ❌ Structured logging
- ❌ Log rotation
- ❌ Error tracking
- ❌ Performance monitoring
- ❌ Health checks
- ❌ Metrics collection
- ❌ Alerting

#### Admin Functionality
- ✅ Admin module setup
- ✅ Admin-only controller with role protection
- ✅ Admin service for user management
- ✅ Get all users endpoint (admin only)
- ✅ Promote user to admin endpoint (admin only)
- ✅ Admin user creation script
- ❌ Admin dashboard UI
- ❌ User management UI
- ❌ Advanced admin features

### FastAPI Python Service Requirements
- ✅ Project setup
- ✅ Pydantic models
- ✅ RabbitMQ consumer
- ✅ NATS publisher
- ✅ Error handling
- ✅ Logging
- ✅ Health checks
- ✅ Configuration management
- ✅ Docker setup
- ❌ Unit tests
- ✅ API endpoints (basic)
- ❌ Authentication
- ❌ Database integration (if needed)
- ✅ Dependency injection
- ✅ Background tasks
- ❌ Middleware

### Infrastructure Requirements
- ✅ Local development without containers
- ✅ Docker configuration
  - ✅ Dockerfile for NestJS backend
  - ✅ Dockerfile for React frontend
  - ✅ Dockerfile for FastAPI Python service
  - ✅ Multi-stage builds for production optimization
  - ✅ Development-specific configurations
- ✅ Docker Compose setup
  - ✅ MySQL service
  - ✅ KeyDB/Redis service
  - ✅ RabbitMQ service
  - ✅ NATS service
  - ✅ Backend service
  - ✅ Frontend service
  - ✅ Python service
  - ✅ Development environment variables
  - ✅ Volume mounts for persistence
  - ✅ Network configuration
  - ✅ Hot reloading for development
  - ✅ Production configuration
- ✅ Kubernetes configuration
  - ✅ Namespace definitions
  - ✅ Deployment manifests
  - ✅ Service definitions
  - ✅ Ingress configuration
  - ✅ ConfigMaps and Secrets
  - ✅ Persistent volume claims
  - ✅ StatefulSets for databases
  - ❌ Horizontal Pod Autoscaling
  - ✅ Resource limits and requests
  - ✅ Liveness and readiness probes
  - ❌ Init containers
- ✅ Environment configuration
- ❌ Monitoring and logging
- ❌ Backup and restore procedures
- ❌ Scaling policies
- ❌ High availability configuration
- ❌ Disaster recovery plan

### Development Tools
- ✅ Development scripts
  - ✅ Start/stop services
  - ✅ View logs
  - ✅ Clean up resources
  - ✅ Start specific services
- ✅ Production scripts
  - ✅ Build for production
  - ✅ Deploy to production
  - ✅ Clean up resources
- ✅ Kubernetes deployment scripts
  - ✅ Build and push images
  - ✅ Deploy to Kubernetes
  - ✅ Wait for services to be ready

### Monorepo Requirements
- ✅ Turborepo setup
  - ✅ Root package.json configuration
  - ✅ turbo.json configuration
  - ✅ Workspace definitions
  - ✅ Task dependencies
  - ✅ Build caching
  - ❌ Remote caching
- ✅ Package management
  - ✅ Shared dependencies
  - ✅ Workspace references
  - ✅ Version management
- ✅ Script integration
  - ✅ Dev script
  - ✅ Build script
  - ✅ Lint script
  - ✅ Type checking
- ✅ Docker integration with Turborepo
  - ✅ Docker scripts using Turborepo
  - ✅ Turborepo-aware Docker builds
  - ❌ Caching in Docker builds
- ❌ CI/CD integration
  - ❌ GitHub Actions with Turborepo
  - ❌ Turborepo remote caching in CI
  - ❌ Parallel execution in CI

## Zod to Python Type Synchronization Strategy

### API Communication (NestJS → FastAPI)
- ✅ Generate OpenAPI (Swagger) from NestJS
- ✅ Use datamodel-code-generator to auto-generate Pydantic models in Python
- ✅ Ensure automatic schema sync between NestJS and FastAPI

### Message Queue (RabbitMQ/NATS)
- ✅ Manually define Pydantic models in Python
- ✅ Match Zod schemas from NestJS
- ✅ Ensure strict type validation for messaging

### Implementation Steps
1. ✅ Expose OpenAPI JSON in NestJS
2. ✅ Generate Pydantic models in Python using datamodel-code-generator
3. ✅ Manually define Pydantic models for MQ messages

## Architecture Details

### Module Structure (NestJS Backend)
- **AppModule**: Root module
- **ConfigModule**: Application configuration
- **DatabaseModule**: Database connection and repositories (with mock option)
- **RedisModule**: Redis/KeyDB connection and services (with mock option)
- **SessionModule**: Session management (with memory store fallback)
- **AuthModule**: Authentication and authorization
- **RabbitMQModule**: Message queue integration (with mock option)
- **NatsModule**: Real-time streaming (with mock option)
- **TasksModule**: Asynchronous task processing
- **CommonModule**: Shared utilities, pipes, filters, etc.

### Authentication Flow Options

#### Legacy: Cookie-Based Session Authentication
1. User submits credentials
2. Server validates credentials
3. Server creates a session with user information
4. Session ID is stored in a cookie
5. Subsequent requests include the cookie
6. AuthGuard validates the session

#### Current: Enhanced Cookie-Based Authentication with Tokens
1. User submits credentials
2. Server validates credentials and generates:
   - Short-lived access token (e.g., 15 minutes)
   - Longer-lived refresh token (e.g., 7 days)
3. Both tokens are stored in HTTP-only secure cookies
4. Subsequent requests include cookies automatically
5. Server validates access token cookie
6. When access token expires, server uses refresh token cookie to issue new tokens
7. Server rotates refresh token with each use for security
8. Server maintains a blacklist of invalidated tokens (e.g., after logout)
9. Frontend automatically refreshes tokens before expiration
10. AuthGuard supports both token and session-based authentication with fallback mechanism

#### Frontend Authentication Features
1. ✅ Login with email and password
2. ✅ Registration with form validation
3. ✅ Secure logout with token invalidation
4. ✅ Automatic token refresh mechanism
5. ✅ Protected routes with role-based access control
6. ✅ Password reset flow (forgot password and reset password)
7. ✅ Email verification flow
8. ✅ Account management screens
   - ✅ Profile update
   - ✅ Password change
   - ✅ Account deletion
9. ✅ Authentication state management with React Context
10. ✅ Loading states during authentication operations
11. ✅ Error handling for authentication failures
12. ✅ Redirect to intended destination after login

### Task Processing Flow
1. Client sends a task request
2. Controller validates the request using Zod schemas
3. Task is queued in RabbitMQ (or mock implementation)
4. Task status event is published to NATS (or mock implementation)
5. Worker consumes the task from RabbitMQ (or mock implementation)
6. Worker publishes processing status (task.processing)
7. Worker processes the task
8. Task completion/failure event is published to NATS (or mock implementation)
9. Client can subscribe to task status updates

## Best Practices

### General Guidance
- Always prefer existing project conventions, utilities, and code before adding new libraries or solutions
- Consistently use the latest stable versions of libraries/packages
- Choose simplest effective solutions, especially in the Python service
- Make services optional for local development without containers
- Use Docker Compose for development with all required services

### Code Style
- Use meaningful variable and function names
- Follow framework-specific naming conventions
- Document public APIs
- Use TypeScript types/interfaces
- Minimize the use of `any` type
- Use consistent formatting (enforced by Prettier)
- Follow ESLint rules
- Write self-documenting code
- Use descriptive error messages

### Error Handling
- ✅ Use custom exception filters
  - ✅ HttpExceptionFilter for HTTP exceptions
  - ✅ AllExceptionsFilter for all other exceptions
- ✅ Provide meaningful error messages
- ✅ Log errors appropriately
- ✅ Return consistent error responses
- ✅ Include error codes
- ✅ Handle edge cases
- ✅ Validate inputs
- ✅ Use try/catch blocks
- ✅ Implement global error handling
- ✅ Provide user-friendly error messages

### Performance
- Use caching where appropriate
- Optimize database queries
- Use pagination for large data sets
- Implement proper indexing
- Minimize HTTP requests
- Use connection pooling
- Implement lazy loading
- Optimize asset delivery
- Use compression
- Monitor performance metrics

### Security
- Validate all inputs
- Sanitize outputs
- Use proper authentication and authorization
- Follow the principle of least privilege
- Keep dependencies updated
- Implement rate limiting
- Use HTTPS
- Set secure HTTP-only cookies for all sensitive data
- Never store tokens in localStorage
- Implement proper CORS
- Use content security policy
- Protect against common vulnerabilities (XSS, CSRF, SQL Injection)
- Conduct security audits

### Docker & Kubernetes
- Use multi-stage builds for smaller images
- Implement proper health checks
- Set resource limits and requests
- Use named volumes for persistence
- Implement proper networking
- Use environment variables for configuration
- Implement proper logging
- Use secrets for sensitive data
- Implement proper security context
- Use init containers when needed
- Implement proper readiness and liveness probes

### Monorepo Best Practices
- Define clear boundaries between packages
- Keep shared packages small and focused
- Use strict versioning for shared packages
- Leverage Turborepo's caching for faster builds
- Use consistent naming conventions across packages
- Minimize cross-package dependencies
- Use TypeScript project references for better type checking
- Ensure all packages have proper build scripts
- Use consistent tooling across all packages
- Document package interfaces and APIs

## Configuration Requirements

The application requires the following environment variables:

```
# App
PORT=3002
NODE_ENV=development

# Database
DB_ENABLED=false  # Set to true when using a real database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=fullstack_db

# Redis/KeyDB
REDIS_ENABLED=false  # Set to true when using a real Redis/KeyDB instance
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Session
SESSION_SECRET=your-secret-key
SESSION_NAME=sid

# JWT (for cookie-based tokens)
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# RabbitMQ
RABBITMQ_ENABLED=false  # Set to true when using a real RabbitMQ instance
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=tasks

# NATS
NATS_ENABLED=false  # Set to true when using a real NATS instance
NATS_URL=nats://localhost:4222

# CORS
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /auth/login`: User login
- `POST /auth/register`: User registration
- `POST /auth/logout`: User logout
- `GET /auth/profile`: Get current user profile
- `PATCH /auth/profile`: Update user profile
- `POST /auth/change-password`: Change user password
- `DELETE /auth/account`: Delete user account
- `POST /auth/refresh`: Refresh access token
- `GET /auth/admin-profile`: Get admin profile (admin only)
- `POST /auth/forgot-password`: Initiate password reset
- `POST /auth/reset-password`: Complete password reset
- `POST /auth/verify-email`: Verify email address (future)
- `POST /auth/resend-verification`: Resend verification email (future)

### OpenAI
- `POST /openai/completions`: Generate text completions
- `GET /openai/completions/stream`: Stream text completions

### Tasks
- `POST /tasks`: Create a generic task
- `POST /tasks/email`: Create an email task
- `POST /tasks/notification`: Create a notification task
- `POST /tasks/data-processing`: Create a data processing task

## NATS Events

### Task Events
- `task.queued`: Published when a task is added to the queue
- `task.processing`: Published when a task starts processing
- `task.completed`: Published when a task is successfully completed
- `task.failed`: Published when a task fails

## Future Enhancements

- 🔺 GraphQL API (optional)
- 🔺 Microservices architecture (optional)
- 🔺 Analytics and reporting (optional)
- 🔺 Mobile app integration (optional)
- 🔺 Internationalization (optional)
- 🔺 Accessibility improvements (optional)
- 🔺 Advanced caching strategies (optional)
- 🔺 Real-time collaboration features (optional)
- 🔺 Machine learning integration (optional)
- 🔺 Advanced search capabilities (optional)
- 🔺 Content delivery network integration (optional)
- 🔺 Progressive web app features (optional)

#### Security Features
- ✅ Password hashing with bcrypt
- ✅ Session-based authentication
- ✅ Role-based access control
- ✅ UUIDv7 for user IDs (prevents enumeration attacks)
- ✅ Prepared statements for SQL queries (prevents SQL injection)
- ✅ HTTP-only cookies for session storage
- ✅ HTTP-only cookies for token storage (access and refresh tokens)
- ✅ Public route decorator for authentication bypass
- ✅ Role-based route protection
- ✅ Token rotation for refresh tokens
- ✅ Token blacklisting for revocation
- ✅ Proper error handling to prevent information leakage
- ❌ CSRF protection
- ✅ Rate limiting with @nestjs/throttler
- 🔺 IP blocking (optional)
- 🔺 Audit logging (optional)
- ✅ Security headers (Helmet)
- 🔺 Content Security Policy (optional)
- 🔺 Two-factor authentication (optional)
- ✅ OpenAI integration
- 🔺 Advanced AI features (function calling, tools, etc.) (optional)
- 🔺 AI-powered search (optional)
- 🔺 AI content generation (optional) 