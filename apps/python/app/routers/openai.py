"""
OpenAI router for the Python service.
This module provides endpoints for interacting with the OpenAI API.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from sse_starlette.sse import EventSourceResponse
from app.services.openai_service import OpenAIService
from app.config import get_settings
from loguru import logger

# Create router
router = APIRouter()

# Get settings
settings = get_settings()

# Create OpenAI service
openai_service = OpenAIService()

# Define request models
class CompletionRequest(BaseModel):
    """Request model for completions."""
    prompt: str = Field(..., description="The prompt to generate a completion for")
    system_message: Optional[str] = Field(None, description="Optional system message to set the context")
    temperature: float = Field(0.7, description="Controls randomness (0-1)")
    max_tokens: Optional[int] = Field(None, description="Maximum number of tokens to generate")
    stream: bool = Field(False, description="Whether to stream the response")

# Define response models
class CompletionResponse(BaseModel):
    """Response model for completions."""
    content: str = Field(..., description="The generated completion")
    finish_reason: str = Field(..., description="The reason the completion finished")
    model: str = Field(..., description="The model used for the completion")
    usage: Dict[str, int] = Field(..., description="Token usage information")

@router.post("/completions", response_model=CompletionResponse)
async def create_completion(request: CompletionRequest):
    """
    Generate a completion using the OpenAI API.
    
    Args:
        request: The completion request
        
    Returns:
        The completion response
    """
    try:
        # Generate completion
        response = await openai_service.generate_completion(
            prompt=request.prompt,
            system_message=request.system_message,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=request.stream
        )
        
        return response
    except Exception as e:
        logger.error(f"Error creating completion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/completions/stream")
async def stream_completion(request: CompletionRequest):
    """
    Stream a completion using the OpenAI API.
    
    Args:
        request: The completion request
        
    Returns:
        A streaming response with the completion
    """
    try:
        # Check if streaming is requested
        if not request.stream:
            # If not streaming, use the regular completion endpoint
            response = await openai_service.generate_completion(
                prompt=request.prompt,
                system_message=request.system_message,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                stream=False
            )
            
            return response
        
        # Create generator function for streaming
        async def event_generator():
            try:
                async for chunk in openai_service.stream_completion(
                    prompt=request.prompt,
                    system_message=request.system_message,
                    temperature=request.temperature,
                    max_tokens=request.max_tokens
                ):
                    yield chunk
            except Exception as e:
                logger.error(f"Error in stream generator: {e}")
                yield f"Error: {str(e)}"
        
        # Return streaming response
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream"
        )
    except Exception as e:
        logger.error(f"Error streaming completion: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 