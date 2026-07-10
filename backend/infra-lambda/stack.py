"""
Single CDK stack that deploys all 12 microservices as Lambda functions
with API Gateway HTTP APIs. True serverless — $0 when idle.
"""
import os
from aws_cdk import (
    Stack,
    Duration,
    CfnOutput,
    aws_lambda as lambda_,
    aws_apigatewayv2 as apigwv2,
    aws_apigatewayv2_integrations as integrations,
    aws_dynamodb as dynamodb,
    aws_ecr_assets as ecr_assets,
    RemovalPolicy,
)
from constructs import Construct

BACKEND_ROOT = os.path.join(os.path.dirname(__file__), "..")

SERVICES = [
    {"name": "s1", "dir": "Service 1 Return Prevention Engine", "handler": "app.main.handler", "memory": 256, "timeout": 30},
    {"name": "s2", "dir": "Service 2 Truth Discovery Engine", "handler": "app.main.handler", "memory": 256, "timeout": 30},
    {"name": "s3", "dir": "Service 3 Fraud & Trust Engine", "handler": "app.main.handler", "memory": 256, "timeout": 30},
    {"name": "s4", "dir": "Service 4 Product Digital Twin", "handler": "app.main.handler", "memory": 512, "timeout": 30},
    {"name": "s5", "dir": "Service 5 Future Simulator", "handler": "app.main.handler", "memory": 256, "timeout": 30},
    {"name": "s6", "dir": "Service 6 Recovery Optimizer", "handler": "app.main.handler", "memory": 256, "timeout": 30},
    {"name": "s7", "dir": "Service 7 Reverse Logistics Optimizer", "handler": "app.main.handler", "memory": 256, "timeout": 30},
    {"name": "s8", "dir": "Service 8 Returnless Refund Engine", "handler": "app.main.handler", "memory": 256, "timeout": 30},
    {"name": "s9", "dir": "Service 9 Circular Routing Engine", "handler": "app.main.handler", "memory": 256, "timeout": 30},
    {"name": "s10", "dir": "Service 10 Packaging Intelligence", "handler": "app.main.handler", "memory": 256, "timeout": 30},
    {"name": "s11", "dir": "Service 11 Seller Intelligence Engine", "handler": "app.main.handler", "memory": 256, "timeout": 30},
    {"name": "s12", "dir": "Service 12 Learning & Knowledge Graph", "handler": "app.main.handler", "memory": 512, "timeout": 30},
    {"name": "s13", "dir": "Service 13 Damage Detection Engine", "handler": "app.main.handler", "memory": 2048, "timeout": 60},
    {"name": "s14", "dir": "Service 14 Pre-Order Fraud Detection", "handler": "app.handler", "memory": 1024, "timeout": 60},
]


class AllServicesLambdaStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # DynamoDB for S4 Digital Twin
        twin_table = dynamodb.Table(self, "ProductDigitalTwinLambda",
            table_name="ProductDigitalTwinLambda",
            partition_key=dynamodb.Attribute(name="productId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )

        fraud_scores_table = dynamodb.Table(self, "FraudScoresLambdaTable",
            table_name="CircularOS-FraudScores",
            partition_key=dynamodb.Attribute(name="EntityID", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="Timestamp", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )

        returnless_decisions_table = dynamodb.Table(self, "ReturnlessDecisionsLambdaTable",
            table_name="CircularOS-ReturnlessDecisions",
            partition_key=dynamodb.Attribute(name="requestId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )
        returnless_jobs_table = dynamodb.Table(self, "ReturnlessJobsLambdaTable",
            table_name="CircularOS-ReturnlessJobs",
            partition_key=dynamodb.Attribute(name="jobId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )
        returnless_rate_limits_table = dynamodb.Table(self, "ReturnlessRateLimitsLambdaTable",
            table_name="CircularOS-ReturnlessRateLimits",
            partition_key=dynamodb.Attribute(name="clientIp", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )
        returnless_analytics_table = dynamodb.Table(self, "ReturnlessAnalyticsLambdaTable",
            table_name="CircularOS-ReturnlessAnalytics",
            partition_key=dynamodb.Attribute(name="metricId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )

        routing_decisions_table = dynamodb.Table(self, "CircularRoutingDecisionsLambdaTable",
            table_name="CircularOS-CircularRoutingDecisions",
            partition_key=dynamodb.Attribute(name="decisionId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )
        routing_analytics_table = dynamodb.Table(self, "CircularRoutingAnalyticsLambdaTable",
            table_name="CircularOS-CircularRoutingAnalytics",
            partition_key=dynamodb.Attribute(name="metricId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )
        routing_audit_table = dynamodb.Table(self, "CircularRoutingAuditLambdaTable",
            table_name="CircularOS-CircularRoutingAudit",
            partition_key=dynamodb.Attribute(name="auditId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )

        customer_sessions_table = dynamodb.Table(self, "CustomerSessionsLambdaTable",
            table_name="CircularOS-CustomerSessions",
            partition_key=dynamodb.Attribute(name="sessionId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )
        product_catalog_table = dynamodb.Table(self, "ProductCatalogLambdaTable",
            table_name="CircularOS-ProductCatalog",
            partition_key=dynamodb.Attribute(name="product_id", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )
        operations_snapshots_table = dynamodb.Table(self, "OperationsSnapshotsLambdaTable",
            table_name="CircularOS-OperationsSnapshots",
            partition_key=dynamodb.Attribute(name="snapshotId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )
        executive_snapshots_table = dynamodb.Table(self, "ExecutiveSnapshotsLambdaTable",
            table_name="CircularOS-ExecutiveSnapshots",
            partition_key=dynamodb.Attribute(name="snapshotId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )
        seller_analytics_table = dynamodb.Table(self, "SellerAnalyticsLambdaTable",
            table_name="CircularOS-SellerAnalytics",
            partition_key=dynamodb.Attribute(name="sellerId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )

        # DynamoDB tables for S12
        for tbl in ["ReturnEventsLambda", "FraudScoresLambda", "RecoveryDecisionsLambda"]:
            dynamodb.Table(self, tbl,
                table_name=tbl,
                partition_key=dynamodb.Attribute(name="PK", type=dynamodb.AttributeType.STRING),
                sort_key=dynamodb.Attribute(name="SK", type=dynamodb.AttributeType.STRING),
                billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
                removal_policy=RemovalPolicy.DESTROY
            )

        for svc in SERVICES:
            service_path = os.path.join(BACKEND_ROOT, svc["dir"])

            # Lambda function using Docker image
            fn = lambda_.DockerImageFunction(self, f"Fn-{svc['name']}",
                function_name=f"circular-os-{svc['name']}",
                code=lambda_.DockerImageCode.from_image_asset(
                    service_path,
                    file="Dockerfile.lambda",
                    exclude=["infra", ".venv", "venv", "tests", "cdk.out", "__pycache__"],
                    network_mode=ecr_assets.NetworkMode.HOST
                ),
                memory_size=svc["memory"],
                timeout=Duration.seconds(svc["timeout"]),
                environment={
                    "ENVIRONMENT": "production",
                    "AWS_REGION_NAME": self.region,
                    "DYNAMODB_TABLE_NAME": twin_table.table_name if svc["name"] == "s4" else "",
                    "DYNAMODB_TABLE": fraud_scores_table.table_name if svc["name"] == "s3" else "",
                    "DYNAMODB_DECISIONS_TABLE": returnless_decisions_table.table_name if svc["name"] == "s8" else (routing_decisions_table.table_name if svc["name"] == "s9" else ""),
                    "DYNAMODB_JOBS_TABLE": returnless_jobs_table.table_name if svc["name"] == "s8" else "",
                    "DYNAMODB_RATE_LIMITS_TABLE": returnless_rate_limits_table.table_name if svc["name"] == "s8" else "",
                    "DYNAMODB_ANALYTICS_TABLE": returnless_analytics_table.table_name if svc["name"] == "s8" else (routing_analytics_table.table_name if svc["name"] == "s9" else ""),
                    "DYNAMODB_AUDIT_TABLE": routing_audit_table.table_name if svc["name"] == "s9" else "",
                    "NEPTUNE_ENDPOINT": "disabled",
                },
            )

            # Grant DynamoDB access for S4
            if svc["name"] == "s4":
                twin_table.grant_read_write_data(fn)
            if svc["name"] == "s3":
                fraud_scores_table.grant_read_write_data(fn)
            if svc["name"] == "s8":
                returnless_decisions_table.grant_read_write_data(fn)
                returnless_jobs_table.grant_read_write_data(fn)
                returnless_rate_limits_table.grant_read_write_data(fn)
                returnless_analytics_table.grant_read_write_data(fn)
            if svc["name"] == "s9":
                routing_decisions_table.grant_read_write_data(fn)
                routing_analytics_table.grant_read_write_data(fn)
                routing_audit_table.grant_read_write_data(fn)

            # API Gateway HTTP API (cheapest, fastest)
            api = apigwv2.HttpApi(self, f"Api-{svc['name']}",
                api_name=f"circular-os-{svc['name']}",
                default_integration=integrations.HttpLambdaIntegration(
                    f"Integration-{svc['name']}", fn
                ),
            )

            CfnOutput(self, f"Url-{svc['name']}",
                value=api.url or "",
                description=f"API URL for {svc['dir']}"
            )

        CfnOutput(self, "CustomerSessionsTableName",
            value=customer_sessions_table.table_name,
            description="DynamoDB table used by the customer frontend session store"
        )
        CfnOutput(self, "ProductCatalogTableName",
            value=product_catalog_table.table_name,
            description="DynamoDB table used by the customer frontend catalog API"
        )
        CfnOutput(self, "OperationsSnapshotsTableName",
            value=operations_snapshots_table.table_name,
            description="DynamoDB table used by the operations dashboard API"
        )
        CfnOutput(self, "ExecutiveSnapshotsTableName",
            value=executive_snapshots_table.table_name,
            description="DynamoDB table used by the executive dashboard API"
        )
        CfnOutput(self, "SellerAnalyticsTableName",
            value=seller_analytics_table.table_name,
            description="DynamoDB table used by the seller dashboard API"
        )
