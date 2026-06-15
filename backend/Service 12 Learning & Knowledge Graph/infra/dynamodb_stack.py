"""
AWS CDK Infrastructure — DynamoDB Tables

Defines all four DynamoDB tables with proper PK/SK schemas,
billing mode, and TTL configuration.
"""

# This is a CDK Python template. Install: pip install aws-cdk-lib constructs

from aws_cdk import (
    Stack,
    aws_dynamodb as dynamodb,
    RemovalPolicy,
)
from constructs import Construct


class DynamoDBStack(Stack):
    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        # ── ReturnEvents ─────────────────────────
        # PK: ReturnID | SK: Timestamp
        self.return_events = dynamodb.Table(
            self, "ReturnEvents",
            table_name="CircularOS-ReturnEvents",
            partition_key=dynamodb.Attribute(
                name="ReturnID",
                type=dynamodb.AttributeType.STRING,
            ),
            sort_key=dynamodb.Attribute(
                name="Timestamp",
                type=dynamodb.AttributeType.STRING,
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
        )

        # ── ProductTwinReferences ────────────────
        # PK: ProductID | SK: RecordType
        self.product_twins = dynamodb.Table(
            self, "ProductTwinReferences",
            table_name="CircularOS-ProductTwinReferences",
            partition_key=dynamodb.Attribute(
                name="ProductID",
                type=dynamodb.AttributeType.STRING,
            ),
            sort_key=dynamodb.Attribute(
                name="RecordType",
                type=dynamodb.AttributeType.STRING,
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
        )

        # ── FraudScores ──────────────────────────
        # PK: EntityID | SK: Timestamp
        self.fraud_scores = dynamodb.Table(
            self, "FraudScores",
            table_name="CircularOS-FraudScores",
            partition_key=dynamodb.Attribute(
                name="EntityID",
                type=dynamodb.AttributeType.STRING,
            ),
            sort_key=dynamodb.Attribute(
                name="Timestamp",
                type=dynamodb.AttributeType.STRING,
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
        )

        # ── RecoveryDecisions ────────────────────
        # PK: ReturnID | SK: RecoveryActionID
        self.recovery_decisions = dynamodb.Table(
            self, "RecoveryDecisions",
            table_name="CircularOS-RecoveryDecisions",
            partition_key=dynamodb.Attribute(
                name="ReturnID",
                type=dynamodb.AttributeType.STRING,
            ),
            sort_key=dynamodb.Attribute(
                name="RecoveryActionID",
                type=dynamodb.AttributeType.STRING,
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
        )
