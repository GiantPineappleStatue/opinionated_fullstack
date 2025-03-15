# Python FastAPI Service

This service is responsible for specialized processing tasks in the fullstack application. It communicates with the NestJS backend via RabbitMQ for task consumption and NATS for real-time updates.

## Features

- FastAPI framework for high-performance API development
- Pydantic for data validation and settings management
- RabbitMQ integration for consuming tasks from NestJS backend
- NATS integration for publishing task status updates
- Automatic type synchronization with NestJS using OpenAPI schema
- OpenAI integration for AI completions with streaming support
- NestJS integration with proxy endpoints for seamless communication
- Docker support for containerized deployment
- Structured logging with Loguru
- Retry logic with Tenacity

## Integration with NestJS

This service is designed to work seamlessly with the NestJS backend:

1. **Automatic Type Synchronization**: On startup, the service fetches the OpenAPI schema from the NestJS backend and generates Pydantic models, ensuring type safety between services.

2. **Proxy Endpoints**: The NestJS backend includes proxy endpoints that forward requests to this service, allowing frontend clients to interact with OpenAI features through the authenticated NestJS API.

3. **Environment Configuration**: Both services are configured to communicate with each other through environment variables.

4. **Message Queue Integration**: Tasks can be delegated from NestJS to this service via RabbitMQ, with status updates sent back via NATS.

## Essential vs Optional Features

### Essential Features
- OpenAI integration with streaming support
- Automatic type synchronization with NestJS
- Error handling and logging
- Health check endpoints

### Optional Features (🔺)
- Database integration (not needed - service uses NestJS backend for data)
- Authentication (not needed - service is called by authenticated NestJS backend)
- Advanced AI features (function calling, tools, etc.)

## Development

### Prerequisites

- Python 3.11+
- Docker and Docker Compose

### Local Development

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the application:

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000.

### Docker Development

The service is configured to run in Docker as part of the fullstack application:

```bash
# From the root of the monorepo
docker-compose up python
```

## API Documentation

When the service is running, you can access the auto-generated API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

- `GET /`: Root endpoint
- `GET /health`: Health check endpoint
- `POST /tasks`: Task processing endpoints
- `POST /openai/completions`: Generate OpenAI completions
- `POST /openai/completions/stream`: Stream OpenAI completions

## Environment Variables

The service uses the following environment variables:

```
# App settings
APP_NAME=python-service
APP_ENV=development
DEBUG=true
LOG_LEVEL=DEBUG

# RabbitMQ settings
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
RABBITMQ_QUEUE=tasks
RABBITMQ_EXCHANGE=tasks
RABBITMQ_ROUTING_KEY=task

# NATS settings
NATS_URL=nats://nats:4222
NATS_SUBJECT_PREFIX=task

# OpenAI settings
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4

# NestJS API settings
NESTJS_API_URL=http://backend:3002/api
NESTJS_OPENAPI_URL=http://backend:3002/api/docs-json
```

## Project Structure

```
app/
├── __init__.py
├── main.py           # FastAPI application entry point
├── config.py         # Application configuration
├── models/           # Generated Pydantic models
│   ├── __init__.py
│   └── nestjs_models.py  # Auto-generated models from NestJS OpenAPI schema
├── services/         # Service implementations
│   ├── __init__.py
│   └── openai_service.py # OpenAI service for completions and streaming
├── utils/            # Utility functions
│   ├── __init__.py
│   └── schema_generator.py # OpenAPI schema fetcher and model generator
├── messaging/        # Messaging services
│   ├── __init__.py
│   ├── rabbitmq.py   # RabbitMQ service
│   └── nats.py       # NATS service
└── routers/          # API routers
    ├── __init__.py
    ├── tasks.py      # Tasks router
    └── openai.py     # OpenAI router for completions and streaming
``` 