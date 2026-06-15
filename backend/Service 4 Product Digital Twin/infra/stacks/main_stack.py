from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    aws_dynamodb as dynamodb,
    Tags,
    RemovalPolicy,
    CfnOutput
)
from constructs import Construct

class DigitalTwinStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create VPC-3: Product & Business Layer
        vpc = ec2.Vpc(self, "ProductBusinessVpc", max_azs=2, nat_gateways=1)
        Tags.of(vpc).add("DomainName", "VPC-3-ProductBusiness")
        Tags.of(vpc).add("Name", "CircularIntelligenceOS/VPC-3-ProductBusinessLayer")

        # DynamoDB Table for Digital Twin
        table = dynamodb.Table(self, "ProductDigitalTwinTable",
            table_name="ProductDigitalTwin",
            partition_key=dynamodb.Attribute(name="productId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY  # for hackathon
        )

        cluster = ecs.Cluster(self, "DigitalTwinCluster", vpc=vpc)

        fargate_service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "DigitalTwinService",
            cluster=cluster,
            cpu=256,
            memory_limit_mib=512,
            desired_count=2,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_asset("../"),
                container_port=8004,
                environment={
                    "ENVIRONMENT": "production",
                    "DYNAMODB_TABLE_NAME": table.table_name,
                    "AWS_REGION": self.region
                },
            ),
            public_load_balancer=True,
        )

        # Grant DynamoDB permissions to the Fargate Task
        table.grant_read_write_data(fargate_service.task_definition.task_role)

        fargate_service.target_group.configure_health_check(
            path="/health",
            healthy_http_codes="200",
        )

        CfnOutput(self, "DigitalTwinServiceURL",
            value=fargate_service.load_balancer.load_balancer_dns_name,
            description="URL for the Product Digital Twin Service",
        )
