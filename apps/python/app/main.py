from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import os

from app.config import Settings, get_settings
from app.messaging.rabbitmq import RabbitMQService
from app.messaging.nats import NatsService
from app.utils.schema_generator import update_models

# Initialize FastAPI app
app = FastAPI(
    title="Python Service",
    description="FastAPI service for specialized processing and OpenAI streaming",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
rabbitmq_service = None
nats_service = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    global rabbitmq_service, nats_service
    
    settings = get_settings()
    logger.info("Starting Python service...")
    
    # Initialize RabbitMQ service
    try:
        rabbitmq_service = RabbitMQService(settings)
        await rabbitmq_service.connect()
        logger.info("RabbitMQ service initialized")
    except Exception as e:
        logger.error(f"Failed to initialize RabbitMQ service: {e}")
        # Continue even if RabbitMQ fails - we'll handle reconnection logic
    
    # Initialize NATS service
    try:
        nats_service = NatsService(settings)
        await nats_service.connect()
        logger.info("NATS service initialized")
    except Exception as e:
        logger.error(f"Failed to initialize NATS service: {e}")
        # Continue even if NATS fails - we'll handle reconnection logic
    
    # Generate models from NestJS OpenAPI schema
    try:
        logger.info("Generating models from NestJS OpenAPI schema...")
        models_updated = await update_models()
        if models_updated:
            logger.info("Models generated successfully")
        else:
            logger.warning("Failed to generate models, using existing models if available")
    except Exception as e:
        logger.error(f"Error generating models: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    logger.info("Shutting down Python service...")
    
    # Close RabbitMQ connection
    if rabbitmq_service:
        await rabbitmq_service.close()
        logger.info("RabbitMQ connection closed")
    
    # Close NATS connection
    if nats_service:
        await nats_service.close()
        logger.info("NATS connection closed")

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to the Python service"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    health = {
        "status": "healthy",
        "services": {
            "rabbitmq": "connected" if rabbitmq_service and rabbitmq_service.is_connected else "disconnected",
            "nats": "connected" if nats_service and nats_service.is_connected else "disconnected",
        }
    }
    return health

# Import and include routers
# This will be expanded as we implement more features
from app.routers import tasks
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])

# Import and include OpenAI router
from app.routers import openai
app.include_router(openai.router, prefix="/openai", tags=["openai"]) 