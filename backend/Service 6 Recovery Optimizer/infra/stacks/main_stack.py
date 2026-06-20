from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    CfnOutput
)
from constructs import Construct

class OptimizerStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # 1. VPC
        vpc = ec2.Vpc.from_lookup(self, "DefaultVpc", is_default=True)

        # 2. ECS Fargate Cluster & Service
        cluster = ecs.Cluster(self, "OptimizerCluster", vpc=vpc)
        
        fargate_service = ecs_patterns.ApplicationLoadBalancedFargateService(self, "OptimizerService",
            cluster=cluster,
            cpu=256,
            memory_limit_mib=512,
            desired_count=1,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_asset("../"),
                container_port=8006,
                environment={
                    "ENVIRONMENT": "production"
                }
            ),
            assign_public_ip=True,
            public_load_balancer=True
        )

        # Health Check config
        fargate_service.target_group.configure_health_check(
            path="/health",
            healthy_http_codes="200"
        )

        CfnOutput(self, "OptimizerServiceURL", 
            value=fargate_service.load_balancer.load_balancer_dns_name,
            description="URL for the Recovery Optimizer Service"
        )
