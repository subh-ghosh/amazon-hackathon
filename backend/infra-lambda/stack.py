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
                ),
                memory_size=svc["memory"],
                timeout=Duration.seconds(svc["timeout"]),
                environment={
                    "ENVIRONMENT": "production",
                    "AWS_REGION_NAME": self.region,
                    "DYNAMODB_TABLE_NAME": "ProductDigitalTwinLambda" if svc["name"] == "s4" else "",
                    "NEPTUNE_ENDPOINT": "disabled",
                },
            )

            # Grant DynamoDB access for S4
            if svc["name"] == "s4":
                twin_table.grant_read_write_data(fn)

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
