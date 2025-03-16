"""
Main entry point for the Python service.
Imports and re-exports the app from app/main.py for compatibility with the Dockerfile.
"""
from app.main import app

# This file exists to provide compatibility with the Dockerfile CMD
# which expects to find a "main:app" at the root level 