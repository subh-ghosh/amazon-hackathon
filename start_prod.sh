#!/bin/bash

echo "Building and starting all frontends in PRODUCTION mode..."

build_and_start() {
    DIR=$1
    echo "Building $DIR..."
    cd $DIR
    npm install
    npm run build
    npm run start &
    cd - > /dev/null
}

build_and_start "frontend/customer"
build_and_start "frontend/seller-dashboard"
build_and_start "frontend/ops-dashboard"
build_and_start "frontend/executive-dashboard"
build_and_start "frontend/landing"

echo ""
echo "=================================================="
echo "All Next.js apps are built and running in PRODUCTION mode."
echo "1. Landing Page:         http://localhost:3005"
echo "2. Customer Portal:      http://localhost:3000"
echo "3. Seller Dashboard:     http://localhost:3002"
echo "4. Ops Dashboard:        http://localhost:3003"
echo "5. Executive Dashboard:  http://localhost:3004"
echo "=================================================="
echo "To stop them, run: pkill -f 'next'"
