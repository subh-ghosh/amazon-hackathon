#!/bin/bash

echo "=== Stopping all frontend dev servers ==="

# Find and kill any processes running on the frontend ports
PORTS=(3000 3002 3003 3004 3005)

for port in "${PORTS[@]}"; do
    PID=$(lsof -t -i:$port)
    if [ -n "$PID" ]; then
        echo "Killing process on port $port (PID: $PID)..."
        kill -9 $PID 2>/dev/null || true
    fi
done

# Fallback: kill next-dev processes
pkill -f "next-dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

echo "All frontends stopped."
