#!/bin/sh
set -e

echo "Starting NATS health check..."

# Check if main port is listening
echo "Checking main port (4222)..."
if ! (echo > /dev/tcp/localhost/4222) 2>/dev/null; then
    echo "Main port check failed"
    exit 1
fi
echo "Main port check passed"

# Check if monitoring port is listening
echo "Checking monitoring port (8222)..."
if ! (echo > /dev/tcp/localhost/8222) 2>/dev/null; then
    echo "Monitoring port check failed"
    exit 1
fi
echo "Monitoring port check passed"

echo "All checks passed"
exit 0 