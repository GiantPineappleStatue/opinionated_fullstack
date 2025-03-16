# syntax=docker/dockerfile:1.4

# Base stage for shared dependencies
FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Development stage
FROM base AS development
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*
COPY apps/python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/python .
ENV PYTHON_APP_ENV=development
ENV PYTHON_DEBUG=true
ENV PYTHON_LOG_LEVEL=DEBUG
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-exclude", "app/models/*"]

# Production stage
FROM base AS production
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
COPY apps/python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/python .
ENV PYTHON_APP_ENV=production
ENV PYTHON_DEBUG=false
ENV PYTHON_LOG_LEVEL=INFO
EXPOSE 8000
USER nobody
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"] 