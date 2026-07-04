from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    aws_events as events,
    aws_dynamodb as dynamodb,
    RemovalPolicy,
    CfnOutput,
    Duration
)
from constructs import Construct

class InfraStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # 1. VPC (Lookup shared VPC-1 Intelligence Layer)
        vpc = ec2.Vpc.from_lookup(self, "DefaultVpc", is_default=True)

        # 2. Existing EventBridge Bus Reference
        bus = events.EventBus.from_event_bus_name(self, "Bus", "circular-intelligence-bus")

        decisions_table = dynamodb.Table(
            self, "ReturnlessDecisionsTable",
            table_name="CircularOS-ReturnlessDecisions",
            partition_key=dynamodb.Attribute(name="requestId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
        )
        jobs_table = dynamodb.Table(
            self, "ReturnlessJobsTable",
            table_name="CircularOS-ReturnlessJobs",
            partition_key=dynamodb.Attribute(name="jobId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
        )
        rate_limits_table = dynamodb.Table(
            self, "ReturnlessRateLimitsTable",
            table_name="CircularOS-ReturnlessRateLimits",
            partition_key=dynamodb.Attribute(name="clientIp", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
        )
        analytics_table = dynamodb.Table(
            self, "ReturnlessAnalyticsTable",
            table_name="CircularOS-ReturnlessAnalytics",
            partition_key=dynamodb.Attribute(name="metricId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
        )

        # 3. ECS Cluster
        cluster = ecs.Cluster(self, "ReturnlessRefundCluster", vpc=vpc)

        # 4. Fargate Service
        returnless_service = ecs_patterns.ApplicationLoadBalancedFargateService(self, "ReturnlessRefundEngineService",
            cluster=cluster,
            cpu=256,
            memory_limit_mib=512,
            desired_count=1,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_asset("../", exclude=["infra", ".venv", "tests", "cdk.out"]),
                container_port=8008,
                environment={
                    "AWS_DEFAULT_REGION": self.region,
                    "AWS_REGION": self.region,
                    "EVENT_BUS_NAME": bus.event_bus_name,
                    "SERVICE_12_URL": "",
                    "DYNAMODB_DECISIONS_TABLE": decisions_table.table_name,
                    "DYNAMODB_JOBS_TABLE": jobs_table.table_name,
                    "DYNAMODB_RATE_LIMITS_TABLE": rate_limits_table.table_name,
                    "DYNAMODB_ANALYTICS_TABLE": analytics_table.table_name,
                }
            ),
            assign_public_ip=True,
            public_load_balancer=True
        )

        # 5. Health Check Configuration
        returnless_service.target_group.configure_health_check(
            path="/health",
            healthy_http_codes="200"
        )

        # 6. Auto Scaling (Min 2, Max 10, Target CPU 70%)
        scaling = returnless_service.service.auto_scale_task_count(
            min_capacity=1,
            max_capacity=10
        )
        scaling.scale_on_cpu_utilization("CpuScaling",
            target_utilization_percent=70,
            scale_in_cooldown=Duration.seconds(60),
            scale_out_cooldown=Duration.seconds(60)
        )

        # 7. IAM Permissions
        bus.grant_put_events_to(returnless_service.task_definition.task_role)
        decisions_table.grant_read_write_data(returnless_service.task_definition.task_role)
        jobs_table.grant_read_write_data(returnless_service.task_definition.task_role)
        rate_limits_table.grant_read_write_data(returnless_service.task_definition.task_role)
        analytics_table.grant_read_write_data(returnless_service.task_definition.task_role)

        # 8. Output
        CfnOutput(self, "ReturnlessRefundServiceURL", value=f"http://{returnless_service.load_balancer.load_balancer_dns_name}")
