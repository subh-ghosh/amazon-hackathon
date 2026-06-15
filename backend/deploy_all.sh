#!/bin/bash
SERVICES=(
    "Service 3 Fraud & Trust Engine"
    "Service 4 Product Digital Twin"
    "Service 5 Future Simulator"
    "Service 6 Recovery Optimizer"
    "Service 7 Reverse Logistics Optimizer"
    "Service 12 Learning & Knowledge Graph"
)

for service in "${SERVICES[@]}"; do
    echo "======================================"
    echo "Deploying $service..."
    echo "======================================"
    cd "$service/infra" || { echo "Failed to cd to $service/infra"; exit 1; }
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -r requirements.txt
    
    npx cdk deploy --require-approval never
    
    deactivate
    cd ../..
done
echo "All deployments complete!"
