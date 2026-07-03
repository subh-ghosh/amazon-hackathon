#!/bin/bash

# Port mappings:
# landing: 3005
# customer: 3000
# seller-dashboard: 3002
# ops-dashboard: 3003
# executive-dashboard: 3004

FRONTENDS=("landing" "customer" "seller-dashboard" "ops-dashboard" "executive-dashboard")
BASE_DIR="/home/subh/Desktop/amazon/amazon-hackathon/frontend"
LOG_DIR="/home/subh/Desktop/amazon/amazon-hackathon/logs"

mkdir -p "$LOG_DIR"

echo "=== Starting all frontends ==="

for app in "${FRONTENDS[@]}"; do
    echo "Starting $app..."
    cd "$BASE_DIR/$app"
    
    # Check if node_modules exists, if not install
    if [ ! -d "node_modules" ]; then
        echo "node_modules not found for $app. Installing dependencies..."
        npm install &
        # Wait for install to finish if we want, or run them in parallel
        # Let's wait for installs to finish to prevent conflicts
        wait
    fi
    
    # Start the dev server in the background
    npm run dev > "$LOG_DIR/$app.log" 2>&1 &
    PID=$!
    echo "$app started with PID $PID. Logs at $LOG_DIR/$app.log"
done

echo "All frontends started!"
echo "Port reference:"
echo " - Landing Page: http://localhost:3005"
echo " - Customer Portal: http://localhost:3000"
echo " - Seller Dashboard: http://localhost:3002"
echo " - Operations Dashboard: http://localhost:3003"
echo " - Executive Dashboard: http://localhost:3004"
