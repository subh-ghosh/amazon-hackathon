#!/bin/bash
# Deploy all services to new AWS account 309860608537
# Services are deployed sequentially (each takes ~5 min)

BACKEND="/home/subh/Desktop/amazon/amazon-hackathon/backend"
RESULTS_FILE="/tmp/deploy_results.txt"
echo "" > "$RESULTS_FILE"

SERVICES=(
    "Service 2 Truth Discovery Engine"
    "Service 3 Fraud & Trust Engine"
    "Service 4 Product Digital Twin"
    "Service 5 Future Simulator"
    "Service 6 Recovery Optimizer"
    "Service 7 Reverse Logistics Optimizer"
    "Service 8 Returnless Refund Engine"
    "Service 9 Circular Routing Engine"
    "Service 10 Packaging Intelligence"
    "Service 11 Seller Intelligence Engine"
    "Service 12 Learning & Knowledge Graph"
)

for service in "${SERVICES[@]}"; do
    echo "======================================"
    echo "Deploying: $service"
    echo "======================================"
    
    SERVICE_DIR="$BACKEND/$service/infra"
    
    # Clear context
    echo '{}' > "$SERVICE_DIR/cdk.context.json"
    rm -rf "$SERVICE_DIR/cdk.out"
    
    # Setup venv if needed
    if [ ! -d "$SERVICE_DIR/venv" ]; then
        python3 -m venv "$SERVICE_DIR/venv"
        source "$SERVICE_DIR/venv/bin/activate"
        pip install -r "$SERVICE_DIR/requirements.txt" -q
    else
        source "$SERVICE_DIR/venv/bin/activate"
    fi
    
    # Deploy
    cd "$SERVICE_DIR"
    npx cdk deploy --require-approval never 2>&1 | tee /tmp/cdk_deploy_current.log
    
    # Extract URL from output
    URL=$(grep -oP 'http://[^\s]+\.elb\.amazonaws\.com' /tmp/cdk_deploy_current.log | head -1)
    echo "$service: $URL" >> "$RESULTS_FILE"
    echo ">>> DEPLOYED: $URL"
    
    deactivate
    cd "$BACKEND"
done

echo ""
echo "======================================"
echo "ALL DEPLOYMENTS COMPLETE"
echo "======================================"
cat "$RESULTS_FILE"
