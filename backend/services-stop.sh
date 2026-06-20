#!/bin/bash
# STOP all 12 ECS services (scale to 0) — saves ~$18/day
# Run this when NOT demoing

echo "⏹  Scaling all services to 0..."

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
  aws ecs update-service --cluster "$cluster" --service "$service" --desired-count 0 --no-cli-pager > /dev/null 2>&1
  echo "  ⬇ Stopped: $service"
done

echo ""
echo "✅ All services scaled to 0. Cost is now ~$0/day (ALBs still running at ~$6.50/day)."
echo "   Run ./services-start.sh to bring them back up."
