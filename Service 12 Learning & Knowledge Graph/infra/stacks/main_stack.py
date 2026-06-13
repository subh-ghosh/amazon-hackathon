from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_neptune as neptune,
    aws_dynamodb as dynamodb,
    aws_events as events,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    RemovalPolicy,
    CfnOutput
)
from constructs import Construct

class HackathonStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # 1. VPC (Using 1 NAT Gateway to save costs while still allowing outbound internet)
        vpc = ec2.Vpc(self, "CircularOsVpc",
            max_azs=2,
            nat_gateways=1
        )

        # 2. DynamoDB Tables
        tables = ["ReturnEvents", "FraudScores", "ProductTwinReferences", "RecoveryDecisions"]
        for table_name in tables:
            dynamodb.Table(self, f"{table_name}Table",
                table_name=table_name,
                partition_key=dynamodb.Attribute(name="PK", type=dynamodb.AttributeType.STRING),
                sort_key=dynamodb.Attribute(name="SK", type=dynamodb.AttributeType.STRING),
                billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
                removal_policy=RemovalPolicy.DESTROY
            )

        # 3. EventBridge Bus
        bus = events.EventBus(self, "CircularIntelligenceBus",
            event_bus_name="circular-intelligence-bus"
        )

        # 4. ECS Fargate Cluster & Service
        cluster = ecs.Cluster(self, "GraphServiceCluster", vpc=vpc)
        
        fargate_service = ecs_patterns.ApplicationLoadBalancedFargateService(self, "GraphService",
            cluster=cluster,
            cpu=512,  # Bumped CPU to run 2 containers
            memory_limit_mib=1024, # Bumped memory for Gremlin Java server
            desired_count=1,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_asset("../"), # FastAPI
                container_port=8000,  # <-- FIX: Tell the Load Balancer that FastAPI is on port 8000
                environment={
                    "NEPTUNE_ENDPOINT": "ws://localhost:8182/gremlin",
                    "EVENT_BUS_NAME": bus.event_bus_name
                }
            ),
            public_load_balancer=True
        )

        # Add the open-source Gremlin graph database as a sidecar container!
        # It perfectly mocks Amazon Neptune and works on the Free Tier.
        fargate_service.task_definition.add_container("GremlinSidecar",
            image=ecs.ContainerImage.from_registry("tinkerpop/gremlin-server:latest"),
            port_mappings=[ecs.PortMapping(container_port=8182)],
            logging=ecs.LogDriver.aws_logs(stream_prefix="GremlinServer")
        )

        # Outputs
        CfnOutput(self, "LoadBalancerDNS", value=fargate_service.load_balancer.load_balancer_dns_name)
