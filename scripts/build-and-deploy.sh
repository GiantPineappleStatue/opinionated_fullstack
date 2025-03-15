#!/bin/bash

# Load environment variables
set -a
source .env
set +a

# Set default values if not provided
PROJECT_NAME=${PROJECT_NAME:-fullstack}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-""}

# Build Docker images
echo "Building Docker images..."

# Frontend
echo "Building frontend image..."
docker build -t ${DOCKER_REGISTRY}${PROJECT_NAME}/frontend:latest -f apps/frontend/Dockerfile apps/frontend

# Backend
echo "Building backend image..."
docker build -t ${DOCKER_REGISTRY}${PROJECT_NAME}/backend:latest -f apps/backend/Dockerfile apps/backend

# Python
echo "Building python image..."
docker build -t ${DOCKER_REGISTRY}${PROJECT_NAME}/python:latest -f apps/python/Dockerfile apps/python

# Push images if registry is provided
if [ -n "$DOCKER_REGISTRY" ]; then
  echo "Pushing images to registry..."
  docker push ${DOCKER_REGISTRY}${PROJECT_NAME}/frontend:latest
  docker push ${DOCKER_REGISTRY}${PROJECT_NAME}/backend:latest
  docker push ${DOCKER_REGISTRY}${PROJECT_NAME}/python:latest
fi

# Deploy to Kubernetes
echo "Deploying to Kubernetes..."

# Create namespace
envsubst < k8s/namespace.yaml | kubectl apply -f -

# Deploy infrastructure
echo "Deploying infrastructure..."
envsubst < k8s/infrastructure/mysql.yaml | kubectl apply -f -
envsubst < k8s/infrastructure/redis.yaml | kubectl apply -f -
envsubst < k8s/infrastructure/rabbitmq.yaml | kubectl apply -f -
envsubst < k8s/infrastructure/nats.yaml | kubectl apply -f -

# Wait for infrastructure to be ready
echo "Waiting for infrastructure to be ready..."
kubectl wait --namespace=${PROJECT_NAME} \
  --for=condition=ready pod \
  --selector=app=mysql \
  --timeout=300s

kubectl wait --namespace=${PROJECT_NAME} \
  --for=condition=ready pod \
  --selector=app=redis \
  --timeout=300s

kubectl wait --namespace=${PROJECT_NAME} \
  --for=condition=ready pod \
  --selector=app=rabbitmq \
  --timeout=300s

kubectl wait --namespace=${PROJECT_NAME} \
  --for=condition=ready pod \
  --selector=app=nats \
  --timeout=300s

# Deploy applications
echo "Deploying applications..."
envsubst < k8s/backend/deployment.yaml | kubectl apply -f -
envsubst < k8s/backend/service.yaml | kubectl apply -f -
envsubst < k8s/frontend/deployment.yaml | kubectl apply -f -
envsubst < k8s/frontend/service.yaml | kubectl apply -f -
envsubst < k8s/python/deployment.yaml | kubectl apply -f -
envsubst < k8s/python/service.yaml | kubectl apply -f -

# Deploy ingress
echo "Deploying ingress..."
envsubst < k8s/ingress.yaml | kubectl apply -f -

echo "Deployment complete!"
echo "You can access the application at http://${INGRESS_HOST:-fullstack.local}" 