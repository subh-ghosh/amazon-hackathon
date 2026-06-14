#!/usr/bin/env python3
import os
import aws_cdk as cdk
from infra.infra_stack import CircularRoutingServiceStack

app = cdk.App()

CircularRoutingServiceStack(app, "CircularIntelligenceOS-CircularRoutingService",
    env=cdk.Environment(account="706335435423", region="us-east-1")
)

app.synth()
