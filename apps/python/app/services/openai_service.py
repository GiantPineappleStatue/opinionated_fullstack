"""
OpenAI service for the Python service.
This module provides functionality for interacting with the OpenAI API.
"""

import json
from typing import AsyncGenerator, Dict, List, Optional, Any
from openai import AsyncOpenAI
from loguru import logger
from app.config import get_settings

# Get settings
settings = get_settings()

class OpenAIService:
    """Service for interacting with the OpenAI API."""
    
    def __init__(self):
        """Initialize the OpenAI service."""
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        logger.info(f"OpenAI service initialized with model: {self.model}")
    
    async def generate_completion(
        self, 
        prompt: str, 
        system_message: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = False
    ) -> Dict[str, Any]:
        """
        Generate a completion using the OpenAI API.
        
        Args:
            prompt: The user prompt to generate a completion for
            system_message: Optional system message to set the context
            temperature: Controls randomness (0-1)
            max_tokens: Maximum number of tokens to generate
            stream: Whether to stream the response
            
        Returns:
            The completion response
        """
        try:
            messages = []
            
            # Add system message if provided
            if system_message:
                messages.append({"role": "system", "content": system_message})
            
            # Add user message
            messages.append({"role": "user", "content": prompt})
            
            # Create completion
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=False  # We don't stream here
            )
            
            return {
                "content": response.choices[0].message.content,
                "finish_reason": response.choices[0].finish_reason,
                "model": response.model,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }
        except Exception as e:
            logger.error(f"Error generating completion: {e}")
            raise
    
    async def stream_completion(
        self, 
        prompt: str, 
        system_message: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream a completion using the OpenAI API.
        
        Args:
            prompt: The user prompt to generate a completion for
            system_message: Optional system message to set the context
            temperature: Controls randomness (0-1)
            max_tokens: Maximum number of tokens to generate
            
        Yields:
            Chunks of the completion response
        """
        try:
            messages = []
            
            # Add system message if provided
            if system_message:
                messages.append({"role": "system", "content": system_message})
            
            # Add user message
            messages.append({"role": "user", "content": prompt})
            
            # Create streaming completion
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )
            
            # Yield chunks
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"Error streaming completion: {e}")
            yield json.dumps({"error": str(e)})
            raise 