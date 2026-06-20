#!/bin/bash
# START all 12 ECS services (scale to 1) — takes ~2-3 min for all to be healthy
# Run this BEFORE demoing

echo "▶  Scaling all services to 1..."

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
  aws ecs update-service --cluster "$cluster" --service "$service" --desired-count 1 --no-cli-pager > /dev/null 2>&1
  echo "  ⬆ Started: $service"
done

echo ""
echo "⏳ All services scaling up. Wait ~2-3 minutes for health checks to pass."
echo ""
echo "Checking health in 90 seconds..."
sleep 90

# Health check
HEALTHY=0
TOTAL=12
for url in \
  "http://Circul-Preve-LR6DbKamKWdv-928899529.us-east-1.elb.amazonaws.com/health" \
  "http://Circul-Truth-h1F0FkRvcVsk-801111338.us-east-1.elb.amazonaws.com/health" \
  "http://Circul-Fraud-XcBUDzI1MwrU-1950216713.us-east-1.elb.amazonaws.com/health" \
  "http://Circul-Digit-1KUgWt1Obxuk-628222820.us-east-1.elb.amazonaws.com/health" \
  "http://Circul-Simul-4WKIzeeG23Pg-1522722278.us-east-1.elb.amazonaws.com/health" \
  "http://Circul-Optim-VznHSwftfNgj-1405514615.us-east-1.elb.amazonaws.com/health" \
  "http://Circul-Logis-tlTDwNs1Omzx-39457157.us-east-1.elb.amazonaws.com/health" \
  "http://Circul-Retur-3aJGuOitxrQQ-1157813753.us-east-1.elb.amazonaws.com/health" \
  "http://Circul-Circu-jsU6YMlH3H2K-853712911.us-east-1.elb.amazonaws.com/health" \
  "http://Circul-Packa-ZPto7mjaCRIO-560627207.us-east-1.elb.amazonaws.com/health" \
  "http://Circul-Selle-VYLlrHB2ylcJ-1969622883.us-east-1.elb.amazonaws.com/health" \
  "http://Circul-Graph-IIxBpeJf0S3j-1441021229.us-east-1.elb.amazonaws.com/health"; do
  status=$(curl -s --max-time 5 "$url" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)
  if [ "$status" = "healthy" ] || [ "$status" = "ok" ]; then
    HEALTHY=$((HEALTHY + 1))
  fi
done

echo ""
echo "✅ $HEALTHY/$TOTAL services healthy."
if [ $HEALTHY -lt $TOTAL ]; then
  echo "⚠️  Some services still starting. Wait another 60s and try: curl http://Circul-Preve-LR6DbKamKWdv-928899529.us-east-1.elb.amazonaws.com/health"
fi
