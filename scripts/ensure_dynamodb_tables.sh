#!/usr/bin/env bash
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"

ensure_table() {
  local table_name="$1"
  local partition_key_name="$2"
  local sort_key_name="${3:-}"

  if aws dynamodb describe-table --region "$REGION" --table-name "$table_name" >/dev/null 2>&1; then
    echo "exists: $table_name"
    return 0
  fi

  if [[ -n "$sort_key_name" ]]; then
    aws dynamodb create-table \
      --region "$REGION" \
      --table-name "$table_name" \
      --attribute-definitions \
        "AttributeName=$partition_key_name,AttributeType=S" \
        "AttributeName=$sort_key_name,AttributeType=S" \
      --key-schema \
        "AttributeName=$partition_key_name,KeyType=HASH" \
        "AttributeName=$sort_key_name,KeyType=RANGE" \
      --billing-mode PAY_PER_REQUEST >/dev/null
  else
    aws dynamodb create-table \
      --region "$REGION" \
      --table-name "$table_name" \
      --attribute-definitions "AttributeName=$partition_key_name,AttributeType=S" \
      --key-schema "AttributeName=$partition_key_name,KeyType=HASH" \
      --billing-mode PAY_PER_REQUEST >/dev/null
  fi

  echo "created: $table_name"
}

ensure_table "CircularOS-FraudScores" "EntityID" "Timestamp"
ensure_table "CircularOS-ReturnlessDecisions" "requestId"
ensure_table "CircularOS-ReturnlessJobs" "jobId"
ensure_table "CircularOS-ReturnlessRateLimits" "clientIp"
ensure_table "CircularOS-ReturnlessAnalytics" "metricId"
ensure_table "CircularOS-CircularRoutingDecisions" "decisionId"
ensure_table "CircularOS-CircularRoutingAnalytics" "metricId"
ensure_table "CircularOS-CircularRoutingAudit" "auditId"
ensure_table "CircularOS-CustomerSessions" "sessionId"
ensure_table "CircularOS-ProductCatalog" "product_id"
ensure_table "CircularOS-OperationsSnapshots" "snapshotId"
ensure_table "CircularOS-ExecutiveSnapshots" "snapshotId"
ensure_table "CircularOS-SellerAnalytics" "sellerId"
