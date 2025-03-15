from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache
import os

class Settings(BaseSettings):
    """Application settings."""
    
    # App settings
    APP_NAME: str = "python-service"
    APP_ENV: str = Field(default="development", env="APP_ENV")
    DEBUG: bool = Field(default=True, env="DEBUG")
    
    # RabbitMQ settings
    RABBITMQ_URL: str = Field(default="amqp://guest:guest@rabbitmq:5672/", env="RABBITMQ_URL")
    RABBITMQ_QUEUE: str = Field(default="tasks", env="RABBITMQ_QUEUE")
    RABBITMQ_EXCHANGE: str = Field(default="tasks", env="RABBITMQ_EXCHANGE")
    RABBITMQ_ROUTING_KEY: str = Field(default="task", env="RABBITMQ_ROUTING_KEY")
    
    # NATS settings
    NATS_URL: str = Field(default="nats://nats:4222", env="NATS_URL")
    NATS_SUBJECT_PREFIX: str = Field(default="task", env="NATS_SUBJECT_PREFIX")
    
    # Logging settings
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    
    # OpenAI settings
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")
    OPENAI_MODEL: str = Field(default="gpt-4", env="OPENAI_MODEL")
    
    # NestJS API settings for OpenAPI schema
    NESTJS_API_URL: str = Field(default="http://backend:3002/api", env="NESTJS_API_URL")
    NESTJS_OPENAPI_URL: str = Field(default="http://backend:3002/api/docs-json", env="NESTJS_OPENAPI_URL")
    
    class Config:
        """Pydantic config."""
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings() 