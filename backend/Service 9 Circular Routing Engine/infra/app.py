#!/usr/bin/env python3
import os
import aws_cdk as cdk
from infra.infra_stack import CircularRoutingServiceStack

app = cdk.App()

CircularRoutingServiceStack(app, "CircularIntelligenceOS-CircularRoutingService",
    env=cdk.Environment(account=os.environ.get("CDK_DEFAULT_ACCOUNT"), region=os.environ.get("CDK_DEFAULT_REGION", "us-east-1"))
)

app.synth()
