import aio_pika
from aio_pika import connect_robust, ExchangeType, Message
from aio_pika.abc import AbstractIncomingMessage
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential
import json
import asyncio
from typing import Callable, Dict, Any, Optional

from app.config import Settings

class RabbitMQService:
    """Service for interacting with RabbitMQ."""
    
    def __init__(self, settings: Settings):
        """Initialize RabbitMQ service."""
        self.settings = settings
        self.connection = None
        self.channel = None
        self.exchange = None
        self.queue = None
        self.is_connected = False
        self.task_handlers: Dict[str, Callable] = {}
    
    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=1, max=60))
    async def connect(self):
        """Connect to RabbitMQ with retry logic."""
        logger.info(f"Connecting to RabbitMQ at {self.settings.RABBITMQ_URL}")
        
        try:
            # Connect to RabbitMQ
            self.connection = await connect_robust(self.settings.RABBITMQ_URL)
            
            # Create channel
            self.channel = await self.connection.channel()
            await self.channel.set_qos(prefetch_count=10)
            
            # Declare exchange
            self.exchange = await self.channel.declare_exchange(
                self.settings.RABBITMQ_EXCHANGE,
                ExchangeType.DIRECT,
                durable=True
            )
            
            # Declare queue
            self.queue = await self.channel.declare_queue(
                self.settings.RABBITMQ_QUEUE,
                durable=True
            )
            
            # Bind queue to exchange
            await self.queue.bind(
                self.exchange,
                routing_key=self.settings.RABBITMQ_ROUTING_KEY
            )
            
            self.is_connected = True
            logger.info("Successfully connected to RabbitMQ")
        except Exception as e:
            self.is_connected = False
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            raise
    
    async def close(self):
        """Close RabbitMQ connection."""
        if self.connection:
            await self.connection.close()
            self.is_connected = False
            logger.info("RabbitMQ connection closed")
    
    async def publish(self, routing_key: str, message_data: Dict[str, Any]):
        """Publish a message to RabbitMQ."""
        if not self.is_connected:
            logger.warning("Cannot publish message: not connected to RabbitMQ")
            return
        
        try:
            message = Message(
                body=json.dumps(message_data).encode(),
                content_type="application/json"
            )
            await self.exchange.publish(message, routing_key=routing_key)
            logger.debug(f"Published message to {routing_key}: {message_data}")
        except Exception as e:
            logger.error(f"Failed to publish message: {e}")
            raise
    
    async def consume(self, callback: Callable[[AbstractIncomingMessage], None]):
        """Start consuming messages from the queue."""
        if not self.is_connected:
            logger.warning("Cannot consume messages: not connected to RabbitMQ")
            return
        
        try:
            await self.queue.consume(callback)
            logger.info(f"Started consuming messages from queue {self.settings.RABBITMQ_QUEUE}")
        except Exception as e:
            logger.error(f"Failed to start consuming messages: {e}")
            raise
    
    def register_task_handler(self, task_type: str, handler: Callable):
        """Register a handler for a specific task type."""
        self.task_handlers[task_type] = handler
        logger.info(f"Registered handler for task type: {task_type}")
    
    async def process_message(self, message: AbstractIncomingMessage):
        """Process an incoming message."""
        async with message.process():
            try:
                # Parse message body
                body = message.body.decode()
                data = json.loads(body)
                
                # Extract task type
                task_type = data.get("type")
                if not task_type:
                    logger.warning(f"Received message without task type: {data}")
                    return
                
                # Find handler for task type
                handler = self.task_handlers.get(task_type)
                if not handler:
                    logger.warning(f"No handler registered for task type: {task_type}")
                    return
                
                # Process task
                logger.info(f"Processing task of type {task_type}")
                await handler(data)
                logger.info(f"Successfully processed task of type {task_type}")
            except json.JSONDecodeError:
                logger.error(f"Failed to decode message body: {message.body}")
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                # In a production system, you might want to send this to a dead-letter queue 