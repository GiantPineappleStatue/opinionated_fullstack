**⚠️ READ ONLY - DO NOT EDIT: LLM AGENTS DO NOT EDIT WITHOUT PERMISSION FROM HUMAN ⚠️**

# Port Configuration Documentation

## Core Services

### Frontend Service (Vite)
| Environment | Local Host | Container | Notes |
|------------|------------|-----------|--------|
| Development | 5173 | 5173 | Vite dev server |
| Production | 5173 | 5173 | Vite preview server |

### Backend Service (NestJS)
| Environment | Local Host | Container | Notes |
|------------|------------|-----------|--------|
| Development | 3001 | 3002 | NestJS API server |
| Production | 3001 | 3002 | NestJS API server |

### Python Service (FastAPI)
| Environment | Local Host | Container | Notes |
|------------|------------|-----------|--------|
| Development | 8000 | 8000 | FastAPI/Flask server |
| Production | 8000 | 8000 | FastAPI/Flask server |

## Database Services
| Service | Local Host | Container | Notes |
|---------|------------|-----------|--------|
| MySQL | 3306 | 3306 | Main database |
| KeyDB/Redis | 6379 | 6379 | Cache & session store |

## Message Brokers
| Service | Local Host | Container | Notes |
|---------|------------|-----------|--------|
| RabbitMQ | 5672 | 5672 | AMQP port |
| RabbitMQ Management | 15672 | 15672 | Management UI |
| NATS | 4222 | 4222 | Client connections |
| NATS Monitoring | 8222 | 8222 | Monitoring interface |

## Development Tools
| Service | Local Host | Container | Notes |
|---------|------------|-----------|--------|
| PgAdmin | 5050 | 80 | Database management |
| Redis Commander | 8081 | 8081 | Redis management UI |
| Mailhog SMTP | 1025 | 1025 | Mail testing |
| Mailhog Web UI | 8025 | 8025 | Mail UI |

## API URLs & Endpoints

### Frontend to Backend Communication
| Environment | URL Pattern | Example |
|------------|-------------|---------|
| Development | http://localhost:3001/api/* | http://localhost:3001/api/auth/login |
| Container | http://backend:3002/api/* | http://backend:3002/api/auth/login |

### Common API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/auth/login | POST | User login |
| /api/auth/register | POST | User registration |
| /api/auth/profile | GET | Get user profile |
| /api/auth/refresh | POST | Refresh access token |
| /api/health | GET | Service health check |

## Security Configuration

### CORS Settings
- Development Origin: http://localhost:5173
- Production Origin: Configured via FRONTEND_URL environment variable
- Credentials: Enabled
- Allowed Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Allowed Headers: Content-Type, Authorization, Accept
- Exposed Headers: Set-Cookie

### Cookie Configuration
| Cookie | Path | SameSite | HTTP Only | Secure |
|--------|------|----------|------------|---------|
| sessionId | /api | Lax | Yes | Prod Only |
| access_token | /api | Lax | Yes | Prod Only |
| refresh_token | /api/auth/refresh | Lax | Yes | Prod Only |

## Important Notes
1. All API endpoints are prefixed with `/api`
2. Backend service runs on port 3002 in container but is mapped to 3001 on host
3. Frontend development server runs on port 5173 for both host and container
4. Session and authentication cookies are scoped to `/api` path
5. Container-to-container communication uses the internal Docker network
6. Health check endpoints are configured for all services
7. All services use the `fullstack-network` Docker network for communication 