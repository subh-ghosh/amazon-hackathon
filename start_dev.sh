#!/bin/bash

echo "Starting all frontends in DEV mode..."

# Function to run an app in the background
start_app() {
    DIR=$1
    echo "Starting $DIR..."
    cd $DIR
    npm install
    npm run dev &
    cd - > /dev/null
}

start_app "frontend/customer"
start_app "frontend/seller-dashboard"
start_app "frontend/ops-dashboard"
start_app "frontend/executive-dashboard"
start_app "frontend/landing"

echo ""
echo "=================================================="
echo "All Next.js apps are starting up in the background."
echo "Wait about 10-15 seconds for them to compile, then open:"
echo "1. Landing Page:         http://localhost:3005"
echo "2. Customer Portal:      http://localhost:3000"
echo "3. Seller Dashboard:     http://localhost:3002"
echo "4. Ops Dashboard:        http://localhost:3003"
echo "5. Executive Dashboard:  http://localhost:3004"
echo "=================================================="
echo "To stop them, run: pkill -f 'next'"
