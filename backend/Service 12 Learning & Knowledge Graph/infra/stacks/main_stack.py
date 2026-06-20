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

        # 1. VPC - use default VPC
        vpc = ec2.Vpc.from_lookup(self, "DefaultVpc", is_default=True)

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

        # 3. EventBridge Bus (already created, reference it)
        bus = events.EventBus.from_event_bus_name(self, "CircularIntelligenceBus", "circular-intelligence-bus")

        # 4. ECS Fargate Cluster & Service
        cluster = ecs.Cluster(self, "GraphServiceCluster", vpc=vpc)
        
        fargate_service = ecs_patterns.ApplicationLoadBalancedFargateService(self, "GraphService",
            cluster=cluster,
            cpu=512,
            memory_limit_mib=1024,
            desired_count=1,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_asset("../"),
                container_port=8000,
                environment={
                    "NEPTUNE_ENDPOINT": "localhost",
                    "EVENT_BUS_NAME": "circular-intelligence-bus"
                }
            ),
            assign_public_ip=True,
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
