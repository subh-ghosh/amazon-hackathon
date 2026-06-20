#!/bin/bash
# Setup scheduled scaling: services ON 8AM-12AM IST, OFF 12AM-8AM IST
# IST = UTC+5:30, so 8AM IST = 2:30 UTC, 12AM IST = 18:30 UTC
# Saves ~33% cost by sleeping 8 hours/day

echo "Setting up scheduled scaling for all services..."

SERVICES=(
  "CircularIntelligenceOS-PreventionService-PreventionServiceClusterA026AA10-cV8BAQVbm4Qg|CircularIntelligenceOS-PreventionService-PreventionEngineService68815E02-FziU87hGRKlE"
  "CircularIntelligenceOS-TruthService-TruthServiceCluster11066DF2-9iUngcHBTgiO|CircularIntelligenceOS-TruthService-TruthEngineService835624D1-AMJQhPb1asqO"
  "CircularIntelligenceOS-FraudService-FraudServiceCluster1E8CDE93-iS0FQORPnuD9|CircularIntelligenceOS-FraudService-FraudEngineService3E47ADD3-cHfaJ5pKtFLg"
  "CircularIntelligenceOS-DigitalTwinService-DigitalTwinClusterAB00DA11-Q8Ur0NQ0jkDT|CircularIntelligenceOS-DigitalTwinService-DigitalTwinServiceF491C81F-8LacLrOBe9UQ"
  "CircularIntelligenceOS-SimulatorService-SimulatorCluster941920A9-wo8hci6DBBb9|CircularIntelligenceOS-SimulatorService-SimulatorServiceFDF22FD0-9ekfAgqVg6Qu"
  "CircularIntelligenceOS-OptimizerService-OptimizerCluster5A47602A-I7Uz0eMhe40n|CircularIntelligenceOS-OptimizerService-OptimizerService979DBA9C-t4uWejSbaBSv"
  "CircularIntelligenceOS-LogisticsService-LogisticsClusterE9D35369-iWLtzUi4CHrN|CircularIntelligenceOS-LogisticsService-LogisticsServiceE2F9FC77-3mvmtg3nGmky"
  "CircularIntelligenceOS-ReturnlessRefundService-ReturnlessRefundCluster4E4E540D-b1yKYQvzOIrP|CircularIntelligenceOS-ReturnlessRefundService-ReturnlessRefundEngineService8C427F0E-lOuEA1txkmnn"
  "CircularIntelligenceOS-CircularRoutingService-CircularRoutingServiceClusterCB581BAB-Pvk22JgX19CD|CircularIntelligenceOS-CircularRoutingService-CircularRoutingEngineServiceB24710BF-ZP7DQ6J5KSuX"
  "CircularIntelligenceOS-PackagingService-PackagingServiceClusterB6941CFA-HLTecwZWAx6s|CircularIntelligenceOS-PackagingService-PackagingEngineServiceAF7B5B61-BSVRYeMd6Asw"
  "CircularIntelligenceOS-SellerService-SellerServiceClusterD1413BA1-ox0M8vxv37D7|CircularIntelligenceOS-SellerService-SellerEngineServiceD9C28F6A-O1ihy2bbMwwi"
  "CircularIntelligenceOS-GraphService-V2-GraphServiceClusterE3F27E36-MJxTOZZc2RsC|CircularIntelligenceOS-GraphService-V2-GraphService118EE3AC-G30YMu3EjKMm"
)

for entry in "${SERVICES[@]}"; do
  cluster=$(echo "$entry" | cut -d'|' -f1)
  service=$(echo "$entry" | cut -d'|' -f2)
  
  # Resource ID for Application Auto Scaling
  resource_id="service/${cluster}/${service}"
  
  # Register as scalable target
  aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --resource-id "$resource_id" \
    --scalable-dimension ecs:service:DesiredCount \
    --min-capacity 0 \
    --max-capacity 1 \
    --no-cli-pager 2>/dev/null
  
  # Scale UP at 8 AM IST (2:30 UTC)
  aws application-autoscaling put-scheduled-action \
    --service-namespace ecs \
    --resource-id "$resource_id" \
    --scalable-dimension ecs:service:DesiredCount \
    --scheduled-action-name "wake-up-morning" \
    --schedule "cron(30 2 * * ? *)" \
    --scalable-target-action MinCapacity=1,MaxCapacity=1 \
    --no-cli-pager 2>/dev/null
  
  # Scale DOWN at 12 AM IST (18:30 UTC)
  aws application-autoscaling put-scheduled-action \
    --service-namespace ecs \
    --resource-id "$resource_id" \
    --scalable-dimension ecs:service:DesiredCount \
    --scheduled-action-name "sleep-midnight" \
    --schedule "cron(30 18 * * ? *)" \
    --scalable-target-action MinCapacity=0,MaxCapacity=0 \
    --no-cli-pager 2>/dev/null

  echo "  ✓ Scheduled: $service (ON 8AM IST, OFF 12AM IST)"
done

echo ""
echo "✅ Scheduled scaling configured for all 12 services."
echo "   ON:  8:00 AM IST daily (auto start)"
echo "   OFF: 12:00 AM IST daily (auto stop)"
echo "   Saves ~33% cost (~₹330/day saved)"
echo ""
echo "   To override manually: ./services-start.sh or ./services-stop.sh"
