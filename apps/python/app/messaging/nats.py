import nats
from nats.aio.client import Client as NATS
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential
import json
import asyncio
from typing import Dict, Any, Optional

from app.config import Settings

class NatsService:
    """Service for interacting with NATS."""
    
    def __init__(self, settings: Settings):
        """Initialize NATS service."""
        self.settings = settings
        self.client = NATS()
        self.is_connected = False
    
    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=1, max=60))
    async def connect(self):
        """Connect to NATS with retry logic."""
        logger.info(f"Connecting to NATS at {self.settings.NATS_URL}")
        
        try:
            # Connect to NATS
            await self.client.connect(self.settings.NATS_URL)
            self.is_connected = True
            logger.info("Successfully connected to NATS")
        except Exception as e:
            self.is_connected = False
            logger.error(f"Failed to connect to NATS: {e}")
            raise
    
    async def close(self):
        """Close NATS connection."""
        if self.client:
            await self.client.close()
            self.is_connected = False
            logger.info("NATS connection closed")
    
    async def publish(self, subject: str, message_data: Dict[str, Any]):
        """Publish a message to NATS."""
        if not self.is_connected:
            logger.warning("Cannot publish message: not connected to NATS")
            return
        
        # Prefix subject with configured prefix
        full_subject = f"{self.settings.NATS_SUBJECT_PREFIX}.{subject}"
        
        try:
            # Convert message data to JSON and encode
            message = json.dumps(message_data).encode()
            
            # Publish message
            await self.client.publish(full_subject, message)
            logger.debug(f"Published message to {full_subject}: {message_data}")
        except Exception as e:
            logger.error(f"Failed to publish message: {e}")
            raise
    
    async def subscribe(self, subject: str, callback):
        """Subscribe to a subject."""
        if not self.is_connected:
            logger.warning("Cannot subscribe: not connected to NATS")
            return
        
        # Prefix subject with configured prefix
        full_subject = f"{self.settings.NATS_SUBJECT_PREFIX}.{subject}"
        
        try:
            # Subscribe to subject
            await self.client.subscribe(full_subject, cb=callback)
            logger.info(f"Subscribed to {full_subject}")
        except Exception as e:
            logger.error(f"Failed to subscribe to {full_subject}: {e}")
            raise
    
    async def publish_task_status(self, task_id: str, status: str, data: Optional[Dict[str, Any]] = None):
        """Publish a task status update."""
        message = {
            "taskId": task_id,
            "status": status,
            "timestamp": asyncio.get_event_loop().time(),
            "data": data or {}
        }
        
        await self.publish(f"task.{status}", message) 