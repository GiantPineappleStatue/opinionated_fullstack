"""
Schema generator for the Python service.
This script fetches the OpenAPI schema from the NestJS backend and generates Pydantic models.
"""

import os
import json
import httpx
import subprocess
from pathlib import Path
from loguru import logger
from app.config import get_settings

# Get settings
settings = get_settings()

# Define paths
CURRENT_DIR = Path(__file__).parent
MODELS_DIR = CURRENT_DIR.parent / "models"
OPENAPI_JSON_PATH = CURRENT_DIR / "openapi.json"

async def fetch_openapi_schema():
    """Fetch the OpenAPI schema from the NestJS backend."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(settings.NESTJS_OPENAPI_URL)
            response.raise_for_status()
            
            # Save the schema to a file
            with open(OPENAPI_JSON_PATH, "w") as f:
                json.dump(response.json(), f, indent=2)
            
            logger.info(f"OpenAPI schema saved to {OPENAPI_JSON_PATH}")
            return True
    except Exception as e:
        logger.error(f"Failed to fetch OpenAPI schema: {e}")
        return False

def generate_models():
    """Generate Pydantic models from the OpenAPI schema."""
    try:
        # Create models directory if it doesn't exist
        os.makedirs(MODELS_DIR, exist_ok=True)
        
        # Generate models using datamodel-code-generator
        cmd = [
            "datamodel-codegen",
            "--input", str(OPENAPI_JSON_PATH),
            "--output", str(MODELS_DIR / "nestjs_models.py"),
            "--input-file-type", "openapi",
            "--output-model-type", "pydantic.BaseModel",
            "--target-python-version", "3.10",
            "--use-schema-description",
            "--field-constraints",
            "--snake-case-field",
            "--enum-field-as-literal", "all"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info(f"Pydantic models generated successfully at {MODELS_DIR / 'nestjs_models.py'}")
            
            # Create __init__.py if it doesn't exist
            init_path = MODELS_DIR / "__init__.py"
            if not init_path.exists():
                with open(init_path, "w") as f:
                    f.write('"""Generated models from NestJS OpenAPI schema."""\n')
            
            return True
        else:
            logger.error(f"Failed to generate models: {result.stderr}")
            return False
    except Exception as e:
        logger.error(f"Error generating models: {e}")
        return False

async def update_models():
    """Update the Pydantic models from the NestJS OpenAPI schema."""
    # Fetch the schema
    schema_fetched = await fetch_openapi_schema()
    
    if not schema_fetched:
        logger.warning("Using existing schema if available")
    
    # Generate models if schema exists
    if OPENAPI_JSON_PATH.exists():
        return generate_models()
    else:
        logger.error("OpenAPI schema not found")
        return False 