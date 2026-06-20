from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    aws_events as events,
    CfnOutput,
    Duration
)
from constructs import Construct

class InfraStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # 1. VPC (Standalone microservice VPC)
        vpc = ec2.Vpc(self, "FraudServiceVpc", max_azs=2, nat_gateways=1)

        # 2. Existing EventBridge Bus Reference
        bus = events.EventBus.from_event_bus_name(self, "Bus", "circular-intelligence-bus")

        # 3. ECS Cluster
        cluster = ecs.Cluster(self, "FraudServiceCluster", vpc=vpc)

        # 4. Fargate Service
        fraud_service = ecs_patterns.ApplicationLoadBalancedFargateService(self, "FraudEngineService",
            cluster=cluster,
            cpu=256,
            memory_limit_mib=512,
            desired_count=1,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_asset("../"),
                container_port=8000,
                environment={
                    "AWS_DEFAULT_REGION": self.region,
                    "EVENT_BUS_NAME": bus.event_bus_name,
                    "SERVICE_12_URL": ""
                }
            ),
            assign_public_ip=True,
            public_load_balancer=True
        )

        # 5. Health Check Configuration
        fraud_service.target_group.configure_health_check(
            path="/health",
            healthy_http_codes="200"
        )

        # 6. Auto Scaling (Min 2, Max 10, Target CPU 70%)
        scaling = fraud_service.service.auto_scale_task_count(
            min_capacity=1,
            max_capacity=10
        )
        scaling.scale_on_cpu_utilization("CpuScaling",
            target_utilization_percent=70,
            scale_in_cooldown=Duration.seconds(60),
            scale_out_cooldown=Duration.seconds(60)
        )

        # 7. IAM Permissions
        bus.grant_put_events_to(fraud_service.task_definition.task_role)

        # 8. Output
        CfnOutput(self, "FraudServiceURL", value=f"http://{fraud_service.load_balancer.load_balancer_dns_name}")
